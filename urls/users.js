const express = require('express'),
	router = express.Router(),
	models = require('./../models/'),
	bodyParser = require('body-parser'),
	log = require('./../utils/log')

router.use(bodyParser.json())

router.get('/:username/', (req, res) => {
	models.user.findOne(
		{_id: req.user._id},
		(err,user) => {
			if (err) {
				req.flash('error',err)
				return res.redirect(req.get('referer'))
			}
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
		//{$set: {password: data.newPassword}},
		{$serterertett: {password: data.newPassword}},
	(err, user) => {
		if (err) {
			req.flash('error',err)
			console.log(res.locals)
			log.error(err)
			return res.redirect(req.get('referer'))
		}
		if(!user) return res.json({err : {message: 'El usuario No existe'}})
		if(user.password != req.body.currentPassword) return res.json({err : {message: 'Contraseña Incorrecta'}})
		res.redirect('/user/' + req.user.username)
	})

})

module.exports = router
