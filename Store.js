const electron = require('electron')
const path = require('path')
const fs = require('fs')

class Store {
  constructor(options) {
    // electron.app or electron.remote
    // depending if we take the data from the main process or the render process
    const userDataPath = (electron.app || electron.remote.app).getPath(
      'userData'
    )

    this.path = path.join(userDataPath, options.configName + '.json')
    this.data = parseDataFile(this.path, options.defaults)
  }

  get(key) {
    return this.data[key]
  }

  set(key, val) {
    this.data[key] = val
    fs.writeFileSync(this.path, JSON.stringify(this.data))
  }
}

function parseDataFile(filePath, defaults) {
  try {
    return JSON.parse(fs.readFileSync(filePath))
  } catch (err) {
    return defaults
  }
}

module.exports = Store
