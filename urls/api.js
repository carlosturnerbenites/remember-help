const express = require('express'),
	router = express.Router(),
	models = require('./../models/'),
	bodyParser = require('body-parser')

router.use(bodyParser.json())

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
