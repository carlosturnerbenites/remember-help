var Mongoose = require('mongoose'),
	Schema = Mongoose.Schema

const childrenSchema = new Mongoose.Schema({
		age: {type:Number, min:5},
		father: { type: Schema.ObjectId, ref: 'father' },
		name: {type:String, required:true},
		user : {type: Schema.ObjectId, ref:'user'}
	}),
	fatherSchema = new Mongoose.Schema({
		children: { type: Schema.ObjectId, ref: 'children' },
		name: {type:String, default:''},
		user : {type: Schema.ObjectId, ref:'user'}
	}),
	userSchema = new Mongoose.Schema({
		name: {type:String, default:'' , required:true},
		password: {type:String, default:'' , required:true},
		type: {type:Number , emum: [0,1,2],required:true},
		username: {type:String, default:'' , required:true}
	}),
	activitySchema = new Mongoose.Schema({
		date : {type:Date},
		dateMax : {type:Date},
		hour : {type:Date},
		img : {type:String, default:''},
		state : {type:String, default:'inprocess'},
		text : {type:String, default:''},
		textSpeech : {type:String, default:''},
		/* la tolerancio se define en minutos*/
		tolerance : {type:Number, default: 20 }
	}),
	messageSchema = new Mongoose.Schema({
		text : {type:String, default:''},
		type: {type:Number}
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
