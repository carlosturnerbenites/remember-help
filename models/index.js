var fs = require('fs'),
	Log = require('log'),
	log = new Log('debug', fs.createWriteStream('remember-help.log')),
	Mongoose = require('mongoose'),
	Schema = Mongoose.Schema

/* Definicion de Esquemas de la DB*/

const childrenSchema = new Mongoose.Schema({
		/* age : Edad del/de la niñ@ */
		age:{type:Number, min:5, required:true},
		/* parent : Referencia del pariente asociado al/a la niñ@*/
		parent :{type:Schema.ObjectId, ref:'parent'},
		/* id : Identificacion de/de la niñ@*/
		id:{type:Number, required:true, unique:true},
		/* name : Nombre del/de la niñ@*/
		name:{type:String, required:true},
		/* stateHealth :  Estado de salud del niño : Sord@, mud@*/
		stateHealth:{type:Number, required:true},
		/* user : Referencia al usuario del/de la niñ@ */
		user :{type:Schema.ObjectId, ref:'user', required:true}
	}),
	administratorSchema = new Mongoose.Schema({
		/* id : identificacion del pariente */
		id:{type:Number, required:true, unique:true},
		/* name : nombre del pariente */
		name:{type:String, required:true},
		/* user : Referencia al usuario del pariente*/
		user :{type:Schema.ObjectId, ref:'user', required:true}
	}),
	parentSchema = new Mongoose.Schema({
		/* children : Referencia a el/la (los/las) niñ@ asosiados al pariente*/
		children:[{ type:Schema.ObjectId, ref:'children', required:'true' }],
		/* id : identificacion del pariente */
		id:{type:Number, required:true, unique:true},
		/* name : nombre del pariente */
		name:{type:String, required:true},
		/* user : Referencia al usuario del pariente*/
		user :{type:Schema.ObjectId, ref:'user', required:true}
	}),
	userSchema = new Mongoose.Schema({
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
	}),
	activitySchema = new Mongoose.Schema({
		/* date : Fecha en la cual se completo la actividad*/
		date :{type:Date, required:true},
		/* hour : Hora a la cual se completo la actividad*/
		hour :{type:Date, required:true},
		/* img : imagen de la actividad*/
		img :{type:String, required:true},
		/* text : texto de la actividad*/
		text :{type:String, required:true},
		/* textSpeech : texto usado por el API Speech para convertir a voz*/
		textSpeech :{type:String, required:true},
		/* tolerance : tiempo antes o despues en el cual se puede realizar una actividd (en minutos)*/
		tolerance :{type:Number, default:20, required:true }
	}),
	historySchema = new Mongoose.Schema({
		/* activity : Referencia a la actividad completada*/
		activity:{ type:Schema.ObjectId, ref:'activity', required:true},
		/* children : Referencia al niñ@ que completo la acvtividad*/
		children:{ type:Schema.ObjectId, ref:'children', required:true},
		/* timeCurrent : Fecha a la cual se completo la actividad*/
		date :{type:Date, required:true},
		/* timeCurrent : Hora a la cual se completo la actividad*/
		time :{type:Date, required:true}
	})

/* Definicion de metodos de los Esquemas */
activitySchema.method('getState', function (children){
	/*
		Crea un objeto con informacion referente al estado de las actividades de determinado niñ@
			estado : complete, incomplete - Estado de la actividad
			detail : after, aClock - completada a tiempo o despues de la hora
		Retorna una promesa
	*/
	var activity = this
	return new Promise((resolve, reject) => {
		var dateCurrent = new Date()
		dateCurrent.setHours(0,0,0,0)

		models.history.findOne({children : children._id, activity: activity._id,date: dateCurrent.toISOString()},(err, history) => {
			if (err) reject({err : err})
			if (history) {

				var dateHistory = history.time,
					dateActivity = activity.hour,
					detail = {
						aClock : false,
						after : false
					}

				dateActivity.setDate(dateHistory.getDate())
				dateActivity.setFullYear(dateHistory.getFullYear())
				dateActivity.setMonth(dateHistory.getMonth())

				var lowerLimit = new Date(dateHistory.setMinutes(dateHistory.getMinutes() - activity.tolerance)),
					upperLimit = new Date(dateHistory.setMinutes(dateHistory.getMinutes() + activity.tolerance*2))
				if (dateActivity > lowerLimit && dateActivity < upperLimit) detail.aClock = true
				else detail.after = true

				return resolve({code: 1, codeText: 'complete', detail: detail})
			}else return resolve({code: 0, codeText: 'inprocess'})
		})
	})
})

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

const models = {
	/*
		El nombre de la coleccion se pasa en singular, y mongoose la crea en plular en la DB
		Mongoose.model('singularName', schemas)
	*/
	activity :Mongoose.model('activity', activitySchema),
	children :Mongoose.model('children', childrenSchema),
	parent :Mongoose.model('parent', parentSchema),
	administrator :Mongoose.model('administrator', administratorSchema),
	history :Mongoose.model('history', historySchema),
	user :Mongoose.model('user', userSchema)
}

/* Definicion de Middlewares de los Esquemas*/

childrenSchema.pre('save', function (next) {
	/*
		Verificar que no exista el 'id' (en la coleccion 'childrens') con el que se este intentando crear un nuevo niñ@
		Returna Error al intentar crear un niñ@ con un 'id' ya existente
	*/
	models.children.findOne({id : this.id}, function (err, children) {
		if (children) next(new Error('Children Duplicate'))
		else next()
	})
})

childrenSchema.post('remove', function (children) {
	/*
		Valida si el familiar asociado al niñ@ tiene mas niñ@
		Si no tiene mas niñ@S asociados, lo Elimina
		Pero si tiene solo elimina la refeencia del niñ@
	*/

	models.parent.findOne({children: {$in :[children._id]}},(err, parent) => {
		if(err) return log.error(err)
		if(parent.children.length == 1){
			parent.remove({},(err, removed) => {
				if(err) return log.error(err)
			})
		}else{
			parent.update(
				{$pullAll : {children : [children._id]}},
				(err,parent) => {
					if(err) return log.error(err)
				})
		}
	})
	models.user.findById(children.user,(err, user) => {
		if(err) return log.error(err)
		if(user) user.remove()
	})
})

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

/* Exportacion de los modelos*/

module.exports = models
