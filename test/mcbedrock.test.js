/* eslint-env mocha */

const SUPPORTED_VERSIONS = ['1.17.10', '1.18.0', '1.18.11', '1.18.30', '1.19.1', '1.19.10', '1.21.70']
const test = require('./mcbedrock')
const assert = require('assert')

describe('mcbedrock', function () {
  this.timeout(18000 * 10)

  for (const version of SUPPORTED_VERSIONS) {
    it('works on ' + version, async () => {
      await test(version)
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
