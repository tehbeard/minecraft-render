import { Dependency, Skip, Spec } from 'nole';
import { MinecraftTest } from './minecraft.test';

import * as path from 'path';
import * as fs from 'fs';
import { BlockModel } from '../utils/types';
import { Logger } from '../utils/logger';


export class RenderTest {
  @Dependency(MinecraftTest)
  minecraftTest!: MinecraftTest;

  @Spec()
  async renderCreateOne()
  {
    const model = await this.minecraftTest.minecraft.getModel('create:block/cogwheel');
    for await (const render of this.minecraftTest.minecraft.render([model])){
      if (!render.buffer) {
        console.log('Rendering skipped ' + render.blockName + ' reason: ' + render.skip!);
        continue;
      }

      render.blockName = render.blockName?.replace("create:block/", "");

      const filePath = path.resolve(__dirname, `../../test-data/${process.env.RENDER_FOLDER || ''}${render.blockName}.png`);
      try{
        await writeAsync(filePath, render.buffer);
      }catch(e)
      {
        console.error(render);
        throw e;
      }
    }
  }
  @Spec(180000)
  async renderAll() {

    // const blocks = [await this.minecraftTest.minecraft.getModel('cactus')];
    const blocks = await this.minecraftTest.minecraft.getBlockList();

    const renderCandidates = pickBlocks(blocks);

    for await (const render of this.minecraftTest.minecraft.render(renderCandidates)) {
      if (!render.buffer) {
        console.log('Rendering skipped ' + render.blockName + ' reason: ' + render.skip!);
        continue;
      }

      render.blockName = render.blockName?.replace("minecraft:block/", "");

      const filePath = path.resolve(__dirname, `../../test-data/${process.env.RENDER_FOLDER || ''}${render.blockName}.png`);
      try{
        await writeAsync(filePath, render.buffer);
      }catch(e)
      {
        console.error(render);
        throw e;
      }
    }
  }
}

function writeAsync(filePath: string, buffer: Buffer) {
  return new Promise<void>((resolve, reject) => {
    fs.writeFile(filePath, buffer, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function pickBlocks(blocks: BlockModel[]) {
  const { BLOCK_NAMES } = process.env;

  if (!BLOCK_NAMES) {
    return blocks;
  }

  const preferred = BLOCK_NAMES.split(',');

  Logger.info(() => `BLOCK_NAMES flag is enabled. "${BLOCK_NAMES}"`)

  return blocks.filter(block => preferred.some(name => name == block.blockName));
}