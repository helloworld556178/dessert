/**
 * 用于保存日志
 * 只进行记录，不进行打印，提升记录日志的速度
 * 
 * log only, without print.
 */


class Log {
    debug: BasicItem;
    info: BasicItem;
    warn: BasicItem;
    error: BasicItem;


    messages: string[];
    private debugIndex: number[];
    private infoIndex: number[];
    private warnIndex: number[];
    private errorIndex: number[];


    private constructor() {
        const self = this;

        this.messages = [];
        this.debugIndex = [];
        this.infoIndex = [];
        this.warnIndex = [];
        this.errorIndex = [];

        this.debug = function (message: string): void {
            const index = self.messages.length;
            self.messages.push(message);
            self.debugIndex.push(index);
        } as BasicItem;
        this.debug.at = index => self.messages[self.debugIndex[index]];
        Object.defineProperty(this.debug, "size", { "get": () => self.debugIndex.length });

        this.info = function (message: string): void {
            const index = self.messages.length;
            self.messages.push(message);
            self.infoIndex.push(index);
        } as BasicItem;
        this.info.at = index => self.messages[self.infoIndex[index]];
        Object.defineProperty(this.info, "size", { "get": () => self.infoIndex.length });

        this.warn = function (message: string): void {
            const index = self.messages.length;
            self.messages.push(message);
            self.warnIndex.push(index);
        } as BasicItem;
        this.warn.at = index => self.messages[self.warnIndex[index]];
        Object.defineProperty(this.warn, "size", { "get": () => self.warnIndex.length });

        this.error = function (message: string): void {
            const index = self.messages.length;
            self.messages.push(message);
            self.errorIndex.push(index);
        } as BasicItem;
        this.error.at = index => self.messages[self.errorIndex[index]];
        Object.defineProperty(this.error, "size", { "get": () => self.errorIndex.length });
    }
    public static create(): Log {
        if (this.instance === undefined) {
            this.instance = new Log();
        }
        return this.instance;
    }
    private static instance: Log;
}



interface BasicItem {
    (message: string): void;
    readonly size: number;
    at(index: number): string;
}


export const LOGGER = Log.create();
