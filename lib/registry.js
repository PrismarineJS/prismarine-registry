class Registry {
  constructor () {
    this.data = {}
    this.palette = []
  }

  set (index, key, value) {
    this.palette[index] = key
    this.data[key] = value
  }

  add (key, value) {
    this.palette.push(key)
    this.data[key] = value
    return this.palette.length - 1
  }

  get (keyOrIndex) {
    return typeof keyOrIndex === 'number' ? this.getValueAt(keyOrIndex) : this.getValue(keyOrIndex)
  }

  getValue (key) {
    return this.data[key]
  }

  getValueAt (index) {
    return this.data[this.palette[index]]
  }

  getName (index) {
    return this.palette[index]
  }

  getIndex (key) {
    return this.palette.indexOf(key)
  }
}

module.exports = Registry
