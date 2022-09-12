import { Jar } from "../utils/jar";
import { async as StreamZipAsync, ZipEntry } from 'node-stream-zip';
import { LoadResourceCallback } from "./types";


export function jarLoader(jarPath: string): LoadResourceCallback
{
    const jar = new StreamZipAsync({ file: jarPath });

    const jarFn = function (packType: "assets"|"data", path: string): Promise<Uint8Array>
    {
        return jar.entryData(packType + "/" + path)
        .then(buffer => Uint8Array.from(buffer))
    }

    jarFn.close = () => jar.close();

    return jarFn;
}


export function createMultiloader(...loaders: LoadResourceCallback[]): LoadResourceCallback
{
    const multiFn = async function (packType: "assets"|"data", path: string): Promise<Uint8Array>
    {
        for(const loader of loaders)
        {
            try{
                return await loader(packType, path);
            }catch(e)
            {

            }
        }
        throw new Error(`Could not load "${path}" from any source.`);
    }
    multiFn.close = () => Promise.all(loaders.map( l => l.close() ));
    return multiFn;
}