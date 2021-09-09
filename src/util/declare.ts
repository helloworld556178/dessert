//#region 通用功能
export type SimpleFunction = (value?: any) => void;
export type SimpleBooleanFunction = (value?: any) => boolean;
//#endregion

//#region 类型对象声明
export interface ZTree {
    refresh(): void;
    getNodesByFilter(fn: (node: ZTreeNode) => boolean, isSingle: true, parentNode?: ZTreeNode): ZTreeNode;
    getNodesByFilter(fn: (node: ZTreeNode) => boolean, isSingle?: false, parentNode?: ZTreeNode): ZTreeNode[];
    getNodesByParam(key: string, value: any, parentNode?: ZTreeNode): ZTreeNode[];
    checkAllNodes(checked: boolean): void;
    checkNode(node: ZTreeNode, checked?: boolean, checkTypeFlag?: boolean, callbackFlag?: boolean): void;
    showNodes(nodes: ZTreeNode[]): void;
    hideNodes(nodes: ZTreeNode[]): void;
    transformToArray(nodes: ZTreeNode[]): ZTreeNode[];
    getNodes(): ZTreeNode[];
    destroy(): void;
    cancelSelectedNode(node?: ZTreeNode): void;
    expandAll(expandFlag: boolean): boolean;

    setting: {
        callback: {
            onClick: (ev?: Event, treeId?: string, treeNode?: ZTreeNode, clickFlag?: 0 | 1 | 2) => void;
        };
    }
}
export interface ZTreeNode {
    checked: boolean;
    isParent: boolean;
    isHidden: boolean;
    name: string;

    readonly level: number;
    children: ZTreeNode[];
    getParentNode(): ZTreeNode;

    [key: string]: any;
}
//#endregion