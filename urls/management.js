const express = require('express'),
	router = express.Router(),
	utils = require('./../utils')

router.get('/statistics',(req,res) => res.render('management/statistics',{classcss:utils.stylesPage.getRandom()}))
router.get('/line-evolution',(req,res) => res.render('management/lineEvolution',{classcss:utils.stylesPage.getRandom()}))
router.get('/collections',(req,res) => res.render('collections/index',{classcss:utils.stylesPage.getRandom()}))

module.exports = router
