export function compatibilityTest(): string[] {
    const res: string[] = [];
    if (!window.hasOwnProperty('ondragstart')) {
        res.push("不支持 ondragstart");
    }
    if (!window.hasOwnProperty('ondragend')) {
        res.push("不支持 ondragend");
    }
    if (!Array.isArray) {
        res.push("不支持 Array.isArray");
    }


    return res;
}