import { assert } from "../util/assert";
import { isNullOrEmpty, defaultValue as or } from "../util/util";

type WIDTH = number;
type HEIGHT = number;
type SIZE = [WIDTH, HEIGHT];

export namespace svg {
    export function size(svg: SVGSVGElement): SIZE {
        assert(!isNullOrEmpty(svg));
        const viewBox = svg.getAttribute("viewBox");
        if (!isNullOrEmpty(viewBox)) {
            const bounds = viewBox.split(" ");
            if (bounds[0] !== "0" || bounds[1] !== "0") {
                throw new Error("viewBox不是初始化的状态，无法获取确定的svg尺寸");
            }
            return [Number(bounds[2]), Number(bounds[3])];
        }
        return [svg.clientWidth, svg.clientHeight];
    }

    // 过滤出符合条件的节点
    export function devices(svg: SVGSVGElement): SVGElement[] {
        throw new Error("尚未实现");
    }
}