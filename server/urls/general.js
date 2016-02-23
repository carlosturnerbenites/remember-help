const express = require('express'),
	router = express.Router()

router.get('/', (req, res) => res.render('index'))
router.get('/authenticate', (req, res) => res.render('users/authenticate') )
router.get('/check-in', (req, res) => res.render('users/checkIn') )

module.exports = router
