var winston = require('winston')

winston.add(winston.transports.File, {
	filename: 'logs/remember-help' + new Date().getFullYear() + ' - ' + new Date().getMonth() + '.log'
})

winston.remove(winston.transports.Console)

module.exports = winston
