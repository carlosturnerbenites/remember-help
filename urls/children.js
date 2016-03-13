const express = require('express'),
	router = express.Router(),
	models = require('./../models/'),
	utils = require('./../utils')

router.get('/activities',(req,res) => {

	var currentTime = new Date()
	currentTime.setHours(0,0,0,0)

	models.activity.find()
	.lean(true)
	.exec((err,activities) => {
		models.children.findOne({user: req.user._id},(err, children) => {
			models.history.find({children : children._id, timeCurrent: currentTime.toISOString()},{activity : 1}, (err, activitiesComplete) => {
				activities.forEach(activity => {
					if (activitiesComplete.some(e => String(e.activity) == String(activity._id)))
						activity.state = 'complete'
					else activity.state = 'inprocess'
				})

				res.render('children/activities',{
					classcss:utils.stylesPage.getRandom(),
					activities:activities,
					children:children
				})
			})
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
