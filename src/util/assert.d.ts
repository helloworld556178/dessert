/**
 * 保证类型是期望的值
 */
export declare class Assert {
    static _<T>(v: T): T;
    static number(v: number): number;
    static number(v: bigint): bigint;
    static boolean(v: boolean): boolean;
    static string(v: string): string;
    static assert(condition: boolean, message?: string): void;
}
export declare function assert(condition: boolean, message?: string): void;
