interface Node<T = any> {
    previous: Node<T>;
    next: Node<T>;
    value: T;
}
export class LinkedList<T> {
    get length(): number {
        return this.size;
    }
    get first(): T {
        if (this.head === undefined) { return undefined; }
        return this.head.value;
    }
    get last(): T {
        if (this.rear === undefined) { return undefined; };
        return this.rear.value;
    }

    push(value: T): void {
        let node: Node<T> = { previous: undefined, next: undefined, value };
        if (this.rear === undefined) {
            this.head = this.rear = node;
        } else {
            node.previous = this.rear;
            this.rear.next = node;
            this.rear = node;
        }
        this.size++;
    }
    pop(): T {
        if (this.head === undefined) { return undefined; }

        let node = this.rear;
        if (this.head === this.rear) {
            this.head = this.rear = undefined;
        } else {
            this.rear = this.rear.previous;
            this.rear.next = undefined;
        }

        this.size--;
        return node.value;
    }
    unshift(value: T): void {
        let node: Node<T> = { previous: undefined, next: undefined, value };
        if (this.head === undefined) {
            this.head = this.rear = node;
        } else {
            this.head.previous = node;
            node.next = this.head;
            this.head = node;
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
            this.head.previous = undefined;
        }

        this.size--;
        return node.value;
    }

    constructor() {
        this.head = undefined;
        this.rear = undefined;
        this.size = 0;
    }

    size: number;
    head: Node<T>;
    rear: Node<T>;
}