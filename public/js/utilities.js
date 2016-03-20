/* exported Validator */

Date.prototype.toHour12 = function () {
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

HTMLElement.prototype.disabeldInputs = function (valueDisabled, selector, exceptions){
	var elements = this.querySelectorAll(selector)
	for (var element of Array.from(elements)){
		if (exceptions.indexOf(element.name) < 0) element.disabled = valueDisabled
	}
	return this
}

HTMLElement.prototype.emptyInputs = function (selector,exceptions){
	var elements = this.querySelectorAll(selector)
	for (var element of Array.from(elements)){
		if (exceptions.indexOf(element.name) < 0) element.value = ''
	}
	return this
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
		mensaje.innerHTML= data.msg
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
		//contenedorPrincipal.removeChild(contenedorPrincipal.lastChild)
	}
}

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

