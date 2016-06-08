var Mongoose = require('mongoose'),
	Schema = Mongoose.Schema

/* Definicion de Esquemas de la DB*/
const historySchema = new Mongoose.Schema({
	/* activity : Referencia a la actividad completada*/
	activity:{ type:Schema.ObjectId, ref:'activity', required:true},
	/* children : Referencia al niñ@ que completo la acvtividad*/
	children:{ type:Schema.ObjectId, ref:'children', required:true},
	/* timeCurrent : Fecha a la cual se completo la actividad*/
	date :{type:Date, required:true},
	/* timeCurrent : Hora a la cual se completo la actividad*/
	time :{type:Date, required:true}
})

/* Creacion de los Modelos de la DB*/
/*
	El nombre de la coleccion se pasa en singular, y mongoose la crea en plular en la DB
	Mongoose.model('singularName', schema)
*/
const History = Mongoose.model('history', historySchema)

module.exports = History
