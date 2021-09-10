/**
 * 提供一个类，管理全局的实例
 */

import { assert } from "./assert";

export interface InstanceTypes {
    readonly "namespace.classname": InstanceManager;
}

export class InstanceManager {
    /**
     * 
     * @param foo 用于加载的函数
     * @returns 
     */
    public static load(foo: (manager: typeof InstanceManager) => Promise<boolean>): Promise<boolean> {
        assert(typeof foo === "function");

        return foo(InstanceManager);
    }

    public static register(id: string, instance: any): void {
        this.ensure();
        assert(id !== undefined && this.#instance.map.has(id) === false);

        this.#instance.map.set(id, instance);
    }
    public static get<T extends keyof InstanceTypes>(id: T): InstanceTypes[T];
    public static get(id: string): any;
    public static get<T extends keyof InstanceTypes = any>(id: T): InstanceTypes[T] {
        this.ensure();
        assert(id !== undefined);

        return this.#instance.map.get(id);
    }

    static ensure(): void {
        if (this.#instance === undefined) {
            this.#instance = new InstanceManager();
        }
    }
    private constructor() {
        this.map = new Map();
    }

    static #instance: InstanceManager;
    private map: Map<string, any>;
}