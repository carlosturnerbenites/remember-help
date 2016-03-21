var btnAgregate = document.querySelector('#AgregateInCollection'),
	btnFind = document.querySelector('#findInCollection'),
	btnEmpty = document.querySelector('#emptyCollection'),
	collectionSelected = document.querySelector('#collection')

function renderForm (schema,selector) {
	var template = document.querySelector('template#field'),
		container = document.querySelector(selector)

	container.innerHTML = ''

	var form = document.createElement('form')
	form.classList.add('form','formLabelInput', 'documentDB')

	for(var field in schema){
		var data = schema[field]
		var templateField = document.importNode(template.content, true)

		templateField.querySelector('.label').innerHTML = field
		templateField.querySelector('.data').type = data.instance
		form.appendChild(templateField)
	}
	container.appendChild(form)
}

function renderDataModel (documents,selector) {
	var template = document.querySelector('template#field'),
		container = document.querySelector(selector)

	container.innerHTML = ''

	documents.forEach((documentDB) => {
		var form = document.createElement('form')
		form.classList.add('form','formLabelInput','documentDB')
		for(var field in documentDB){
			var templateField = document.importNode(template.content, true)
			templateField.querySelector('.label').innerHTML = field
			templateField.querySelector('.data').value = documentDB[field]
			form.appendChild(templateField)
		}
		container.appendChild(form)
	})
}

btnFind.addEventListener('click', () => {
	ajax({
		type : 'GET',
		URL : '/api/collections/' + collectionSelected.value,
		async : true,
		onSuccess : (result) => {
			var documents = JSON.parse(result)
			renderDataModel(documents,'#results')
		},
		data : null
	})
})

btnAgregate.addEventListener('click', () => {
	ajax({
		type : 'GET',
		URL : '/api/collections/schemas/' + collectionSelected.value,
		async : true,
		onSuccess : (result) => {
			var schema = JSON.parse(result)
			renderForm(schema,'#addDocument')
		},
		data : null
	})
})

btnEmpty.addEventListener('click', () => {
	if(confirm('Desea Borrar todos los datos de la Coleccion ' + collectionSelected.value)){
		ajax({
			type : 'POST',
			URL : '/api/collections/empty/' + collectionSelected.value,
			async : true,
			onSuccess : (result) => {
				var data = JSON.parse(result)
			},
			data : null
		})
	}
})
