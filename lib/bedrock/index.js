const Registry = require('../registry')

module.exports = (version) => ({
  biomes: new Registry(),
  items: new Registry()
})
