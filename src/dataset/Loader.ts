import { async as StreamZipAsync } from 'node-stream-zip';
import { LoadResourceCallback } from "./types";


export function jarLoader(jarPath: string): LoadResourceCallback
{
    const jar = new StreamZipAsync({ file: jarPath });

    const loader = {
        async load(packType: "assets"|"data", path: string): Promise<Uint8Array>
        {
            return jar.entryData(packType + "/" + path)
            .then(buffer => Uint8Array.from(buffer))
        },
        async close() { jar.close(); },
        async loadAll(packType: "assets"|"data", path: string): Promise<Uint8Array []> {
            try {
                return [ await loader.load(packType, path) ];
            }catch(e)
            {
                return [];
            }
        }


    };
    return loader;
}


export function createMultiloader(...loaders: LoadResourceCallback[]): LoadResourceCallback
{
    const loader = {
        
        async load(packType: "assets"|"data", path: string): Promise<Uint8Array>
        {
            for(const childLoader of loaders)
            {
                try{
                    return await childLoader.load(packType, path);
                }catch(e)
                {

                }
            }
            throw new Error(`Could not load "${path}" from any source.`);
        },
        async close() { return Promise.all(loaders.map( l => l.close() )) },

        async loadAll(packType: "assets"|"data", path: string): Promise<Uint8Array[]> {
            const results = [];
            for(const loader of loaders)
            {
                try{
                    results.push(await loader.load(packType, path));
                }catch(e)
                {

                }
            }
            return results;
        }
    };


    return loader;
}