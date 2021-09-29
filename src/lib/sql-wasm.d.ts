/**
 * 这是自己为 sql-wasm 写的，对一些可能用到的方法添加了定义
 */

export default function initSqlJs(configure?: { [key: string]: any; }): Promise<SQL>;

declare interface SQL {
    Database: typeof Database;
    Statement: typeof Statement;
}

export namespace Database {
    export type SqlValue = Uint8Array | string | number | null;
    export type QueryExecResult = {
        columns: Array<string>;
        values: Array<Array<Database.SqlValue>>;
    };
}

declare class Database {
    /**
     * Close the database, and all associated prepared statements. The memory associated to the database and all associated statements will be freed.   
     * **Warning**: A statement belonging to a database that has been closed cannot be used anymore.   
     * Databases **must** be closed when you're finished with them, or the memory consumption will grow forever
     */
    public close(): void;
    /**
     * Register a custom function with SQLite
     * @param name the name of the function as referenced in SQL statements.
     * @param foo the actual function to be executed.
     * @returns The database object. Useful for method chaining
     */
    public create_function(name: string, foo: Function): Database;

    public each(sql: string, callback: Function, done: Function): Database;
    public each(sql: string, params: Statement.BindParams, callback: Function, done: Function): Database;
    public exec(sql: string, params: Statement.BindParams): Array<Database.QueryExecResult>;
    public export(): Uint8Array;
    public getRowsModified(): number;
    public handleError(): void;
    public iterateStatements(sql: string): StatementIterator;
    public prepare(sql: string, params?: Statement.BindParams): Statement;
    public run(sql: string, params?: Statement.BindParams): Database;

    constructor(db: ArrayBuffer);
}

export namespace Statement {
    export type BindParams = Array<Database.SqlValue> | Database.SqlValue | string | null;
}

declare class Statement {
    getAsObject(configure?: {
        $start?: number;
        $end?: number;
    }): object[] | object;
    bind(configure: {
        $start?: number;
        $end?: number;
    }): void;
    step(): boolean;
}


declare class StatementIterator { }