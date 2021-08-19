import { assert } from "./assert";

// 用于生成一个n元组？
type GeneraterTuple<
    T,
    N extends number,
    R extends Array<T> = []
    > = R['length'] extends N ? R : GeneraterTuple<T, N, [T, ...R]>;
// type X = GeneraterTuple<string, 10>;

/**
 * TODO 实现一种功能，拦截 function 对象
 */
export namespace yes {
    /** 不允许将函数作为值传递 */
    export function o(v: any): any {
        assert(typeof v !== "function", "此处不应该使用函数作为值传递");
        return v;
    }
}

export namespace util {
    export namespace date {
        export const TIMEZONE_OFFSET = new Date().getTimezoneOffset() * 60000;

        /**
         * 将字符串翻译为标准时区的时间戳
         * @param date 
         * @returns 
         */
        export function utctimestamp(date: string): number {
            if (typeof (date) === "string") {
                if (isNaN(Number(date)) === false) { return Number(date); }

                let match = date.match(/^([0-9]+):([0-9]+):([0-9]+)$/);
                if (match !== null) {
                    let timestamp = Number(match[1]);
                    timestamp = timestamp * 60 + Number(match[2]);
                    timestamp = timestamp * 60 + Number(match[3]);
                    timestamp *= 1000;
                    return timestamp;
                }
            }
            return 0;
        }

        export function timestamp(date: string): number {
            return utctimestamp(date) + TIMEZONE_OFFSET;
        }

        export function time(timestamp: number): string {
            let ret: string[] = new Array(3);
            timestamp = timestamp || 0;
            timestamp = Math.floor(timestamp / 1000);
            ret[2] = String(timestamp % 60).padStart(2, '0');
            timestamp = Math.floor(timestamp / 60);
            ret[1] = String(timestamp % 60).padStart(2, '0');
            timestamp = Math.floor(timestamp / 60);
            ret[0] = String(timestamp);
            if (ret[0].length === 1) {
                ret[0] = ret[0].padStart(2, '0');
            }
            return ret.join(":");
        }

        /**
         * 获取标准时区的日期，返回的是没有考虑时区的字符串
         * @param timestamp 
         * @returns 
         */
        export function utcdate(timestamp: number): string {
            timestamp = timestamp || 0;
            let d = new Date(timestamp);
            return `${String(d.getUTCFullYear()).padStart(4, '0')}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
        }

        /**
         * 获取标准时区的日期时间，返回的是没有考虑时区的字符串
         * @param timestamp 
         * @returns 
         */
        export function utcdatetime(timestamp: number): string {
            timestamp = timestamp || 0;
            let d = new Date(timestamp);
            return `${String(d.getUTCFullYear()).padStart(4, '0')}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')} ${String(d.getUTCHours()).padStart(2, '0')
                }:${String(d.getUTCMinutes()).padStart(2, '0')}:${String(d.getUTCSeconds()).padStart(2, '0')}`;
        }

        /**
         * 获取当前时区的日期，返回的是考虑时区的字符串
         * @param timestamp 
         * @returns 
         */
        export function date(timestamp: number): string {
            timestamp = timestamp || 0;
            let d = new Date(timestamp);
            return `${String(d.getFullYear()).padStart(4, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }

        /**
         * 获取当前时区的日期时间，返回的是考虑时区的字符串
         * @param timestamp 
         * @returns 
         */
        export function datetime(timestamp: number): string {
            timestamp = timestamp || 0;
            let d = new Date(timestamp);
            return `${String(d.getFullYear()).padStart(4, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')
                }:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
        }
    }

    export function clamp(v: number, min: number, max: number): number {
        return Math.min(Math.max(v, min), max);
    }

    export function at(v: number, min: number, max: number): boolean {
        return v >= min && v <= max;
    }

    /** 用于深拷贝一份数据，中间不能有函数成员 */
    export function copy<T>(o: T): Promise<T> {
        let resolve: (value: T) => void;
        let promise = new Promise<T>(r => resolve = r);


        let instance = new MessageChannel();
        instance.port1.postMessage(o);
        instance.port2.onmessage = ev => {
            instance.port1.close();
            instance.port2.close();
            resolve(ev.data)
        };

        return promise;
    }

    /** 禁止对象修改 */
    export function freeze(o: object): object { return Object.freeze(o); }
    /** 禁止对象新增或删除成员 */
    export function seal(o: object): object { return Object.seal(o); }

    /** 生成一个有分数星星字符串 */
    export function rateStr(rate: 0 | 1 | 2 | 3 | 4 | 5): string {
        return "★★★★★☆☆☆☆☆".slice(5 - rate, 10 - rate);
    }

    /** 控制台输出 */
    export function FBI_WARNING(): void {
        // 在此提醒，为免于生成丑陋的锯齿背景图片，请注意空格的个数，并保证console面板的宽度。
        console.log(
            // atob(`JWMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJWMgRkJJIFdBUk5JTkcgJWMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKJWMgICAgICAgIEZlZGVyYWwgTGF3IHByb3ZpZGVzIHNldmVyZSBjaXZpbCBhbmQgY3JpbWluYWwgcGVuYWx0aWVzIGZvciAgICAgICAgCiAgICAgICAgdGhlIHVuYXV0aG9yaXplZCByZXByb2R1Y3Rpb24sZGlzdHJpYnV0aW9uLCBvciBleGhpYml0aW9uIG9mICAgICAgICAKICAgICAgICAgY29weXJpZ2h0ZWQgbW90aW9uIHBpY3R1cmVzIChUaXRsZSAxNywgVW5pdGVkIFN0YXRlcyBDb2RlLCAgICAgICAgIAogICAgICAgIFNlY3Rpb25zIDUwMSBhbmQgNTA4KS4gVGhlIEZlZGVyYWwgQnVyZWF1IG9mIEludmVzdGlnYXRpb24gICAgICAgICAgCiAgICAgICAgIGludmVzdGlnYXRlcyBhbGxlZ2F0aW9ucyBvZiBjcmltaW5hbCBjb3B5cmlnaHQgaW5mcmluZ2VtZW50ICAgICAgICAKICAgICAgICAgICAgICAgICAoVGl0bGUgMTcsIFVuaXRlZCBTdGF0ZXMgQ29kZSwgU2VjdGlvbiA1MDYpLiAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAo=`),
            decodeURIComponent("%25c%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%25c%20FBI%20WARNING%20%25c%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%0A%25c%20%20%20%20%20%20%20%20Federal%20Law%20provides%20severe%20civil%20and%20criminal%20penalties%20for%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20the%20unauthorized%20reproduction%2Cdistribution%2C%20or%20exhibition%20of%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20%20copyrighted%20motion%20pictures%20(Title%2017%2C%20United%20States%20Code%2C%20%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20Sections%20501%20and%20508).%20The%20Federal%20Bureau%20of%20Investigation%20%20%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20%20investigates%20allegations%20of%20criminal%20copyright%20infringement%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20(Title%2017%2C%20United%20States%20Code%2C%20Section%20506).%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%0A"),
            'background: #000; font-size: 18px; font-family: monospace',
            'background: #f33; font-size: 18px; font-family: monospace; color: #eee; text-shadow:0 0 1px #fff',
            'background: #000; font-size: 18px; font-family: monospace',
            'background: #000; font-size: 18px; font-family: monospace; color: #ddd; text-shadow:0 0 2px #fff'
        );
    }

    /** 根据本地化的结果比较两个字符串的大小 */
    export function localCompare(s1: string, s2: string): number {
        return (s1 || "").localeCompare(s2 || "");
    }

    /** 生成一个新的ID */
    export function newId(): string {
        if (idGenerator === undefined) {
            idGenerator = function* () {
                let id = 1;
                while (true) {
                    yield id++;
                }
            }();
        }
        return `${ID_PREFIX}${idGenerator.next().value}`;
    }

    const ID_PREFIX = "ID-";
    let idGenerator: Generator<number>;
}

/**
 * 只作用于浏览器
 */
export class BrowserUtil {
    /**
     * 使用 post 方法向服务器发送一条数据，不接收信息，可以在页面卸载时使用，不会阻塞页面的卸载
     * @param url 
     * @param data 
     * @returns 只判断是否将这条信息加入发送队列，不保证是否发送成功
     */
    public static sendBeacon(url: string, data: BodyInit): boolean {
        return navigator.sendBeacon(url, data);

        // let img = document.createElement("img");
        // img.src = url;
        // document.body.appendChild(img);
    }

    /** 将 url 解析 */
    public static parseURL(url: string): HTMLHyperlinkElementUtils {
        let a = document.createElement("a");
        a.href = url;

        return a;
    }

    /** 禁止复制粘贴 */
    public static preventCopyAndPaste(): void {
        if (this.instance === undefined) {
            this.instance = new BrowserUtil();
        }
        if (this.instance.oncopy !== undefined) {
            return;
        }
        this.instance.oncopy = ev => ev.preventDefault();
        this.instance.onpaste = ev => ev.preventDefault();
        document.addEventListener("copy", this.instance.oncopy);
        document.addEventListener("paste", this.instance.onpaste);
    }
    /** 恢复本工具禁止的复制粘贴 */
    public static removePreventCopyAndPaste(): void {
        if (this.instance === undefined) {
            this.instance = new BrowserUtil();
        }
        if (this.instance.oncopy !== undefined) {
            document.removeEventListener("copy", this.instance.oncopy);
            document.removeEventListener("paste", this.instance.onpaste);

            this.instance.oncopy = undefined;
            this.instance.onpaste = undefined;
        }
    }

    /** 基于密码学生成随机数 */
    public static random(): number {
        if (this.instance === undefined) {
            this.instance = new BrowserUtil();
        }
        if (this.instance.randomNumberQueue === undefined || this.instance.randomNumberIndex === this.instance.randomNumberQueue.length) {
            this.instance.randomNumberIndex = 0;
            this.instance.randomNumberQueue = new Uint32Array(16);
            crypto.getRandomValues(this.instance.randomNumberQueue);
        }
        return this.instance.randomNumberQueue[this.instance.randomNumberIndex++];
    }

    /** 获取元素的大小以及在视域中的位置 */
    public static getBoundingClientRect(e: HTMLElement): DOMRect {
        return e.getBoundingClientRect();
    }

    /** 百度语音 */
    public static voiceAnnouncements(s: string): void {
        // 百度语音合成：或者使用新版地址https://tsn.baidu.com/text2audio
        var url = "http://tts.baidu.com/text2audio?lan=zh&ie=UTF-8&spd=5&text=" + encodeURI(s);
        var n = new Audio(url);
        n.src = url;
        n.play();
    }

    /**
     * postMessage可以在页面与子页面之间传递数据
     */
    private constructor() { }

    private static instance: BrowserUtil;
    private oncopy: (ev: Event) => void;
    private onpaste: (ev: Event) => void;
    private randomNumberQueue: Uint32Array;
    private randomNumberIndex: number;
}
