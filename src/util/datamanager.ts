/**
 * 提供一个类，实例化后可以提供类似sql的查询以及存储功能
 */

import { assert } from "./assert";

type BasicDataType = string | number | boolean | bigint | null | undefined;
interface BasicKeyValuePair {
    [key: string]: BasicDataType;
}

enum COMMAND_TYPE {
    NONE, SELECT, UPDATE, INSERT, DELETE, DROP, CREATE
}

export interface TableList {
    anytablename: string;
}



interface IFrom<K> {
    from<T extends keyof K>(target: T): IWhere;
}
interface IWhere {
    go<T = void>(): T;
    where<T extends BasicKeyValuePair>(params: T): IGO;
}
interface ISet {
    set<T extends BasicKeyValuePair>(params: T): IWhere;
}
interface IInto<K> {
    into<T extends keyof K>(target: T): IGO;
}
interface ICreate {
    primary(key: string): IGO;
}
interface IGO {
    go<T = void>(): T;
}

export interface IDataManager<K> {
    select(key: string | "*", ...keys: string[]): IFrom<K>;
    update<T extends keyof K>(target: T): ISet;
    insert<T extends BasicKeyValuePair>(params: T[]): IInto<K>;

    delete<T extends keyof K>(target: T): IWhere;
    drop<T extends keyof K>(target: T): IGO;
    create<T extends keyof K>(target: T): ICreate;

    tables(): (keyof K)[];
}

export class DataManager<K = TableList> implements IDataManager<K>, ICreate, IFrom<K>, IWhere, ISet, IInto<K>, IGO {
    public go<T = void>(): T {
        assert(this.worker !== undefined);

        const result = this.worker.go<T>();
        this.worker = undefined;
        return result;
    }
    public from<T extends keyof K>(target: T): IWhere {
        assert(this.worker !== undefined);

        this.worker.setTarget(target);
        return this;
    }
    public where<T extends BasicKeyValuePair>(params: T): IGO {
        assert(this.worker !== undefined);

        this.worker.setCondition(params);
        return this;
    }
    public set<T extends BasicKeyValuePair>(params: T): IWhere {
        assert(this.worker !== undefined);

        this.worker.setKVs(params);
        return this;
    }
    public into<T extends keyof K>(target: T): IGO {
        assert(this.worker !== undefined);

        this.worker.setTarget(target);
        return this;
    }
    public primary(key: string): IGO {
        assert(this.worker !== undefined);

        this.worker.setKey(key);
        return this;
    }



    public select(key: string, ...keys: string[]): IFrom<K> {
        this.worker = new Worker(this.db);
        this.worker.setType(COMMAND_TYPE.SELECT);
        this.worker.select(key, ...keys);
        return this;
    }
    public update<T extends keyof K>(target: T): ISet {
        this.worker = new Worker(this.db);
        this.worker.setType(COMMAND_TYPE.UPDATE);
        this.worker.setTarget(target);
        return this;
    }
    public insert<T extends BasicKeyValuePair>(params: T[]): IInto<K> {
        this.worker = new Worker(this.db);
        this.worker.setType(COMMAND_TYPE.INSERT);
        this.worker.setKVs(params);
        return this;
    }
    public delete<T extends keyof K>(target: T): IWhere {
        this.worker = new Worker(this.db);
        this.worker.setType(COMMAND_TYPE.DELETE);
        this.worker.setTarget(target);
        return this;
    }
    public drop<T extends keyof K>(target: T): IGO {
        this.worker = new Worker(this.db);
        this.worker.setType(COMMAND_TYPE.DROP);
        this.worker.setTarget(target);
        return this;
    }
    public create<T extends keyof K>(target: T): ICreate {
        this.worker = new Worker(this.db);
        this.worker.setType(COMMAND_TYPE.CREATE);
        this.worker.setTarget(target);
        return this;
    }
    public tables(): (keyof K)[] {
        return [...this.db.keys()];
    }


    constructor() {
        this.db = new Map();
    }

    private db: Map<keyof K, ITable>;
    private worker: Worker<K>;
}


interface ITable {
    key: string;
    map: Map<BasicDataType, BasicKeyValuePair>;
}


abstract class AWorker<K> implements IGO {
    public setType(type: COMMAND_TYPE): void {
        this.type = type;
    }

    public select(key: "*" | string, ...keys: string[]): void {
        if (key === "*") {
            this.keys = key;
        } else {
            this.keys = new Array(keys.length + 1);
            this.keys[0] = key;
            for (let i = 0; i < keys.length; i++) {
                this.keys[i + 1] = keys[i];
            }
        }
    }
    public setCondition<T extends BasicKeyValuePair>(condition: T): void {
        this.condition = condition;
    }
    public setTarget<T extends keyof K>(target: T): void {
        this.target = target;
    }
    public setKVs<T extends BasicKeyValuePair>(kvs: T | T[]): void {
        this.kvs = kvs;
    }
    public setKey(key: string): void {
        this.key = key;
    }

    public go<T = void>(): T {
        let result = undefined;
        let table: ITable;
        switch (this.type) {
            case COMMAND_TYPE.SELECT:
                assert(this.target !== undefined);
                table = this.db.get(this.target);
                assert(table !== undefined);
                if (this.keys === "*" && this.condition === undefined) {
                    result = [...table.map.values()];
                } else if (this.keys === "*") {
                    const keys = Object.keys(this.condition);
                    assert(keys.length === 1, "目前查询条件只支持 key");
                    assert(table.key === keys[0], "目前的查询条件只支持 key");
                    result = [table.map.get(this.condition[table.key])];
                } else if (this.condition === undefined) {
                    result = new Array<BasicDataType>(table.map.size);
                    let i = 0;
                    const columns: string[] = this.keys;
                    table.map.forEach(row => {
                        const t = {};
                        columns.forEach(e => t[e] = row[e]);
                        result[i++] = t;
                    });
                } else {
                    const keys = Object.keys(this.condition);
                    assert(keys.length === 1, "目前查询条件只支持 key");
                    assert(table.key === keys[0], "目前的查询条件只支持 key");
                    result = [{}];
                    const columns: string[] = this.keys;
                    const row = table.map.get(this.condition[table.key]);
                    columns.forEach(c => result[0][c] = row[c]);
                }

                this.keys = undefined;
                this.target = undefined;
                this.condition = undefined;
                break;
            case COMMAND_TYPE.UPDATE:
                assert(this.target !== undefined);
                assert(this.kvs !== undefined);
                assert(Array.isArray(this.kvs) === false);
                table = this.db.get(this.target);
                assert(table !== undefined);
                assert(table.key in this.kvs === false);
                if (this.condition === undefined) {
                    table.map.forEach(row => {
                        for (let c in this.kvs) {
                            row[c] = this.kvs[c];
                        }
                    });
                    result = table.map.size;
                } else {
                    const keys = Object.keys(this.condition);
                    assert(keys.length === 1, "目前查询条件只支持 key");
                    assert(table.key === keys[0], "目前的查询条件只支持 key");
                    const row = table.map.get(this.condition[table.key]);
                    assert(row !== undefined, "没有找到需要更新的行");
                    for (let c in this.kvs) {
                        row[c] = this.kvs[c];
                    }
                    result = 1;
                }

                this.target = undefined;
                this.kvs = undefined;
                this.condition = undefined;
                break;
            case COMMAND_TYPE.INSERT:
                assert(this.target !== undefined);
                table = this.db.get(this.target);
                assert(table !== undefined);
                if (Array.isArray(this.kvs)) {
                    this.kvs.forEach(kv => {
                        assert(table.key in kv, "插入时必须指定 key");
                        // 没有判断是否已经存在
                        table.map.set(kv[table.key], kv);
                    });
                    result = this.kvs.length;
                } else {
                    assert(false, "插入应当是一个数组");
                }

                this.target = undefined;
                this.kvs = undefined;
                break;
            case COMMAND_TYPE.CREATE:
                assert(this.db.has(this.target) === false, `指定的表 ${this.target} 已经存在，创建失败`);
                assert(this.key !== undefined, "需要指定一个key");
                this.db.set(this.target, {
                    key: this.key,
                    map: new Map()
                });
                this.key = undefined;
                this.target = undefined;
                break;
            case COMMAND_TYPE.DELETE:
                assert(this.target !== undefined);
                if (this.condition === undefined) {
                    this.db.get(this.target)?.map?.clear();
                } else {
                    const keys = Object.keys(this.condition);
                    const table = this.db.get(this.target);
                    assert(table !== undefined, "找不到指定名称的表格");
                    assert(keys.length === 1, "目前只能根据 key 进行删查改");
                    assert(keys[0] === table.key, "目前只能根据 key 进行删查改");
                    result = table.map.get(this.condition[table.key]);
                }

                this.condition = undefined;
                this.target = undefined;
                break;
            case COMMAND_TYPE.DROP:
                this.db.delete(this.target);
                this.target = undefined;
                break;
            default:
                throw new Error(`${this.type} NOT IMPLEMENTS YET.`);
        }

        this.type = COMMAND_TYPE.NONE;

        return result;
    }

    constructor(db: Map<keyof K, ITable>) {
        assert(db !== undefined);

        this.type = COMMAND_TYPE.NONE;
        this.db = db;
    }

    protected key: string;
    protected keys: "*" | string[];
    protected condition: BasicKeyValuePair;
    protected target: keyof K;
    protected kvs: BasicKeyValuePair | BasicKeyValuePair[];

    protected type: COMMAND_TYPE;
    protected db: Map<keyof K, ITable>;
}
class Worker<K = TableList> extends AWorker<K> {
    constructor(db: Map<keyof K, ITable>) {
        super(db);
    }
}
