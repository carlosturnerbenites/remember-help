const express = require('express'),
	router = express.Router(),
	models = require('./../models/'),
	bodyParser = require('body-parser'),
	utils = require('./../utils')

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: false }))

router.get('/today',(req,res) => {
	var data = req.body,
		dateCurrent = new Date()
	dateCurrent.setHours(0,0,0,0)

	models.children.findOne({id: data.children}, (err, children) => {
		if (err) return res.json({err: err})

		models.history.find({children : children._id, date: dateCurrent.toISOString()})
		.populate('activity children')
		.exec((err, histories) => {
			if (err) return res.json({err: err})
			res.json({histories: histories})
		})
	})
})

router.get(
	['/rangeDate','/line-evolution'],
	(req,res) => {
		var data = req.body,
			dateInit = new Date(data.dateInit),
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
				{
					$group : {
						_id : { month: { $month: '$date' }, day: { $dayOfMonth: '$date' }, year: { $year: '$date' }},
						complete: { $sum: 1 }
					}
				}
			], (err, documents) => {
				if (err) return res.json({err: err})

				models.activity.count({},(err,count) => {
					if (err) return res.json({err: err})

					documents = documents.map(document => {
						document.incomplete = count - document.complete
						return document
					})

					return res.json(documents)
				})
			})
		})
	})

module.exports = router
