function Modal (modalReference,parentElement){
	var body = document.body
	this.modal = document.getElementById(modalReference)
	this.contentModal = this.modal.querySelector('.contentModal')
	this.bodyModal = this.modal.querySelector('.bodyModal')

	var thisModal = this

	this.parentElement = document.querySelector(parentElement)
	this.show = function (){
		this.modal.classList.add('effectShowModal')
		this.modal.setAttribute('modalActive','true')
		this.parentElement.classList.add('sectionInactive')
		body.classList.add('overflowHidden')

	}
	this.hide = function (){
		this.modal.classList.remove('effectShowModal')
		this.modal.classList.add('effectHideModal')
		this.bodyModal.innerHTML = ''

		window.setTimeout(
			function (){
				thisModal.modal.classList.remove('effectHideModal')
				thisModal.modal.removeAttribute('modalActive')
				thisModal.parentElement.classList.remove('sectionInactive')
				body.classList.remove('overflowHidden')
			},1000)
	}
	this.addContent = function (element){
		this.bodyModal.innerHTML = ''
		this.bodyModal.appendChild(element)
	}
	this.setTitle = function (title){
		this.bodyTitle = this.modal.querySelector('.titleModal')
		this.bodyTitle.innerHTML = ''
		var titleContent = document.createElement('h2')
		titleContent.innerHTML = title
		this.bodyTitle.appendChild(titleContent)
	}
	this.close = this.modal.querySelector('[data-closemodal]')
	this.close.addEventListener('click',this.hide.bind(this))
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
