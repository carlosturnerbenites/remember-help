const notification = new NotificationC()

$( '#formLogger' ).submit( event => {
	event.preventDefault()
	$.ajax( {
		'type' : 'POST',
		'url' : '/logger/getLog',
		'contentType' : 'application/json',
		'success' : ( response ) => {
			console.log( response )
			var formatter = new JSONFormatter.default( response )
			document.body.appendChild( formatter.render() )
		},
		'data' : JSON.stringify( {} )
	} )
} )
