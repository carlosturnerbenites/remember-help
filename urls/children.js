const express = require('express'),
	router = express.Router()

router.get('/activities',(req,res) => res.render('children/activities',{classcss:"activities"}))
router.get('/messages',(req,res) => res.render('children/messages',{classcss:"messages"}))
router.get('/reminders',(req,res) => res.render('children/reminders',{classcss:"reminders"}))

module.exports = router
