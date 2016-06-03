import {Loader} from './utilities'

function effect(evento){
	var span = document.createElement('span')
	this.appendChild(span)
	span.style.top = evento.offsetY + 'px'
	span.style.left = evento.offsetX + 'px'
	span.classList.add('effect-onda')
	window.setTimeout(() => {
		this.removeChild(span)
	},500)
}

document.addEventListener('DOMContentLoaded', function () {
	var btnLogout = document.querySelector('#btnLogout')
	if(btnLogout){
		btnLogout.addEventListener('click', event => {
			if(!confirm('Desea Salir de la Aplicación')) event.preventDefault()
		})
	}
	var btnCloseMessage = Array.from(document.querySelectorAll('.message >.close'))
	if(btnCloseMessage.length){
		btnCloseMessage.forEach(button => {button.onclick = function (e) {this.parentNode.remove()}})
	}
	var btnEffect = Array.from(document.querySelectorAll('.effect'))

	var formRememberData = document.querySelector('#formRememberData')
	if(formRememberData){
		formRememberData.onsubmit = function(){
			var loader = new Loader('body')
			loader.show()
		}
	}

	btnEffect.forEach(function (element, index) {
		element.onmousedown = effect
	})

	document.addEventListener('DOMNodeInserted', function (ev) {
		var btnEffect = Array.from(document.querySelectorAll('.effect'))
		btnEffect.forEach(function (element, index) {
			element.onmousedown = effect
		})
	}, false)

}, false)
