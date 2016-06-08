var fs = require('fs'),
	log = require('./../utils/log'),
	Mongoose = require('mongoose'),
	Schema = Mongoose.Schema

/* Modelos Necesarios*/
const models = {
	user : require('./users')
}

/* Definicion de Esquemas de la DB*/
const parentSchema = new Mongoose.Schema({
	/* children : Referencia a el/la (los/las) niñ@ asosiados al pariente*/
	children:[{ type:Schema.ObjectId, ref:'children', required:'true' }],
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
var Parent = Mongoose.model('parent', parentSchema)

/* Definicion de Middlewares de los Esquemas*/
parentSchema.post('remove', function (parent) {
	/*
		Elimina el usuario de un parent al despues de ser eliminado
	*/
	models.user.findById(parent.user,(err, user) => {
		user.remove({},(err, removed) => {
			if(err) return log.error(err)
		})
	})
})

module.exports = Parent
