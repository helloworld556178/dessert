/**
 * 保证类型是期望的值
 */
export class Assert {
    static _<T>(v: T): T {
        if (typeof (v) === "function") { throw new Error("不能是函数"); }
        return v;
    }
    static number(v: number): number;
    static number(v: bigint): bigint;
    static number(v: number | bigint): number | bigint {
        if (typeof (v) === "number" || typeof (v) === "bigint") {
            return v;
        }
        throw new Error("只能是数字");
    }
    static boolean(v: boolean): boolean {
        if (typeof (v) !== "boolean") { throw new Error("只能是布尔值"); }
        return v;
    }
    static string(v: string): string {
        if (typeof (v) !== "string") { throw new Error("只能是字符串"); }
        return v;
    }


    static assert(condition: boolean, message?: string): void {
        assert(condition, message);
    }
}

export function assert(condition: boolean, message?: string): void {
    if (!condition) {
        // console.error(message || "发生了错误");
        throw new Error(message);
    }
}

