var formChangePassword = document.querySelector( '#changePassword' ),
	validator = new Validator( formChangePassword )

validator.config( [
	{
		'fn' : 'equals',
		'params' : 'newPassword confirmNewPassword',
		'messageError' : 'Las contraseñas no **coinciden**.'
	}
] )

formChangePassword.onsubmit = function ( event ){
	var validation = validator.isValid()
	if( !validation.isValid ){
		event.preventDefault()
		validator.showErrors( '.errors' )
	}else{
		if( !confirm( '¿Esta seguro de cambiar su contraseña actual?' ) ) return event.preventDefault()
	}
}
