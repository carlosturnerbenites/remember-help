const express = require('express'),
	router = express.Router(),
	models = require('./../models/'),
	utils = require('./../utils/')

router.get('/collections',(req,res) => {
	res.render('collections/index')
})

router.get('/check-in', (req, res) => res.render('users/checkIn',{statesHealth : utils.statesHealth}))

router.post('/check-in',(req, res) => {

	var data = req.body,
		dataNewChildren = {
			id : data.idChildren,
			password: data.passwordChildren,
			type : 1,
			username: data.usernameChildren
		},
		dataNewFamily = {
			id: data.idFamily,
			password: data.passwordParent,
			type : 0,
			username: data.usernameParent
		}

	if (dataNewChildren.username == dataNewFamily.username) return {err : {msg: 'User Duplicate'}}

	models.user.create(dataNewChildren, (err, userChildren) => {
		if (err) return res.json({err: err})

		dataNewChildren.user = userChildren._id
		dataNewChildren.age = data.ageChildren
		dataNewChildren.stateHealth = data.stateHealth
		dataNewChildren.name = data.nameChildren

		models.children.create(dataNewChildren, (err,newChildren) => {
			if (err) return res.json({err: err})

			models.parent.findOne({id : data.idFamily},(err,family) => {
				if (err) return res.json({err: err})

				if(family) {
					family.update({ $push : {children: newChildren}}, (err) => {
						if (err) return res.json({err: err})
						return res.redirect('/authenticate')
					})
				}else {
					models.user.create(dataNewFamily, (err, user) => {

						dataNewFamily.user = user._id
						dataNewFamily.children = [newChildren]
						dataNewFamily.name = data.nameParent

						models.parent.create(dataNewFamily, (err,parent) => {
							models.children.findOneAndUpdate({_id : newChildren._id}, {$set : { parent : parent._id}}).exec()
							if (err) return res.json({err: err})
							return res.redirect('/authenticate')
						})
					})
				}
			})

		})
	})
})

module.exports = router
