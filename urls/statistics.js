const express = require('express'),
	router = express.Router(),
	models = require('./../models/'),
	bodyParser = require('body-parser'),
	utils = require('./../utils')

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: false }))

router.post('/today',(req,res) => {
	var data = req.body,
		dateCurrent = new Date()

	dateCurrent.setHours(0,0,0,0)

	models.children.findOne({id: data.children}, (err, children) => {
		if (err) return res.json({err: err})

		models.history.find({children : children._id, date: dateCurrent.toISOString()})
		.populate('activity children')
		.exec((err, histories) => {
			if (err) return res.json({err: err})

			res.json({histories:histories})
		})
	})
})

router.post(
	['/rangeDate','/line-evolution'],
	(req,res) => {
		var data = req.body

		var dateInit = new Date(data.dateInit),
			dateEnd = new Date(data.dateEnd)

		dateInit.setHours(0,0,0,0)
		dateInit.setDate(dateInit.getDate()+1)
		dateEnd.setHours(0,0,0,0)
		dateEnd.setDate(dateEnd.getDate()+1)

		var datesQuery = dateInit.getDatesUntil(dateEnd)

		models.children.findOne({id: data.children},(err,children) => {
			if (err) return res.json({err: err})

			models.history.aggregate([
				{
					$match: {
						'children' : children._id, date : {$in : datesQuery}
					}
				},
				/* {
					$project: {
						date: { $dateToString: { format: '%Y-%m-%d', date: '$date' }}
					}
				},*/
				{
					$group : {
						_id : { month: { $month: '$date' }, day: { $dayOfMonth: '$date' }, year: { $year: '$date' }},
						complete: { $sum: 1 }
					}
				}
			], (err, docs) => {
				if (err) return res.json({err: err})

				models.activity.count({},(err,count) => {
					if (err) return res.json({err: err})
					for (var doc of docs){ doc.incomplete = count - doc.complete }
					return res.json(docs)
				})
			})
		})
	})

module.exports = router
