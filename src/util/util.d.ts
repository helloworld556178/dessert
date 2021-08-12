/**
 * TODO 实现一种功能，拦截 function 对象
 */
export declare namespace yes {
    /** 不允许将函数作为值传递 */
    function o(v: any): any;
}
export declare class Util {
    static clamp(v: number, min: number, max: number): number;
    /** 用于深拷贝一份数据，中间不能有函数成员 */
    static copy<T>(o: T): Promise<T>;
    /** 禁止对象修改 */
    static freeze(o: object): object;
    /** 禁止对象新增或删除成员 */
    static seal(o: object): object;
    /** 生成一个新的ID */
    static newId(): string;
    /** 生成一个有分数星星字符串 */
    static rateStr(rate: 0 | 1 | 2 | 3 | 4 | 5): string;
    /** 控制台输出 */
    static FBI_WARNING(): void;
    /** 根据本地化的结果比较两个字符串的大小 */
    static localCompare(s1: string, s2: string): number;
    private constructor();
    private static instance;
    private idGenerator;
    static readonly ID_PREFIX = "ID-";
}
/**
 * 只作用于浏览器
 */
export declare class BrowserUtil {
    /**
     * 使用 post 方法向服务器发送一条数据，不接收信息，可以在页面卸载时使用，不会阻塞页面的卸载
     * @param url
     * @param data
     * @returns 只判断是否将这条信息加入发送队列，不保证是否发送成功
     */
    static sendBeacon(url: string, data: BodyInit): boolean;
    /** 将 url 解析 */
    static parseURL(url: string): HTMLHyperlinkElementUtils;
    /** 禁止复制粘贴 */
    static preventCopyAndPaste(): void;
    /** 恢复本工具禁止的复制粘贴 */
    static removePreventCopyAndPaste(): void;
    /** 基于密码学生成随机数 */
    static random(): number;
    /** 获取元素的大小以及在视域中的位置 */
    static getBoundingClientRect(e: HTMLElement): DOMRect;
    /** 百度语音 */
    static voiceAnnouncements(s: string): void;
    /**
     * postMessage可以在页面与子页面之间传递数据
     */
    private constructor();
    private static instance;
    private oncopy;
    private onpaste;
    private randomNumberQueue;
    private randomNumberIndex;
}
