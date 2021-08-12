interface Node<T> {
    next: Node<T>;
    value: T;
}

export class Queue<T> {
    get length(): number { return this.size; }
    get first(): T {
        if (this.head === undefined) { return undefined; }
        return this.head.value;
    }
    get last(): T {
        if (this.head === undefined) { return undefined; }
        return this.rear.value;
    }

    push(value: T): void {
        let node: Node<T> = { next: undefined, value };
        if (this.head === undefined) {
            this.head = this.rear = node;
        } else {
            this.rear.next = node;
            this.rear = node;
        }
        this.size++;
    }
    shift(): T {
        if (this.head === undefined) { return undefined; }
        let node = this.head;
        if (this.head === this.rear) {
            this.head = this.rear = undefined;
        } else {
            this.head = this.head.next;
        }
        this.size--;
        return node.value;
    }

    constructor() {
        this.size = 0;
        this.head = undefined;
        this.rear = undefined;
    }

    head: Node<T>;
    rear: Node<T>;
    size: number;
}
