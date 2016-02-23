var urlConfig
if(!process.env.NODE_ENV) urlConfig = './config/configDev.json'
else if(process.env.NODE_ENV == 'prod') urlConfig = './config/configProd.json'
else process.exit()

const config = require(urlConfig),
	express = require('express'),
	app = express(),
	http = require('http'),
	server = http.createServer(app),
	port = process.env.PORT || 8000,
	urlGeneral = require('./urls/general'),
	urlChildren = require('./urls/children'),
	urlManagement = require('./urls/management')

app.use('',urlGeneral)
app.use('/children',urlChildren)
app.use('/management',urlManagement)

app.set('views', __dirname + '/views')
app.set('view engine', 'jade')
app.use(express.static(config.statics))

server.listen(port, () => {console.log('Server listen in ' + port)})
