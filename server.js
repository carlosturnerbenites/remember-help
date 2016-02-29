var urlConfig
if(!process.env.NODE_ENV) urlConfig = './config/configDev.json'
else if(process.env.NODE_ENV == 'prod') urlConfig = './config/configProd.json'
else process.exit()

const config = require(urlConfig),
	mongoose = require('mongoose'),
	express = require('express'),
	app = express(),
	http = require('http'),
	server = http.createServer(app),
	port = process.env.PORT || 8000,
	urlGeneral = require('./urls/general'),
	urlChildren = require('./urls/children'),
	urlManagement = require('./urls/management'),
	api = require('./urls/api'),
	schedule = require('node-schedule'),
	models = require('./models')

schedule.scheduleJob({hour: 0, minute: 0, dayOfWeek: new schedule.Range(0, 7)}, () => {
	models.activitie.update(
		{ state : { $ne : 'inprocess'}},
		{ $set : { state : 'complete' }},
		{ multi: true }
	).exec()
})

mongoose.connect(config.URIMongo)

app.use('',urlGeneral)
app.use('/children',urlChildren)
app.use('/management',urlManagement)
app.use('/api',api)

app.set('views', __dirname + '/views')
app.set('view engine', 'jade')
app.use(express.static(config.statics))

server.listen(port, () => {console.log('Server listen in ' + port)})
