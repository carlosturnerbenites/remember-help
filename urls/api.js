const express = require('express'),
	router = express.Router(),
	bodyParser = require('body-parser'),
	mongoose = require('mongoose'),
	multer = require('multer'),
	uploadActivities = multer({ dest: 'public/images/activities' }),
	formsView = require('./../utils/forms.js'),
	utils = require('./../utils/'),
	models = require('./../models/'),
	Q = require('q')

var permissions = utils.permissionsCollection

router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())

function serialize (req,model) {
	var data = req.body,
		paths = model.schema.paths

	for (var nameField in paths){
		var field = paths[nameField]

		if(field.instance == 'Date'){
			data[nameField] = new Date(data[nameField])
		}

		if(field.instance == 'Boolean'){
			console.log(data[nameField])
			data[nameField] = data[nameField] | false
		}
	}

	if(req.files){
		for (var file of req.files){
			data[file.fieldname] = file.path.replace(/^public/,'')
		}
	}

	return data
}

router.get('/permissions',(req, res) => res.json(permissions))

router.get('/collections/schemas/:collection',(req, res) => {
	var collection = req.params.collection,
		model = mongoose.model(collection),
		paths = model.schema.paths

	delete paths._id
	delete paths.__v
	res.json(paths)
})

router.get('/collections/dataForm/:collection',(req, res) => {
	var collection = req.params.collection,
		dataForm = formsView[collection],
		promises = []

	for(var nameField in dataForm.fields){
		var field = dataForm.fields[nameField]
		if(field.type == 'ref'){
			var query = models[field.ref].find().exec((err,documents) => {
				field.dataRef = documents
				res.json(formsView[collection])
			})
			promises.push(query)
		}
	}
	Q.all(promises).then(() => {
		return res.json(formsView[collection])
	})
})

router.get('/collections/:collection',(req, res) => {
	var collection = req.params.collection,
		model = mongoose.model(collection),
		formschema = formsView[collection]

	model.find({},{__v: 0})
	.populate('user parent activity children')
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

		model.create(data,(err, document) => {
			if(err) return res.json(err)
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
			return res.json({msg: 'El Documento se ha **eliminadro** correctamente', document: document})
		})
	})
})

router.post('/collections/update/:collection/:id',
	uploadActivities.any(),(req, res) => {
		var collection = req.params.collection,
			id = req.params.id,
			model = mongoose.model(collection),
			action = 'updateOne',
			data = req.body

			console.log(data)

		model.findByIdAndUpdate(id, {$set: data},(err, document) => {
			if (err) return res.json({err: err})
			return res.json({msg: 'El Documento se ha **Editado** correctamente', document: document})
		})
	})

module.exports = router
