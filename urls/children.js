const express = require( 'express' ),
	router = express.Router(),
	models = require( './../models/' ),
	utils = require( './../utils' ),
	Q = require( 'q' )

const Activity = models.activity,
	Children = models.children

router.get( '/activities', ( req, res ) => {

	var monthCurrent = new Date().getMonth() + 1

	Activity
	.find( { '$or' : [ { 'date' : null }, { 'dateDetail.month' : monthCurrent } ] } )
	.sort( { 'time' : -1 } )
	.exec(
		( error, oDbActivities ) => {

			Children.findOne( { 'user' : req.user._id }, ( error, oDbChildren ) => {
				if ( error ) {
					req.flash( 'error', error )
					return res.redirect( req.get( 'referer' ) )
				}

				var promises = []

				oDbActivities.forEach( oDbActivity => {
					promises.push( oDbActivity.getState( oDbChildren ) )
				} )
				Q.all( promises ).then( () => {
					res.render( 'children/activities', {
						'activities' : oDbActivities,
						'children' : oDbChildren
					} )
				} )
			} )
		}
	)
} )

module.exports = router
