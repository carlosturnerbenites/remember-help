var formCheckIn = document.querySelector('#formCheckIn'),
	validator = new Validator(formCheckIn)

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
	var formValidation = validator.isValid()
	if(!formValidation.isValid){
		event.preventDefault()
		validator.showErrors()
	}
}

formCheckIn.idChildren.onchange = function (e){
	var target = e.target
	if (target.validity.valid){
		ajax({
			type : 'POST',
			URL : 'api/collection/children',
			async : true,
			contentType : 'application/json',
			onSuccess : (result) => {
				var data = JSON.parse(result)
				if (data.err) return alert(data.err)
				if (data.document) alert('Esta identificacion ya esta registrada')
			},
			data : JSON.stringify({value : target.value})
		})
	}
}

formCheckIn.idFamily.onchange = function (e){
	var target = e.target
	if (target.validity.valid){
		ajax({
			type : 'POST',
			URL : 'api/collection/parent',
			async : true,
			contentType : 'application/json',
			onSuccess : (result) => {
				var data = JSON.parse(result)

				if (data.err) return alert(data.err)

				var container =document.querySelector('#dataParent')
				if (data.document){
					var documentDB = data.document
					container.disabeldInputs(true, 'input, select',['idFamily'])

					container.querySelector('#nameParent').value = documentDB.name
				}else {
					container
						.disabeldInputs(false, 'input, select',['idFamily'])
						.emptyInputs('input, select',['idFamily'])
				}
			},
			data : JSON.stringify({value : target.value})
		})
	}
}