const express = require('express'),
	router = express.Router()

router.get('/', (req, res) => res.render('index'))
router.get('/authenticate', (req, res) => res.render('users/authenticate'))
router.get('/check-in', (req, res) => res.render('users/checkIn'))
router.get('/logout', (req, res) => {
	req.logout()
	res.redirect('/')
})
module.exports = router
