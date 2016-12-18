const models = require( './../models/' ),
	Q = require( 'q' )

function Form ( form ) {
	var promises = []
	for ( var name in form.fields ) {
		var field = form.fields[name]
		if ( field.type == 'ref' ){
			var promise = new Promise( ( resolve, reject ) => {
				models[field.ref].find().exec( function ( error, results ) {
					if (error) reject(error)
					field.options = results
					resolve()
				} )
			} )
			console.log(models[field.ref])
			promises.push( promise )
		}
	}
	console.log("aaaaaaaaaaaaaaaaaaaaaa")
	if ( promises.length > 0 ){
		Q.all( promises ).then( data => {
			console.log("bien")
			return form
		} ).catch( error => {
			console.log("mal")
			return form
		})
	}else{
		return form
	}

}

module.exports = Form
