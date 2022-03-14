namespace color {
    export function toRGB(color: number): string {
        return "rgb(" + (color >> 16) + "," + ((color >> 8) & 0xFF) + "," + (color & 0xFF) + ")";
    }
    export function toHSL(hex: number): string {
        const r = (hex >> 16) & 0xFF;
        const g = (hex >> 8) & 0xFF;
        const b = hex & 0xFF;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const h = max === min ? 0 : (max === r ? ((g - b) / (max - min)) * 60 : (max === g ? ((b - r) / (max - min)) * 60 + 120 : ((r - g) / (max - min)) * 60 + 240));
        const s = max === 0 ? 0 : (max - min) / max;
        const l = (max + min) / 2;
        return "hsl(" + h + "," + s * 100 + "%," + l * 100 + "%)";
    }
    export function isRGB(color: string): boolean {
        return color.indexOf("rgb") === 0;
    }
    export function isHSL(color: string): boolean {
        return color.indexOf("hsl") === 0;
    }
    export function toHex(color: string): number {
        if (isRGB(color)) {
            const rgb = color.substring(4, color.length - 1).split(",");
            return (parseInt(rgb[0]) << 16) + (parseInt(rgb[1]) << 8) + parseInt(rgb[2]);
        } else if (isHSL(color)) {
            const hsl = color.substring(4, color.length - 1).split(",");
            const r = Math.round(Number(hsl[2].substring(0, hsl[2].length - 1)) * 2.55);
            const g = Math.round(Number(hsl[1].substring(0, hsl[1].length - 1)) * 2.55);
            const b = Math.round(Number(hsl[0].substring(0, hsl[0].length - 1)) * 2.55);
            return (r << 16) + (g << 8) + b;
        } else {
            return parseInt(color.substring(1), 16);
        }
    }
}