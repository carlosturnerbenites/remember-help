Date.prototype.toHour12 = function () {
	/*
		Formatea un Object Date en Time (12 horas)
	*/
	return this.toLocaleTimeString('es-CO',{hour12:true})
		.replace('p. m.','PM')
		.replace('a. m.','AM')
}

Date.prototype.getTimeHumanize = function () {
	var time = this.getHours() + ':' + this.getMinutes() + ':' + this.getSeconds()
	return time
}

Date.prototype.getValueInput = function (format){
	var d = String(this.getDate()).length == 2 ? this.getDate() : '0' + this.getDate(),
		m = String(this.getMonth()).length == 2 ? this.getMonth()+1 : '0' + (this.getMonth()+1),
		y = this.getFullYear(),
		dateFormat = format.replace('d',d).replace('m',m).replace('y',y)
	return dateFormat
}

HTMLFormElement.prototype.isValid = function (){
	for (var element of Array.from(this.elements)){
		if (element.validity.valid == false) return false
	}
	return true
}

HTMLInputElement.prototype.checkSizeImage = function (data,cb){

	if(!this.files.length) return cb(new Error('No Se ha seleccionado ningun archivo'))

	var fr = new FileReader,
		maxWidth = data.maxWidth,
		maxHeight = data.maxHeight,
		response = {
			valid : true,
			type: 0,
			message : ''
		}

	fr.onload = function () {
		var img = new Image

		img.onload = function () {
			if(img.width > maxWidth){
				response.valid = false
				response.type = 2
				response.message += 'El **ancho** de la imagen **no es aceptado**, el **ancho maximo** permitido es **' + maxWidth + '**\n\n'
			}
			if(img.height > maxHeight){
				response.valid = false
				response.type = 2
				response.message += 'El **largo** de la imagen **no es aceptado**, el **largo maximo** permitido es **' + maxHeight + '**'
			}
			cb(null, response)
		}

		img.src = fr.result
	}

	fr.readAsDataURL(this.files[0])
}

HTMLElement.prototype.serialize = function (){
	var elements = this instanceof HTMLFormElement ? this.elements: this.querySelector('input, select'),
		exceptions = ['submit','reset']

	var data = {}
	for(var element of Array.from(elements)){
		if(exceptions.indexOf(element.type) < 0){
			data[element.name] = element.value
		}
	}
	return data
}

HTMLElement.prototype.remove = function (){
	/*
		Remueve del DOM un elemento
	*/
	this.parentNode.removeChild(this)
}

HTMLElement.prototype.disabeldInputs = function (valueDisabled, selector, exceptions){
	var elements = this.querySelectorAll(selector)
	for (var element of Array.from(elements)){
		if (exceptions.indexOf(element.name) < 0) element.disabled = valueDisabled
	}
	return this
}
HTMLElement.prototype.readOnlyInputs = function (valueReadOnly, selector, exceptions){
	var elements = this.querySelectorAll(selector)
	for (var element of Array.from(elements)){
		if (exceptions.indexOf(element.name) < 0) element.readOnly = valueReadOnly
	}
	return this
}

HTMLElement.prototype.emptyInputs = function (selector,exceptions){
	/*
		Vacia el attributo 'value' de los elementos de un HTMLFormElement
		El array exceptions, contiene los inputs que no se deben vaciar
	*/
	var elements = this.querySelectorAll(selector)
	for (var element of Array.from(elements)){
		if (exceptions.indexOf(element.name) < 0) element.value = ''
	}
	return this
}

function CommonElement (){
	this.init = () => {
		this.template = document.querySelector('#commonElements')
		this.cloneTemplate = document.importNode(this.template.content, true)
	}
	this.get = function (name,data){
		this.init()
		var element = this.cloneTemplate.querySelector(name),
			cloneElement = element.cloneNode(true)
		cloneElement.innerHTML = data.html

		if(data.css){
			data.css.forEach(classCss => {
				cloneElement.classList.add(classCss)
			})
		}
		if(data.general){
			for(var key in data.general){cloneElement.setAttribute(key,data.general[key])}
		}
		return cloneElement
	}
}

function Validator (form){

	this.stagesFaild = []

	this.config = function (stages){
		this.stages = stages
		this.stages.forEach((stage) => { stage.isValid = false })
	}

	this.showErrors = function (){
		var section = document.createElement('section')
		section.classList.add('errors')
		this.stagesFaild.forEach((e) => { section.innerHTML += markdown.toHTML(e.messageError) })
		form.appendChild(section)
		section.scrollIntoView()

		window.setTimeout(() => { form.removeChild(section) }, 10000)

		return section
	}

	this.validateStage = function (){
		this.stages.forEach((stage) => {
			var fn = this[stage.fn]
			stage.isValid = fn(stage.params.split(' '))
		})
	}

	this.isValid = function (){

		this.validateStage()

		this.stagesFaild = this.stages.filter((stage) => {
			return stage.isValid == false
		})

		if (this.stagesFaild.length) return {isValid : false, stagesFaild : this.stagesFaild}
		return {isValid : true}
	}

	this.equals = function (elements){
		var valueOne = form[elements[0]],
			valueTwo = form[elements[1]]
		if (valueOne.value == valueTwo.value) {
			return true
		}
		return false
	}

	this.notEquals = function (elements){
		var valueOne = form[elements[0]],
			valueTwo = form[elements[1]]
		if (valueOne.value != valueTwo.value) {
			return true
		}
		return false
	}

	this.mayor = function (elements){
		var valueOne = form[elements[0]],
			valueTwo = form[elements[1]]
		if (valueOne.value > valueTwo.value) {
			return true
		}
		return false
	}
}

function getValueInput (date,format){
	var d = String(date.getDate()).length == 2 ? date.getDate() : '0' + date.getDate(),
		m = String(date.getMonth()).length == 2 ? date.getMonth() : '0' + date.getMonth(),
		y = date.getFullYear(),
		dateFormat = format.replace('d',d).replace('m',m).replace('y',y)
	return dateFormat
}

function Modal (modalReference,selectorParentElement){

	var fullOpen = new Event('fullOpen')

	this.modal = document.getElementById(modalReference)

	var body = document.body,
		bodyModal = this.modal.querySelector('.bodyModal'),
		close = this.modal.querySelector('[data-closemodal]'),
		bodyTitle = this.modal.querySelector('.titleModal'),
		parentElement = document.querySelector(selectorParentElement)

	this.show = function (){
		this.modal.classList.add('effectShowModal')
		this.modal.setAttribute('modalActive','true')
		parentElement.classList.add('sectionInactive')
		body.classList.add('overflowHidden')
		setTimeout(() => {
			this.modal.dispatchEvent(fullOpen)
		},1000)
	}

	this.hide = function (){
		this.modal.classList.remove('effectShowModal')
		this.modal.classList.add('effectHideModal')
		bodyModal.innerHTML = ''

		window.setTimeout(() => {
			this.modal.classList.remove('effectHideModal')
			this.modal.removeAttribute('modalActive')
			parentElement.classList.remove('sectionInactive')
			body.classList.remove('overflowHidden')
		},1000)
	}

	this.addContent = function (element){
		bodyModal.innerHTML = ''
		bodyModal.appendChild(element)
		return this
	}

	this.setTitle = function (title){
		bodyTitle.innerHTML = ''
		var titleContent = document.createElement('h2')
		titleContent.innerHTML = title
		bodyTitle.appendChild(titleContent)
		return this
	}

	close.addEventListener('click',this.hide.bind(this))
}

function NotificationC (){
	var contenedorPrincipal = document.body

	var createMessage = function (data){
		var contenedorMSG = document.createElement('article')
		contenedorMSG.classList.add('contenedorMensaje')
		var mensaje = document.createElement('p')
		mensaje.innerHTML= markdown.toHTML(data.msg)
		contenedorMSG.classList.add('MSG')
		var icon = document.createElement('img')

		contenedorMSG.appendChild(icon)
		contenedorMSG.appendChild(mensaje)

		if (data.type == 0) icon.src = '/images/notifications/correcto.png'
		else if(data.type == 1) icon.src = '/images/notifications/incorrecto.png'
		else if(data.type == 2) icon.src = '/images/notifications/informacion.png'

		icon.classList.add('contenedorIcon')
		mensaje.classList.add('contenedorMensaje')

		return contenedorMSG
	}

	this.show = function (data){
		var contenedorMSG = createMessage(data),
			top = window.window.scrollY,
			time = data.time || 3000

		contenedorMSG.setAttribute('style', 'top:' + top + 'px')
		contenedorPrincipal.appendChild(contenedorMSG)
		setTimeout(this.hide.bind(this), time)
	}
	this.hide = function (){
		contenedorPrincipal.removeChild(contenedorPrincipal.lastChild)
	}
}

function ajax (config){
	var xhr = new XMLHttpRequest(),
		responseJSON = config | true

	xhr.open(config.type, config.URL, config.async)
	xhr.setRequestHeader('Content-Type', config.contentType)

	xhr.send(config.data)

	if(config.async){
		xhr.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
				var response = responseJSON ? JSON.parse(this.responseText) : this.responseText
				config.onSuccess(response)
			}
		}
	}else{
		var response = responseJSON ? JSON.parse(xhr.responseText) : xhr.responseText
		config.onSuccess(response)
	}
}
