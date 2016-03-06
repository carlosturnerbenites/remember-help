var urlConfig
if(!process.env.NODE_ENV) urlConfig = './config/configDev.json'
else if(process.env.NODE_ENV == 'prod') urlConfig = './config/configProd.json'
else process.exit()

const config = require(urlConfig),
	port = process.env.PORT || 8000,
	http = require('http'),
	mongoose = require('mongoose'),
	express = require('express'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	expressSession = require('express-session'),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	schedule = require('node-schedule'),
	MongoStore = require('connect-mongo')(expressSession),

	app = express(),
	server = http.createServer(app),

	urlGeneral = require('./urls/general'),
	urlChildren = require('./urls/children'),
	urlManagement = require('./urls/management'),
	api = require('./urls/api'),
	models = require('./models')

app.set('views', __dirname + '/views')
app.set('view engine', 'jade')
app.use(express.static(config.statics))

mongoose.connect(config.URIMongo)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use(cookieParser())

app.use(expressSession({
	secret: 'help',
	resave: false,
	saveUninitialized: false ,
	store: new MongoStore({
		mongooseConnection: mongoose.connection
	})
}))

app.use(passport.initialize())
app.use(passport.session())

passport.use(new LocalStrategy((username, password, done) => {
	models.user.findOne({username : username},(err,user) => {
		if(err) return done(null, false, { message: err})
		if (!user) return done(null, false, { message: 'Unknown user'})
		if(user.password == password) return done(null,user)
		done(null, false, { message: 'Unknown password'})
	})
}))

passport.serializeUser((user, done) => done(null, user))

passport.deserializeUser((user, done) => {
	models.user.findById(user._id,(err,user) => {
		done(err, user)
	})
})

app.use('',urlGeneral)
app.use('/children', ensureAuth , urlChildren)
app.use('/management', ensureAuth , urlManagement)
app.use('/api',api)

app.post('/authenticate',
	passport.authenticate('local',{failureRedirect: '/authenticate', successRedirect: '/children/activities'})
)

function ensureAuth (req, res, next) {
	if (req.isAuthenticated()) return next()
	res.redirect('/authenticate')
}

schedule.scheduleJob({hour: 0, minute: 0, dayOfWeek: new schedule.Range(0, 7)}, () => {
	models.activitie.update(
		{ state : { $ne : 'inprocess'}},
		{ $set : { state : 'inprocess' }},
		{ multi: true }
	).exec()
})

server.listen(port, () => {console.log('Server listen in ' + port)})
