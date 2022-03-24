import { assert } from "../util/assert.js";
import { isNullOrEmpty } from "../util/util.js";
import { SvgMap } from "./svg.map.js";

interface Item {
    id: string;
    template: string;
    position: { x: number; y: number; };
}


export declare class PropertyTool {
    static initInput(): void;
    static init(): void;

    static setDeviceId(value: string): void;
    static setDeviceName(value: string): void;
    static setSubstationName(value: string): void;
    static setBayName(value: string): void;
    static setScale(value: number): void;
    static setRotate(value: number): void;
    static setX1(value: number): void;
    static setY1(value: number): void;
    static setX2(value: number): void;
    static setY2(value: number): void;
    static setLineType(type: number): void;
    static setLineDirection(direction: number): void;
    static setText(value: string): void;
    /**
     * 控制控件的显示和隐藏
     * * 0：通用
     * * 1：线
     * * 2：文字
     * @param type 
     */
    static setType(type: 0 | 1 | 2): void;

    static onclickassociatedevice: () => void;
    static onclickresetsize: () => void;
    static onclicksave: () => void;
    static onchangescale: (value: number) => void;
    static onchangerotate: (value: number) => void;
    static onchangex1: (value: number) => void;
    static onchangey1: (value: number) => void;
    static onchangex2: (value: number) => void;
    static onchangey2: (value: number) => void;
    static onchangelinetype: (type: number) => void;
    static onchangelinedirection: (direction: number) => void;
    static onchangetext: (value: string) => void;


    static svgmap: SvgMap;
}

export declare class SvgMapParser {
    static fromJSON(svgmap: SvgMap, json: JSON): void;
    static fromSVG(svgmap: SvgMap, svg: SVGSVGElement): void;
    // 判断是否所有的设备都与数据库关联
    static valid(svgmap: SvgMap): boolean;
}



export interface SvgToolBox {
    init(toolBoxId: string, svgId: string): void;

    onadd: (item: Item) => void;
}
export class SvgToolBoxImpl implements SvgToolBox {
    init(toolBoxId: string, svgId: string): void {
        const EVENT_FLAG = {
            inSVG: false
        };


        const self = this;
        self.svg = <any>document.getElementById(svgId);
        self.toolBox = document.getElementById(toolBoxId);
        assert(!isNullOrEmpty(self.svg));
        assert(!isNullOrEmpty(self.toolBox));
        self.toolBox.addEventListener("dragstart", ondragstart);
        self.toolBox.addEventListener("dragend", ondragend);
        self.svg.addEventListener("dragover", ondragenter);
        self.svg.addEventListener("dragleave", ondragleave);


        function ondragenter(ev: DragEvent): void {
            if (ev.currentTarget === self.svg) {
                EVENT_FLAG.inSVG = true;

                ev.preventDefault();
                ev.dataTransfer.dropEffect = "move";
            }
        }
        function ondragleave(ev: DragEvent): void {
            if (ev.currentTarget === self.svg) {
                ev.preventDefault();
                ev.stopPropagation();
                EVENT_FLAG.inSVG = false;

                ev.dataTransfer.dropEffect = "none";
            }
        }
        function ondragstart(ev: DragEvent): void {
            ev.dataTransfer.effectAllowed = "move";
            EVENT_FLAG.inSVG = false;

            self.draggingItem = undefined;
            let target = <HTMLElement>ev.target;
            if (isNullOrEmpty(target)) {
                ev.preventDefault();
                return;
            }
            const svg = target.querySelector("svg[data-type=template]");
            if (!isNullOrEmpty(svg)) {
                target = <any>svg;
            } else {
                while (!isNullOrEmpty(target) && !(target.tagName === "svg" && target.dataset["type"] === "template")) {
                    target = <any>target.parentElement;
                }
            }
            if (isNullOrEmpty(target) || !(target.tagName === "svg" && target.dataset["type"] === "template")) {
                ev.preventDefault();
                return;
            }
            self.draggingItem = target.children[0];
        }
        function ondragend(ev: DragEvent): void {
            const inSvgFlag = EVENT_FLAG.inSVG;
            EVENT_FLAG.inSVG = false;

            const draggingItem = self.draggingItem;
            self.draggingItem = undefined;
            if (draggingItem === undefined) { return; }
            if (!inSvgFlag) { return; }
            let [x, y] = [ev.x, ev.y];
            const offset = [0, 0];
            let target: HTMLElement = <any>self.svg.parentElement;
            while (!!target) {
                offset[0] += target.offsetLeft;
                offset[1] += target.offsetTop;
                target = <any>target.offsetParent;
            }
            x -= offset[0];
            y -= offset[1];
            if (typeof self.onadd === "function") {
                self.onadd({
                    id: "",
                    template: draggingItem,
                    position: {
                        x: x,
                        y: y
                    }
                });
            }
        }
    }
    onadd: (item: Item) => void;


    draggingItem: any;
    svg: SVGSVGElement;
    toolBox: HTMLElement;
}



// 记录外部数据
export interface Entity {
    dataId: string;
}
export interface Device extends Entity {
    deviceId: string;
    deviceName: string;
    substationName: string;
    bayName: string;
}
export interface Line extends Entity { }

