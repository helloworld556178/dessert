/**
 * 提供一个类，实例化后可以提供类似sql的查询以及存储功能
 */

function assert(condition, message) {
    if (!condition) {
        // console.error(message || "发生了错误");
        throw new Error(message);
    }
}


var COMMAND_TYPE;
(function (COMMAND_TYPE) {
    COMMAND_TYPE[COMMAND_TYPE["NONE"] = 0] = "NONE";
    COMMAND_TYPE[COMMAND_TYPE["SELECT"] = 1] = "SELECT";
    COMMAND_TYPE[COMMAND_TYPE["UPDATE"] = 2] = "UPDATE";
    COMMAND_TYPE[COMMAND_TYPE["INSERT"] = 3] = "INSERT";
    COMMAND_TYPE[COMMAND_TYPE["DELETE"] = 4] = "DELETE";
    COMMAND_TYPE[COMMAND_TYPE["DROP"] = 5] = "DROP";
    COMMAND_TYPE[COMMAND_TYPE["CREATE"] = 6] = "CREATE";
})(COMMAND_TYPE || (COMMAND_TYPE = {}));
export class DataManager {
    constructor() {
        this.db = new Map();
    }
    go() {
        assert(this.worker !== undefined);
        const result = this.worker.go();
        this.worker = undefined;
        return result;
    }
    from(target) {
        assert(this.worker !== undefined);
        this.worker.setTarget(target);
        return this;
    }
    where(params) {
        assert(this.worker !== undefined);
        this.worker.setCondition(params);
        return this;
    }
    set(params) {
        assert(this.worker !== undefined);
        this.worker.setKVs(params);
        return this;
    }
    into(target) {
        assert(this.worker !== undefined);
        this.worker.setTarget(target);
        return this;
    }
    primary(key) {
        assert(this.worker !== undefined);
        this.worker.setKey(key);
        return this;
    }
    select(key, ...keys) {
        this.worker = new Worker(this.db);
        this.worker.setType(COMMAND_TYPE.SELECT);
        this.worker.select(key, ...keys);
        return this;
    }
    update(target) {
        this.worker = new Worker(this.db);
        this.worker.setType(COMMAND_TYPE.UPDATE);
        this.worker.setTarget(target);
        return this;
    }
    insert(params) {
        this.worker = new Worker(this.db);
        this.worker.setType(COMMAND_TYPE.INSERT);
        this.worker.setKVs(params);
        return this;
    }
    delete(target) {
        this.worker = new Worker(this.db);
        this.worker.setType(COMMAND_TYPE.DELETE);
        this.worker.setTarget(target);
        return this;
    }
    drop(target) {
        this.worker = new Worker(this.db);
        this.worker.setType(COMMAND_TYPE.DROP);
        this.worker.setTarget(target);
        return this;
    }
    create(target) {
        this.worker = new Worker(this.db);
        this.worker.setType(COMMAND_TYPE.CREATE);
        this.worker.setTarget(target);
        return this;
    }
    tables() {
        return [...this.db.keys()];
    }
}
class AWorker {
    constructor(db) {
        assert(db !== undefined);
        this.type = COMMAND_TYPE.NONE;
        this.db = db;
    }
    setType(type) {
        this.type = type;
    }
    select(key, ...keys) {
        if (key === "*") {
            this.keys = key;
        }
        else {
            this.keys = new Array(keys.length + 1);
            this.keys[0] = key;
            for (let i = 0; i < keys.length; i++) {
                this.keys[i + 1] = keys[i];
            }
        }
    }
    setCondition(condition) {
        this.condition = condition;
    }
    setTarget(target) {
        this.target = target;
    }
    setKVs(kvs) {
        this.kvs = kvs;
    }
    setKey(key) {
        this.key = key;
    }
    go() {
        let result = undefined;
        let table;
        switch (this.type) {
            case COMMAND_TYPE.SELECT:
                assert(this.target !== undefined);
                table = this.db.get(this.target);
                assert(table !== undefined);
                if (this.keys === "*" && this.condition === undefined) {
                    result = [...table.map.values()];
                }
                else if (this.keys === "*") {
                    const keys = Object.keys(this.condition);
                    assert(keys.length === 1, "目前查询条件只支持 key");
                    assert(table.key === keys[0], "目前的查询条件只支持 key");
                    result = [table.map.get(this.condition[table.key])];
                }
                else if (this.condition === undefined) {
                    result = new Array(table.map.size);
                    let i = 0;
                    const columns = this.keys;
                    table.map.forEach(row => {
                        const t = {};
                        columns.forEach(e => t[e] = row[e]);
                        result[i++] = t;
                    });
                }
                else {
                    const keys = Object.keys(this.condition);
                    assert(keys.length === 1, "目前查询条件只支持 key");
                    assert(table.key === keys[0], "目前的查询条件只支持 key");
                    result = [{}];
                    const columns = this.keys;
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
                }
                else {
                    const keys = Object.keys(this.condition);
                    assert(keys.length === 1, "目前查询条件只支持 key");
                    assert(table.key === keys[0], "目前的查询条件只支持 key");
                    const row = table.map.get(this.kvs[table.key]);
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
                }
                else {
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
                }
                else {
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
}
class Worker extends AWorker {
    constructor(db) {
        super(db);
    }
}
