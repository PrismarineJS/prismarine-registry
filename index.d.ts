import { IndexedData } from 'minecraft-data';
import { NBT } from 'prismarine-nbt';

export interface PCRegistry extends IndexedData {
  loadDimensionCodec(codec: NBT): void;
  writeDimensionCodec(): NBT;
}

export interface BedrockRegistry extends IndexedData {
  loadItemStates(itemStates: ItemState[]): void;
  writeItemStates(): ItemState[];
}

export type ItemState = {
  name: string;
  runtime_id: number;
  component_based: boolean;
}

export type Registry = PCRegistry & BedrockRegistry;
export default function loader(mcVersion: string): Registry;
