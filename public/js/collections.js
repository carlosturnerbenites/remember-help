var find = document.querySelector('#findInCollection'),
	agregate = document.querySelector('#AgregateInCollection'),
	collection = document.querySelector('#collection')

function renderForm (schema,selector) {
	var template = document.querySelector('template#field'),
		container = document.querySelector(selector)

	container.innerHTML = ''

	var form = document.createElement('form')
		form.classList.add('formRound', 'documentDB')

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
		form.classList.add('formRound', 'documentDB')
		for(var field in documentDB){
			var templateField = document.importNode(template.content, true)
			templateField.querySelector('.label').innerHTML = field
			templateField.querySelector('.data').value = documentDB[field]
			form.appendChild(templateField)
		}
		container.appendChild(form)
	})

}

function findInCollection () {
	ajax({
		type : 'POST',
		URL : '/api/collections/' + collection.value,
		async : true,
		contentType : 'application/json',
		onSuccess : (result) => {
			var documents = JSON.parse(result)
			renderDataModel(documents,'#results')
		},
		data : null
	})
}
function AgregateInCollection () {
	ajax({
		type : 'POST',
		URL : '/api/collections/schemas/' + collection.value,
		async : true,
		contentType : 'application/json',
		onSuccess : (result) => {
			var schema = JSON.parse(result)
			console.log(schema)
			renderForm(schema,'#addDocument')
		},
		data : null
	})
}
find.addEventListener('click', findInCollection)
agregate.addEventListener('click', AgregateInCollection)


