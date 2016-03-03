var find = document.querySelector('#findInCollection'),
	agregate = document.querySelector('#AgregateInCollection'),
	collection = document.querySelector('#collection')

function renderDataModel (documents,selector) {
	var template = document.querySelector('template#field'),
		container = document.querySelector(selector)
	for (var documentDB of documents) {
		var form = document.createElement('form')
			form.classList.add('formRound')
		for(var field in documentDB){
			var templateField = document.importNode(template.content, true)
			templateField.querySelector('.label').innerHTML = field
			templateField.querySelector('.data').value = documentDB[field]
			form.appendChild(templateField)
		}
		container.appendChild(form)

	}

}

function findInCollection () {
	ajax({
		type : 'POST',
		URL : '/api/collections/' + collection.value,
		async : true,
		contentType : 'application/json',
		onSuccess : (result) => {
			var documents = JSON.parse(result)
			renderDataModel(documents,"#results")
		},
		data : null
	})
}
function AgregateInCollection () {

}
find.addEventListener('click', findInCollection)
agregate.addEventListener('click', AgregateInCollection)

function ajax (config){
	var xhr = new XMLHttpRequest()

	xhr.open(config.type, config.URL, config.async)
	xhr.setRequestHeader('Content-Type', config.contentType)

	xhr.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			config.onSuccess(this.responseText)
		}
	}

	xhr.send(config.data)
}
