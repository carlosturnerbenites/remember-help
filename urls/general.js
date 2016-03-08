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
		children = {
			name: data.nameChildren,
			username: 'C' + data.username,
			password: data.password,
			type : 1
		},
		father = {
			name: data.nameFather,
			username: 'P' + data.username,
			password: data.password,
			type : 0
		}

	models.user.findOne({username : data.username},(err,exists) => {
		if(err) return res.send(err)
		if(exists) return res.json({msg:'Usename Duplicate'})

		models.user.create(children, (err, user) => {
			children.user = user._id
			children.age =  data.ageChildren

			models.children.create(children, (err) => {
				if(err) return res.json(err)

				models.user.create(father, (err, user) => {
					father.user = user._id
					models.father.create(father, (err) => {
						if(err) return res.json(err)

						return res.redirect('/authenticate')
					})
				})
			})
		})

	})
})

module.exports = router
