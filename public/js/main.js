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
}, false)
