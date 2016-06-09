var winston = require('winston')


var baseNameLog = process.env.BASE_NAME_LOG,
	date = new Date(),
	filename = baseNameLog
		.replace('year',date.getFullYear())
		.replace('month',date.getMonth())

console.log(filename)
winston.add(winston.transports.File, {filename: filename})

winston.remove(winston.transports.Console)

module.exports = winston
