const path = require('path')
const { ipcRenderer } = require('electron')
const osu = require('node-os-utils')
const cpu = osu.cpu
const mem = osu.mem
const os = osu.os

let cpuOverload
let alertFrequency

// Get settings & values
ipcRenderer.on('settings:get', (e, settings) => {
  cpuOverload = +settings.cpuOverload
  alertFrequency = +settings.alertFrequency
})

setInterval(() => {
  // CPU usage
  cpu.usage().then((info) => {
    document.getElementById('cpu-usage').innerText = info + '%'
    document.getElementById('cpu-progress').style.width = info + '%'

    // Make progress bar if overload
    if (info > cpuOverload) {
      document.getElementById('cpu-progress').style.background = 'red'
    } else {
      document.getElementById('cpu-progress').style.width = '#30c88b'
    }

    // Check overload
    if (info >= cpuOverload && runNotify(alertFrequency)) {
      notifyUser({
        title: 'CPU Overload',
        body: `CPU is over ${cpuOverload} %`,
        icon: path.join(__dirname, 'img', 'icon.png'),
      })
      sessionStorage.setItem('lastNotify', new Date().getTime())
    }
  })

  // CPU Free
  cpu.free().then((info) => {
    document.getElementById('cpu-free').innerText = info + '%'
  })

  // Uptime
  document.getElementById('sys-uptime').innerText = secondsToDhms(os.uptime())
}, 2000)

// set model
document.getElementById('cpu-model').innerText = cpu.model()

// Computer name
document.getElementById('comp-name').innerText = os.hostname()

// OS
document.getElementById('os').innerText = `${os.type()} ${os.arch()}`

// Total Mem
mem.info().then((info) => {
  document.getElementById('mem-total').innerText = info.totalMemMb
})

// Shows days, hours, mins, sec
function secondsToDhms(seconds) {
  seconds = +seconds
  const d = Math.floor(seconds / (3600 * 24))
  const h = Math.floor((seconds % (3600 * 24)) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return `${d}day, ${h}hh, ${m}min, ${s}sec`
}

function notifyUser(options) {
  new Notification(options.title, options)
}

// Check how much time passed since notification
function runNotify(frequency) {
  if (sessionStorage.getItem('lastNotify') === null) {
    // Store timestamp
    sessionStorage.setItem('lastNotify', new Date().getTime())
    return true
  }

  const notifyTime = new Date(parseInt(sessionStorage.getItem('lastNotify')))

  const now = new Date().getTime()
  const diffTime = Math.abs(now - notifyTime)
  const minutesPassed = Math.ceil(diffTime / (1000 * 60))

  if (minutesPassed > frequency) {
    return true
  } else {
    return false
  }
}
