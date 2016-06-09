const express = require('express'),
	router = express.Router(),
	models = require('./../models/'),
	utils = require('./../utils'),
	Q = require('q')

router.get('/activities',(req,res) => {

	var dateCurrent = new Date(),
		monthCurrent = dateCurrent.getMonth() + 1

	models.activity.aggregate(
		[
			{
				'$project':{
					eDate:{
						year:{$cond:[{$ifNull:['$date',0]},{$year:'$date'},null]},
						month:{$cond:[{$ifNull:['$date',0]},{$month:'$date'},null]},
						day:{$cond:[{$ifNull:['$date',0]},{$dayOfMonth:'$date'},null]},
						hour:{$cond:[{$ifNull:['$date',0]},{$hour:'$date'},null]},
						minutes:{$cond:[{$ifNull:['$date',0]},{$minute:'$date'},null]},
						seconds:{$cond:[{$ifNull:['$date',0]},{$second:'$date'},null]}
					},
					date: '$$ROOT.date',
					_id: '$$ROOT._id'
				}
			},
			{
				$match: {$or : [{'date':null},{'eDate.month':monthCurrent}]}
			}
		],
		(err,data) => {
			if (err) {
				req.flash('error',err)
				return res.redirect(req.get('referer'))
			}
			var idActivities = data.map(element => {return {_id:element._id}})

			models.activity.find({_id: {$in :idActivities}})
			.sort({hour:-1})
			.exec((err,activitiesDB) => {

				models.children.findOne({user: req.user._id},(err, children) => {
					if (err) {
						req.flash('error',err)
						return res.redirect(req.get('referer'))
					}

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
		}
	)

})

module.exports = router
