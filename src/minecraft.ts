import { destroyRenderer, prepareRenderer, render } from "./render";
import { Jar } from "./utils/jar";
import type { AnimationMeta, BlockModel, Renderer, RendererOptions } from "./utils/types";
//@ts-ignore
import * as deepAssign from 'assign-deep';
import { ModelBlockstateFile, ResourceLoader } from "./dataset/types";
import { ResourcePackLoader } from "./dataset/ResourcePackLoader";

export class Minecraft {

  protected loader: ResourceLoader;
  protected resourceLoader: ResourcePackLoader;

  protected renderer!: Renderer | null;
  protected _cache: { [key: string]: any } = {};

  protected constructor(loader: ResourceLoader) {
    this.loader = loader;
    this.resourceLoader = new ResourcePackLoader(loader);
  }

  static open(loader: ResourceLoader) {
    return new Minecraft(loader);
  }

  async getBlockNameList(): Promise<string[]> {
    return (await this.loader.list("assets", "minecraft/blockstates"))
      .filter(entry => entry.endsWith(".json"))
      .map(entry => "minecraft:" + entry.slice('minecraft/blockstates/'.length, -('.json'.length)));
  }

  async getBlockList(): Promise<BlockModel[]> {
    return (await Promise.all((await this.getBlockNameList()).map(
      async block => {
        const record = await this.getModelBlockstatesFile(block);
          if("variants" in record)
          {
            let blockstate = Object.values(record.variants)[0];
            blockstate = Array.isArray(blockstate) ? blockstate[0] : blockstate;
            return this.getModel(blockstate.model);
          }else{
            return null;
          }
          // return this.getModel('block');
      }
      )
      )).filter( f => f != null) as BlockModel[];
  }

  async getNamespaces(): Promise<string[]> {
    return Array.from(
      new Set(
        (await this.loader.list("assets", "")).map( f => f.split("/")[0] ).filter( f => f != "" && !['realms','.mcassetsroot'].includes(f))
      )
    );
  }

  async getModelFile<T = BlockModel>(name = 'block/block'): Promise<T> {


    // if (name.indexOf('/') == -1) {
    //   name = `block/${name}`;
    // }

    const path = `minecraft/models/${name}.json`;

    // try {
      if (this._cache[path]) {
        return JSON.parse(JSON.stringify(this._cache[path]));
      }

      this._cache[path] = await this.resourceLoader.getModel(name);

      return this._cache[path];
    // } catch (e) {
    //   throw new Error(`Unable to find model file: ${path}`);
    // }
  }

  async getModelBlockstatesFile<T = ModelBlockstateFile>(name = 'block/block'): Promise<T> {
    if (name.startsWith('minecraft:')) {
      name = name.substring('minecraft:'.length);
    }
    if (name.startsWith('create:')) {
      name = name.substring('minecraft:'.length);
    }

    const path = `minecraft/blockstates/${name}.json`;

    try {
      if (this._cache[path]) {
        return JSON.parse(JSON.stringify(this._cache[path]));
      }

      this._cache[path] = JSON.parse(
        (new TextDecoder).decode( await this.loader.load("assets", path) )
      );

      return this._cache[path];
    } catch (e) {
      throw new Error(`Unable to find blockstates file: ${path}`);
    }
  }

  async getDefaultModelRotation(name = 'block'): Promise<number> {
    try{
      const record = await this.getModelBlockstatesFile(name);
      if("variants" in record)
      {
        let blockstate = Object.values(record.variants)[0];
        blockstate = Array.isArray(blockstate) ? blockstate[0] : blockstate;
        return blockstate?.y ?? 0;
      }
    }catch(e)
    {
      
    }
    return 0;
  }

  async getTextureFile(name: string = ''): Promise<Buffer> {
    try {
      return this.resourceLoader.getTextureAsBuffer(name);
    } catch (e) {
      throw new Error(`Unable to find texture file: ${name}`);
    }
  }


  async getTextureMetadata(name: string = ''): Promise<AnimationMeta | null> {
    return this.resourceLoader.getAnimationData(name);
  }

  async *render(blocks: BlockModel[], options?: RendererOptions) {
    try {
      await this.prepareRenderEnvironment(options);

      for (const block of blocks) {
        yield await render(this, block);
      }
    } finally {
      await this.cleanupRenderEnvironment();
    }
  }

  async getModel(blockName: string): Promise<BlockModel> {
    let { parent, ...model } = await this.getModelFile(blockName);

    if (parent) {
      model = deepAssign({}, await this.getModel(parent), model);

      if (!model.parents) {
        model.parents = [];
      }

      model.parents.push(parent);
    }

    return deepAssign(model, { blockName });
  }

  async close() {
    await this.loader.close();
  }

  async prepareRenderEnvironment(options: RendererOptions = {}) {
    this.renderer = await prepareRenderer(options)
  }

  async cleanupRenderEnvironment() {
    await destroyRenderer(this.renderer!);
    this.renderer = null;
  }

  getRenderer() {
    return this.renderer!;
  }
}