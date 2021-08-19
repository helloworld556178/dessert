import { SimpleFunction } from "./declare";

/**
 * 当连续下发 setTimeout 的时候，如果前一个 setTimeout 的 callback 还没有执行，则只会执行 理论上最晚执行的那个 setTimeout 的 callback
 */
export class TimeoutHandler {
    init(callback: SimpleFunction, timeout: number): void {
        if (this.timeoutThreshold <= Date.now() + timeout) {
            this.callback = callback;
            this.timeoutThreshold = Date.now() + timeout;
        }
        this.setTimeout();
    }

    constructor() {
        this.handler = undefined;
        this.callback = undefined;
        this.timeoutThreshold = 0;
    }

    private setTimeout(): void {
        if (this.handler !== undefined) { return; }
        this.handler = globalThis.setTimeout(() => {
            this.handler = undefined;
            if (this.timeoutThreshold > Date.now()) {
                this.setTimeout();
            } else {
                this.callback && this.callback();
                this.callback = undefined;
            }
        }, this.timeoutThreshold - Date.now());
    }

    private handler: number;
    private callback: SimpleFunction;
    private timeoutThreshold: number;
}
