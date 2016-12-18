const Form = require( './' )

module.exports = Form( {
	'fieldTextRef' :'text',
	'fieldValueRef' :'_id',
	'fieldsExcludeForSearch' : ['_id','img'],
	'form' : {
		'method' : 'POST',
		'enctype' : 'multipart/form-data'
	},
	'fields' : {
		'_id' : {
			'type' : 'hidden',
			'placeholder' : '_id',
			'label' : ''
		},
		'date' : {
			'type' : 'text',
			'placeholder' : 'date',
			'label' : 'Fecha',
			'required' : true,
			'attrs' : { 'data-input-date' : true }
		},
		'time' : {
			'type' : 'text',
			'placeholder' : 'time',
			'label' : 'Hora',
			'required' : true,
			'attrs' : { 'data-input-time' : true }
		},
		'text' : {
			'type' : 'text',
			'placeholder' : 'text',
			'label' : 'Descripción',
			'required' : true
		},
		'img' : {
			'type' : 'file',
			'placeholder' : 'img',
			'label' : 'Imagen',
			'accept' : 'image/*',
			'path' : '/images/activities/',
			'required' : true
		},
		'textSpeech' : {
			'type' : 'text',
			'placeholder' : 'textSpeech',
			'label' : 'Texo De Lectura',
			'required' : true
		},
		'tolerance' : {
			'type' : 'number',
			'placeholder' : 'tolerance',
			'label' : 'Tolerancia',
			'default' : 20,
			'required' : true

		}
	}
} )
