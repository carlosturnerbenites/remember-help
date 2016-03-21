var Mongoose = require('mongoose'),
	Schema = Mongoose.Schema

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
		/* photo : Nombre del imagen del usuario*/
		photo:{type:String, default: 'unkown.png', required:true, unique:true},
		/* password : contraseña del usuario */
		password:{type:String, required:true},
		/* type : Tipo de usuario : 777 - Developer, 776 - Administrador, 0 - pariente, 1 - niñ@*/
		type:{type:Number , emum:[777,776,0,1,2],required:true},
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

activitySchema.method('getState', function (children){
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

				return resolve({code : 1,codeText : 'complete', detail : detail})
			}else return resolve({code : 0,codeText : 'inprocess'})
		})
	})
})

const models = {activity :Mongoose.model('activity', activitySchema),
	children :Mongoose.model('children', childrenSchema),
	parent :Mongoose.model('parent', parentSchema),
	history :Mongoose.model('history', historySchema),
	user :Mongoose.model('user', userSchema)
}

childrenSchema.pre('save', function (next) {
	models.children.findOne({id : this.id}, function (err, children) {
		if (children) next(new Error('Children Duplicate'))
		else next()
	})
})
userSchema.pre('save', function (next) {
	models.user.findOne({username : this.username}, function (err, children) {
		if (children) next(new Error('Username Duplicate'))
		else next()
	})
})

module.exports = models
