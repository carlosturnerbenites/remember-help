process.env.BASE_DATE = new Date( '1970 01 01' )
process.env.BASE_PATH_LOG = 'logs/'
process.env.BASE_NAME_LOG = 'remember-help-year-month.log'

var urlConfig
if( !process.env.NODE_ENV ) urlConfig = './config/configProd.json'
else if( process.env.NODE_ENV == 'dev' ) urlConfig = './config/configDev.json'
else process.exit()

const config = require( urlConfig ),
	nameProject = 'Remember Help',

	express = require( 'express' ),
	cookieParser = require( 'cookie-parser' ),
	bodyParser = require( 'body-parser' ),
	expressSession = require( 'express-session' ),
	favicon = require( 'express-favicon' ),
	flash = require( 'express-flash' ),
	passport = require( 'passport' ),
	LocalStrategy = require( 'passport-local' ).Strategy,

	mongoose = require( 'mongoose' ),
	models = require( './models' ),
	URIMongo = process.env.PROD_MONGODB || config.URIMongo,
	MongoStore = require( 'connect-mongo' )( expressSession ),

	port = process.env.PORT || 8000,
	app = express(),

	urlLogger = require( './urls/logger' ),
	urlActivities = require( './urls/activities' ),
	urlChildren = require( './urls/children' ),
	urlAdministration = require( './urls/administration' ),
	urlGeneral = require( './urls/general' ),
	urlManagement = require( './urls/management' ),
	urlStatistics = require( './urls/statistics' ),
	urlUsers = require( './urls/users' ),
	urlApi = require( './urls/api' ),

	utils = require( './utils' ),

	log = require( './utils/log' )

mongoose.Promise = global.Promise

mongoose.connect( URIMongo, ( error ) => {
	if( error ) {
		log.error( error )
		throw new Error( error )
	}
} )

app.set( 'views', __dirname + '/views' )
app.set( 'view engine', 'jade' )
app.use( express.static( config.statics ) )

app.use( bodyParser.json() )
app.use( bodyParser.urlencoded( { 'extended' : false } ) )

app.use( cookieParser() )

app.use( favicon( __dirname + '/public/images/favicon.ico' ) )

app.use( expressSession( {
	'secret' : 're)rYq$"4NJ3C@~DGv>7BuL',
	'resave' : false,
	'saveUninitialized' : false,
	'store' : new MongoStore( {
		'mongooseConnection' : mongoose.connection
	} )
} ) )

app.use( passport.initialize() )
app.use( passport.session() )
app.use( flash() )

passport.use( new LocalStrategy( ( username, password, done ) => {
	models.user.findOne( { 'username' : username }, ( err, user ) => {
		if( err ) return done( null, false, { 'message' : err } )
		if ( !user ) return done( null, false, { 'message' : 'El usuario no se encuentra Registrado.' } )
		if ( !user.active ) return done( null, false, { 'message' : 'EL usuario se encuentra Inactivo' } )
		if( user.password == password ) return done( null, user, { 'message' : 'Bienvenido ' + user.username } )
		done( null, false, { 'message' : 'La contraseña es incorrecta.' } )
	} )
} ) )

passport.serializeUser( ( user, done ) => done( null, user ) )

passport.deserializeUser( ( user, done ) => {
	models.user.findById( user._id, ( err, user ) => {
		done( err, user )
	} )
} )

app.use( ( req, res, next ) => {
	res.locals.user = req.user
	res.locals.classcss = utils.stylesPage.getRandom()
	res.locals.nameProject = nameProject
	next()
} )

app.use( '', urlGeneral )
app.use( '/children', requiredType( [ 1 ] ), urlChildren )
app.use( '/activities', requiredType( [ 1 ] ), urlActivities )
app.use( '/admin', requiredType( [ 777, 776 ] ), urlAdministration )
app.use( '/logger', requiredType( [ 777, 776 ] ), urlLogger )
app.use( '/management', requiredType( [ 0 ] ), urlManagement )
app.use( '/statistics', requiredType( [ 0 ] ), urlStatistics )
app.use( '/user', requiredType( [ 777, 776, 0 ] ), urlUsers )
app.use( '/api', urlApi )

app.post(
	'/authenticate',
	passport.authenticate(
		'local',
		{
			'failureFlash' : true,
			'successFlash' : true,
			'failureRedirect' : '/authenticate'
		}
	), ( req, res ) => {
		log.info( 'Login User: ' + req.user.username + '. id: ' + req.user._id )
		if ( req.user.type == 0 ) return res.redirect( '/management/statistics' )
		if ( req.user.type == 1 ) return res.redirect( '/children/activities' )
		if ( req.user.type == 776 ) return res.redirect( '/admin/collections' )
		if ( req.user.type == 777 ) return res.redirect( '/admin/collections' )
	} )

function requiredType ( type ) {
	return function ensureAuth ( req, res, next ) {
		if ( req.isAuthenticated() ) {
			if ( type.indexOf( parseInt( req.user.type ) ) >= 0 ) return next()
			return res.redirect( '/' )
		}else{
			res.redirect( '/authenticate' )
		}
	}
}

app.listen( port, () => { console.log( 'Server listen in ' + port ) } )
