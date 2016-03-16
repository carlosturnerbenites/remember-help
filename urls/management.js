const express = require('express'),
	router = express.Router(),
	models = require('./../models/'),
	utils = require('./../utils')

router.get('/collections',(req,res) => {
	res.render('collections/index',{
		classcss:utils.stylesPage.getRandom()
	})
})

router.get('/line-evolution',(req,res) => {
	res.render('management/lineEvolution',{
		classcss:utils.stylesPage.getRandom()
	})
})

router.get('/statistics',(req,res) => {

	models.parent.findOne({user: req.user._id})
	.populate('children')
	.exec((err, parent) => {
		if (err) return res.json({err: err})

		res.render('management/statistics',{
			classcss:utils.stylesPage.getRandom(),
			parent: parent
		})
	})
})

module.exports = router
