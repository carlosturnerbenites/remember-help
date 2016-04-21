const express = require('express'),
	router = express.Router(),
	models = require('./../models/'),
	bodyParser = require('body-parser'),
	nodemailer = require('nodemailer'),
	markdown = require('nodemailer-markdown').markdown

router.use(bodyParser.json())

router.get('/', (req, res) => res.render('index'))
router.get('/authenticate', (req, res) => res.render('users/authenticate'))
router.get('/recommendations', (req, res) => res.render('recommendations'))
router.get('/remember', (req, res) => {res.render('users/remember')})

router.get('/logout', (req, res) => {
	req.logout()
	res.redirect('/')
})

router.post('/remember', (req,res) => {
	var email = req.body.email

	models.user.findOne({email: email},(err,user) => {
		if (err) return res.json({err: err})
		if (!user) return res.json({msg: 'El correo no se encuentra registrado'})

		user.getAssociated().then(associated => {
			var transporter = nodemailer.createTransport('smtps://apprememberhelp%40gmail.com:remember-help@smtp.gmail.com')
			transporter.use('compile', markdown({}))

			var mailOptions = {
				from: '"Remember Help " <apprememberhelp@gmail.com>',
				to: email,
				subject: 'Recordar Datos Remember Help',
				markdown: '# Hola ' + associated.name +'\
					\n\nPediste que te recordamaos tus **datos**\
					\n\n**Usuario**:'+ user.username +'\
					\n\n**COntraseña**:'+ user.password
			}

			transporter.sendMail(mailOptions, function (err, info){
				if(err) return res.json({err:{message: err}})
				res.redirect('/authenticate')
			})
		})
	})

})

module.exports = router
