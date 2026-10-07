/* eslint-env mocha */

const SUPPORTED_VERSIONS = ['1.17.10', '1.18.0', '1.18.11', '1.18.30', '1.19.1', '1.19.10', '1.21.50', '1.21.60', '1.21.70']
const test = require('./mcbedrock')
const assert = require('assert')
const { sleep } = require('./util/sleep')

describe('mcbedrock', function () {
  this.timeout(18000 * 10)

  for (const version of SUPPORTED_VERSIONS) {
    // starts a vanilla server; skipped until it reads recorded packets instead
    it.skip('works on ' + version, async () => {
      await test(version)
      await sleep(200)
    })
  }
})

describe('bedrock hashed runtime ids', function () {
  const VERSION = '1.21.70'
  const DIAMOND_ID = 192
  const DIAMOND_HASH = 1460042000
  const DIAMOND_INDEX = 1276

  function setup () {
    const registry = require('prismarine-registry')(`bedrock_${VERSION}`)
    require('prismarine-block')(registry)
    return { registry }
  }

  it('remaps block state ids to hashes when block_network_ids_are_hashes is true', function () {
    const { registry } = setup()
    registry.handleStartGame({ itemstates: [], block_network_ids_are_hashes: true })

    const block = registry.blocksByName.diamond_block

    // Every block index resolves to the same shared block object reference.
    assert.strictEqual(registry.blocksArray.find(b => b.id === DIAMOND_ID), block)
    assert.strictEqual(registry.blocks[DIAMOND_ID], block)
    assert.strictEqual(registry.blocksByStateId[DIAMOND_HASH], block)

    assert.strictEqual(block.id, DIAMOND_ID)
    assert.strictEqual(block.minStateId, undefined)
    assert.strictEqual(block.maxStateId, undefined)
    assert.deepStrictEqual(block.states, [DIAMOND_HASH])
    assert.strictEqual(block.defaultState, DIAMOND_HASH)

    // blockStates stays an array, keyed by the resolved (hashed) stateId.
    const blockState = registry.blockStates.find(bs => bs.stateId === block.defaultState)
    assert.strictEqual(blockState.stateId, DIAMOND_HASH)
    assert.strictEqual(blockState.name, 'diamond_block')

    // blocksByRuntimeId keeps its { stateId, ...block } shape.
    const runtimeBlock = registry.blocksByRuntimeId[DIAMOND_HASH]
    assert.strictEqual(runtimeBlock.stateId, DIAMOND_HASH)
    assert.strictEqual(runtimeBlock.name, 'diamond_block')
  })

  it('keeps sequential block state ids when block_network_ids_are_hashes is false', function () {
    const { registry } = setup()
    registry.handleStartGame({ itemstates: [], block_network_ids_are_hashes: false })

    const block = registry.blocksByName.diamond_block

    assert.strictEqual(registry.blocksArray.find(b => b.id === DIAMOND_ID), block)
    assert.strictEqual(registry.blocks[DIAMOND_ID], block)
    assert.strictEqual(registry.blocksByStateId[DIAMOND_INDEX], block)

    assert.strictEqual(block.id, DIAMOND_ID)
    assert.strictEqual(block.minStateId, DIAMOND_INDEX)
    assert.strictEqual(block.maxStateId, DIAMOND_INDEX)
    assert.deepStrictEqual(block.states, [DIAMOND_INDEX])
    assert.strictEqual(block.defaultState, DIAMOND_INDEX)

    const blockState = registry.blockStates.find(bs => bs.stateId === block.defaultState)
    assert.strictEqual(blockState.stateId, DIAMOND_INDEX)
    assert.strictEqual(blockState.name, 'diamond_block')

    const runtimeBlock = registry.blocksByRuntimeId[DIAMOND_INDEX]
    assert.strictEqual(runtimeBlock.stateId, DIAMOND_INDEX)
    assert.strictEqual(runtimeBlock.name, 'diamond_block')
  })

  it('remaps every state of a multi-state block in the hash scheme', function () {
    const { registry } = setup()
    registry.handleStartGame({ itemstates: [], block_network_ids_are_hashes: true })

    const block = registry.blocksByName.oak_log // pillar_axis: x / y / z -> 3 states
    assert.strictEqual(block.states.length, 3)
    assert.strictEqual(block.minStateId, undefined)
    assert.strictEqual(block.maxStateId, undefined)

    for (const stateId of block.states) {
      assert.ok(Number.isInteger(stateId), `expected an integer hash, got ${stateId}`)
      assert.ok(stateId < 0 || stateId >= registry.blockStates.length, `expected a hash, got ${stateId}`)
      assert.strictEqual(registry.blocksByStateId[stateId], block)
      assert.strictEqual(registry.blocksByRuntimeId[stateId].name, 'oak_log')
    }
    assert.ok(block.states.includes(block.defaultState))
  })

  it('can be remapped multiple times via handleStartGame', function () {
    const { registry } = setup()

    // Calling twice with the same scheme is idempotent (derives from pristine source).
    registry.handleStartGame({ itemstates: [], block_network_ids_are_hashes: true })
    const first = registry.blocksByName.diamond_block
    registry.handleStartGame({ itemstates: [], block_network_ids_are_hashes: true })
    const second = registry.blocksByName.diamond_block
    assert.deepStrictEqual(second, first)
    assert.deepStrictEqual(second.states, [DIAMOND_HASH])

    // Switching scheme re-derives cleanly back to the index scheme.
    registry.handleStartGame({ itemstates: [], block_network_ids_are_hashes: false })
    const indexed = registry.blocksByName.diamond_block
    assert.deepStrictEqual(indexed.states, [DIAMOND_INDEX])
    assert.strictEqual(indexed.minStateId, DIAMOND_INDEX)
    assert.strictEqual(indexed.maxStateId, DIAMOND_INDEX)
    assert.strictEqual(registry.blocksByStateId[DIAMOND_INDEX], indexed)
    assert.strictEqual(registry.blocksByStateId[DIAMOND_HASH], undefined)

    // And back to hashes again.
    registry.handleStartGame({ itemstates: [], block_network_ids_are_hashes: true })
    assert.deepStrictEqual(registry.blocksByName.diamond_block.states, [DIAMOND_HASH])
  })

  it('indexes block states by their state id', function () {
    const { registry } = setup()
    // before start_game, state ids are the indexes into blockStates
    assert.strictEqual(registry.blockStatesByStateId[DIAMOND_INDEX], registry.blockStates[DIAMOND_INDEX])

    for (const hashes of [true, false]) {
      registry.handleStartGame({ itemstates: [], block_network_ids_are_hashes: hashes })
      const stateId = hashes ? DIAMOND_HASH : DIAMOND_INDEX
      assert.strictEqual(registry.blockStatesByStateId[stateId], registry.blockStates[DIAMOND_INDEX])

      // and with it prismarine-block resolves the properties of hashed state ids
      const Block = require('prismarine-block')(registry)
      const log = registry.blocksByName.oak_log
      for (const id of log.states) {
        assert.strictEqual(registry.blockStatesByStateId[id].name, 'oak_log')
        assert(Block.fromStateId(id, 0).getProperties().pillar_axis)
      }
    }
  })

  it('does not mutate the shared minecraft-data structures', function () {
    const minecraftData = require('minecraft-data')(`bedrock_${VERSION}`)
    const keys = ['blocksArray', 'blocks', 'blocksByName', 'blocksByStateId', 'blockStates']

    const before = {}
    for (const key of keys) {
      before[key] = JSON.stringify(minecraftData[key])
    }

    const { registry } = setup()
    registry.handleStartGame({ itemstates: [], block_network_ids_are_hashes: true })
    registry.handleStartGame({ itemstates: [], block_network_ids_are_hashes: false })

    for (const key of keys) {
      assert.strictEqual(JSON.stringify(minecraftData[key]), before[key], `minecraft-data.${key} was mutated`)
    }
  })
})

describe('bedrock item palette', function () {
  it('writes back every field of the item states it loaded', function () {
    const registry = require('prismarine-registry')('bedrock_1.21.70')
    const nbt = { type: 'compound', name: '', value: {} }
    const itemstates = [
      { name: 'minecraft:stone', runtime_id: 1, component_based: false, version: 'none', nbt },
      { name: 'minecraft:wolf_armor', runtime_id: 2, component_based: true, version: 'data_driven', nbt },
      { name: 'custom:item', runtime_id: 3, component_based: true, version: 'data_driven', nbt }
    ]
    registry.handleItemRegistry({ itemstates })
    assert.deepStrictEqual(registry.writeItemStates(), itemstates)
  })

  describe('items from their components', function () {
    const nbt = require('prismarine-nbt')
    const dataDriven = (components) => nbt.comp({ components: nbt.comp({ item_properties: nbt.comp({ max_stack_size: nbt.int(1) }), ...components }) }, '')
    const itemstates = [
      {
        name: 'custom:ruby_sword',
        runtime_id: 1000,
        component_based: true,
        version: 'data_driven',
        nbt: dataDriven({
          'minecraft:durability': nbt.comp({ max_durability: nbt.int(250), damage_chance: nbt.comp({ min: nbt.int(100), max: nbt.int(100) }) }),
          'minecraft:display_name': nbt.comp({ value: nbt.string('Ruby Sword') }),
          'minecraft:repairable': nbt.comp({
            repair_items: nbt.list(nbt.comp([
              { items: nbt.list(nbt.comp([{ name: nbt.string('minecraft:diamond') }])), repair_amount: nbt.float(10) },
              { items: nbt.list(nbt.comp([{ tags: nbt.string("q.any_tag('minecraft:planks')") }])), repair_amount: nbt.float(5) }
            ]))
          })
        })
      },
      {
        name: 'custom:apple',
        runtime_id: 1001,
        component_based: true,
        version: 'data_driven',
        nbt: dataDriven({ 'minecraft:display_name': nbt.comp({ value: nbt.string('item.apple.name') }) })
      },
      {
        name: 'custom:seeds',
        runtime_id: 1002,
        component_based: false,
        version: 'legacy',
        nbt: nbt.comp({ components: nbt.comp({ 'minecraft:max_stack_size': nbt.int(16) }) }, '')
      },
      { name: 'custom:empty', runtime_id: 1003, component_based: false, version: 'none', nbt: nbt.comp({}, '') },
      { name: 'minecraft:apple', runtime_id: 1004, component_based: true, version: 'data_driven', nbt: dataDriven({}) }
    ]

    function load () {
      const registry = require('prismarine-registry')('bedrock_1.21.70')
      registry.handleItemRegistry({ itemstates })
      return registry
    }

    it('takes the stack size, durability, name and repair items of the components', function () {
      const { name, stackSize, maxDurability, displayName, repairWith } = load().itemsByName['custom:ruby_sword']
      // the repair items given by a tag are left out
      assert.deepStrictEqual({ name, stackSize, maxDurability, displayName, repairWith },
        { name: 'custom:ruby_sword', stackSize: 1, maxDurability: 250, displayName: 'Ruby Sword', repairWith: ['diamond'] })
    })

    it('translates a display name that is a language key', function () {
      assert.strictEqual(load().itemsByName['custom:apple'].displayName, 'Apple')
    })

    it('takes the stack size of a legacy item', function () {
      assert.strictEqual(load().itemsByName['custom:seeds'].stackSize, 16)
    })

    it('takes nothing from an empty nbt', function () {
      const { stackSize, maxDurability, displayName, repairWith } = load().itemsByName['custom:empty']
      assert.deepStrictEqual([stackSize, maxDurability, displayName, repairWith], [undefined, undefined, undefined, undefined])
    })

    it('keeps the minecraft-data fields of vanilla items', function () {
      const registry = load()
      const { stackSize, displayName } = registry.itemsByName.apple
      assert.deepStrictEqual([stackSize, displayName], [64, 'Apple'])
    })

    it('writes back the item states unchanged', function () {
      assert.deepStrictEqual(load().writeItemStates(), itemstates)
    })
  })
})
