import { LoadResourceCallback, ModelBlockstate, ModelBlockstateFile } from "./types";
import { constructPath } from "./utils";

export class ModelDataProvider {

    private dataProvider: LoadResourceCallback;


    constructor(dataProvider: LoadResourceCallback)
    {
        this.dataProvider = dataProvider;
    }
    
    getModelBlockstate(namespace: string, identifier?: string ): Promise<ModelBlockstateFile>
    {
        return this.dataProvider('assets', constructPath('blockstates', 'json', namespace, identifier))
        .then( data => JSON.parse(data) as ModelBlockstateFile); //TODO - Validation of format
    }

    getDefaultModelblockstate(namespace: string, identifier?: string): Promise<ModelBlockstate>
    {
        return this.getModelBlockstate(namespace, identifier).then(
            file => file.variants[0]
        )
    }

    //TODO - Rework this to provide the raw png 
    getTexture(namespace: string, identifier?: string): Promise<string>
    {
        return this.dataProvider('assets', constructPath('textures','png', namespace, identifier));
    }
}