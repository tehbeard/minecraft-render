

//TODO - Rework this to return a buffer/blob instead
export type LoadResourceCallback = (packType: "assets"|"data", path: string) => Promise<string>;

export type ModelBlockstateFile = {
    variants: Record<string, ModelBlockstate>;
}

export type ModelBlockstate = {
    model: string;
    uvblock?: true;
    x?: number;
    y?: number;
}