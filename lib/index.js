const loader = require('./loader')

module.exports = (version) => {
  const staticData = require('minecraft-data')(version)
  if (!staticData) {
    throw new Error('Do not have data for ' + version)
  }
  const data = loader(staticData)

  let registry
  if (version.startsWith('bedrock_')) {
    registry = require('./bedrock')(data, staticData)
  } else {
    registry = require('./pc')(data, staticData)
  }

  return Object.assign(data, registry)
}
