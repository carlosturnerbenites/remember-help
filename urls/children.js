const express = require('express'),
	router = express.Router(),
	models = require('./../models/'),
	utils = require('./../utils')

router.get('/activities',(req,res) => {

	var dateCurrent = new Date()
	dateCurrent.setHours(0,0,0,0)

	models.activity.find()
	.lean(true)
	.exec((err,activities) => {
		models.children.findOne({user: req.user._id},(err, children) => {
			if (err) return res.json({err: err})

			models.history.find({children : children._id, date: dateCurrent.toISOString()},{activity : 1}, (err, activitiesComplete) => {
				if (err) return res.json({err: err})

				activities.forEach(activity => {
					activity.state = activitiesComplete.some(e => String(e.activity) == String(activity._id)) ? 'complete' : 'inprocess'
				})

				res.render('children/activities',{
					activities:activities,
					children:children
				})
			})
		})
	})
})

router.get('/messages',(req,res) => {
	models.message.find({} , (err,messages) => {
		if (err) return res.json({err: err})
		res.render('children/messages',{
			messages:messages
		})
	})
})

router.get('/treasure',(req,res) => {
	res.render('children/treasure',{})
})

module.exports = router
