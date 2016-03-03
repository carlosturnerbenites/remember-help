const express = require('express'),
	router = express.Router(),
	models = require('./../models/'),
	bodyParser = require('body-parser'),
	mongoose = require('mongoose')

router.use(bodyParser.json())

router.post('/collections/:collection',(req, res) => {
	var collection = req.params.collection,
		model = mongoose.model(collection)

	model.find({}, (errr,documents) => {
		res.json(documents)
	})
})
router.post('/history/add',(req, res) => {
	var data = req.body

	models.activitie.findById(data.id, (err, activity) => {
		console.log(activity)

		var currentTime = new Date(),
			activityTime = new Date(activity.date),
			response = {}
		response.id = activity._id

		if(activityTime < currentTime) {
			response.message = 'Felicidades, has terminado ha tiempo la actividad'
			response.classcss = 'complete'
			activity.update({ $set : { state : 'complete' }}).exec()
		}else{
			response.message = 'Terminaste, pero intenta debes mejorar la proxima'
			response.classcss = 'incomplete'
		}

		res.send(response)

	})

})

module.exports = router
