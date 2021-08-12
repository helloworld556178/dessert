import { assert } from "../util/assert";
import { Queue } from "../structure/queue";
import { SimplePromise } from "../util/promise";
import { SimpleFunction } from "../util/declare";

/**
 * 使用 arraybuffer 的播放器
 * 1. constructor
 * 2. bindVideoElement
 * 3. init(与destroy对应)
 * 4. setMimeCodec
 * 5. destroy(与init对应)
 * 
 * * addData(任何时候)
 * * clearBuffer(任何时候)
 */
export class ArrayBufferPlayer {
    capture(): string {
        assert(this.videoE !== undefined);

        let canvas = document.createElement("canvas");
        let ctx = canvas.getContext("2d");
        canvas.width = this.videoE.videoWidth;
        canvas.height = this.videoE.videoHeight;
        ctx.drawImage(this.videoE, 0, 0);
        return canvas.toDataURL("image/png");
    }
    p2p(): void {
        assert(this.videoE !== undefined);

        if (this.videoE.paused) {
            this.videoE.play();
        } else {
            this.videoE.pause();
        }
    }
    play(): void {
        assert(this.videoE !== undefined);

        this.videoE.play();
    }
    pause(): void {
        assert(this.videoE !== undefined);

        this.videoE.pause();
    }
    setPlaybackRate(v: number): void {
        assert(this.videoE !== undefined);

        this.videoE.playbackRate = v;
    }

    clearBuffer(): void {
        this.buffer = new Queue();
    }
    addData(data: ArrayBuffer): void {
        this.buffer.push(new Uint8Array(data));
        if (this.sourceBuffer && this.sourceBuffer.updating === false) {
            this.sourceBuffer.appendBuffer(this.buffer.shift());
        }
    }
    setMimeCodec(mimeCodec: string): void {
        assert(!!this.initPromise && this.initPromise.fulfilled, "首先需要初始化");

        if (this.sourceBuffer !== undefined) {
            return;
        }
        this.mimeCodec = mimeCodec;
        this.sourceBuffer = this.mediaSource.addSourceBuffer(mimeCodec);
        this.onupdateend = () => {
            if (this.sourceBuffer === undefined) { return; }
            if (this.sourceBuffer.updating) { return; }
            if (this.destroyPromise) { return; }

            if (this.sourceBuffer.buffered.length > 0
                && this.videoE.currentTime - this.sourceBuffer.buffered.start(0) > 10) {
                // 因为是直播，可以随时删除不用的数据
                this.sourceBuffer.remove(this.sourceBuffer.buffered.start(0), this.videoE.currentTime - 1);
            } else if (this.buffer.length > 0) {
                this.sourceBuffer.appendBuffer(this.buffer.shift());
            }
        };
        this.sourceBuffer.addEventListener("updateend", this.onupdateend);
    }
    init(): Promise<any> {
        assert(this.videoE !== undefined);

        if (this.initPromise) {
            return this.initPromise.promise;
        }
        this.initPromise = new SimplePromise();

        this.videoE.pause();
        this.videoE.muted = true;
        this.videoE.controls = false;

        this.mediaSource = new MediaSource();

        this.onsourceopen = () => {
            this.initPromise.resolve();
        };
        this.mediaSource.addEventListener("sourceopen", this.onsourceopen);

        this.objectUrl = URL.createObjectURL(this.mediaSource);
        this.videoE.src = this.objectUrl;
        this.videoE.play();

        return this.initPromise.promise;
    }
    destroy(): Promise<any> {
        assert(this.initPromise !== undefined && this.initPromise.fulfilled, "尚未初始化完成或者初始化过程中产生了错误");

        if (this.destroyPromise) {
            return this.destroyPromise.promise;
        }
        this.destroyPromise = new SimplePromise();



        this.videoE.pause();
        this.videoE.removeAttribute("src");
        this.videoE.load();
        URL.revokeObjectURL(this.objectUrl);
        this.objectUrl = undefined;

        for (let i = this.mediaSource.sourceBuffers.length - 1; i >= 0; i--) {
            this.mediaSource.removeSourceBuffer(this.mediaSource.sourceBuffers[i]);
        }
        if (this.mediaSource.readyState === "open") {
            this.mediaSource.endOfStream();
        }
        this.mediaSource.removeEventListener("sourceopen", this.onsourceopen);
        this.onsourceopen = undefined;
        this.mediaSource = undefined;


        // 不需要删除sourceBuffer，在从mediaSource中移除的时候就已经删除了
        if (this.sourceBuffer !== undefined) {
            this.sourceBuffer.removeEventListener("updateend", this.onupdateend);
            this.onupdateend = undefined;
        }
        this.sourceBuffer = undefined;

        this.buffer = new Queue();

        Promise.resolve().then(() => {
            this.destroyPromise.resolve();
            this.initPromise = undefined;
            this.destroyPromise = undefined;
        });


        return this.destroyPromise.promise;
    }

    /** 应该保证没有初始化 */
    bindVideoElement(video: HTMLVideoElement): Promise<any> {
        assert(video !== undefined);
        if (this.initPromise === undefined) {
            return Promise.resolve().then(() => this.videoE = video);
        }
        return this.initPromise.promise
            .then(() => this.destroy())
            .then(() => this.videoE = video);
    }

    constructor() {
        this.videoE = undefined;
        this.objectUrl = undefined;
        this.mediaSource = undefined;
        this.sourceBuffer = undefined;
        this.buffer = new Queue();

        this.initPromise = undefined;
        this.destroyPromise = undefined;
    }

    private initPromise: SimplePromise<any>;
    private destroyPromise: SimplePromise<any>;

    private videoE: HTMLVideoElement;
    private mediaSource: MediaSource;
    private sourceBuffer: SourceBuffer;
    private objectUrl: string;
    private buffer: Queue<Uint8Array>;
    private onupdateend: SimpleFunction;
    private onsourceopen: SimpleFunction;
    private mimeCodec: string;
}
