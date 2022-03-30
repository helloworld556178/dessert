interface AVLTreeNode {
    value: number;
    left: AVLTreeNode | null;
    right: AVLTreeNode | null;
    height: number;
}

class AVLTree {
    root: AVLTreeNode | null = null;

    insert(value: number): void {
        this.root = this.insertNode(this.root, value);
    }

    private insertNode(node: AVLTreeNode | null, value: number): AVLTreeNode | null {

    }

    private balance(node: AVLTreeNode): AVLTreeNode {

    }

    private rotateRight(node: AVLTreeNode): AVLTreeNode {

    }

    private rotateLeft(node: AVLTreeNode): AVLTreeNode {
    }

    private getHeight(node: AVLTreeNode | null): number {
    }

    private getBalance(node: AVLTreeNode): number {

    }

    private getBalanceFactor(node: AVLTreeNode): number {

    }
}