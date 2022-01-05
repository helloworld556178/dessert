class DomClass extends HTMLElement {
    static get observedAttributes() {
        // 返回需要监听的属性
        return ['style', 'class', 'data-name'];
    }
    attributeChangedCallback(attributeName: string, oldValue: string, newValue: string): void {
        // 监听到的属性的变化
    }

    constructor() {
        super();

        const shadow = this.attachShadow({ mode: "closed" });
        // shandow内可以添加link，可以添加style
        shadow.appendChild(document.createElement("div"));
    }
}

customElements.define("dom-class", DomClass);