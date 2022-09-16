import { Dependency, Spec } from 'nole';
import { createMultiloader, jarLoader } from '../dataset/Loader';
import { Minecraft } from '../minecraft';
import { JarTest } from './jar.test';

export class MinecraftTest {
  @Dependency(JarTest)
  jarTest!: JarTest;

  minecraft!: Minecraft

  @Spec()
  async init() {
    this.minecraft = Minecraft.open(
      createMultiloader(
        jarLoader('C:/tools/MultiMC/instances/Sprinkles 1.18/.minecraft/mods/create-mc1.18.2_v0.5.0c.jar'),
        jarLoader('./test-data/test.jar')
      )
    );
  }

  @Spec()
  async blockModel() {
    
    // const blockList = (await this.minecraft.getBlockNameList());
    const blockList = (await this.minecraft.getNamespaces());
    
    for( let entry of blockList){
      console.log("-", entry);
    }
    console.log("Blocks found", blockList.length);
  }
}