import { assert } from "./assert";
import { SimplePromise } from "./promise";

/**
 * 经过测试：
 * 1. 当需要更新版本时，需要先关闭已经有的数据库链接，否则会触发onblocked事件，即任意时刻处于onupgradeneeded的连接只能必须独占数据库
 */

type BasicDataType = string | number | boolean | bigint | null | undefined;


/**
 * 对 indexeddb 的一种封装   
 * 由于需要考虑多窗口情况下，原生接口对本程序的影响，因此设计的时候应该以数据库提供的事件为准
 */
class DB {
    private openPromise: SimplePromise;
    private db: IDBDatabase;
    private name: string;
    private version: number;
    constructor() {
        this.openPromise = undefined;

        this.version = 0;
        this.name = undefined;
        this.db = undefined;
    }

    get databaseOpenFlag(): boolean { return !!this.openPromise && this.openPromise.fulfilled; }
    /**
     * * 如果成功，则成功
     * * 如果失败，则解释原因
     * * 重复执行不会产生第二个结果
     * @param db 数据库名字
     */
    open(db: string): Promise<any> {
        assert(typeof db === "string");

        if (this.openPromise !== undefined) {
            return this.openPromise.promise;
        }
        this.openPromise = new SimplePromise();

        const request = indexedDB.open(db);
        request.onerror = () => {
            console.warn(request.error);
            this.openPromise.reject(request.error);
        };
        request.onsuccess = () => {
            this.db = request.result;
            this.db.onversionchange = () => {
                // 这里根据需求，是外部有修改数据库版本的需求，应该满足
                this.close();
            };
            this.db.onerror = () => {
                this.close();
            };
            // this.db.onabort
            this.name = db;
            this.version = this.db.version;
            this.openPromise.resolve();
        };
        return this.openPromise.promise;
    }

    // 等待所有连接关闭后，关闭该连接
    close(): Promise<any> {
        if (this.db === undefined && this.openPromise === undefined) {
            return Promise.resolve();
        }
        if (this.db === undefined && this.openPromise !== undefined && this.openPromise.finished === true) {
            this.openPromise = undefined;
            return Promise.resolve();
        }
        const promise = new SimplePromise();
        if (this.openPromise.finished === false) {
            this.openPromise.promise.then(() => {
                this.db.onclose = () => {
                    this.openPromise = undefined;
                    promise.resolve();
                };
                this.db.close();
            });
        } else {
            this.db.onclose = () => {
                this.openPromise = undefined;
                promise.resolve();
            };
            this.db.close();
        }

        return promise.promise;
    }

    /**
     * * 如果成功，则成功
     * * 如果失败，则解释原因
     * * 如果阻塞，则等待
     * @param db 数据库名字
     */
    static destroy(db: string): Promise<any> {
        assert(typeof (db) === "string");

        const promise = new SimplePromise();
        const request = indexedDB.deleteDatabase(db);
        request.onerror = () => {
            console.warn(request.error)
            promise.reject(request.error);
        };
        request.onsuccess = () => promise.resolve();
        return promise.promise;
    }

    /**
     * 1. 索引的含义：类似于传统意义上的列，此处简化，允许重复，允许空
     * 2. 此处不设置 primary key，使用自动生成的 key
     * 3. 查询的时候使用 index 查询
     * 4. 插入的时候传入对象会自动解析key与index（此处不使用key），没有对应的项就不解析
     * @param table 表名
     */
    create(table: string, ...indexes: string[]): Promise<any> {
        assert(this.name !== undefined, "没有打开数据库，没有获取过数据库的名字");

        // TODO

        return promise.promise;
    }

    /** @deprecated 暂时不用 */
    alter(table: string): void;

    /**
     * 删除表
     * @param table 表格名
     */
    drop(table: string): Promise<any>;

    /**
     * 插入数据
     * @param data 待插入的数据
     */
    insert(data: { [key: string]: BasicDataType; }): Promise<any>;

    /**
     * 根据索引更新数据
     * @param index 索引的名字
     * @param value 索引的值
     * @param data 需要更新的数据
     */
    update(index: string, value: BasicDataType, data: { [key: string]: BasicDataType; }): Promise<any>;

    /**
     * 根据数据模板删除数据
     * @param data 需要删除的数据模板
     * @deprecated 暂时不用这个
     */
    remove(data: { [key: string]: any; }): Promise<any>;
    /**
     * 删除某些数据
     * @param index 索引的名字
     * @param value 索引的值
     */
    remove(index: string, value: BasicDataType): Promise<any>;
}
