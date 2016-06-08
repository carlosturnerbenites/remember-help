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
			res.json({histories: histories})
		})
	})
})

router.post(
	['/rangeDate','/line-evolution'],
	(req,res) => {
		var data = req.body,
			dateInit = new Date(data.dateInit.split('-')),
			dateEnd = new Date(data.dateEnd.split('-'))

		models.children.findOne({id: data.children},(err,children) => {
			if (err) return res.json({err: err})

			models.history.aggregate([
				{
					$match: {
						'children' : children._id, date : {$gte : dateInit,$lte : dateEnd}
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
						document.data = []
						document.incomplete = count - document.complete

						document.data.push(document._id.day + '/' + document._id.month + '/' + document._id.year)
						document.data.push(document.complete)
						document.data.push(document.incomplete)

						return document
					})

					return res.json(documents)
				})
			})
		})
	})

module.exports = router
