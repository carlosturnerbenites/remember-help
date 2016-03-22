const express = require('express'),
	router = express.Router(),
	bodyParser = require('body-parser'),
	mongoose = require('mongoose')

router.use(bodyParser.json())

router.get('/collections/schemas/:collection',(req, res) => {
	var collection = req.params.collection,
		model = mongoose.model(collection),
		paths = model.schema.paths

	delete paths._id
	delete paths.__v
	res.json(paths)
})

router.post('/collections/empty/:collection',(req, res) => {
	var collection = req.params.collection,
		model = mongoose.model(collection)

	model.count({},(err, count) => {
		if (err) return res.json({err: err})
		if (!count) return res.json({err: {message : 'Collection empty'}})
		model.remove({},(err, count) => {
			if (err) return res.json({err:err})
			res.json({msg: 'Delete Complete', count: count})
		})
	})
})

router.get('/collections/:collection',(req, res) => {
	var collection = req.params.collection,
		model = mongoose.model(collection)

	model.find({},{_id : 0, __v : 0})
	.populate('activity children')
	.exec((err,documents) => {
		if (err) return res.json({err:err})

		res.json(documents)
	})
})

router.post('/collection/:collection',(req, res) => {
	var collection = req.params.collection,
		model = mongoose.model(collection),
		data = req.body,
		query = data.query,
		projection = data.projection

	projection._id = 0
	projection.__id = 0

	model.findOne(query,projection,(err,document) => {
		if (err) return res.json({err:err})
		return res.json({document : document})
	})
})

router.post('/collections/add/:collection',(req, res) => {
	var collection = req.params.collection,
		model = mongoose.model(collection),
		data = req.body

	model.create(data,(err, document) => {
		if(err) return res.json({err: err})
		res.json({msg: 'Se ha creado Correctamente el documento', document: document})
	})
})

module.exports = router
