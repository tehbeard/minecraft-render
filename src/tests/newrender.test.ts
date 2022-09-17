import { Dependency, Skip, Spec } from "nole";
import { MinecraftTest } from "./minecraft.test";

import * as path from "path";
import * as fs from "fs";
import { BlockModel } from "../utils/types";
import { Logger } from "../utils/logger";
import { RenderClass } from "../dataset/RenderClass";
import { createMultiloader, jarLoader } from "../dataset/Loader";
import { ResourcePackLoader } from "../dataset/ResourcePackLoader";
import { render } from "../render";

export class NewRenderTest {
  @Dependency(MinecraftTest)
  minecraftTest!: MinecraftTest;

  @Spec()
  async renderCreateOne() {
    const renderer = new RenderClass(
      new ResourcePackLoader(
        createMultiloader(
          jarLoader(
            "C:/tools/MultiMC/instances/Sprinkles 1.18/.minecraft/mods/create-mc1.18.2_v0.5.0c.jar"
          ),
          jarLoader("./test-data/test.jar")
        )
      ),
      {}
    );

    const buffer = await renderer.render("create", "cogwheel");

    const filePath = path.resolve(
      __dirname,
      `../../test-data/${process.env.RENDER_FOLDER || ""}${"cogwheel"}.png`
    );
    if(buffer!=null){
      await writeAsync(filePath, buffer);
    }else{
      console.log("Did not render");
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
