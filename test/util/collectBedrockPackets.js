const bedrock = require('bedrock-protocol')
const { startServerAndWait2 } = require('minecraft-bedrock-server')
const debug = require('debug')('prismarine-registry')
const path = require('path')
const { getPort } = require('./getPort')
const { waitFor } = require('./waitFor')
const { sleep } = require('./sleep')

async function collectPackets (version, names = ['start_game'], cb) {
  const [port, v6] = [await getPort(), await getPort()]
  console.log('Starting vanilla server', version, 'on port', port, v6)
  const server = await startServerAndWait2(version, 1000 * 220, {
    'online-mode': false,
    'server-port': port,
    'server-portv6': v6,
    path: path.join(__dirname, `server_bedrock_${version}`)
  })
  console.log('Started server')

  await sleep(200)

  const client = bedrock.createClient({
    host: '127.0.0.1',
    port,
    username: 'test',
    version,
    raknetBackend: 'raknet-native',
    offline: true,
    skipPing: true
  })

  console.log('Started client. Connecting to server')

  let clientConnected = false
  const collected = []
  await waitFor((resolve) => {
    client.on('join', () => {
      console.log('[client] Client connected')
      clientConnected = true
      stopIfDone()
    })

    client.on('packet', ({ name }) => debug('[client] -> ', name))

    client.on('error', (err) => {
      console.error('[client]', err)
      resolve('timeout')
    })
    client.on('end', () => console.log('Bot disconnected.'))

    for (const name of names) {
      client.on(name, (packet) => {
        cb(name, packet)
        collected.push(packet)
        stopIfDone()
      })
    }

    function stopIfDone () {
      if (clientConnected && collected.length === names.length) {
        console.log('✔ Got all packets')
        console.log('Stopping server', version)
        server.kill()
        client.close()
        resolve()
      }
    }
  }, 1000 * 60, () => {
    client.close()
    server.kill()
    throw Error('❌ client timed out ')
  })

  console.log('Stopping server', version)
}

module.exports = collectPackets
