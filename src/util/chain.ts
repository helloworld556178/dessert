/**
 * 顺序，线性执行，阻塞。
 * 
 * 下一个回调函数的最后一个参数是上一个回调函数的返回值
 * @param args 前面的是指定的参数，最后一个参数是上一个回调函数的返回值
 * 
 * ``` JavaScript
 * chain(()=>6).chain(console.log, 7)
 * ```
 * 上面的代码输出 `7 6`
 */
export function chain(cb: (...args: any[]) => any, ...args: any[]) {
    let res: any = undefined;
    if (typeof cb === "function") {
        res = cb(...args);
    }

    return {
        chain: foo
    };


    function foo(cb: (...args: any[]) => any, ...args: any[]) {
        if (typeof cb === "function") {
            res = cb(...args, res);
        } else {
            res = undefined;
        }

        return {
            chain: foo
        };
    }
}
