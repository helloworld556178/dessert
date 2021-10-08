/**
 * 提供一种将多个map存储在一起的封装
 */

import { assert } from "./assert";

type ObjectList = Scope<{
    "test": {
        key: string;
        value: number;
    };
}>;

export type Scope<T> = T extends TYPE_KKV ? T : never;

interface TYPE_KV {
    key: any;
    value: any;
}

interface TYPE_KKV {
    [key: string]: TYPE_KV;
}

interface IMap<V extends TYPE_KV> {
    add(key: V["key"], value: V["value"]): void;
    set(key: V["key"], value: V["value"]): void;
    list(key: V["key"]): V["value"][];
    one(key: V["key"]): V["value"];
}

export interface IObjectManager<K extends TYPE_KKV> {
    o<T extends keyof K>(key: T): IMap<K[T]>;
}

export class ObjectManager<K extends TYPE_KKV = ObjectList> implements IObjectManager<K>, IMap<any> {
    // 临时变量
    private o1: Map<any, any>;

    public o<T extends keyof K>(key: T): IMap<K[T]> {
        this.o1 = <any>this.map.get(key);
        if (this.o1 === undefined) {
            this.o1 = new Map();
            this.map.set(key, this.o1);
        }
        return this;
    }

    constructor() {
        this.map = new Map();
    }
    add(key: any, value: any): void {
        assert(this.o1 !== undefined);

        let list: any[] = this.o1.get(key);
        if (list === undefined) {
            list = [];
            this.o1.set(key, list);
        }
        list.push(value);
    }
    set(key: any, value: any): void {
        assert(this.o1 !== undefined);

        this.o1.set(key, [value]);
    }
    list(key: any): any[] {
        assert(this.o1 !== undefined);

        const list = this.o1.get(key);
        if (Array.isArray(list) === true) {
            return list;
        }
        return [];
    }
    one(key: any): any {
        assert(this.o1 !== undefined);

        const list = this.o1.get(key);
        if (Array.isArray(list) === true) {
            return list[0];
        }
        return undefined;
    }

    private map: Map<keyof K, object>;
}
