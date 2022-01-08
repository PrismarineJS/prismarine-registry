module.exports = (version) => {
  if (version.startsWith('bedrock_')) {
    return require('./bedrock')(version)
  } else {
    return require('./pc')(version)
  }
}
