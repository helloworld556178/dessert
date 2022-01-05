// 单个实例，即，只能使用一次init
namespace svgmap {
    type ID = string;
    const MIN_WHEEL_VIEW = 2;
    const MAX_WHEEL_VIEW = Infinity;
    type CHILDREN_TYPE = keyof SVGElementTagNameMap;

    const _viewBox = [0, 0, 100, 100];
    const viewBox: readonly number[] = _viewBox;
    const _size = [0, 0];
    const size: readonly number[] = _size;


    interface IEntities { svg: SVGSVGElement; paintHandler: number; };
    const _o: IEntities = { svg: undefined, paintHandler: -1 };
    const o: Readonly<IEntities> = new Proxy(_o, {
        get(target, key) {
            return Reflect.get(target, key);
        },
        set(_1, _2, _3) { return false; }
    });

    interface Mouse {
        leftDownFlag: boolean;
        previousPosition: number[];
    }
    const _mouse: Mouse = {
        leftDownFlag: false,
        previousPosition: undefined
    };
    const mouse: Readonly<Mouse> = _mouse;

    interface Children {
        "data-sequence": string;
        "type": CHILDREN_TYPE;
        "x"?: number;
        "y"?: number;
        "width"?: number;
        "height"?: number;
        "fill": string;
        "data-id": string;
        "onclick": (ev: Event) => void;
    }
    const _children: Children[] = [];
    const children: readonly Children[] = _children;


    interface PaintFlag {
        resize: boolean;

        children: boolean;
    }
    const _paintFlag: PaintFlag = { resize: false, children: false };
    const paintFlag: Readonly<PaintFlag> = _paintFlag;



    export function imageSize(src: string): Promise<{ width: number; height: number; }> {
        let r = undefined;
        const p = new Promise<{ width: number; height: number; }>(_r => r = _r);
        const image = new Image();
        image.src = src;
        image.onload = function () {
            r({
                "width": image.width,
                "height": image.height
            });
        }
        return p;
    }
    export function init(svg: ID, width?: number, height?: number): void {
        _viewBox[2] = or(width, viewBox[2]);
        _viewBox[3] = or(height, viewBox[3]);

        _o.svg = document.querySelector<SVGSVGElement>(`#${svg}`);
        if (isNullOrEmpty(o.svg)) {
            throw new Error("cannot get svg");
        }

        _size[0] = o.svg.clientWidth;
        _size[1] = o.svg.clientHeight;

        o.svg["onmousewheel"] = handlewheel;
        o.svg.onresize = handleresize;
        o.svg.onmousedown = handlemousedown;
        o.svg.onmouseup = handlemouseup;
        o.svg.onmousemove = handlemousemove;
        o.svg.oncontextmenu = (ev) => ev.preventDefault();
    }
    export function add(type: CHILDREN_TYPE, { id, x, y, width, height, fill, onclick }: {
        x: number;
        y: number;
        width: number;
        height: number;
        fill?: string;
        id: string;
        onclick: (ev: Event) => void;
    }): void {
        assert(!isNullOrEmpty(type));
        assert(!isNullOrEmpty(x));
        assert(!isNullOrEmpty(y));
        assert(!isNullOrEmpty(width));
        assert(!isNullOrEmpty(height));

        _children.push({
            "data-sequence": newId(),
            "data-id": id,
            type,
            x,
            y,
            width,
            height,
            fill,
            onclick
        });
        _paintFlag.children = true;
        paintOnce();
    }


    function handlewheel(ev: WheelEvent): void {
        chain(() => {
            if (size[0] === 0 || size[1] === 0) { return 0; }
            if (ev.deltaY === 0) {
                return 0;
            }

            if (ev.deltaY > 0) {
                // 向下，缩小
                if (viewBox[2] > MAX_WHEEL_VIEW || viewBox[3] > MAX_WHEEL_VIEW) {
                    return 0;
                }
                return 1;
            } else if (ev.deltaY < 0) {
                // 向上，放大
                if (viewBox[2] < MIN_WHEEL_VIEW || viewBox[3] < MIN_WHEEL_VIEW) {
                    return 0;
                }
                return -1;
            }
            return 0;
        }).chain((direction) => {
            const center = [viewBox[2] / 2 + viewBox[0], viewBox[3] / 2 + viewBox[1]];
            const current = [ev.offsetX / size[0] * viewBox[2] + viewBox[0]
                , ev.offsetY / size[1] * viewBox[3] + viewBox[1]];
            if (direction === -1) {
                _viewBox[2] /= 1.5;
                _viewBox[3] /= 1.5;
                _viewBox[0] = current[0] - (current[0] - center[0]) / 1.5 - viewBox[2] / 2;
                _viewBox[1] = current[1] - (current[1] - center[1]) / 1.5 - viewBox[3] / 2;
            } else {
                _viewBox[2] *= 1.5;
                _viewBox[3] *= 1.5;
                _viewBox[0] = current[0] - (current[0] - center[0]) * 3 / 2 - viewBox[2] / 2;
                _viewBox[1] = current[1] - (current[1] - center[1]) * 3 / 2 - viewBox[3] / 2;
            }
        }).chain(() => {
            _paintFlag.resize = true;
            paintOnce();
        }).chain(() => ev.preventDefault());
    }
    function handleresize(_ev: Event): void {
        _size[0] = o.svg.clientWidth;
        _size[1] = o.svg.clientHeight;
    }
    function handlemousedown(ev: MouseEvent): void {
        if (ev.button === 0) {
            _mouse.leftDownFlag = true;
            _mouse.previousPosition = [ev.offsetX, ev.offsetY];
        }
    }
    function handlemouseup(ev: MouseEvent): void {
        if (ev.button === 0) {
            _mouse.leftDownFlag = false;
        }
    }
    function handlemousemove(ev: MouseEvent): void {
        if (mouse.leftDownFlag) {
            foo();
        }


        function foo() {
            const offset = [(ev.offsetX - mouse.previousPosition[0]) / size[0] * viewBox[2], (ev.offsetY - mouse.previousPosition[1]) / size[1] * viewBox[3]];
            _mouse.previousPosition = [ev.offsetX, ev.offsetY];
            _viewBox[0] -= offset[0];
            _viewBox[1] -= offset[1];

            _paintFlag.resize = true;
            paintOnce();
        }
    }



    const childrenCache: Children[] = [];
    function paintOnce(): void {
        if (o.paintHandler > -1) {
            return;
        }

        _o.paintHandler = setTimeout(paint, 0);



        function paint(): void {
            let flag = false;
            const displayProperty = { value: undefined };


            if (paintFlag.children) {
                hide();
                for (let i = 0, l = children.length; i < l; i++) {
                    const child = children[i];
                    if (childrenCache[i] === undefined) {
                        appendChild(child);
                        childrenCache.push(Object.assign({}, child));
                    } else {
                        const cachedChild = childrenCache[i];
                        if (cachedChild["data-sequence"] === child["data-sequence"]) {
                            for (let key in child) {
                                if (child[key] !== cachedChild[key]) {
                                    editChild(child, i);
                                    Object.assign(cachedChild, child);
                                    break;
                                }
                            }
                        }
                        else if (cachedChild["data-sequence"] < child["data-sequence"]) {
                            removeChild(i);
                            childrenCache.splice(i, 1);
                            i--;
                        } else {
                            // 这种情况目前不会出现
                            appendChild(child, i);
                            childrenCache.splice(i, 0, Object.assign({}, child));
                            throw new Error("这种情况目前不会出现");
                        }
                    }
                }
            }


            if (paintFlag.resize) {
                o.svg.setAttribute("viewBox", viewBox.join(" "));
            }



            show();
            _o.paintHandler = -1;

            function hide() {
                if (flag) { return; }
                flag = true;
                displayProperty.value = o.svg.style.getPropertyValue("display");
                o.svg.style.setProperty("display", "none");
            }
            function show() {
                if (!flag) { return; }
                if (isNullOrEmpty(displayProperty.value)) {
                    o.svg.style.removeProperty("display");
                } else {
                    o.svg.style.setProperty("display", displayProperty.value);
                }
            }
        }


        function editChild(child: Children, index: number): void {
            const e = o.svg.children[index];
            for (let i in child) {
                e.setAttribute(i, child[i]);
            }
        }
        function removeChild(index: number): void {
            o.svg.children[index].remove();
        }
        function appendChild(child: Children, index = -1): void {
            const e = document.createElementNS("http://www.w3.org/2000/svg", child.type);
            for (let i in child) {
                if (isNullOrEmpty(child[i])) { continue; }
                if (i.startsWith("on") === false) {
                    e.setAttribute(i, child[i]);
                } else {
                    e[i] = child[i];
                }
            }

            if (index === -1) {
                o.svg.appendChild(e);
            } else {
                o.svg.insertBefore(o.svg.children[index], e);
            }
        }
    }

    /**
     * @returns `value` if `value` is not empty, else `defaultValue`
     */
    function or<T>(value: T, defaultValue: T): T {
        if (isNullOrEmpty(value)) {
            return defaultValue;
        }
        return value;
    }
    function isNullOrEmpty(v: any): boolean {
        return (v === "" || v === undefined || v === null);
    }
    function assert(condition: boolean, message?: string): void {
        if (!condition) {
            throw new Error(message);
        }
    }


    function chain(cb: (...args: any[]) => any, ...args: any[]) {
        let res = undefined;
        if (typeof cb === "function") {
            res = cb(...args);
        }

        return {
            chain: foo
        };


        function foo(cb: (...args: any[]) => any, ...args: any[]) {
            if (typeof cb === "function") {
                res = cb(...args, res);
            } else {
                res = undefined;
            }

            return {
                chain: foo
            };
        }
    }

    let gid = 1;
    function newId() {
        return "data-a2-" + gid++;
    }
}


// 翻成了类
import { chain } from "../util/chain";
import { assert } from "../util/assert";
import { isNullOrEmpty, defaultValue as or } from "../util/util";

const MIN_WHEEL_VIEW = 2;
const MAX_WHEEL_VIEW = Infinity;
type ID = string;
type CHILDREN_TYPE = keyof SVGElementTagNameMap;
interface IEntities { svg: SVGSVGElement; paintHandler: number; }
interface Mouse {
    leftDownFlag: boolean;
    previousPosition: number[];
}
interface Children {
    "data-sequence": string;
    "type": CHILDREN_TYPE;
    "x"?: number;
    "y"?: number;
    "width"?: number;
    "height"?: number;
    "fill": string;
    "data-id": string;
    "onclick": (ev: Event) => void;
}
interface PaintFlag {
    resize: boolean;

    children: boolean;
}
let gid = 1;
export class SvgMap {
    constructor() {
        const _viewBox = [0, 0, 100, 100];
        const viewBox: readonly number[] = _viewBox;
        const _size = [0, 0];
        const size: readonly number[] = _size;

        const _o: IEntities = { svg: undefined, paintHandler: -1 };
        const o: Readonly<IEntities> = new Proxy(_o, {
            get(target, key) {
                return Reflect.get(target, key);
            },
            set(_1, _2, _3) { return false; }
        });

        const _mouse: Mouse = {
            leftDownFlag: false,
            previousPosition: undefined
        };
        const mouse: Readonly<Mouse> = _mouse;

        const _children: Children[] = [];
        const children: readonly Children[] = _children;

        const _paintFlag: PaintFlag = { resize: false, children: false };
        const paintFlag: Readonly<PaintFlag> = _paintFlag;



        function handlewheel(ev: WheelEvent): void {
            chain(() => {
                if (size[0] === 0 || size[1] === 0) { return 0; }
                if (ev.deltaY === 0) {
                    return 0;
                }

                if (ev.deltaY > 0) {
                    // 向下，缩小
                    if (viewBox[2] > MAX_WHEEL_VIEW || viewBox[3] > MAX_WHEEL_VIEW) {
                        return 0;
                    }
                    return 1;
                } else if (ev.deltaY < 0) {
                    // 向上，放大
                    if (viewBox[2] < MIN_WHEEL_VIEW || viewBox[3] < MIN_WHEEL_VIEW) {
                        return 0;
                    }
                    return -1;
                }
                return 0;
            }).chain((direction) => {
                const center = [viewBox[2] / 2 + viewBox[0], viewBox[3] / 2 + viewBox[1]];
                const current = [ev.offsetX / size[0] * viewBox[2] + viewBox[0]
                    , ev.offsetY / size[1] * viewBox[3] + viewBox[1]];
                if (direction === -1) {
                    _viewBox[2] /= 1.5;
                    _viewBox[3] /= 1.5;
                    _viewBox[0] = current[0] - (current[0] - center[0]) / 1.5 - viewBox[2] / 2;
                    _viewBox[1] = current[1] - (current[1] - center[1]) / 1.5 - viewBox[3] / 2;
                } else {
                    _viewBox[2] *= 1.5;
                    _viewBox[3] *= 1.5;
                    _viewBox[0] = current[0] - (current[0] - center[0]) * 3 / 2 - viewBox[2] / 2;
                    _viewBox[1] = current[1] - (current[1] - center[1]) * 3 / 2 - viewBox[3] / 2;
                }
            }).chain(() => {
                _paintFlag.resize = true;
                paintOnce();
            }).chain(() => ev.preventDefault());
        }
        function handleresize(_ev: Event): void {
            _size[0] = o.svg.clientWidth;
            _size[1] = o.svg.clientHeight;
        }
        function handlemousedown(ev: MouseEvent): void {
            if (ev.button === 0) {
                _mouse.leftDownFlag = true;
                _mouse.previousPosition = [ev.offsetX, ev.offsetY];
            }
        }
        function handlemouseup(ev: MouseEvent): void {
            if (ev.button === 0) {
                _mouse.leftDownFlag = false;
            }
        }
        function handlemousemove(ev: MouseEvent): void {
            if (mouse.leftDownFlag) {
                foo();
            }


            function foo() {
                const offset = [(ev.offsetX - mouse.previousPosition[0]) / size[0] * viewBox[2], (ev.offsetY - mouse.previousPosition[1]) / size[1] * viewBox[3]];
                _mouse.previousPosition = [ev.offsetX, ev.offsetY];
                _viewBox[0] -= offset[0];
                _viewBox[1] -= offset[1];

                _paintFlag.resize = true;
                paintOnce();
            }
        }



        const childrenCache: Children[] = [];
        function paintOnce(): void {
            if (o.paintHandler > -1) {
                return;
            }

            _o.paintHandler = setTimeout(paint, 0);



            function paint(): void {
                let flag = false;
                const displayProperty = { value: undefined };


                if (paintFlag.children) {
                    hide();
                    for (let i = 0, l = children.length; i < l; i++) {
                        const child = children[i];
                        if (childrenCache[i] === undefined) {
                            appendChild(child);
                            childrenCache.push(Object.assign({}, child));
                        } else {
                            const cachedChild = childrenCache[i];
                            if (cachedChild["data-sequence"] === child["data-sequence"]) {
                                for (let key in child) {
                                    if (child[key] !== cachedChild[key]) {
                                        editChild(child, i);
                                        Object.assign(cachedChild, child);
                                        break;
                                    }
                                }
                            }
                            else if (cachedChild["data-sequence"] < child["data-sequence"]) {
                                removeChild(i);
                                childrenCache.splice(i, 1);
                                i--;
                            } else {
                                // 这种情况目前不会出现
                                appendChild(child, i);
                                childrenCache.splice(i, 0, Object.assign({}, child));
                                throw new Error("这种情况目前不会出现");
                            }
                        }
                    }
                }


                if (paintFlag.resize) {
                    o.svg.setAttribute("viewBox", viewBox.join(" "));
                }



                show();
                _o.paintHandler = -1;

                function hide() {
                    if (flag) { return; }
                    flag = true;
                    displayProperty.value = o.svg.style.getPropertyValue("display");
                    o.svg.style.setProperty("display", "none");
                }
                function show() {
                    if (!flag) { return; }
                    if (isNullOrEmpty(displayProperty.value)) {
                        o.svg.style.removeProperty("display");
                    } else {
                        o.svg.style.setProperty("display", displayProperty.value);
                    }
                }
            }


            function editChild(child: Children, index: number): void {
                const e = o.svg.children[index];
                for (let i in child) {
                    e.setAttribute(i, child[i]);
                }
            }
            function removeChild(index: number): void {
                o.svg.children[index].remove();
            }
            function appendChild(child: Children, index = -1): void {
                const e = document.createElementNS("http://www.w3.org/2000/svg", child.type);
                for (let i in child) {
                    if (isNullOrEmpty(child[i])) { continue; }
                    if (i.startsWith("on") === false) {
                        e.setAttribute(i, child[i]);
                    } else {
                        e[i] = child[i];
                    }
                }

                if (index === -1) {
                    o.svg.appendChild(e);
                } else {
                    o.svg.insertBefore(o.svg.children[index], e);
                }
            }
        }
        function newId() {
            return "data-a2-" + gid++;
        }


        this.init = function (svg: ID, width?: number, height?: number): void {
            _viewBox[2] = or(width, viewBox[2]);
            _viewBox[3] = or(height, viewBox[3]);

            _o.svg = document.querySelector<SVGSVGElement>(`#${svg}`);
            if (isNullOrEmpty(o.svg)) {
                throw new Error("cannot get svg");
            }

            _size[0] = o.svg.clientWidth;
            _size[1] = o.svg.clientHeight;

            o.svg["onmousewheel"] = handlewheel;
            o.svg.onresize = handleresize;
            o.svg.onmousedown = handlemousedown;
            o.svg.onmouseup = handlemouseup;
            o.svg.onmousemove = handlemousemove;
            o.svg.oncontextmenu = (ev) => ev.preventDefault();
        }

        this.add = function (type: CHILDREN_TYPE, { id, x, y, width, height, fill, onclick }: {
            x: number;
            y: number;
            width: number;
            height: number;
            fill?: string;
            id: string;
            onclick: (ev: Event) => void;
        }): void {
            assert(!isNullOrEmpty(type));
            assert(!isNullOrEmpty(x));
            assert(!isNullOrEmpty(y));
            assert(!isNullOrEmpty(width));
            assert(!isNullOrEmpty(height));

            _children.push({
                "data-sequence": newId(),
                "data-id": id,
                type,
                x,
                y,
                width,
                height,
                fill,
                onclick
            });
            _paintFlag.children = true;
            paintOnce();
        }
    }

    init: (svg: ID, width?: number, height?: number) => void;
    add: (type: CHILDREN_TYPE, { id, x, y, width, height, fill, onclick }: {
        x: number;
        y: number;
        width: number;
        height: number;
        fill?: string;
        id: string;
        onclick: (ev: Event) => void;
    }) => void;
}

export function imageSize(src: string): Promise<{ width: number; height: number; }> {
    let r = undefined;
    const p = new Promise<{ width: number; height: number; }>(_r => r = _r);
    const image = new Image();
    image.src = src;
    image.onload = function () {
        r({
            "width": image.width,
            "height": image.height
        });
    }
    return p;
}
