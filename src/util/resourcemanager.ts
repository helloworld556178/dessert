/**
 * 提供一个类，管理全局的资源
 */

import { assert } from "./assert";

export interface ResourceTypes {
    readonly "namespace.classname": any;
}

export class ResourceManager {
    /**
     * 
     * @param foo 用于加载的函数
     * @returns 
     */
    public static load(foo: () => Promise<{ key: string; value: any; }[]>): Promise<void> {
        assert(typeof foo === "function");

        return foo().then(kvs => (kvs || []).forEach(kv => this.register(kv.key, kv.value)));
    }

    public static register(id: string, instance: any): void {
        this.ensure();
        assert(id !== undefined && this.#instance.map.has(id) === false);

        this.#instance.map.set(id, Object.freeze(instance));
    }
    public static get<T extends keyof ResourceTypes>(id: T): ResourceTypes[T];
    public static get(id: string): any;
    public static get<T extends keyof ResourceTypes = any>(id: T): ResourceTypes[T] {
        this.ensure();
        assert(id !== undefined);

        return this.#instance.map.get(id);
    }

    static ensure(): void {
        if (this.#instance === undefined) {
            this.#instance = new ResourceManager();
        }
    }
    private constructor() {
        this.map = new Map();
    }

    static #instance: ResourceManager;
    private map: Map<string, any>;
}
