var btnAgregate = document.querySelector('#AgregateInCollection'),
	btnFind = document.querySelector('#findInCollection'),
	btnEmpty = document.querySelector('#emptyCollection'),
	collectionSelected = document.querySelector('#collection'),
	notification = new NotificationC(),
	collections

var dataForVisualization = {
	activity : {
		form:{
			'method': 'POST',
			'enctype' : 'multipart/form-data'
		},
		fields:{
			date :{type:'date', label:'Fecha', required:true},
			hour :{type:'date', label:'Hora', required:true},
			img :{type:'file', label:'Imagen', required:true,accept:'image/*'},
			text :{type:'text', label:'Descripcion', required:true},
			textSpeech :{type:'text', label:'Texo De Lectura', required:true},
			tolerance :{type:'number', label:'Tolerancia', default:20, required:true }
		}
	}
}

ajax({
	type : 'GET',
	URL : '/api/permissions/',
	async : false,
	onSuccess : response => collections = response,
	data : null
})

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

function renderViewAgregate (schema,collection,selector) {
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

		var Tfield = clone.querySelector('#TField')
		Tfield.querySelector('.label').innerHTML = data.label
		Tfield.querySelector('.data').type = data.type
		Tfield.querySelector('.data').value = data.default || ''
		Tfield.querySelector('.data').required = data.required
		Tfield.querySelector('.data').name = field
		Tfield.querySelector('.data').id = field

		form.appendChild(Tfield)

		if(data.type == 'file'){
			Tfield.querySelector('.data').accept = data.accept
			if(data.accept == 'image/*'){
				Tfield.querySelector('.data').onchange = event => {
					this.checkSizeImage(
						{maxWidth:1855,maxHeight:892},
						(err, response) => {
							if (err) return notification.show({msg: err.message, type: 1})
							if(!response.valid) this.value = ''
							return notification.show({msg: response.message, type: response.type})
						}
					)
				}
			}
		}

	}
	var input = document.createElement('input')
	input.type = 'submit'
	input.classList.add('btn','btnSuccess')
	form.appendChild(input)

	container.appendChild(form)
}

function renderViewFind (response,selector) {
	var template = document.querySelector('template#templateField'),
		container = document.querySelector(selector),
		dataFields = response.schema.fields,
		dataForm = response.schema.form

	container.innerHTML = ''

	response.documents.forEach(documentDB => {
		var form = document.createElement('form'),
			buttonDelete = document.createElement('button')

		buttonDelete.type = 'button'
		buttonDelete.classList.add('btn','btnError')
		buttonDelete.innerHTML = 'Borrar'
		buttonDelete.addEventListener('click', deleteDocumentDB)
		buttonDelete.dataset.ref = documentDB._id
		buttonDelete.dataset.action = 'deleteOne'

		form.classList.add('form','formLabelInput','documentDB')
		form.id = documentDB._id

		for(var field in documentDB){
			var dataField = dataFields[field] || field,
				templateField = document.importNode(template.content, true)

			templateField.querySelector('.label').innerHTML = dataField.label
			templateField.querySelector('.data').value = documentDB[field]
			templateField.querySelector('.data').readOnly = dataField.readOnly

			templateField.querySelector('.data').type = dataField.type
			templateField.querySelector('.data').required = dataField.required
			templateField.querySelector('.data').name = field
			templateField.querySelector('.data').id = field

			form.appendChild(templateField)
		}
		form.appendChild(buttonDelete)
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
		URL : '/api/collections/dataForm/' + collectionSelected.value,
		async : true,
		onSuccess : schema => renderViewAgregate(schema,collection,'#addDocument'),
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
