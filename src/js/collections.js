var btnAgregate = document.querySelector('#AgregateInCollection'),
	btnFind = document.querySelector('#findInCollection'),
	btnEmpty = document.querySelector('#emptyCollection'),
	collectionSelected = document.querySelector('#collection'),
	notification = new NotificationC(),
	commonElement = new CommonElement(),
	collections

collectionSelected.querySelector('option').selected = true

ajax({
	type : 'GET',
	URL : '/api/permissions/',
	async : false,
	onSuccess : response => collections = response,
	data : null
})

var checkImageSize = (event) => {
	event.target.checkSizeImage(
		{maxWidth:1855,maxHeight:892},
		(err, response) => {
			if (err) return notification.show({msg: err.message, type: 1})
			if(!response.valid) event.target.value = ''
			return notification.show({msg: response.message, type: 2})
		}
	)
}

function updateDocumentDB (event){
	this.enctype = 'multipart/form-data'
	this.action = '/api/collections/update/' + collectionSelected.value + '/' + this.dataset.ref
	this.method = 'POST'

	var action = this.querySelector('[type=submit]').dataset.action

	if(!collections[collectionSelected.value][action]){
		event.preventDefault()
		return notification.show({msg:'No se puede realizar esta accion sobre la Colección',type: 2})
	}
	if(!confirm('Desea Editar este documento ')) return event.preventDefault()
}

function deleteDocumentDB (){

	var action = this.dataset.action
	if(!collections[collectionSelected.value][action]) return notification.show({msg:'No se puede realizar esta accion sobre la Colección',type: 2})

	var form = document.getElementById(this.dataset.ref)
	if (!form.contains(this)) notification.show({msg:'Disculpa ha sucedido algo Inesperado, !Recarga La Pagina, Por Favor¡',type:2})

	if(confirm('Desea Borrar este documento ')){
		ajax({
			type : 'DELETE',
			URL : '/api/collections/empty/' + collectionSelected.value + '/' + this.dataset.ref,
			async : true,
			onSuccess : response => {
				if(response.err) return notification.show({msg:response.err.message,type:1})
				notification.show({msg:'Se ha eliminado el documento',type:0})
				form.remove()
			},
			data : null
		})
	}
}

function renderViewAgregate (schema,collection,selector){
	var template = document.querySelector('template#templateField'),
		container = document.querySelector(selector)
	container.innerHTML = ''

	var configFields = schema.fields,
		configForm = schema.form

	var form = document.createElement('form')
	form.classList.add('form','formLabelInput', 'documentDB')
	form.enctype = configForm.enctype
	form.method = configForm.method
	form.action = '/api/collections/add/' + collection

	for(var field in configFields){
		var clone = document.importNode(template.content, true)
		var data = configFields[field]

		var Tfield = clone.querySelector('#TField'),
			tfData = Tfield.querySelector('.data'),
			tfLabel = Tfield.querySelector('.label')

		tfLabel.innerHTML = data.label
		tfData.type = data.type
		tfData.value = data.default || ''
		tfData.required = data.required
		tfData.name = field
		tfData.id = field

		form.appendChild(Tfield)

		if(data.type == 'file'){
			tfData.accept = data.accept
			if(data.accept == 'image/*'){
				tfData.addEventListener('change',checkImageSize)
			}
		}
		if(data.type == 'checkbox'){

		}
		if(data.type == 'ref'){
			var select = document.createElement('select')

			select.name = field

			for(var nameFieldData in data.dataRef){
				var fieldData = data.dataRef[nameFieldData],
					option = document.createElement('option')

				option.text = fieldData[data.input.text]
				option.value = fieldData[data.input.value]
				select.appendChild(option)
			}

			tfData.parentNode.replaceChild(select, tfData)
		}

	}
	var input = document.createElement('button')
	input.type = 'submit'
	input.innerHTML = 'Guardar'
	input.classList.add('btn','btnSuccess','effect')
	form.appendChild(input)

	container.appendChild(form)
}

function renderViewFind (response,selector) {
	var template = document.querySelector('template#templateField'),
		container = document.querySelector(selector),
		configFields = response.schema.fields,
		configForm = response.schema.form

	container.innerHTML = ''

	if(!response.documents.length) return notification.show({msg:'No se **encontraron** Resultados.',type: 2})

	response.documents.forEach(documentDB => {
		var form = document.createElement('form')

		var buttonDelete = commonElement.get('button',{html:'Borrar', css:['effect','btnError']})
		buttonDelete.addEventListener('click', deleteDocumentDB)
		buttonDelete.dataset.ref = documentDB._id
		buttonDelete.dataset.action = 'deleteOne'

		var buttonUpdate = commonElement.get('button',{html:'Editar', css:['effect','btnInfo'],general:{type:'submit'}})
		buttonUpdate.dataset.ref = documentDB._id
		buttonUpdate.dataset.action = 'updateOne'

		form.classList.add('form','formLabelInput','documentDB')
		form.id = documentDB._id
		form.dataset.ref = documentDB._id

		form.addEventListener('submit', updateDocumentDB)
		for(var field in documentDB){
			var data = configFields[field]

			var dataField = configFields[field] || field,
				templateField = document.importNode(template.content, true),
				tfData = templateField.querySelector('.data'),
				tfLabel = templateField.querySelector('.label')

			tfLabel.innerHTML = dataField.label
			tfData.readOnly = dataField.readOnly

			tfData.type = dataField.type
			tfData.required = dataField.required
			tfData.name = field
			tfData.id = field

			if(data.type == 'checkbox'){
				tfData.checked = documentDB[field]
			}else if(data.type == 'file'){
				if(documentDB[field]) tfData.required = false
			}else if(data.type == 'ref'){
				var schemasRef = response.schemas[data.ref]
				if(documentDB[field] instanceof Array){
					var fieldset = document.createElement('fieldset')
					for (var item of documentDB[field]){
						var clone = tfData.cloneNode(true)
						clone.value = item[schemasRef.fieldValueRef]
						clone.name = field
						clone.type = schemasRef.fields[schemasRef.fieldTextRef].type
						fieldset.appendChild(clone)
					}
					tfData.parentNode.replaceChild(fieldset,tfData)
				}else{

					tfData.value = documentDB[field][schemasRef.fieldTextRef]
					tfData.name = ''

					var input = document.createElement('input')
					input.type = 'hidden'
					input.value = documentDB[field][schemasRef.fieldValueRef]
					input.name = field
					input.id = field
					templateField.appendChild(input)
				}
			}else{
				tfData.value = documentDB[field]
			}

			form.appendChild(templateField)
		}
		form.appendChild(buttonDelete)
		form.appendChild(buttonUpdate)
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
		onSuccess : response => renderViewFind(response,'#results'),
		data : null
	})
})

btnAgregate.onclick =  function (){
	var action = this.dataset.action
	if(!collections[collectionSelected.value][action]) return notification.show({msg:'No se puede realizar esta accion sobre la Colección',type: 2})
	var collection = collectionSelected.value
	ajax({
		type : 'GET',
		URL : '/api/collections/' + collectionSelected.value,
		async : true,
		onSuccess : response => renderViewAgregate(response.schema,collection,'#results'),
		data : null
	})
}

btnEmpty.onclick =  function (){
	var action = this.dataset.action
	if(!collections[collectionSelected.value][action]) return notification.show({msg:'No se puede realizar esta accion sobre la Colección',type: 2})

	if(confirm('Desea Borrar todos los datos de la Coleccion ' + collectionSelected.value)){
		ajax({
			type : 'DELETE',
			URL : '/api/collections/empty/' + collectionSelected.value,
			async : true,
			onSuccess : response => {
				if(response.err) return notification.show({msg:response.err.message,type:1})
				notification.show({msg:'Se ha(n) eliminado ' + response.count.n + ' documento(s)',type:0})
			},
			data : null
		})
	}
}
