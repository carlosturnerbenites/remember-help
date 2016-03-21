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

		models.activity.findById(data.id, (err, activity) => {

			activity.getState(children).then((state) => {

				if(state.code == 1) return res.json({err : 'Ya has completado esta actividad.'})

				var response = {
					id : activity._id
				}

				models.history.create({
					children: children._id,
					activity: activity._id,
					date: dateCurrent,
					time : new Date()
				},(err, history) => {
					activity.getState(children).then((state) => {
						if(state.detail.aClock){
							response.message = 'Felicidades, has terminado ha tiempo la actividad',
							response.classcss = 'complete'
						}else{
							response.message = 'Has terminado la actividad, pero mejora la proxima vez.',
							response.classcss = 'warning'
						}
						res.json(response)
					})
				})

			})

		})
	})
})

module.exports = router
