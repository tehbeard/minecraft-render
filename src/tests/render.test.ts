import { Dependency, Skip, Spec } from "nole";

import * as path from "path";
import * as fs from "fs";
import { BlockModel } from "../utils/types";
import { Logger } from "../utils/logger";
import { RenderClass } from "../dataset/RenderClass";
import { createMultiloader, jarLoader } from "../dataset/Loader";
import { ResourcePackLoader } from "../dataset/ResourcePackLoader";
import { DownloadTest } from "./download.test";

export class NewRenderTest {
  @Dependency(DownloadTest)
  jarTest!: DownloadTest;

  @Spec(180000)
  async renderAll() {

    const packLoader = new ResourcePackLoader(
      createMultiloader(
        jarLoader("./test-data/test.jar")
      )
    );
    const renderer = new RenderClass(
      packLoader,
      {}
    );

    for(let namespace of await packLoader.getNamespaces()){

      console.log("Processing " + namespace);


      
      const dirPath = path.resolve(__dirname,`../../test-data/${namespace}`);
      try{
        fs.statSync(dirPath)
      }catch(e)
      {
        fs.mkdirSync(dirPath);
      }

      const blockstates = await packLoader.getBlockstates(namespace);
      for(let blockstate of blockstates)
      {
        console.log(namespace + ":" + blockstate);

        const filePath = path.resolve(dirPath, `${blockstate}.png`)

        const buffer = await renderer.render(namespace, blockstate);

        if(buffer!=null){
          await writeAsync(filePath, buffer);
        }else{
          console.log("Did not render");
        }

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

  const preferred = BLOCK_NAMES.split(",");

  Logger.info(() => `BLOCK_NAMES flag is enabled. "${BLOCK_NAMES}"`);

  return blocks.filter((block) =>
    preferred.some((name) => name == block.blockName)
  );
}
