const express = require('express'),
	router = express.Router(),
	models = require('./../models/'),
	bodyParser = require('body-parser'),
	utils = require('./../utils'),
	mongoose = require('mongoose')

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: false }))

router.post('/today',(req,res) => {
	var data = req.body,
		currentTime = new Date()

	console.log(req.body)

	currentTime.setHours(0,0,0,0)

	models.children.findOne({id: data.children}, (err, children) => {
		models.history.find({children : children._id, timeCurrent: currentTime.toISOString()})
		.populate('activity children')
		.exec((err, activities) => {
			return res.json({activities:activities})
		})
	})
})

module.exports = router
