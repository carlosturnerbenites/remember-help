const Form = require( './' )

module.exports = Form( {
	'fieldTextRef' : '_id',
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
		'activity' : {
			'type' : 'ref',
			'label' : 'Actividad',
			'ref' : 'activity',
			'readOnly' : true,
			'required' : true,
			'input' : {
				'text' : 'text',
				'value' : '_id'
			}
		},
		'children' : {
			'type' : 'ref',
			'label' : 'Niñ@',
			'ref' : 'children',
			'readOnly' : true,
			'required' : true
		},
		'date' : {
			'type' : 'date',
			'label' : 'Fecha',
			'required' : true
		},
		'time' : {
			'type' : 'date',
			'label' : 'Fecha Y Hora',
			'required' : true
		}
	}
} )
