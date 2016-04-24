const express = require('express'),
	router = express.Router(),
	bodyParser = require('body-parser'),
	mongoose = require('mongoose'),
	fs = require('fs'),
	Log = require('log'),
	log = new Log('debug', fs.createWriteStream('remember-help.log')),
	multer = require('multer'),
	uploadActivities = multer({ dest: 'public/images/activities' }),
	formsView = require('./../utils/forms.js')


var collections = {
	parent: {
		edit : true,
		find : true,
		create : false,
		delete : true,
		deleteOne : false
	},
	children: {
		edit : true,
		find : true,
		create : false,
		delete : true,
		deleteOne : true
	},
	user: {
		edit : true,
		find : true,
		create : false,
		delete : true,
		deleteOne : false
	},
	activity: {
		edit : true,
		find : true,
		create : true,
		delete : true,
		deleteOne : true
	},
	history: {
		edit : true,
		find : true,
		create : false,
		delete : false,
		deleteOne : false
	}
}

function serialize(req,model) {
	var data = req.body,
		paths = model.schema.paths

	for (var nameField in paths){
		var field = paths[nameField]

		if(field.instance == 'Date'){
			data[nameField] = new Date(data[nameField])
		}
	}

	if(req.files){
		for (var file of req.files){
			data[file.fieldname] = file.path.replace(/^public/,'')
		}
	}

	return data
}

router.use(bodyParser.json())

router.get('/permissions',(req, res) => res.json(collections))

router.get('/collections/schemas/:collection',(req, res) => {
	var collection = req.params.collection,
		model = mongoose.model(collection),
		paths = model.schema.paths

	delete paths._id
	delete paths.__v
	res.json(paths)
})
router.get('/collections/dataForm/:collection',(req, res) => {
	var collection = req.params.collection
	res.json(formsView[collection])
})

router.get('/collections/:collection',(req, res) => {
	var collection = req.params.collection,
		model = mongoose.model(collection),
		formschema = formsView[collection]

	model.find({},{__v : 0})
	.populate('activity children')
	.exec((err,documents) => {
		if (err) return res.json({err:err})

		res.json({documents: documents,schema: formschema})
	})
})

router.post('/collection/:collection',(req, res) => {
	var collection = req.params.collection,
		model = mongoose.model(collection),
		data = req.body,
		query = data.query,
		projection = data.projection

	projection._id = 0
	projection.__v = 0

	model.findOne(query,projection,(err,document) => {
		if (err) return res.json({err:err})
		return res.json({document : document})
	})
})

router.post('/collections/add/:collection',
	uploadActivities.any(),
	(req, res) => {
		var collection = req.params.collection,
			model = mongoose.model(collection),
			data = serialize(req,model),
			action = 'create'

			//return res.json(data)

		model.create(data,(err, document) => {
			if(err) return res.json(err);console.log(err)
			log.info('Create document in collection : ' + collection + ', document : ' + document + '. User : ' + req.user.username)
			return res.json({msg: 'Se ha creado Correctamente el documento', document: document})
		})
	})

router.delete('/collections/empty/:collection',(req, res) => {
	var collection = req.params.collection,
		model = mongoose.model(collection),
		action = 'delete'

	model.count({},(err, count) => {
		if (err) return res.json({err: err})
		if (!count) return res.json({err: {message : 'Collection empty'}})
		model.remove({},(err, count) => {
			if (err) return res.json({err:err})
			log.info('Remove all data of collection ' + collection + '. User : ' + req.user.username)
			res.json({msg: 'Delete Complete', count: count})
		})
	})
})

router.delete('/collections/empty/:collection/:id',(req, res) => {
	var collection = req.params.collection,
		id = req.params.id,
		model = mongoose.model(collection),
		action = 'deleteOne'

	model.findById(id, (err, document) => {
		if (err) return res.json({err: err})
		document.remove().then((document) => {
			log.info('Remove of ' + collection + ', document : ' + document + '. User : ' + req.user.username)
			return res.json({msg: 'El Documento se ha **eliminadro** correctamente', document: document})
		})
	})
})

module.exports = router
