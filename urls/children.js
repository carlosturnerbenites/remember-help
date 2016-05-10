const express = require('express'),
	router = express.Router(),
	models = require('./../models/'),
	utils = require('./../utils'),
	Q = require('q')

router.get('/activities',(req,res) => {

	var dateCurrent = new Date()
	dateCurrent.setHours(0,0,0,0)

	models.activity.find({}, (err,activitiesDB) => {
		models.children.findOne({user: req.user._id},(err, children) => {
			if (err) return res.json({err: err})

			var promises = [],
				activities = []

			activitiesDB.forEach(activityDB => {
				var activity = activityDB.toObject()
				var promise = activityDB.getState(children).then((state) => {
					activity.state = state
					activities.push(activity)
				})
				promises.push(promise)
			})
			Q.all(promises).then(() => {
				res.render('children/activities',{
					activities:activities,
					children:children
				})
			})
		})
	})
})

router.get('/treasure',(req,res) => {
	res.render('children/treasure',{})
})

module.exports = router
