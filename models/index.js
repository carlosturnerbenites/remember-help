var Mongoose = require('mongoose'),
	Schema = Mongoose.Schema

const childrenSchema = new Mongoose.Schema({
		age: {type:Number, min:5, required: true},
		father: { type: Schema.ObjectId, ref: 'father' },
		name: {type:String, required:true},
		user : {type: Schema.ObjectId, ref:'user'}
	}),
	fatherSchema = new Mongoose.Schema({
		children: { type: Schema.ObjectId, ref: 'children' },
		name: {type:String, required: true},
		user : {type: Schema.ObjectId, ref:'user'}
	}),
	userSchema = new Mongoose.Schema({
		name: {type:String, default:'' , required:true},
		password: {type:String, default:'' , required:true},
		type: {type:Number , emum: [0,1,2],required:true},
		username: {type:String, default:'' , required:true, unique:true}
	}),
	activitySchema = new Mongoose.Schema({
		date : {type:Date},
		dateMax : {type:Date},
		hour : {type:Date, required: true},
		img : {type:String, default:'', required: true},
		text : {type:String, default:'', required: true},
		textSpeech : {type:String, default:'', required: true},
		/* la tolerancio se define en minutos*/
		tolerance : {type:Number, default: 20, required: true }
	}),
	messageSchema = new Mongoose.Schema({
		text : {type:String, required: true},
		type: {type:Number , required: true}
	}),
	historySchema = new Mongoose.Schema({
		activity: { type: Schema.ObjectId, ref: 'activity' },
		children: { type: Schema.ObjectId, ref: 'children' },
		timeCurrent : {type:Date, default: Date.now}
	})

module.exports = {
	activity : Mongoose.model('activity', activitySchema),
	children : Mongoose.model('children', childrenSchema),
	father : Mongoose.model('father', fatherSchema),
	history : Mongoose.model('history', historySchema),
	message : Mongoose.model('message', messageSchema),
	user : Mongoose.model('user', userSchema)
}
