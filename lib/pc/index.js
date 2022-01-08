const Registry = require('../registry')

module.exports = (version) => ({
  biomes: new Registry(),
  recipes: new Registry()
})
