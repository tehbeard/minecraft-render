

//TODO - Rework this to return a buffer/blob instead
export type LoadResourceCallback = (
    { 
        load: (packType: "assets"|"data", path: string) => Promise<Uint8Array>,
        close: () => Promise<any>,
        loadAll: (packType: "assets"|"data", path: string) => Promise<Uint8Array[]>
    }
    );

export type ModelBlockstateFile = {
    variants: Record<string, ModelBlockstate|ModelBlockstate[]>;
}|{
    multipart: []
}

export type ModelBlockstate = {
    model: string;
    uvblock?: true;
    x?: number;
    y?: number;
    weight?: number;
}

type Vector3 = [number, number, number];
type Vector4 = [number, number, number, number];

type Directions = "down"|"up"|"north"|"south"|"west"|"east";

type Element = {
    from: Vector3;
    to: Vector3;
    rotation: { origin: Vector3, axis: "x"|"y"|"z", angle: number, rescale: boolean };
    shade: boolean;
    faces: Record< Directions, {
        uv: Vector4;
        texture: string;
        cullface: Directions;
        rotation: number;
        tintindex: number;
    }>
};

export type ModelBlock = {
    parent?: string;
    ambientocclusion?: boolean;

    display: Record<
        "thirdperson_righthand"|"thirdperson_lefthand"|"firstperson_righthand"|"firstperson_lefthand"|"gui"|"head"|"ground"|"fixed",
        {
            rotation?: Vector3;
            translation?: Vector3;
            scale ?: Vector3
        }
        >;
    
    textures: Record<string, string>;

    elements: Element[]
}