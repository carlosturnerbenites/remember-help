const express = require( 'express' ),
	router = express.Router(),
	bodyParser = require( 'body-parser' ),
	mongoose = require( 'mongoose' ),
	multer = require( 'multer' ),
	formsView = require( './../utils/forms.js' ),
	utils = require( './../utils/' ),
	models = require( './../models/' ),
	Q = require( 'q' ),
	log = require( './../utils/log' )

var permissions = utils.permissionsCollection
var storage = multer.diskStorage( {
	'destination' : function ( req, file, cb ) {
		var path = 'public/images/'
		if( req.params.collection ) {
			var model = mongoose.model( req.params.collection )
			path += model.collection.name
		}
		cb( null, path )
	}
} )

var upload = multer( { 'storage' : storage } )

router.use( bodyParser.urlencoded( { 'extended' : false } ) )
router.use( bodyParser.json() )

function serialize ( req, model ) {
	var data = req.body,
		paths = model.schema.paths

	for ( var nameField in paths ) {
		var field = paths[nameField]

		if( field.instance == 'Date' ) {
			if( data[nameField] ) data[nameField] = new Date( data[nameField] )
		}

		if( field.instance == 'Boolean' ) {
			data[nameField] = data[nameField] == 'on' ? true : false
		}
	}

	if( req.files ) {
		for ( var file of req.files ) {
			data[file.fieldname] = file.filename
		}
	}

	return data
}

router.get( '/permissions', ( req, res ) => res.json( permissions ) )

router.get( '/collections/schemas/:collection', ( req, res ) => {
	var collection = req.params.collection,
		model = mongoose.model( collection ),
		paths = model.schema.paths

	delete paths._id
	delete paths.__v
	res.json( paths )
} )

router.post( '/collections/:collection', ( req, res ) => {
	var collection = req.params.collection,
		model = mongoose.model( collection ),
		dataForm = formsView[collection],
		promises = [],
		querySearch = req.body ? serialize( req, model ) : {}

	console.log( querySearch )

	for( var nameField in dataForm.fields ) {
		var field = dataForm.fields[nameField]
		if( field.type == 'ref' ) {
			var query = models[field.ref].find().exec( ( err, documents ) => {
				field.dataRef = documents
			} )
			promises.push( query )
		}
	}
	Q.all( promises ).then( () => {
		model.find( querySearch, { '__v' : 0 } )
		.populate( 'user parent activity children' )
		.exec( ( err, documents ) => {
			if ( err ) return res.json( { 'err' : err } )
			res.json( { 'documents' : documents, 'schema' : dataForm, 'schemas' : formsView } )
		} )
	} )
} )

router.get( '/form-view/:collection', ( req, res ) => {
	var collection = req.params.collection,
		formView = formsView[collection]

	res.json( formView )
} )

router.post( '/collection/:collection', ( req, res ) => {
	var collection = req.params.collection,
		model = mongoose.model( collection ),
		data = req.body,
		query = data.query,
		projection = data.projection

	projection._id = 0
	projection.__v = 0

	model.findOne( query, projection )
		.populate( 'user parent activity children' )
		.exec( ( err, document ) => {
			if ( err ) return res.json( { 'err' : err } )
			return res.json( { 'document' : document } )
		} )
} )

router.post( '/collections/add/:collection',
	upload.any(),
	( req, res ) => {
		var collection = req.params.collection,
			model = mongoose.model( collection ),
			data = serialize( req, model ),
			action = 'create'

		delete data._id

		model.create( data, ( err, document ) => {
			if( err ) return res.json( err )

			log.info( 'created document ' + document._id+ ' of  collection ' + collection + ' User: ' + req.user.username + '. id: ' + req.user._id )

			req.flash( 'success', 'Se ha creado Correctamente el documento' )
			res.redirect( req.get( 'referer' ) )
		} )
	}
)

router.delete( '/collections/empty/:collection', ( req, res ) => {
	var collection = req.params.collection,
		model = mongoose.model( collection ),
		action = 'delete'

	model.count( { }, ( err, count ) => {
		if ( err ) return res.json( { 'err' : err } )
		if ( !count ) return res.json( { 'err' : { 'message' : 'Collection empty' } } )
		model.remove( { }, ( err, count ) => {
			log.info( 'Delete all data of collection ' + collection + ' User: ' + req.user.username + '. id: ' + req.user._id )
			if ( err ) return res.json( { 'err' : err } )
			res.json( { 'msg' : 'Delete Complete', 'count' : count } )
		} )
	} )
} )

router.delete( '/collections/empty/:collection/:id', ( req, res ) => {
	var collection = req.params.collection,
		id = req.params.id,
		model = mongoose.model( collection ),
		action = 'deleteOne'

	model.findById( id, ( err, document ) => {
		if ( err ) return res.json( { 'err' : err } )
		document.remove().then( ( document ) => {
			log.info( 'Delete document ' + id + ' of collection ' + collection + ' User: ' + req.user.username + '. id: ' + req.user._id )
			return res.json( { 'msg' : 'El Documento se ha **eliminadro** correctamente', 'document' : document } )
		} )
	} )
} )

router.post( '/collections/update/:collection/:id',
	upload.any()
	, ( req, res ) => {
		var collection = req.params.collection,
			id = req.params.id,
			model = mongoose.model( collection ),
			action = 'updateOne',
			data = serialize( req, model ),

			configFields = formsView[collection].fields

		for( var field in configFields ) {
			var dataField = configFields[field]

			if( dataField.type == 'checkbox' ) {}

		}

		model.findByIdAndUpdate( id, { '$set' : data }, ( err, document ) => {
			if ( err ) return res.json( { 'err' : err } )
			log.info( 'Update document ' + id + ' of collection ' + collection + ' User: ' + req.user.username + '. id: ' + req.user._id)
			req.flash( 'success', 'El Documento se ha Editado correctamente.' )
			res.redirect( req.get( 'referer' ) )
		} )
	}
)

module.exports = router
