const express = require( 'express' ),
	router = express.Router(),
	models = require( './../models/' ),
	utils = require( './../utils/' ),
	bodyParser = require( 'body-parser' ),
	fs = require( 'fs' ),
	log = require( './../utils/log' )

router.use( bodyParser.json() )

router.get( '/', ( req, res ) => res.render( 'administration/logger' ) )

router.post( '/getLog', ( req, res ) => {
	var basePathLog = process.env.BASE_PATH_LOG,
		baseNameLog = process.env.BASE_NAME_LOG,
		data = req.body

	var month = 5,
		year = 2016

	var filename = baseNameLog
					.replace( 'year', year )
					.replace( 'month', month ),
		pathLog = basePathLog + filename

	fs.readFile( pathLog, 'utf8', function ( error, content ) {
		if ( error ) console.log( error )
		var data = JSON.parse( content )
		return res.json( data )
	} )
} )

module.exports = router
