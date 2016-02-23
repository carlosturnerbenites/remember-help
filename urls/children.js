const express = require('express'),
	router = express.Router()

router.get('/activities',(req,res) => res.render('children/activities'))
router.get('/messages',(req,res) => res.render('children/messages'))
router.get('/reminders',(req,res) => res.render('children/reminders'))

module.exports = router
