/* exported Modal Message ajax */
Date.prototype.getTimeHumanize = function () {
	var time = this.getHours() + ':' + this.getMinutes() + ':' + this.getSeconds()
	return time
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

function Message (data){
	this.contenedorPrincipal = document.body

	this.createMessage = function (){
		this.contenedorMSG = document.createElement('article')
		this.contenedorMSG.classList.add('contenedorMensaje')
		var mensaje = document.createElement('p')
		// var contenedorIcon = document.createElement('article')
		// var contenedorMensaje = document.createElement('article')
		mensaje.innerHTML= data.msg
		// var icono = document.createElement('span')
		this.contenedorMSG.classList.add('MSG')
		var icon = document.createElement('img')

		this.contenedorMSG.appendChild(icon)
		this.contenedorMSG.appendChild(mensaje)

		if (data.tipo == 0){
			icon.src = 'correcto.png'
		}else if(data.tipo == 1){
			icon.src = 'incorrecto.png'
		}
		else if(data.tipo == 2){
			icon.src = 'informacion.png'
		}

		icon.classList.add('contenedorIcon')
		mensaje.classList.add('contenedorMensaje')
	}
	this.show = function (){
		this.createMessage()
		var top = window.window.scrollY
		this.contenedorMSG.setAttribute('style', 'top:' + top + 'px')
		this.contenedorPrincipal.appendChild(this.contenedorMSG)
		setTimeout(this.hide.bind(this), data.time)
	}
	this.hide = function (){
		this.contenedorPrincipal.removeChild(this.contenedorPrincipal.lastChild)
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

