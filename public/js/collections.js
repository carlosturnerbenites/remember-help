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
		var templateField = document.importNode(template.content, true)

		templateField.querySelector('.label').innerHTML = field
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
			console.log(schema)
			renderForm(schema,'#addDocument')
		},
		data : null
	})
})

btnEmpty.addEventListener('click', () => {
	ajax({
		type : 'POST',
		URL : '/api/collections/empty/' + collectionSelected.value,
		async : true,
		onSuccess : (result) => {
			console.log(result)
		},
		data : null
	})
})
