var btnAgregate = document.querySelector('#AgregateInCollection'),
	btnFind = document.querySelector('#findInCollection'),
	btnEmpty = document.querySelector('#emptyCollection'),
	collectionSelected = document.querySelector('#collection'),
	notification = new NotificationC()

var collections = {
	parent: {
		edit : true,
		find : true,
		create : false,
		delete : true
	},
	children: {
		edit : true,
		find : true,
		create : false,
		delete : true
	},
	user: {
		edit : true,
		find : true,
		create : false,
		delete : true
	},
	activity: {
		edit : true,
		find : true,
		create : true,
		delete : true
	},
	history: {
		edit : true,
		find : true,
		create : false,
		delete : false
	}
}

function renderViewAgregate (schema,selector) {
	var template = document.querySelector('template#templateField'),
		container = document.querySelector(selector)
	container.innerHTML = ''

	var form = document.createElement('form')
	form.classList.add('form','formLabelInput', 'documentDB')

	for(var field in schema){
		var clone = document.importNode(template.content, true)
		var data = schema[field]

		var Tfield = clone.querySelector('#TField')
		Tfield.querySelector('.label').innerHTML = field
		Tfield.querySelector('.data').type = data.instance
		Tfield.querySelector('.data').required = data.isRequired
		Tfield.querySelector('.data').name = data.path

		form.appendChild(Tfield)
	}
	var input = document.createElement('input')
	input.type = 'submit'
	form.appendChild(input)

	form.onsubmit = function (e){
		e.preventDefault()

		var data = this.serialize()

		ajax({
			type : 'POST',
			URL : '/api/collections/add/' + collectionSelected.value,
			contentType : 'application/json',
			async : true,
			onSuccess : response => notification.show({msg:response.msg,type: 0}),
			data : JSON.stringify(data)
		})
	}

	container.appendChild(form)
}

function renderViewFind (documents,selector) {
	var template = document.querySelector('template#templateField'),
		container = document.querySelector(selector)

	container.innerHTML = ''

	documents.forEach(documentDB => {
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

btnFind.addEventListener('click', function (){

	var action = this.dataset.action
	if(!collections[collectionSelected.value][action]) return notification.show({msg:'No se puede realizar esta accion sobre la Colección',type: 2})

	ajax({
		type : 'GET',
		URL : '/api/collections/' + collectionSelected.value,
		async : true,
		onSuccess : documents => renderViewFind(documents,'#results'),
		data : null
	})
})

btnAgregate.addEventListener('click', function (){

	var action = this.dataset.action
	if(!collections[collectionSelected.value][action]) return notification.show({msg:'No se puede realizar esta accion sobre la Colección',type: 2})

	ajax({
		type : 'GET',
		URL : '/api/collections/schemas/' + collectionSelected.value,
		async : true,
		onSuccess : schema => renderViewAgregate(schema,'#addDocument'),
		data : null
	})
})

btnEmpty.addEventListener('click', function (){

	var action = this.dataset.action
	if(!collections[collectionSelected.value][action]) return notification.show({msg:'No se puede realizar esta accion sobre la Colección',type: 2})

	if(confirm('Desea Borrar todos los datos de la Coleccion ' + collectionSelected.value)){
		ajax({
			type : 'POST',
			URL : '/api/collections/empty/' + collectionSelected.value,
			async : true,
			onSuccess : response => {
				if(response.err) return notification.show({msg:response.err.message,type:1})
				notification.show({msg:'Se ha(n) eliminado ' + response.count.n + ' documento(s)',type:0})
			},
			data : null
		})
	}
})
