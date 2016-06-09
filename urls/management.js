const express = require('express'),
	router = express.Router(),
	models = require('./../models/')

router.get('/statistics',(req,res) => {
	models.parent.findOne({user: req.user._id})
	.populate('children')
	.exec((err, parent) => {
		if (err) {
			req.flash('error',err)
			return res.redirect(req.get('referer'))
		}
		res.render('management/statistics',{parent: parent})
	})
})

module.exports = router
