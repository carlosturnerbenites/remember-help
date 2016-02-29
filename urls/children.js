const express = require('express'),
	router = express.Router(),
	models = require('./../models/'),
	utils = require('./../utils')

var activities = {},
	messages = {}

router.get('/treasure',(req,res) => {
	res.render('children/treasure',{
		classcss:utils.stylesPage.getRandom()
	})
})

router.get('/activities',(req,res) => {
	models.activitie.find({} , (err,activitiesD) => {
		activities = activitiesD

		res.render('children/activities',{
			classcss:utils.stylesPage.getRandom(),
			activities:activities
		})
	})
})

router.get('/messages',(req,res) => {
	models.message.find({} , (err,messagesD) => {
		messages = messagesD

		res.render('children/messages',{
			classcss:utils.stylesPage.getRandom(),
			messages:messages
		})
	})
})

module.exports = router
