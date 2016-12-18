const Form = require( './' )

module.exports = Form( {
	'fieldTextRef' : 'name',
	'fieldValueRef' : '_id',
	'fieldsExcludeForSearch' : [ '_id' ],
	'form' : {
		'method' : 'POST',
		'enctype' : 'application/x-www-form-urlencoded'
	},
	'fields' : {
		'_id' : {
			'type' : 'hidden',
			'label' : ''
		},
		'id' : {
			'type' : 'number',
			'label' : 'Identificación',
			'required' : true,
			'unique' : true
		},
		'name' : {
			'type' : 'text',
			'label' : 'Nombre',
			'required' : true
		},
		'user' : {
			'type' : 'ref',
			'label' : 'Usuario',
			'ref' : 'user',
			'readOnly' : true,
			'required' : true,
			'input' : {
				'text' : 'username',
				'value' : '_id'
			}
		}
	}
} )
