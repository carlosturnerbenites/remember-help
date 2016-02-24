const express = require('express'),
	router = express.Router(),
	models = require('./../models/')

// models.activitie.create({date:Date.now(), hour:Date.now(), dateMax:Date.now(), text:"Dormir", img:"/images/activities/dormir.png"},(err, activity) => {console.log(err)})
// models.message.create({"type":0,"text":"Bien hecho"},(err, activity) => {console.log(err)})

var activities = {},
	messages = {}

models.activitie.find({} , (err,activitiesD) => {activities = activitiesD})
models.message.find({} , (err,messagesD) => {messages = messagesD})

router.get('/activities',(req,res) => {
	res.render('children/activities',{
		classcss:'activities',
		activities:activities
	})
})

router.get('/messages',(req,res) => {
	res.render('children/messages',{
		classcss:'messages',
		messages:messages
	})
})

module.exports = router
