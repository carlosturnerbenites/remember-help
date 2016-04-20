var btnLogout = document.querySelector('#btnLogout')
if(btnLogout){
	btnLogout.addEventListener('click', event => {
		if(!confirm('Desea Salir de la Aplicación')) event.preventDefault()
	})
}
