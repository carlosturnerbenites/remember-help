var fs = require('fs'),
	log = require('./../utils/log'),
	Mongoose = require('mongoose')

/* Definicion de Esquemas de la DB*/
const userSchema = new Mongoose.Schema({
	/* active : Estado del usuario en el sistema */
	active:{type:Boolean, required:true, default:true},
	/* photo : Nombre del imagen del usuario*/
	photo:{type:String, default: 'unkown.png'},
	/* password : contraseña del usuario */
	password:{type:String, required:true},
	/* email : direccion de correo electronico */
	email:{type:String, required:true},
	/* type : Tipo de usuario : 777 - Developer, 776 - Administrador, 0 - pariente, 1 - niñ@*/
	type:{type:Number , emum:[777,776,0,1],required:true},
	/* username : Nombre de usuario*/
	username:{type:String, required:true, unique:true}
})

/* Modelos Necesarios*/
const models = {
	user : require('./users'),
	parent : require('./parents'),
	children : require('./childrens'),
	administrator : require('./administrators')
}

/* Definicion de Metodos de los Esquemas*/
userSchema.method('getAssociated', function (){
	/*
		Busca la persona(niñ@ o pariente) asociada a un usuario
		Retorna una promesa
	*/
	return new Promise((resolve, reject) => {

		var data = {}
		if(this.type == 0) data = {model: 'parent', fields: 'user children'}
		else if(this.type == 1) data = {model: 'children', fields: 'user parent'}
		else if(this.type == 776) data = {model: 'administrator', fields: 'user'}
		else return {err: {msg:'Este usuario no tiene asociada a ninguna persona'}}

		models[data.model].findOne({user: this._id})
		.populate(data.fields)
		.exec((err,associated) => {
			console.log(data)
			if(err) reject(err)
			resolve(associated)
		})
	})
})

/* Creacion de los Modelos de la DB*/
/*
	El nombre de la coleccion se pasa en singular, y mongoose la crea en plular en la DB
	Mongoose.model('singularName', schema)
*/
var User = Mongoose.model('user', userSchema)

/* Definicion de Middlewares de los Esquemas*/
userSchema.pre('save', function (next) {
	/*
		Verificar que no exista el 'username' (en la coleccion 'users') con el que se este intentando crear un nuevo usuario
		Returna Error al intentar crear un usuario con un 'username' ya existente
	*/
	models.user.findOne({username : this.username}, function (err, children) {
		if (children) next(new Error('Username Duplicate'))
		else next()
	})
})

userSchema.post('remove', function (user) {
	/*
		Borrar la foto de un usuario despues de que es eliminado
	*/
	var namePhoto = user.photo
	if (namePhoto != 'unkown.png'){
		fs.unlink(
			process.env.PWD + '/public/images/users/' + user.photo,
			err => {if (err) return log.error(err)}
			)
	}
})

module.exports = User
