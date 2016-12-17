const express = require( 'express' ),
	router = express.Router(),
	models = require( './../models/' ),
	bodyParser = require( 'body-parser' ),
	log = require( './../utils/log' )

const User = models.user

router.use( bodyParser.json() )
router.use( bodyParser.urlencoded( { 'extended' : false } ) )

function changePassword ( dataUser ) {
	return new Promise( ( resolve, reject ) => {
		User.findOneAndUpdate(
			{ '_id' : dataUser._id },
			{ '$set' : { 'password' : dataUser.newPassword } },
		( error, oDbUser ) => {
			if ( error ) return reject( error )
			if ( !oDbUser ) return reject( { 'message' : 'El usuario No existe' } )
			if ( oDbUser.password != dataUser.currentPassword ) return reject( { 'message' : 'Contraseña Incorrecta' } )

			return resolve( { 'error' : error, 'ok' : true, 'message' : 'Contraseña Cambia con Exito' } )
		} )
	} )
}

router.get( '/:username/', ( req, res ) => {

	var user = req.user

	User.findOne(
		{ '_id' : user._id },
		( error, oDbUser ) => {
			if ( error ) {
				req.flash( 'error', error )
				return res.redirect( req.get( 'referer' ) )
			}
			if ( !oDbUser ) {
				req.flash( 'error', 'El Usuario no Existe' )
				return res.redirect( req.get( 'referer' ) )
			}
			oDbUser.getAssociated().then( associated => {
				res.render( 'users/perfil', { 'associated' : associated } )
			} )
		}
	)
} )

router.post( '/changePassword', ( req, res ) => {

	var dateUser = req.body

	changePassword( dateUser ).then( data => {
		req.flash( 'success', data.message )
		return res.redirect( '/user/' + req.user.username )
	} ).catch( error => {
		req.flash( 'error', error )
		log.error( error )
		return res.redirect( req.get( 'referer' ) )
	} )
} )

module.exports = router
