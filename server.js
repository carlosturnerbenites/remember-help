var urlConfig
if(!process.env.NODE_ENV) urlConfig = './config/configProd.json'
else if(process.env.NODE_ENV == 'dev') urlConfig = './config/configDev.json'
else process.exit()

const config = require(urlConfig),
	express = require('express'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	expressSession = require('express-session'),
	favicon = require('express-favicon'),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,

	mongoose = require('mongoose'),
	models = require('./models'),
	MongoStore = require('connect-mongo')(expressSession),

	port = process.env.PORT || 8000,
	http = require('http'),
	app = express(),
	/* Desde Express 4 ya no es necesario crear un servidor con http Module (Esisten Exepciones), solo se debe usar app.listen()*/
	server = http.createServer(app),

	urlActivities = require('./urls/activities'),
	urlChildren = require('./urls/children'),
	urlAdministration = require('./urls/administration'),
	urlGeneral = require('./urls/general'),
	urlManagement = require('./urls/management'),
	urlStatistics = require('./urls/statistics'),
	urlApi = require('./urls/api'),

	utils = require('./utils')

mongoose.connect(config.URIMongo)

app.set('views', __dirname + '/views')
app.set('view engine', 'jade')
app.use(express.static(config.statics))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use(cookieParser())

app.use(favicon(__dirname + '/public/images/favicon.ico'))

app.use(expressSession({
	secret: 're)rYq$"4NJ3C@~DGv>7BuL',
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

app.use((req, res, next) => {
	res.locals.user = req.user
	res.locals.classcss = utils.stylesPage.getRandom()
	next()
})

app.use('',urlGeneral)
app.use('/children', requiredType([1]), urlChildren)
app.use('/activities', requiredType([1]), urlActivities)
app.use('/admin', requiredType([777,776]), urlAdministration)
app.use('/management', requiredType([0]), urlManagement)
app.use('/statistics', requiredType([0]), urlStatistics)
app.use('/api',urlApi)

app.post('/authenticate',
	passport.authenticate('local',{failureRedirect: '/authenticate'}),
	(req, res) => {
		if (req.user.type == 0) return res.redirect('/management/statistics')
		if (req.user.type == 1) return res.redirect('/children/activities')
		if (req.user.type == 776) return res.redirect('/admin/collections')
	}
)

function requiredType (type){
	return function ensureAuth (req, res, next) {
		if (req.isAuthenticated()){
			if (type.indexOf(parseInt(req.user.type)) >= 0) return next()
			return res.redirect('/')
		}else{
			res.redirect('/authenticate')
		}
	}
}

server.listen(port, () => {console.log('Server listen in ' + port)})
