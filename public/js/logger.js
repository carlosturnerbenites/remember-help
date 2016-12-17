var formLogger = document.querySelector( '#formLogger' ),
	notification = new NotificationC()

formLogger.onsubmit = function ( event ){
	event.preventDefault()
	ajax( {
		'type' : 'POST',
		'URL' : '/logger/getLog',
		'async' : true,
		'contentType' : 'application/json',
		'onSuccess' : ( response ) => {
			console.log( response )
			var formatter = new JSONFormatter.default( response )
			document.body.appendChild( formatter.render() )
		},
		'data' : JSON.stringify( {} )
	} )
}
