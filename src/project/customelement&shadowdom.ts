class DomClass extends HTMLElement {
    static get observedAttributes() {
        // 返回需要监听的属性
        return ['style', 'class', 'data-name'];
    }
    attributeChangedCallback(attributeName: string, oldValue: string, newValue: string): void {
        // 监听到的属性的变化
    }

    connectedCallback() {
        // Run functionality when an instance of this element is inserted into the DOM.
    }
    disconnectedCallback() {
        // Run functionality when an instance of this element is removed from the DOM.
    }
    // 实例生成时触发
    createdCallback() { }
    // 实例插入HTML文档时触发
    attachedCallback() { }
    // 实例从HTML文档移除时触发
    detachedCallback() { }

    constructor() {
        super();

        const slot = document.createElement("slot");
        slot.name = "slot-name";
        // slot可以用于指明用户插入的子元素在子元素树中的位置
        this.appendChild(slot);
        // slot可以作为自定义元素的任意后代后面的子元素，这里将其直接作为根元素的后代加入
        // <element data-comment="这个元素将作为上面定义的slot的子元素" slot="slot-name">这是用户插入的子元素</element>
        const shadow = this.attachShadow({ mode: "closed" });
        // shandow内可以添加link，可以添加style
        shadow.appendChild(document.createElement("div"));
    }
}

customElements.define("dom-class", DomClass, {
    // 如果继承的是其他的元素，要指明继承的元素，并且使用is创建
    // extends: "button"
});
customElements.whenDefined("dom-class").then(() => {
    // 在dom-class被定义后执行此处代码
});
// js创建自定义dom的方法
const el = customElements.get("dom-class");

// 两种克隆节点的方式，用于给自定义元素提供模板
// document.body.cloneNode(true);
// document.importNode(document.body, true);