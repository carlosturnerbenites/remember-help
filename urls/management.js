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
	models.father.findOne({user: req.user._id})
	.populate('children')
	.exec((err, father) => {
		res.render('management/statistics',{
			classcss:utils.stylesPage.getRandom(),
			father: father
		})
	})
})

module.exports = router
