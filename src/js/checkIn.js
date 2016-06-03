import {NotificationC,Validator,ajax} from './utilities'

var formCheckIn = document.querySelector('#formCheckIn'),
	validator = new Validator(formCheckIn),
	notification = new NotificationC()

validator.config([
	{
		fn : 'notEquals',
		params : 'usernameChildren usernameParent',
		messageError : 'No pueden registrarse dos usuarios con el mismo **username**'
	},
	{
		fn : 'equals',
		params : 'passwordChildren confirmPasswordChildren',
		messageError : 'La contraseña del **niñ@** no **coincide**'
	},
	{
		fn : 'equals',
		params : 'passwordParent confirmPasswordParent',
		messageError : 'La contraseña del **pariente** no **coincide**'
	}
])

formCheckIn.onsubmit = function (event){
	var validation = validator.isValid()
	if(!validation.isValid){
		event.preventDefault()
		validator.showErrors('.errors')
	}
}

formCheckIn.idChildren.onchange = function (e){
	var target = e.target
	if (target.validity.valid){
		ajax({
			type : 'POST',
			URL : '/api/collection/children',
			async : true,
			contentType : 'application/json',
			onSuccess : (response) => {
				var container = document.querySelector('#dataChildren')

				if (response.err) return notification.show({msg: response.err.message, type: 1})
				if (response.document) {
					var documentDB = response.document

					container.disabeldInputs(true, 'input, select',['idChildren'])
					container.querySelector('#nameChildren').value = documentDB.name
					container.querySelector('#ageChildren').value = documentDB.age

					notification.show({msg: 'Este numero de identificacion ya se encuentra registrado.', type: 2})
				}else{
					container
						.disabeldInputs(false, 'input, select',['idChildren'])
						.emptyInputs('input, select',['idChildren'])
				}
			},
			data : JSON.stringify({query: {id : target.value}, projection: {}})
		})
	}
}

formCheckIn.idFamily.onchange = function (e){
	var target = e.target
	if (target.validity.valid){
		ajax({
			type : 'POST',
			URL : '/api/collection/parent',
			async : true,
			contentType : 'application/json',
			onSuccess : (response) => {
				if (response.err) return notification.show({msg: response.err.message, type: 1})

				var container = document.querySelector('#dataParent')

				if (response.document){
					var documentDB = response.document

					container.readOnlyInputs(true, 'input, select',['idFamily'])
					container.querySelector('#nameParent').value = documentDB.name
					container.querySelector('#email').value = documentDB.user.email

					console.log(documentDB)

					notification.show({msg: 'Este numero de identificacion ya se encuentra registrado.', type: 2})

				}else {
					container
						.readOnlyInputs(false, 'input, select',['idFamily'])
						.emptyInputs('input, select',['idFamily'])
				}
			},
			data : JSON.stringify({query: {id : target.value}, projection: {}})
		})
	}
}
