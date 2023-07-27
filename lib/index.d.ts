import {IndexedData} from 'minecraft-data'
import {NBT} from 'prismarine-nbt'

interface PCRegistry extends IndexedData {
  loadDimensionCodec(codec: NBT): void
  writeDimensionCodec(): NBT
}

interface BedrockRegistry extends IndexedData {

}
export type Registry = PCRegistry & BedrockRegistry
export default function loader(mcVersion: string): Registry
