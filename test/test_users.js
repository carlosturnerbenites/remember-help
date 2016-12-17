var test = require( 'tape' )

var file = require( '../urls/users.js' )

test( 'function: is_valid', function ( t ) {

	const models = require( './../models/' )

	models.user.findOne( {}, ( error, oDbUser ) => {
		file( {
			'_id' : oDbUser._id,
			'newPassword' : '6Ytg(dgU$%',
			'currentPassword' : oDbUser.password
		} ).then( data => {
			t.pass( data )
			t.end()
		} ).catch( error => {
			t.fail( error.message )
			t.end()
		} )
	} )
} )

