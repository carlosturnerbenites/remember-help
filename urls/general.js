const express = require('express'),
	router = express.Router(),
	models = require('./../models/'),
	bodyParser = require('body-parser'),
	nodemailer = require('nodemailer'),
	jade = require('jade'),
	utils = require('./../utils')

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
		if (err) {
			req.flash('error',err)
			return res.redirect(req.get('referer'))
		}
		if (!user) {
			req.flash('error','El correo no se encuentra registrado')
			return res.redirect(req.get('referer'))
		}

		user.getAssociated().then(associated => {
			var fn = jade.compileFile('views/mails/remember.jade', {})
			var html = fn({
				associated: associated,
				classcss: utils.stylesPage.getRandom()
			})

			var transporter = nodemailer.createTransport('smtps://apprememberhelp%40gmail.com:remember-help@smtp.gmail.com')

			var mailOptions = {
				from: '"Remember Help " <apprememberhelp@gmail.com>',
				to: email,
				subject: 'Remember Help - Datos De Sesion',
				html: html
			}

			transporter.sendMail(mailOptions, function (err, info){
				if (err) {
					req.flash('error',err)
					return res.redirect(req.get('referer'))
				}
				req.flash('success','El correo se envio correctamente a ' + info.accepted)
				res.redirect('/authenticate')
			})
		})
	})
})

module.exports = router
