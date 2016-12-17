const express = require( 'express' ),
	router = express.Router(),
	models = require( './../models/' )

const Parent = models.parent

router.get( '/statistics', ( req, res ) => {

	var user = req.user

	Parent.findOne( { 'user' : user._id } )
	.populate( 'children' )
	.exec( ( error, oDbParent ) => {
		if ( error ) {
			req.flash( 'error', error )
			return res.redirect( req.get( 'referer' ) )
		}
		return res.render( 'management/statistics', { 'parent' : oDbParent } )
	} )
} )

module.exports = router
