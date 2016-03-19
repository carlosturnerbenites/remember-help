const express = require('express'),
	router = express.Router(),
	models = require('./../models/'),
	bodyParser = require('body-parser')

router.use(bodyParser.json())

router.post('/valid-activity',(req, res) => {
	if(req.user.type != 1) return res.json({err : 'Solo una niña ó un niño puede completar las actividades'})

	var data = req.body,
		dateCurrent = new Date()
	dateCurrent.setHours(0,0,0,0)

	models.children.findOne({user: req.user._id},(err, children) => {
		if (err) return res.json({err : err})

		models.history.findOne({children : children._id, activity: data.id,date: dateCurrent.toISOString()},(err, history) => {
			if (err) return res.json({err : err})
			if (history) return res.json({err : 'Ya has completado esta actividad.'})

			models.activity.findById(data.id, (err, activity) => {

				var response = {
					message : 'Felicidades, has terminado ha tiempo la actividad',
					type : 0
				}

				models.history.create({
					children: children._id,
					activity: activity._id,
					date: dateCurrent,
					time : new Date()
				})

				models.message.create({
					type: response.type,
					text: response.message
				})

				response.classcss = 'complete'
				response.id = activity._id

				res.json(response)
			})
		})
	})
})

module.exports = router
