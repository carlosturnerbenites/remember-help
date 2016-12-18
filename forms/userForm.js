const Form = require( './' )

module.exports = Form( {
	'fieldTextRef' : 'username',
	'fieldValueRef' : '_id',
	'fieldsExcludeForSearch' : [ '_id', 'photo', 'password' ],
	'form' : {
		'method' : 'POST',
		'enctype' : 'multipart/form-data'
	},
	'fields' : {
		'_id' : {
			'type' : 'hidden',
			'label' : ''
		},
		'active' : {
			'type' : 'checkbox',
			'label' : 'Activo',
			'default' : true
		},
		'photo' : {
			'type' : 'file',
			'label' : 'Foto',
			'accept' : 'image/*',
			'path' : '/images/users/',
			'required' : true
		},
		'password' : {
			'type' : 'password',
			'label' : 'Contraseña',
			'required' : true
		},
		'email' : {
			'type' : 'email',
			'label' : 'Correo Electronico',
			'required' : true
		},
		'type' : {
			'type' : 'number',
			'label' : 'Tipo',
			'emum' : [ 777, 776, 0, 1 ],
			'required' : true
		},
		'username' : {
			'type' : 'text',
			'label' : 'Nombre De Usuario',
			'required' : true,
			'unique' : true
		}
	}
} )
