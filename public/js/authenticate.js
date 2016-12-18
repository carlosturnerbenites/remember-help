var formAuthenticate = document.querySelector( '#formAuthenticate' ),
	notification = new NotificationC()

$( '.backContinue' ).click( function () {
	formAuthenticate.reset()
	$( '#sectionContinue' ).attr( 'data-hidden', 'false' )
	$( '#sectionAuth' ).attr( 'data-hidden', 'true' )
	$( '#userPhoto' ).attr( 'src', 'images/users/unkown.png' )
	$( '#userUsername' ).html( '' )
} )

$( '#continueAuthenticate' ).click( function (){
	$.ajax( {
		'type' : 'POST',
		'url' : '/api/collection/user',
		'contentType' : 'application/json',
		'success' : ( response ) => {
			if ( response.err ) return notification.show( { 'msg' : response.err.message, 'type' : 1 } )

			if ( response.document ) {
				var user = response.document

				$( '#userPhoto' ).attr( 'src', 'images/users/' + user.photo )
				$( '#userUsername' ).html( user.username )

				$( '#sectionContinue' ).attr( 'data-hidden', 'true' )
				$( '#sectionAuth' ).attr( 'data-hidden', 'false' )

				formAuthenticate.password.focus()
			}else notification.show( { 'msg' : 'No existe un usuario registrado con este **username**', 'type' : 2 } )
		},
		'data' : JSON.stringify( { 'query' : { 'username' : $( '[ name = username ]' ).val() }, 'projection' : { 'password' : 0 } } )
	} )
} )
