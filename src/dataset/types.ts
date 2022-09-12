

//TODO - Rework this to return a buffer/blob instead
export type LoadResourceCallback = ((packType: "assets"|"data", path: string) => Promise<Uint8Array>) & ({ close: () => Promise<any> });

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

type Coordinate = [number, number, number];
type Coordinate4 = [number, number, number, number];

type Directions = "down"|"up"|"north"|"south"|"west"|"east";

type Element = {
    from: Coordinate;
    to: Coordinate;
    rotation: { origin: Coordinate, axis: "x"|"y"|"z", angle: number, rescale: boolean };
    shade: boolean;
    faces: Record< Directions, {
        uv: Coordinate4;
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
            rotation?: Coordinate;
            translation?: Coordinate;
            scale ?: Coordinate
        }
        >;
    
    textures: Record<string, string>;

    elements: Element[]
}