import { assert } from "./assert";

/**
 * 经过测试：
 * 1. 当需要更新版本时，需要先关闭已经有的数据库链接，否则会触发onblocked事件，即任意时刻处于onupgradeneeded的连接只能必须独占数据库
 */

/**
 * 对 indexeddb 的一种封装   
 * 由于需要考虑多窗口情况下，原生接口对本程序的影响，因此设计的时候应该以数据库提供的事件为准
 */
declare class DB {
    get databaseOpenFlag(): boolean;
    /**
     * * 如果成功，则成功
     * * 如果失败，则解释原因
     * * 重复执行不会产生第二个结果
     * @param db 数据库名字
     */
    open(db: string): Promise<any>;

    /**
     * * 如果成功，则成功
     * * 如果失败，则解释原因
     * * 如果阻塞，则等待
     * @param db 数据库名字
     */
    static destroy(db: string): Promise<any>;

    /**
     * 1. 索引的含义：类似于传统意义上的列，此处简化，允许重复，允许空
     * 2. 此处不设置 primary key，使用自动生成的 key
     * 3. 查询的时候使用 index 查询
     * 4. 插入的时候传入对象会自动解析key与index（此处不使用key），没有对应的项就不解析
     * @param table 表名
     */
    create(table: string, ...indexes: string[]): Promise<any>;
}
