const express = require('express'),
	router = express.Router()

router.get('/', (req, res) => res.render('index',{user :req.user}))

router.get('/authenticate', (req, res) => res.render('users/authenticate'))

router.get('/recommendations', (req, res) => res.render('recommendations'))

router.get('/logout', (req, res) => {
	req.logout()
	res.redirect('/')
})

module.exports = router
