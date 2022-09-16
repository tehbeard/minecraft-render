import { ResourceLoader, ModelBlock, ModelBlockstate, ModelBlockstateFile } from "./types";
import { constructPath, parseJSON } from "./utils";

export class ModelDataProvider {

    private dataProvider: ResourceLoader;


    constructor(dataProvider: ResourceLoader)
    {
        this.dataProvider = dataProvider;
    }
    
    getModelBlockstate(namespace: string, identifier?: string ): Promise<ModelBlockstateFile>
    {
        return this.dataProvider('assets', constructPath('blockstates', 'json', namespace, identifier))
        .then( parseJSON<ModelBlockstateFile> ); //TODO - Validation of format
    }

    getDefaultModelblockstate(namespace: string, identifier?: string): Promise<ModelBlockstate>
    {
        return this.getModelBlockstate(namespace, identifier).then(
            file => file.variants[0]
        )
    }

    //TODO - Rework this to provide the raw png 
    getTexture(namespace: string, identifier?: string): Promise<Uint8Array>
    {
        return this.dataProvider('assets', constructPath('textures','png', namespace, identifier));
    }

    getModel(namespace: string, identifier?: string): Promise<ModelBlock>
    {
        return this.dataProvider('assets', constructPath('models', 'json', namespace, identifier))
        .then( parseJSON<ModelBlock> ); //TODO - Validation of format
    }

    getModels(namespace: string, identifier?: string): Promise<ModelBlock[]>
    {
        return this.getModel(namespace, identifier)
        .then( model => {

            // If we have a parent
            if(model.parent != undefined)
            {
                return this.getModels(namespace, identifier)
                .then( models => {
                    return models.concat(model);
                })
            }else{
                return [ model ];
            }
        })
    }
}