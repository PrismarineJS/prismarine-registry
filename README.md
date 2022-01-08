# prismarine-registry
[![NPM version](https://img.shields.io/npm/v/prismarine-registry.svg)](http://npmjs.com/package/prismarine-registry)
[![Build Status](https://github.com/PrismarineJS/prismarine-registry/workflows/CI/badge.svg)](https://github.com/PrismarineJS/prismarine-registry/actions?query=workflow%3A%22CI%22)
[![Discord](https://img.shields.io/badge/chat-on%20discord-brightgreen.svg)](https://discord.gg/GsEFRM8)
[![Try it on gitpod](https://img.shields.io/badge/try-on%20gitpod-brightgreen.svg)](https://gitpod.io/#https://github.com/PrismarineJS/prismarine-registry)

Registry for storing indexed data

## Usage

```js
const registry = require('prismarine-registry')('1.18')

registry.biomes.set(2, 'minecraft:ocean', { data: 'about an ocean biome' })
console.assert(registry.biomes.getIndex('minecraft:ocean') === 2)
console.log(registry.biomes.get('minecraft:ocean')) // Should get { data: 'about an ocean biome' }
```

## API

Calling the default default export for `prismarine-registry` with a minecraft version will create a new set of registries.

to create a registry for version 1.18,

```js
const registry = require('prismarine-registry')('1.18')
```

and to add something to the registry,
```js
registry.biomes.set(2, 'minecraft:ocean', { data: 'about an ocean biome' })
```

or to push with an auto-incrementing ID,

```js
registry.biomes.add('minecraft:ocean', { data: 'about an ocean biome' })
```

to get something from registry with an index,

```js
registry.biomes.getValueAt(index) => value
registry.biomes.getName(index) => string name

```

A individual registry looks like this:

```ts
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
```
