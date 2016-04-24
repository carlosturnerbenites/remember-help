const express = require('express'),
	router = express.Router(),
	models = require('./../models/'),
	bodyParser = require('body-parser')

router.use(bodyParser.json())

router.get('/:username/', (req, res) => {
	models.user.findOne(
		{_id: req.user._id},
		(err,user) => {
			if(err) return res.json({err: err})
			user.getAssociated().then(associated => {
				res.render('users/perfil',{associated: associated})
			})
		}
	)
})

router.post('/changePassword',(req,res) => {
	var data = req.body
	models.user.findOneAndUpdate(
		{_id: data.user},
		{
			$set: {password: req.body.newPassword}
		},
	(err, user) => {
		if(err) return res.json({err: err})
		if(!user) return res.json({err : {message: 'El usuario No existe'}})
		if(user.password != req.body.currentPassword) return res.json({err : {message: 'Contraseña Incorrecta'}})
		res.redirect('/user/' + req.user.username)
	})

})

module.exports = router
