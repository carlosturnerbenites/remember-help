const express = require('express'),
	router = express.Router(),
	models = require('./../models/'),
	bodyParser = require('body-parser'),
	utils = require('./../utils')

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: false }))

router.post('/today',(req,res) => {
	var data = req.body,
		currentTime = new Date()

	currentTime.setHours(0,0,0,0)

	models.children.findOne({id: data.children}, (err, children) => {
		if (err) return res.json({err: err})

		models.history.find({children : children._id, timeCurrent: currentTime.toISOString()})
		.populate('activity children')
		.exec((err, histories) => {
			if (err) return res.json({err: err})

			res.json({histories:histories})
		})
	})
})

router.post('/rangeDate',(req,res) => {
	var data = req.body

	var dateInit = new Date(data.dateInit),
		dateEnd = new Date(data.dateEnd)

	dateInit.setHours(0,0,0,0)
	dateInit.setDate(dateInit.getDate()+1)
	dateEnd.setHours(0,0,0,0)
	dateEnd.setDate(dateEnd.getDate()+1)

	var datesQuery = dateInit.getDatesUntil(dateEnd)

	models.children.findOne({id: data.children},(err,children) => {
		models.history.aggregate([
			{
				$match: {
					'children' : children._id, timeCurrent : {$in : datesQuery}
				}
			},
			/* {
				$project: {
					date: { $dateToString: { format: '%Y-%m-%d', date: '$timeCurrent' }}
				}
			},*/
			{
				$group : {
					_id : { month: { $month: '$timeCurrent' }, day: { $dayOfMonth: '$timeCurrent' }, year: { $year: '$timeCurrent' }},
					complete: { $sum: 1 }
				}
			}
		], (err, docs) => {
			if (err) return res.json(err)
			models.activity.count({},(err,count) => {
				for (var doc of docs){
					console.log(doc)
					doc.incomplete = count - doc.complete
				}
				return res.json(docs)
			})
		})
	})
})

module.exports = router
