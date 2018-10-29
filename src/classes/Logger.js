const bunyan = require('bunyan')
const PrettyStream = require('bunyan-pretty-colors')
const prettyStdOut = new PrettyStream()
prettyStdOut.pipe(process.stdout)

global.logger = bunyan.createLogger({
  name: 'app',
  streams: [
    {
      level: 'debug',
      type: 'raw',
      stream: prettyStdOut
    },
    {
      level: 'error',
      stream: prettyStdOut
    },
    {
      level: 'warning',
      stream: prettyStdOut
    }
  ]
})
