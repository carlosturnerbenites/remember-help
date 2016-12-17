var log = require( './../utils/log' ),
	Mongoose = require( 'mongoose' ),
	Schema = Mongoose.Schema

/* Modelos Necesarios*/
const models = {
	'history' : require( './histories' ),
	'user' : require( './users' )
}

/* Definicion de Esquemas de la DB*/
const childrenSchema = new Mongoose.Schema( {
	/* age : Edad del/de la niñ@ */
	'age' : { 'type' : Number, 'min' : 5, 'required' : true },
	/* parent : Referencia del pariente asociado al/a la niñ@*/
	'parent' : { 'type' : Schema.ObjectId, 'ref' : 'parent' },
	/* id : Identificacion de/de la niñ@*/
	'id' : { 'type' : Number, 'required' : true, 'unique' : true },
	/* name : Nombre del/de la niñ@*/
	'name' : { 'type' : String, 'required' : true },
	/* stateHealth :  Estado de salud del niño : Sord@, mud@*/
	'stateHealth' : { 'type' : Number, 'required' : true },
	/* user : Referencia al usuario del/de la niñ@ */
	'user' : { 'type' : Schema.ObjectId, 'ref' : 'user', 'required' : true }
} )

/* Creacion de los Modelos de la DB*/
/*
	El nombre de la coleccion se pasa en singular, y mongoose la crea en plular en la DB
	Mongoose.model( 'singularName', schema)
*/
const Children = Mongoose.model( 'children', childrenSchema )

/* Definicion de Middlewares de los Esquemas*/
childrenSchema.pre( 'save', function ( next ) {
	/*
		Verificar que no exista el 'id' (en la coleccion 'childrens' ) con el que se este intentando crear un nuevo niñ@
		Returna Error al intentar crear un niñ@ con un 'id' ya existente
	*/
	Children.findOne( { 'id' : this.id }, function ( err, children ) {
		if ( children ) next( new Error( 'Children Duplicate' ) )
		else next()
	} )
} )

childrenSchema.post( 'remove', function ( children ) {
	/*
		Valida si el familiar asociado al niñ@ tiene mas niñ@
		Si no tiene mas niñ@S asociados, lo Elimina
		Pero si tiene solo elimina la refeencia del niñ@
	*/

	models.parent.findOne( { 'children' : { '$in' : [ children._id ] } }, ( err, parent ) => {
		if( err ) return log.error( err )
		if( parent.children.length == 1 ){
			parent.remove( {}, ( err, removed ) => {
				if( err ) return log.error( err )
			} )
		}else{
			parent.update(
				{ '$pullAll' : { 'children' : [ children._id ] } },
				( err, parent ) => {
					if( err ) return log.error( err )
				} )
		}
	} )
	models.user.findById( children.user, ( err, user ) => {
		if( err ) return log.error( err )
		if( user ) user.remove()
	} )
} )

module.exports = Children
