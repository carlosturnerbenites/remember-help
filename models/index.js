const models = {
	/*
		El nombre de la coleccion se pasa en singular, y mongoose la crea en plular en la DB
		Mongoose.model('singularName', schema)
	*/
	activity :require('./activities'),
	children :require('./childrens'),
	parent :require('./parents'),
	administrator :require('./administrators'),
	history :require('./histories'),
	user :require('./users')
}

/* Exportacion de los modelos*/
module.exports = models
