import { IndexedData } from 'minecraft-data'
import { NBT } from 'prismarine-nbt'

declare function loader(mcVersion: string): loader.Registry
declare namespace loader {
  export interface RegistryPc extends IndexedData {
    loadDimensionCodec(codec: NBT): void;
    writeDimensionCodec(): NBT;
  }
  
  export interface RegistryBedrock extends IndexedData {
    blockStatesByStateId: { [stateId: number]: BlockState };
    handleStartGame(packet: any): void;
    handleItemRegistry(packet: any): void;
    writeItemStates(): ItemState[];
  }
  
  export type Registry = RegistryBedrock | RegistryPc
  export type BlockState = {
    name: string
    states: { [name: string]: { type: string, value: unknown } }
    version?: number
    stateId?: number
  }
  export type ItemState = {
    name: string
    runtime_id: number
    component_based: boolean
  }
}

export = loader