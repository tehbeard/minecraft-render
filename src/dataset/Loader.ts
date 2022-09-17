import { async as StreamZipAsync } from 'node-stream-zip';
import { ResourceLoader } from "./types";


export function jarLoader(jarPath: string): ResourceLoader
{
    const jar = new StreamZipAsync({ file: jarPath });

    const loader = {
        async load(packType: "assets"|"data", path: string): Promise<Uint8Array>
        {
            return jar.entryData(packType + "/" + path)
            .then(buffer => Uint8Array.from(buffer))
        },
        async list(packType: "assets"|"data", path: string): Promise<string[]>
        {
            return Object.entries(await jar.entries())
            .filter(([key]) => key.startsWith(packType + "/" + path))
            .map(([_, value]) => value.name.substring( (packType + "/" + path).length + ( path.length > 0 ? 1 : 0) ))
            .filter( f => f!="");
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


export function createMultiloader(...loaders: ResourceLoader[]): ResourceLoader
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
        async list(packType: "assets"|"data", path: string): Promise<string[]>
        {
            let list: Set<string> = new Set();
            for(const childLoader of loaders)
            {
                (await childLoader.list(packType, path)).map( f => list.add(f))
            }
            return Array.from(list);
        },
        async close() { return Promise.all(loaders.map( l => l.close() )) },

        async loadAll(packType: "assets"|"data", path: string): Promise<Uint8Array[]> {
            const results = [];
            for(const childLoader of loaders)
            {
                try{
                    results.push(await childLoader.load(packType, path));
                }catch(e)
                {

                }
            }
            return results;
        }
    };


    return loader;
}