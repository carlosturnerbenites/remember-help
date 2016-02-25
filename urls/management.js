const express = require('express'),
	router = express.Router(),
	models = require('./../models/'),
	utils = require("./../utils")
var stylesPage = ['styleRed','styleYellow','styleBlue','styleGreen','styleOscure']

router.get('/statistics',(req,res) => res.render('management/statistics',{classcss:stylesPage.getRandom()}))
router.get('/line-evolution',(req,res) => res.render('management/lineEvolution',{classcss:stylesPage.getRandom()}))
router.get('/collections',(req,res) => res.render('collections/index',{classcss:stylesPage.getRandom()}))

module.exports = router
