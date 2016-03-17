const express = require('express'),
	router = express.Router(),
	bodyParser = require('body-parser'),
	mongoose = require('mongoose')

router.use(bodyParser.json())

router.get('/collections/schemas/:collection',(req, res) => {
	var collection = req.params.collection,
		model = mongoose.model(collection),
		paths = model.schema.paths

	res.json(paths)
})

router.post('/collections/empty/:collection',(req, res) => {
	var collection = req.params.collection,
		model = mongoose.model(collection)

	model.remove({},(err) => {
		if (err) return res.json({err:err})
		res.json({msg: 'Delete Complete'})
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
		data = req.body

	model.findOne({ id : parseInt(data.value)},{_id : 0, __v : 0},(err,document) => {
		if (err) return res.json({err:err})
		res.json({document : document})
	})
})

// router.post('/collections/add',(req, res) => {})

module.exports = router
