async function waitFor (cb, withTimeout, onTimeout) {
  let t
  const ret = await Promise.race([
    new Promise((resolve, reject) => cb(resolve, reject)),
    new Promise(resolve => { t = setTimeout(() => resolve('timeout'), withTimeout) })
  ])
  clearTimeout(t)
  if (ret === 'timeout') await onTimeout()
  return ret
}

module.exports = { waitFor }
