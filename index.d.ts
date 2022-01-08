declare module "prismarine-registry" {
  interface Registry {
    // Sets a value at a string key and numerical index
    set(index: number, key: string, value): void
    // Returns at what index the key was set
    add(key: string, value): number

    // Gets the value at a string key or numerical index
    get(keyOrIndex: number | string)
    // Get the value for the string key
    getValue(key: string)
    // Get value for the number index
    getValueAt(index: number)

    getName(index: number): string
    getIndex(key: string): number
  }

  interface BedrockRegistry {
    biomes: Registry
    items: Registry
    recipes: Registry
    commands: Registry
  }

  interface JavaRegistry {
    biomes: Registry
    recipes: Registry
  }
  
  export default function(mcVersion: string): JavaRegistry & BedrockRegistry
}