var Mongoose = require( 'mongoose' ),
	Schema = Mongoose.Schema

/* Definicion de Esquemas de la DB*/
const historySchema = new Mongoose.Schema( {
	/* activity : Referencia a la actividad completada*/
	'activity' : { 'type' : Schema.ObjectId, 'ref' : 'activity', 'required' : true },
	/* children : Referencia al niñ@ que completo la acvtividad*/
	'children' : { 'type' : Schema.ObjectId, 'ref' : 'children', 'required' : true },
	/* date : Fecha a la cual se completo la actividad*/
	'date' : { 'type' : Date, 'required' : true },
	/* dateDetail : Detalle de la Fecha a la cual se completo la actividad*/
	'dateDetail' : {
		'month' : { 'type' : Number },
		'day' : { 'type' : Number },
		'year' : { 'type' : Number },
	},
	/* time : Hora a la cual se completo la actividad*/
	'time' : { 'type' : Date, 'required' : true },
	/* timeDetail : Detalle de la Hora a la cual se completo la actividad*/
	'timeDetail' : {
		'hours' : { 'type' : Number },
		'minutes' : { 'type' : Number },
		'seconds' : { 'type' : Number },
		'milliseconds' : { 'type' : Number },
	},
} )

/* Creacion de los Modelos de la DB*/
/*
	El nombre de la coleccion se pasa en singular, y mongoose la crea en plular en la DB
	Mongoose.model('singularName', schema)
*/
const History = Mongoose.model( 'history', historySchema )

/* Definicion de Middlewares de los Esquemas*/
historySchema.pre( 'save', function ( next ) {
	/*
		Verificar que no exista el 'id' (en la coleccion 'childrens') con el que se este intentando crear un nuevo niñ@
		Returna Error al intentar crear un niñ@ con un 'id' ya existente
	*/
	this.dateDetail = {
		'month' : this.date.getUTCMonth() + 1,
		'day' : this.date.getUTCDate(),
		'year' : this.date.getUTCFullYear(),
	}
	this.timeDetail = {
		'hours' : this.time.getHours(),
		'minutes' : this.time.getMinutes(),
		'seconds' : this.time.getSeconds(),
		'milliseconds' : this.time.getMilliseconds()
	}
	next()
} )

module.exports = History
