interface DataTemplate {
    [key: string]: any;
}


/**
 * 用于存储数据，可以恢复上一时刻的数据   
 * 1. 用于存储数据，只能存储数据，不能存储函数   
 * 2. 只能存储可枚举属性，包含 Symbol 类型   
 * 3. 数组只能按照数组存储数据，不能附加数据
 * 4. 支持设置为 undefined，undefined 被认为是有效数据
 * 
 * @member c 获取快照
 * @member o 获取当前对象
 * @method capture 生成快照
 * @method set 替换当前数据为新的数据
 * @method restore 恢复快照
 */
export class Store<T = DataTemplate | DataTemplate[]>{
    /**
     * 获取快照，不应该修改从这个属性获取的对象
     */
    get c(): T {
        return this.#captureData;
    }
    /**
     * 获取当前对象，如果生成快照后没有修改过，应该尽量使用 c，而不是这个接口
     */
    get o(): T {
        if (this.#data === undefined && !this.#dataUndefinedFlag) {
            this.#data = this.#captureData;
            this.#captureData = Store.copy(this.#data);
        }
        return this.#data;
    }
    /**
     * 生成快照
     */
    capture(): Store<T> {
        // this.#captureData = Store.copy(this.#data);
        if (this.#data !== undefined) {
            this.#captureData = this.#data;
            this.#data = undefined;
        } else if (this.#dataUndefinedFlag) {
            this.#captureData = undefined;
        }
        return this;
    }
    /**
     * 设置数据，可以被恢复
     * @param data 设置的数据
     */
    set(data: T): Store<T> {
        this.#data = data;
        if (this.#data === undefined) {
            this.#dataUndefinedFlag = true;
        } else {
            this.#dataUndefinedFlag = false;
        }
        return this;
    }
    /**
     * 恢复快照
     */
    restore(): Store<T> {
        // this.#data = Store.copy(this.#captureData);
        this.#data = undefined;
        if (this.#captureData === undefined) {
            this.#dataUndefinedFlag = true;
        } else {
            this.#dataUndefinedFlag = false;
        }
        return this;
    }

    constructor(data?: T) {
        if (data === undefined) {
            this.#data = this.#captureData = undefined;
            this.#dataUndefinedFlag = true;
        } else {
            this.#data = undefined;
            this.#captureData = data;
            this.#dataUndefinedFlag = false;
        }
    }


    /** 
     * 1. 不能处理循环引用的数据 
     * 2. 设计用来处理JSON数据
     */
    private static copy<T>(data: T): T {
        if (data === undefined || data === null) {
            return data;
        } else if (Array.isArray(data)) {
            let array = new Array(data.length);
            data.forEach((e, index) => array[index] = this.copy(e));
            return <any>array;
        } else if (typeof (data) === "object") {
            let o = {};
            // Object.keys(data).forEach(key => o[key] = this.copy(data[key]));
            // Object.getOwnPropertySymbols(o).forEach(key => o[key] = this.copy(data[key]));
            Reflect.ownKeys(<any>data).forEach(key => o[key] = this.copy(data[key]));
            return <any>o;
        } else if (typeof data === "function") {
            // 是否要这样处理？
            throw new Error("只应处理纯JSON对象")
            return data;
        } else {
            return data;
        }
    }

    // 设置对应的 #data 是否是 undefined
    #dataUndefinedFlag: boolean;
    #data: T;
    #captureData: T;
}
