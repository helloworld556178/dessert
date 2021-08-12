import { SimpleFunction } from "./declare";


/**
 * 可以记录状态的 Promise
 */
export class SimplePromise<T = any> {
    get promise(): Promise<T> { return this.promiseInstance; }
    get fulfilled(): boolean { return this.resolveFlag; }
    get rejected(): boolean { return this.rejectFlag; }
    get finished(): boolean { return this.finallyFlag; }
    resolve(v?: any): void {
        this.promiseResolve(v);
        this.resolveFlag = true;
    }
    reject(v?: any): void {
        this.promiseReject(v);
        this.rejectFlag = true;
    }

    constructor() {
        this.promiseInstance = new Promise<T>((resolve, reject) => (this.promiseResolve = resolve, this.promiseReject = reject));
        this.resolveFlag = false;
        this.rejectFlag = false;
        this.finallyFlag = false;
        this.promiseInstance.finally(() => this.finallyFlag = true).catch(() => { });
    }

    private promiseResolve: SimpleFunction;
    private promiseReject: SimpleFunction;
    private resolveFlag: boolean;
    private rejectFlag: boolean;
    private finallyFlag: boolean;
    private promiseInstance: Promise<T>;
}