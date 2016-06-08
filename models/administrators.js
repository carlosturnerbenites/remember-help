var Mongoose = require('mongoose'),
	Schema = Mongoose.Schema

/* Definicion de Esquemas de la DB*/
const administratorSchema = new Mongoose.Schema({
	/* id : identificacion del pariente */
	id:{type:Number, required:true, unique:true},
	/* name : nombre del pariente */
	name:{type:String, required:true},
	/* user : Referencia al usuario del pariente*/
	user :{type:Schema.ObjectId, ref:'user', required:true}
})

/* Creacion de los Modelos de la DB*/
/*
	El nombre de la coleccion se pasa en singular, y mongoose la crea en plular en la DB
	Mongoose.model('singularName', schema)
*/
const Administrator = Mongoose.model('administrator', administratorSchema)

module.exports = Administrator
