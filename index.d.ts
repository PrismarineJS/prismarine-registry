import {IndexedData} from 'minecraft-data'

declare function loader(mcVersion: string): IndexedData
declare namespace loader {
  export type Registry = IndexedData
}

export = loader