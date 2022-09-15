import { async as StreamZipAsync } from 'node-stream-zip';
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
    jarFn.loadAll = async (packType: "assets"|"data", path: string): Promise<Uint8Array []> => {
        try {
            return [ await jarFn(packType, path) ];
        }catch(e)
        {
            return [];
        }
    };
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

    multiFn.loadAll = async (packType: "assets"|"data", path: string): Promise<Uint8Array[]> => {
        const results = [];
        for(const loader of loaders)
        {
            try{
                results.push(await loader(packType, path));
            }catch(e)
            {

            }
        }
        return results;
    }


    return multiFn;
}