import { chain } from "../util/chain";
import { assert } from "../util/assert";
import { isNullOrEmpty, defaultValue as or, lt, last } from "../util/util";

const MIN_WHEEL_VIEW = 2;
const MAX_WHEEL_VIEW = Infinity;
const VK_DOWN = "ArrowDown";
const VK_LEFT = "ArrowLeft";
const VK_RIGHT = "ArrowRight";
const VK_UP = "ArrowUp";
type ID = string;
// type CHILDREN_TYPE = keyof SVGElementTagNameMap;
type CHILDREN_TYPE = "g" | "line";
interface IEntities {
    svg: SVGSVGElement;
    paintHandler: number;
    focusFlag: boolean;
    editFlag: boolean;
    // 通过点击获取，svg失去焦点或者重新点击后变为undefined或者新的值
    editChild: Children | undefined;
    get activeFlag(): boolean;
}
interface Mouse {
    clickFlag: boolean;
    clickFlagHandler: number;
    leftDownFlag: boolean;
    // 鼠标在内部
    inFlag: boolean;
    previousPosition: number[];
}
interface Children {
    "data-sequence": string;
    "type": CHILDREN_TYPE;
    "x"?: number;
    "y"?: number;
    "scale"?: number;
    "rotate"?: number;
    "data-id": string;
    "data-type"?: string;
    "onclick": (ev: Event, data: Children) => void;
    "children"?: string;
    // 直线
    "x1"?: number;
    "y1"?: number;
    "x2"?: number;
    "y2"?: number;

    "-translate"?: SVGTransform;
    "-scale"?: SVGTransform;
    "-rotate"?: SVGTransform;
}
interface PaintFlag {
    resize: boolean;

    children: boolean;
}
let gid = 1;
/**
 * data-sequence 是生成的顺序，在svg生成时生成，不会读取svg文件中的同名属性
 * 
 * 需要将viewBox的比例设定的同svg实际大小的比例相同
 */
export class SvgMap {
    constructor() {
        const _viewBox = [0, 0, 100, 100];
        const viewBox: readonly number[] = _viewBox;
        const _size = [0, 0];
        const size: readonly number[] = _size;

        const _o: IEntities = {
            svg: undefined,
            paintHandler: -1,
            focusFlag: false,
            editFlag: false,
            editChild: undefined,
            get activeFlag(): boolean { return o.focusFlag || mouse.inFlag; }
        };
        const o: Readonly<IEntities> = new Proxy(_o, {
            get(target, key) {
                return Reflect.get(target, key);
            },
            set(_1, _2, _3) { return false; }
        });

        const _mouse: Mouse = {
            clickFlag: false,
            clickFlagHandler: -1,
            inFlag: false,
            leftDownFlag: false,
            previousPosition: undefined
        };
        const mouse: Readonly<Mouse> = _mouse;

        const _children: Children[] = [];
        const children: readonly Children[] = _children;

        const _paintFlag: PaintFlag = { resize: false, children: false };
        const paintFlag: Readonly<PaintFlag> = _paintFlag;

        const self = this;



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
                    return 1;
                } else if (direction === 1) {
                    _viewBox[2] *= 1.5;
                    _viewBox[3] *= 1.5;
                    _viewBox[0] = current[0] - (current[0] - center[0]) * 3 / 2 - viewBox[2] / 2;
                    _viewBox[1] = current[1] - (current[1] - center[1]) * 3 / 2 - viewBox[3] / 2;
                    return 1;
                }
                return 0;
            }).chain(result => {
                if (result === 1) {
                    _paintFlag.resize = true;
                    paintOnce();
                }
            }).chain(() => ev.preventDefault());
        }
        function handlekeydown(ev: KeyboardEvent): void {
            // 如果监听的是 globalThis 的 KeyboardEvent
            // if (!o.activeFlag) { return; }

            // 无需保证事件的触发间隔，绘制时是有间隔的
            const offset = [0, 0];
            chain(() => {
                if (ev.key === VK_UP) { offset[0] = 0, offset[1] = -1; }
                else if (ev.key === VK_RIGHT) { offset[0] = 1, offset[1] = 0; }
                else if (ev.key === VK_DOWN) { offset[0] = 0, offset[1] = 1; }
                else if (ev.key === VK_LEFT) { offset[0] = -1, offset[1] = 0; }
                else { return 0; }
                return 1;
            }).chain(result => {
                if (result === 0) { return 0; }
                if (o.editFlag && !!o.editChild) {
                    if (o.editChild.type === "g") {
                        o.editChild.x += offset[0];
                        o.editChild.y += offset[1];
                        _paintFlag.children = true;
                        return 1;
                    } else if (o.editChild.type === "line") {
                        o.editChild.x1 += offset[0];
                        o.editChild.x2 += offset[0];
                        o.editChild.y1 += offset[1];
                        o.editChild.y2 += offset[1];
                        _paintFlag.children = true;
                        return 1;
                    }
                } else {
                    _viewBox[0] -= offset[0];
                    _viewBox[1] -= offset[1];
                    _paintFlag.resize = true;
                    return 2;
                }
            }).chain(result => {
                if (result === 2) { paintOnce(); }
                if (result === 1) {
                    paintOnce();
                    self.onitemmousemove && self.onitemmousemove(o.editChild);
                }
            });
        }
        function handleresize(_ev: Event): void {
            _size[0] = o.svg.clientWidth;
            _size[1] = o.svg.clientHeight;
        }
        function handlemousedown(ev: MouseEvent): void {
            if (ev.target !== ev.currentTarget && o.editFlag === true) {
                if (ev.button === 0) {
                    // 拖拽功能
                    let editChild = <SVGElement>ev.target;
                    // child only
                    while (editChild !== undefined && <any>(editChild.parentElement) !== o.svg) {
                        editChild = <any>editChild.parentElement;
                    }
                    if (editChild !== undefined) {
                        const sequence = editChild.getAttribute("data-sequence");
                        _o.editChild = children.find(e => e["data-sequence"] === sequence);
                    }
                }
            } else {
                _o.editChild = undefined;
            }


            if (ev.button === 0) {
                _mouse.clickFlag = true;
                if (mouse.clickFlagHandler > -1) {
                    clearTimeout(mouse.clickFlagHandler);
                }
                _mouse.clickFlagHandler = setTimeout(() => {
                    _mouse.clickFlag = false;
                    _mouse.clickFlagHandler = -1;
                }, 500);


                _mouse.leftDownFlag = true;
                _mouse.previousPosition = [ev.offsetX, ev.offsetY];
            }
        }
        function handlemouseup(ev: MouseEvent): void {
            if (ev.button === 0) {
                _mouse.leftDownFlag = false;

                // if (o.editFlag === true) {
                //     _o.editChild = undefined;
                // }
            }
        }
        function handlemousemove(ev: MouseEvent): void {
            // 这里不参与单击事件的过滤，因为从其他窗口点击进来后，可能触发鼠标移动事件，进而取消点击

            if (mouse.leftDownFlag) {
                if (o.editFlag === true && !isNullOrEmpty(o.editChild)) {
                    // 拖拽功能
                    drag();
                    return;
                }
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

            // 拖拽功能
            function drag() {
                const offset = [(ev.offsetX - mouse.previousPosition[0]) / size[0] * viewBox[2], (ev.offsetY - mouse.previousPosition[1]) / size[1] * viewBox[3]];
                _mouse.previousPosition = [ev.offsetX, ev.offsetY];
                if (o.editChild.type === "line") {
                    o.editChild.x1 += offset[0];
                    o.editChild.x2 += offset[0];
                    o.editChild.y1 += offset[1];
                    o.editChild.y2 += offset[1];
                } else {
                    o.editChild.x += offset[0];
                    o.editChild.y += offset[1];
                }

                _paintFlag.children = true;
                paintOnce();

                // 是否分发？
                self.onitemmousemove && self.onitemmousemove(o.editChild);
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
                                        editChild(child, i, cachedChild);
                                        Object.assign(cachedChild, child);
                                        break;
                                    }
                                }
                            }
                            else if (lt(cachedChild["data-sequence"], child["data-sequence"])) {
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
                    if (children.length < childrenCache.length) {
                        for (let i = childrenCache.length - 1, l=children.length; i >= l; i--) {
                            removeChild(i);
                        }
                        childrenCache.splice(children.length);
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


            function editChild(child: Children, index: number, cachedChild: Children): void {
                const e = o.svg.children[index];

                // 如果类型是直线，将直接使用x1,x2,y1,y2进行定位，可以也可以使用下面的所有判定条件，因此没有进行特殊判断
                for (let i in child) {
                    if (i[0] === "-") {
                        continue;
                    } else if (["children", "x", "y", "rotate", "scale"].includes(i)) {
                        continue;
                    } else if (typeof (child[i]) !== "function" && child[i] !== cachedChild[i]) {
                        if (i === "text" && child["type"] === "g" && child["data-type"] === "text") {
                            e.children[0].innerHTML = child[i];
                        } else {
                            e.setAttribute(i, child[i]);
                        }
                    }
                }
                if (!isNullOrEmpty(child['x']) && !isNullOrEmpty(child['y'])
                    && (child['x'] !== cachedChild['x'] || child['y'] !== cachedChild['y'])) {
                    if (child["-translate"] === undefined) {
                        const translate: SVGTransform = tryGetSVGTransform(<any>e, SVGTransform.SVG_TRANSFORM_TRANSLATE);
                        child["-translate"] = translate;
                    }
                    child["-translate"].setTranslate(child['x'], child['y']);
                }
                if (!isNullOrEmpty(child['rotate']) && child["rotate"] !== cachedChild["rotate"]) {
                    if (child["-rotate"] === undefined) {
                        const rotate: SVGTransform = tryGetSVGTransform(<any>e, SVGTransform.SVG_TRANSFORM_ROTATE);
                        child["-rotate"] = rotate;
                    }
                    child["-rotate"].setRotate(child["rotate"], 0, 0);
                }
                if (!isNullOrEmpty(child['scale']) && child["scale"] !== cachedChild["scale"]) {
                    if (child["-scale"] === undefined) {
                        const scale = tryGetSVGTransform(<any>e, SVGTransform.SVG_TRANSFORM_SCALE);
                        child["-scale"] = scale;
                    }
                    child["-scale"].setScale(child["scale"], child["scale"]);
                }
            }
            function removeChild(index: number): void {
                o.svg.children[index].remove();
            }
            function appendChild(child: Children, index = -1): void {
                const e = document.createElementNS("http://www.w3.org/2000/svg", child.type);

                // 如果类型是直线，将直接使用x1,x2,y1,y2进行定位，可以也可以使用下面的判定条件，因此没有进行特殊判断
                for (let i in child) {
                    if (isNullOrEmpty(child[i])) { continue; }
                    if (i[0] === "-") {
                        continue;
                    } else if (i === "children") {
                        e.innerHTML = child[i];
                    } else if (["x", "y", "scale", "rotate"].includes(i)) {
                        // 使用transform设定
                        continue;
                    } else if (i.startsWith("on") === false) {
                        if (i === "text" && child["type"] === "g" && child["data-type"] === "text") {
                            e.children[0].innerHTML = child[i];
                        } else {
                            e.setAttribute(i, child[i]);
                        }
                    } else if (i === "onclick" && typeof child[i] === "function") {
                        e.onclick = ev => {
                            // 只处理单击事件
                            if (mouse.clickFlag) {
                                child[i](ev, child);
                            }
                        };
                    } else {
                        e[i] = child[i];
                    }
                }
                if (!isNullOrEmpty(child['x']) && !isNullOrEmpty(child['y'])) {
                    if (child["-translate"] === undefined) {
                        const translate: SVGTransform = tryGetSVGTransform(<any>e, SVGTransform.SVG_TRANSFORM_TRANSLATE);
                        child["-translate"] = translate;
                    }
                    child["-translate"].setTranslate(child['x'], child['y']);
                }
                if (!isNullOrEmpty(child["rotate"])) {
                    if (child["-rotate"] === undefined) {
                        const rotate: SVGTransform = tryGetSVGTransform(<any>e, SVGTransform.SVG_TRANSFORM_ROTATE);
                        child["-rotate"] = rotate;
                    }
                    child["-rotate"].setRotate(child["rotate"], 0, 0);
                }
                if (!isNullOrEmpty(child["scale"])) {
                    if (child["-scale"] === undefined) {
                        const scale = tryGetSVGTransform(<any>e, SVGTransform.SVG_TRANSFORM_SCALE);
                        child["-scale"] = scale;
                    }
                    child["-scale"].setScale(child["scale"], child["scale"]);
                }



                if (index === -1) {
                    o.svg.appendChild(e);
                } else {
                    o.svg.insertBefore(o.svg.children[index], e);
                }
            }

            /**
             * 从某个元素中找到translate变换，如果没有，则创建一个新的变换
             */
            function tryGetSVGTransform(e: SVGElement, target: number): SVGTransform {
                if (!("transform" in e)) {
                    return undefined;
                }
                const transforms: SVGTransformList = e["transform"].baseVal;
                const length = transforms.length;
                let transform: SVGTransform = undefined;
                for (let i = 0; i < length; i++) {
                    if (transforms[i].type === target) {
                        transform = transforms[i];
                        break;
                    }
                }
                if (transform === undefined) {
                    transform = o.svg.createSVGTransform();
                    if (target === SVGTransform.SVG_TRANSFORM_TRANSLATE) {
                        transform.setTranslate(0, 0);
                    } else if (target === SVGTransform.SVG_TRANSFORM_ROTATE) {
                        transform.setRotate(0, 0, 0);
                    } else if (target === SVGTransform.SVG_TRANSFORM_SCALE) {
                        transform.setScale(1, 1);
                    }
                    transforms.appendItem(transform);
                }
                return transform;
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

            if (o.svg.tabIndex === -1) {
                o.svg.tabIndex = -1;
            }

            _size[0] = o.svg.clientWidth;
            _size[1] = o.svg.clientHeight;

            // 这里没有设置passive为true，因为要阻止浏览器的默认行为
            o.svg["onmousewheel"] = handlewheel;
            window.addEventListener("resize", handleresize);
            // window.addEventListener("keydown", handlekeydown, { capture: true });
            o.svg.onkeydown = handlekeydown;
            o.svg.onfocus = () => _o.focusFlag = true;
            o.svg.onblur = () => {
                _o.focusFlag = false;

                if (o.editFlag === true) {
                    _o.editChild = undefined;
                }
            };
            o.svg.onmouseenter = () => _mouse.inFlag = true;
            o.svg.onmouseleave = () => _mouse.inFlag = false;
            o.svg.onmousedown = handlemousedown;
            o.svg.onmouseup = handlemouseup;
            o.svg.onmousemove = handlemousemove;
            o.svg.oncontextmenu = (ev) => ev.preventDefault();
        }

        this.add = function (type: CHILDREN_TYPE, { id, x, y, x1, y1, x2, y2, onclick, ...args }: {
            x?: number;
            y?: number;
            x1?: number;
            y1?: number;
            x2?: number;
            y2?: number;
            id: string;
            onclick: (ev: Event, data: Children) => void;
        }): string {
            assert(!isNullOrEmpty(type));
            if (type === "g") {
                assert(!isNullOrEmpty(x));
                assert(!isNullOrEmpty(y));
            } else if (type === "line") {
                assert(!isNullOrEmpty(x1));
                assert(!isNullOrEmpty(y1));
                assert(!isNullOrEmpty(x2));
                assert(!isNullOrEmpty(y2));
            }

            const sequence = newId();
            _children.push({
                "data-sequence": sequence,
                "data-id": id,
                type,
                x,
                y,
                x1, x2, y1, y2,
                onclick,
                ...args
            });
            if (o.editFlag === true) {
                _o.editChild = last(children);
            }
            _paintFlag.children = true;
            paintOnce();

            return sequence;
        }
        this.editFlag = function (editFlag: boolean): void {
            _o.editFlag = editFlag || false;
        }
        this.remove = (id: string): boolean => {
            assert(!isNullOrEmpty(id));
            if (o.editFlag && !!o.editChild && o.editChild["data-id"] === id) {
                _o.editChild = undefined;
            }

            const index = children.findIndex(e => e["data-id"] === id);
            if (index > -1) {
                _children.splice(index, 1);
                _paintFlag.children = true;
                paintOnce();
                return true;
            }
            return false;
        }
        this.clear = () => {
            if (o.editFlag) {
                _o.editChild = undefined;
            }
            _children.splice(0, children.length);
            _paintFlag.children = true;
            paintOnce();
        }

        this.triggerEdit = () => {
            _paintFlag.children = true;
            paintOnce();
        };
        this.triggerResize = () => {
            _paintFlag.resize = true;
            paintOnce();
        };
        Object.defineProperty(this, "viewBox", {
            get() { return [...viewBox]; },
            set(value: [number, number, number, number]) {
                if (Array.isArray(value) && value.length === 4 && value.filter(e => isNaN(e)).length === 0) {
                    _viewBox[0] = Number(value[0]);
                    _viewBox[1] = Number(value[1]);
                    _viewBox[2] = Number(value[2]);
                    _viewBox[3] = Number(value[3]);
                }
            }
        });
        Object.defineProperty(this, "size", {
            get() { return [...size]; }
        });
        Object.defineProperty(this, "editChild", {
            get() { return o.editChild; }
        });

        this.cleanEventListener = () => {
            window.removeEventListener("resize", handleresize);
            // window.removeEventListener("keydown", handlekeydown, { capture: true });
        };
    }

    init: (svg: ID, width?: number, height?: number) => void;
    add: (type: CHILDREN_TYPE, { id, x, y, onclick }: {
        id: string;
        x: number;
        y: number;
        onclick: (ev: Event, data: Children) => void;
    }) => string;
    remove: (id: string) => boolean;
    clear(): void { throw "没有实现"; }
    triggerEdit: () => void;
    triggerResize: () => void;
    editFlag: (editFlag: boolean) => void;
    get editChild(): Children { return undefined; }
    get viewBox() { return [0, 0, 0, 0] };
    set viewBox(value: [number, number, number, number]) { [...value]; }
    get size() { return [0, 0]; }
    // 清理添加的listener
    cleanEventListener(): void { throw "没有实现"; }
    // 没有太好的办法从外部获取这个事件
    onitemmousemove: (item: Children) => void;

    /**
     * 将svg中的坐标按照视口指定的范围转化
     * @param param0 svg中的坐标以及svg的大小
     */
    static svg2ViewBox([x, y, width, height]: [number, number, number, number], viewBox: [number, number, number, number]): [number, number] {
        assert(!isNullOrEmpty(x));
        assert(!isNullOrEmpty(y));
        assert(!isNullOrEmpty(width));
        assert(!isNullOrEmpty(height));
        assert(!isNullOrEmpty(viewBox));
        assert(viewBox.length === 4);

        x = Number(x);
        y = Number(y);
        width = Number(width);
        height = Number(height);
        viewBox = <any>viewBox.map(e => Number(e));
        assert(!isNaN(x));
        assert(!isNaN(y));
        assert(!isNaN(width) && width !== 0);
        assert(!isNaN(height) && height !== 0);
        assert(viewBox[2] !== 0);
        assert(viewBox[3] !== 0);

        return [
            x / width * viewBox[2] + viewBox[0],
            y / height * viewBox[3] + viewBox[1]
        ];
    }
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
