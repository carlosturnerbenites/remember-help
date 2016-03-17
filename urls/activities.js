const express = require('express'),
	router = express.Router(),
	models = require('./../models/'),
	bodyParser = require('body-parser'),
	mongoose = require('mongoose')

router.use(bodyParser.json())

router.post('/valid-activity',(req, res) => {
	if(req.user.type != 1) return res.json({err : 'Solo una niña ó un niño puede completar las actividades'})

	var data = req.body,
		timeCurrent = new Date()
	timeCurrent.setHours(0,0,0,0)

	models.children.findOne({user: req.user._id},(err, children) => {
		models.history.findOne({children : children._id, activity: data.id,timeCurrent: timeCurrent.toISOString()},(err, history) => {
			if (err) return res.json({err : err})
			if (history) return res.json({err : 'Ya has completado esta actividad.'})

			models.activity.findById(data.id, (err, activity) => {

				var response = {
					message : 'Felicidades, has terminado ha tiempo la actividad',
					type : 0
				}

				response.classcss = 'complete'
				activity.update({ $set : { state : 'complete' }}).exec()

				models.history.create({
					children: children._id,
					activity: activity._id,
					timeCurrent: timeCurrent
				})

				models.message.create({
					type: response.type,
					text: response.message
				})

				response.id = activity._id

				res.send(response)
			})
		})
	})
})

module.exports = router
