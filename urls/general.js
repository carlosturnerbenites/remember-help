const express = require('express'),
	router = express.Router(),
	models = require('./../models/')

router.get('/', (req, res) => res.render('index',{user :req.user}))

router.get('/authenticate', (req, res) => res.render('users/authenticate'))

router.get('/check-in', (req, res) => res.render('users/checkIn'))

router.get('/logout', (req, res) => {
	req.logout()
	res.redirect('/')
})

router.post('/check-in', (req, res) => {

	var data = req.body,
		dataNewChildren = {
			id : data.idChildren,
			password: data.password,
			type : 1,
			username: 'C' + data.username
		},
		dataNewFamily = {
			id: data.idFamily,
			password: data.password,
			type : 0,
			username: 'P' + data.username
		}

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
					family.update({ $push : {children: newChildren}}, (err, parent) => {
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
