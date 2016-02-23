const express = require('express'),
	router = express.Router()

router.get('/activities',(req,res) => res.render('children/activities',{classcss:"reminders"}))
router.get('/messages',(req,res) => res.render('children/messages',{classcss:"messages"}))
router.get('/reminders',(req,res) => res.render('children/reminders',{classcss:"activities"}))

module.exports = router
