/**
 * 备忘录模式
 * undo redo
 */
namespace memento {
    /**
     * 本类主要用于统合功能，存储数据，具体功能分给其他类完成
     * 1. `newSnapeshot` 创建 `State` 的 `Snapshot`
     * 2. 使用 `undo` 和 `redo` 操作快照
     * 3. `undo` 和 `redo` 的具体实现在 `Command` 里
     * 4. `Command` 需要的 `Snapshot` 由 **调用者** 提供
     */
    export abstract class Editor {
        protected state: State;
        public abstract newSnapshot(): void;
        public abstract undo(): void;
        public abstract redo(): void;
    }
    abstract class Snapshot {
        protected state: State;
        public constructor(state: State) { }
        public abstract restore(): void;
    }
    abstract class Command {
        protected backup: Snapshot;
        public abstract execute(): void;
        public abstract doExecute(): void;
    }
    abstract class UndoCommand extends Command {
        public abstract override doExecute(): void;
        public abstract undo(): void;
    }
    abstract class RedoCommand extends Command {
        public abstract override doExecute(): void;
        public abstract redo(): void;
    }
    abstract class State {
        protected text: string;
        protected cursorPosition: number;
        protected selection: [number, number];
        protected font: string;
        protected color: string;
        protected backgroundColor: string;
    }
}