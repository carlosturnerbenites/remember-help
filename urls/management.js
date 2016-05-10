const express = require('express'),
	router = express.Router(),
	models = require('./../models/')

router.get('/statistics',(req,res) => {
	models.parent.findOne({user: req.user._id})
	.populate('children')
	.exec((err, parent) => {
		if (err) return res.json({err: err})
		res.render('management/statistics',{parent: parent})
	})
})

module.exports = router
