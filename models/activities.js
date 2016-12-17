var Mongoose = require( 'mongoose' )

/* Modelos Necesarios*/
const models = {
	'history' : require( './histories' )
}

/* Definicion de Esquemas de la DB*/
const activitySchema = new Mongoose.Schema( {
	/* date : Fecha en la cual se debe completo la actividad*/
	'date' : { 'type' : Date },
	/* dateDetail : Detalle de la Fecha en la cual se debe completo la actividad*/
	'dateDetail' : {
		'month' : { 'type' : Number },
		'day' : { 'type' : Number },
		'year' : { 'type' : Number },
	},
	/* hour : Hora a la cual se debe completo la actividad*/
	'hour' : { 'type' : Date, 'required' : true },
	/* hourDetail : Detalle de la Hora a la cual se debe completo la actividad*/
	'hourDetail' : {
		'hours' : { 'type' : Number },
		'minutes' : { 'type' : Number },
		'seconds' : { 'type' : Number },
		'milliseconds' : { 'type' : Number },
	},
	/* img : imagen de la actividad*/
	'img' : { 'type' : String, 'required' : true },
	/* text : texto de la actividad*/
	'text' : { 'type' : String, 'required' : true },
	/* textSpeech : texto usado por el API Speech para convertir a voz*/
	'textSpeech' : { 'type' : String, 'required' : true },
	/* tolerance : tiempo antes o despues en el cual se puede realizar una actividd (en minutos)*/
	'tolerance' : { 'type' : Number, 'default' : 20, 'required' : true }
} )

/* Definicion de Metodos de los Esquemas*/
activitySchema.method( 'getState', function ( children ){
	/*
		Crea un objeto con informacion referente al estado de las actividades de determinado niñ@
			estado : complete, incomplete - Estado de la actividad
			detail : after, aClock - completada a tiempo o despues de la hora
		Retorna una promesa
	*/
	var activity = this
	return new Promise( ( resolve, reject ) => {
		var dateCurrent = new Date()
		dateCurrent.setHours( 0, 0, 0, 0 )

		models.history.findOne( { 'children' : children._id, 'activity' : activity._id, 'date' : dateCurrent.toISOString() }, ( err, history ) => {
			if ( err ) reject( { 'err' : err } )
			if ( history ) {

				var dateHistory = history.time,
					dateActivity = activity.hour,
					detail = {
						'aClock' : false,
						'after' : false
					}

				dateActivity.setDate( dateHistory.getDate() )
				dateActivity.setFullYear( dateHistory.getFullYear() )
				dateActivity.setMonth( dateHistory.getMonth() )

				var lowerLimit = new Date( dateHistory.setMinutes( dateHistory.getMinutes() - activity.tolerance ) ),
					upperLimit = new Date( dateHistory.setMinutes( dateHistory.getMinutes() + activity.tolerance * 2 ) )
				if ( dateActivity > lowerLimit && dateActivity < upperLimit ) detail.aClock = true
				else detail.after = true

				return resolve( { 'code' : 1, 'codeText' : 'complete', 'detail' : detail } )
			}else return resolve( { 'code' : 0, 'codeText' : 'inprocess' } )
		} )
	} )
} )

/* Creacion de los Modelos de la DB*/
/*
	El nombre de la coleccion se pasa en singular, y mongoose la crea en plular en la DB
	Mongoose.model( 'singularName', schema)
*/
const Activity = Mongoose.model( 'activity', activitySchema )

/* Definicion de Middlewares de los Esquemas*/
activitySchema.pre( 'save', function ( next ) {
	/*
		Verificar que no exista el 'id' (en la coleccion 'childrens') con el que se este intentando crear un nuevo niñ@
		Returna Error al intentar crear un niñ@ con un 'id' ya existente
	*/
	this.dateDetail = {
		'month' : this.date.getUTCMonth() + 1,
		'day' : this.date.getUTCDate(),
		'year' : this.date.getUTCFullYear(),
	}
	this.hourDetail = {
		'hours' : this.hour.getHours(),
		'minutes' : this.hour.getMinutes(),
		'seconds' : this.hour.getSeconds(),
		'milliseconds' : this.hour.getMilliseconds()
	}
	next()
} )

module.exports = Activity
