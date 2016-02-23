const express = require('express'),
	router = express.Router()

router.get('/statistics',(req,res) => res.render('management/statistics'))
router.get('/line-evolution',(req,res) => res.render('management/lineEvolution'))

module.exports = router
