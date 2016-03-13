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
			name: data.nameChildren,
			password: data.password,
			type : 1,
			username: 'C' + data.username
		},
		dataNewFamily = {
			id: data.idFamily,
			name: data.nameFamily,
			password: data.password,
			type : 0,
			username: 'P' + data.username
		}

	models.user.findOne({username : data.username},(err,exists) => {
		if(err) return res.send(err)
		if(exists) return res.json({msg:'Username Duplicate'})

		models.children.findOne({id : data.idChildren},(err,childrenDB) => {
			if(err) return res.send(err)
			if(childrenDB) return res.json({msg:'Children Duplicate'})

			models.user.create(dataNewChildren, (err, userChildren) => {
				if(err) return res.send(err)

				dataNewChildren.user = userChildren._id
				dataNewChildren.age = data.ageChildren
				dataNewChildren.stateHealth = data.stateHealth

				models.children.create(dataNewChildren, (err,newChildren) => {
					if(err) return res.json(err)

					models.father.findOne({id : data.idFamily},(err,family) => {
						if(err) return res.json(err)

						if(family) {
							family.update({ $push : {children: newChildren}}, (err, father) => {
								if(err) return res.json(err)
								return res.redirect('/authenticate')
							})
						}else {
							models.user.create(dataNewFamily, (err, user) => {

								dataNewFamily.user = user._id
								dataNewFamily.children = [newChildren]

								models.father.create(dataNewFamily, (err,father) => {
									models.children.findOneAndUpdate({_id : newChildren._id}, {$set : { father : father._id}}).exec()
									if(err) return res.json(err)
									return res.redirect('/authenticate')
								})
							})
						}
					})

				})
			})
		})

	})
})

module.exports = router
