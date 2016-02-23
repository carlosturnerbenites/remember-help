const express = require("express"),
app = express(),
http = require('http'),
server = http.createServer(app),
port = process.env.PORT || 8000,
urlGeneral = require('./urls/general')

app.use("",urlGeneral)

app.set('views', __dirname + '/views')
app.set('view engine', 'jade')
app.use(express.static('public'))


server.listen(port, () => {console.log("Server listen in " + port)})
