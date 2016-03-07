const express = require('express'),
	router = express.Router(),
	models = require('./../models/'),
	bodyParser = require('body-parser'),
	mongoose = require('mongoose')

router.use(bodyParser.json())

router.get('/collections/schemas/:collection',(req, res) => {
	var collection = req.params.collection,
		model = mongoose.model(collection),
		paths = model.schema.paths
	res.json(paths)
})

// router.post('/collections/add',(req, res) => {})

router.get('/collections/:collection',(req, res) => {
	var collection = req.params.collection,
		model = mongoose.model(collection)

	model.find({},{_id : 0, __v : 0})
	.populate('activity children')
	.exec((errr,documents) => {
		console.log(documents)
		res.json(documents)
	})
})

router.post('/history/add',(req, res) => {
	var data = req.body

	models.activity.findById(data.id, (err, activity) => {
		console.log(activity)

		var currentTime = new Date(),
			activityTime = new Date(activity.date),
			response = {}
		response.id = activity._id

		if(activityTime < currentTime) {
			response.message = 'Felicidades, has terminado ha tiempo la actividad'
			response.type = 1
			response.classcss = 'complete'
			activity.update({ $set : { state : 'complete' }}).exec()

			models.children.findOne({user: req.user._id},(err, children) => {

				models.history.create({
					children: children._id,
					activity: activity._id,
					timeCurrent: Date.now()
				})
			})

		}else{
			response.message = 'Terminaste, pero intenta debes mejorar la proxima'
			response.type = 2
			response.classcss = 'incomplete'
		}

		models.message.create({
			type: response.type,
			text: response.message
		})

		res.send(response)

	})
})

module.exports = router
