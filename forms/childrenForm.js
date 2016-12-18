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
		'age' : {
			'type' : 'number',
			'label' : 'Edad',
			'min' : 5,
			'required' : true
		},
		'parent' : {
			'type' : 'ref',
			'label' : 'Pariente',
			'ref' : 'parent',
			'readOnly' : true,
			'input' : {
				'text' : 'name',
				'value' : '_id'
			}
		},
		'id' : {
			'type' : 'number',
			'label' : 'Identificación',
			'required' : true, 'unique' : true
		},
		'name' : {
			'type' : 'text',
			'label' : 'Nombre',
			'required' : true
		},
		'stateHealth' : {
			'type' : 'number',
			'label' : 'Estado De Salud',
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
