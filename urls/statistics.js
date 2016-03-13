const express = require('express'),
	router = express.Router(),
	models = require('./../models/'),
	bodyParser = require('body-parser')

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

module.exports = router
