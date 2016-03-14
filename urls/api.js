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

router.post('/collections/empty/:collection',(req, res) => {
	var collection = req.params.collection,
		model = mongoose.model(collection)

	model.remove({},(err) => {
		if (err) return res.json({err:err})
		res.json({msg: 'Delete Complete'})
	})
})

router.get('/collections/:collection',(req, res) => {
	var collection = req.params.collection,
		model = mongoose.model(collection)

	model.find({},{_id : 0, __v : 0})
	.populate('activity children')
	.exec((err,documents) => {
		if (err) return res.json({err:err})

		res.json(documents)
	})
})

// router.post('/collections/add',(req, res) => {})

router.post('/history/add',(req, res) => {
	if(req.user.type != 1) return res.json({err : 'Solo una niña ó un niño puede completar las actividades'})

	var data = req.body,
		timeCurrent = new Date()
	timeCurrent.setHours(0,0,0,0)

	models.children.findOne({user: req.user._id},(err, children) => {
		models.history.findOne({children : children._id, activity: data.id,timeCurrent: timeCurrent.toISOString()},(err, history) => {
			if (err) return res.json({err : err})
			if (history) return res.json({err : 'Ya has completado esta actividad.'})

			models.activity.findById(data.id, (err, activity) => {

				var currentTime = new Date(),
					activityTime = new Date(activity.date),
					response = {}
				response.id = activity._id

				if(activityTime < currentTime) {
					response.message = 'Felicidades, has terminado ha tiempo la actividad'
					response.type = 1
					response.classcss = 'complete'
					activity.update({ $set : { state : 'complete' }}).exec()

					models.history.create({
						children: children._id,
						activity: activity._id,
						timeCurrent: timeCurrent
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
	})
})

module.exports = router
