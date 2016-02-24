const express = require('express'),
	router = express.Router(),
	models = require('./../models/'),
	bodyParser = require('body-parser')

router.use(bodyParser.json())

router.post('/history/add',(req, res) => {
	var data = req.body
	console.log(data)
	res.send("ok")
})

module.exports = router
