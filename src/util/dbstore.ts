import { SimplePromise } from "./promise";

export class DBStore {
    private static readonly OBJECT_NAME = "STORE";
    public readonly name: string;
    public readonly version: number;
    public get ready(): boolean { return this.promise.finished; }

    private db: IDBDatabase;
    private promise: SimplePromise<void>;

    constructor(name: string, version?: number) {
        this.name = name;
        this.version = version;
        this.promise = new SimplePromise<void>();
        this.init();
    }
    public getDBVersion(): number {
        if (!this.ready) { return -1; }
        return this.db.version;
    }

    private init(): void {
        const indexedDB: IDBFactory = window.indexedDB || window["mozIndexedDB"] || window["webkitIndexedDB"] || window["msIndexedDB"];
        if (!indexedDB) { return; }
        const request = indexedDB.open(this.name, this.version);
        request.onerror = (event: Event) => {
            this.promise.reject(event);
        };
        request.onsuccess = (event: Event) => {
            this.db = event.target["result"];
            this.promise.resolve();
        };
        request.onupgradeneeded = (event: Event) => {
            const db: IDBDatabase = event.target["result"];
            if (!db.objectStoreNames.contains(DBStore.OBJECT_NAME)) {
                const store = db.createObjectStore(DBStore.OBJECT_NAME, { keyPath: "key" });
                store.createIndex("value", "value", { unique: false });
            }
        };
    }

    private async store(): Promise<IDBObjectStore> {
        await this.promise.promise;
        return this.db.transaction(DBStore.OBJECT_NAME, "readwrite").objectStore(DBStore.OBJECT_NAME);
    }

    public async delete(key: string): Promise<void> {
        const store = await this.store();
        const promise = new SimplePromise();
        const request = store.delete(key);
        request.onsuccess = () => promise.resolve();
        request.onerror = (event: Event) => promise.reject(event);
        return promise.promise;
    }
    public async set(key: string, value: any): Promise<void> {
        const store = await this.store();
        const promise = new SimplePromise();
        const request = store.put({ key, value });
        request.onsuccess = () => promise.resolve();
        request.onerror = (event: Event) => promise.reject(event);
        return promise.promise;
    }
    public async get(key: string): Promise<any> {
        const store = await this.store();
        const request = store.get(key);
        const promise = new SimplePromise();
        request.onsuccess = (event: Event) => promise.resolve(event.target["result"]?.value);
        request.onerror = (event: Event) => promise.reject(event);
        return promise.promise;
    }
    public async then(callback: () => Promise<void> | void): Promise<void> {
        await this.promise.promise;
        if (!this.db.objectStoreNames.contains(DBStore.OBJECT_NAME)) {
            return Promise.reject("does not have store, please upgrade database version");
        }
        return callback();
    }
    // 没什么意义
    public catch(callback: (error: Event) => void): Promise<void> {
        return this.promise.promise.catch(callback);
    }
}
