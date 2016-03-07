const express = require('express'),
	router = express.Router(),
	models = require('./../models/'),
	utils = require('./../utils')

router.get('/activities',(req,res) => {
	models.activity.find({}, (err,activities) => {
		res.render('children/activities',{
			classcss:utils.stylesPage.getRandom(),
			activities:activities
		})
	})
})

router.get('/messages',(req,res) => {
	models.message.find({} , (err,messages) => {
		res.render('children/messages',{
			classcss:utils.stylesPage.getRandom(),
			messages:messages
		})
	})
})

router.get('/treasure',(req,res) => {
	res.render('children/treasure',{
		classcss:utils.stylesPage.getRandom()
	})
})

module.exports = router
