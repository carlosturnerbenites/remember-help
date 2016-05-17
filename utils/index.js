const mongoose = require('mongoose')
var collections = mongoose.connection.collections,
	models = mongoose.connection.models,
	nameCollections = Object.keys(collections)

Array.prototype.getRandom = function (){
	return this[Math.floor(Math.random()*this.length)]
}

Date.prototype.getDatesUntil = function (dateEnd){
	var datesQuery = [],
		dateInit = this

	while (dateInit <= dateEnd){
		datesQuery.push(new Date(dateInit))
		dateInit.setDate(dateInit.getDate()+1)
	}
	return datesQuery
}

var stylesPage = ['styleRed','styleYellow','styleBlue','styleGreen','styleOscure','stylePurple']

var statesHealth = [
	{value : 0, name : 'Ninguna'},
	{value : 1, name : 'Sord@'},
	{value : 2, name : 'Mud@'}
]

var permissionsCollection = {
	administrator: {
		edit: true,
		find: true,
		create: true,
		delete: true,
		deleteOne: false,
		updateOne: true
	},
	parent: {
		edit: true,
		find: true,
		create: false,
		delete: true,
		deleteOne: false,
		updateOne: true
	},
	children: {
		edit: true,
		find: true,
		create: false,
		delete: true,
		deleteOne: true,
		updateOne: true
	},
	user: {
		edit: true,
		find: true,
		create: true,
		delete: true,
		deleteOne: true,
		updateOne: true
	},
	activity: {
		edit: true,
		find: true,
		create: true,
		delete: true,
		deleteOne: true,
		updateOne: true
	},
	history: {
		edit: true,
		find: true,
		create: false,
		delete: false,
		deleteOne: false,
		updateOne: false
	}
}

module.exports = {
	stylesPage : stylesPage,
	statesHealth : statesHealth,
	nameCollections : nameCollections,
	models : models,
	permissionsCollection : permissionsCollection
}
