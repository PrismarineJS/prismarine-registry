module.exports = (mcData) => {
  const data = {
    blocks: mcData.blocks,
    blocksByName: mcData.blocksByName,
    blocksArray: mcData.blocksArray,
    blocksByStateId: mcData.blocksByStateId,

    blockStates: mcData.blockStates, // bedrock

    blockCollisionShapes: mcData.blockCollisionShapes,

    biomes: mcData.biomes,
    biomesByName: mcData.biomesByName,
    biomesArray: mcData.biomesArray,

    items: mcData.itemsById,
    itemsByName: mcData.itemsByName,
    itemsArray: mcData.items,

    foods: mcData.foodsById,
    foodsByName: mcData.foodsByName,
    foodsByFoodPoints: mcData.foodsByFoodPoints,
    foodsBySaturation: mcData.foodsBySaturation,
    foodsArray: mcData.foods,

    recipes: mcData.recipes,

    instruments: mcData.instruments,
    instrumentsArray: mcData.instrumentsArray,

    materials: mcData.materials,

    enchantments: mcData.enchantments,
    enchantmentsByName: mcData.enchantmentsByName,
    enchantmentsArray: mcData.enchantmentsArray,

    mobs: mcData.mobs,
    objects: mcData.objects,
    entitiesByName: mcData.entitiesByName,
    entitiesArray: mcData.entitiesArray,

    windows: mcData.windows,
    windowsByName: mcData.windowsByName,
    windowsArray: mcData.windowsArray,

    protocol: mcData.protocol,
    protocolComments: mcData.protocolComments,
    protocolYaml: [mcData.proto, mcData.types], // bedrock

    defaultSkin: mcData.defaultSkin, // bedrock

    version: mcData.version,

    effects: mcData.effects,
    effectsByName: mcData.effectsByName,
    effectsArray: mcData.effectsArray,

    attributes: mcData.attributes,
    attributesByName: mcData.attributesByName,
    attributesArray: mcData.attributesArray,

    particles: mcData.particles,
    particlesByName: mcData.particlesByName,
    particlesArray: mcData.particles,

    language: mcData.language,

    blockLoot: mcData.blockLoot,
    blockLootArray: mcData.blockLootArray,

    entityLoot: mcData.entityLoot,
    entityLootArray: mcData.entityLootArray,

    commands: mcData.commands,

    loginPacket: mcData.loginPacket,

    mapIcons: mcData.mapIcons,
    mapIconsByName: mcData.mapIconsByName,
    mapIconsArray: mcData.mapIconsArray,

    tints: mcData.tints
  }

  return data
}
