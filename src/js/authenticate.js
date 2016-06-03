import {NotificationC,ajax} from './utilities'

var formAuthenticate = document.querySelector('#formAuthenticate'),
	continueAuthenticate = document.querySelector('#continueAuthenticate'),
	notification = new NotificationC(),
	sectionContinue =document.querySelector('#sectionContinue'),
	sectionAuth = document.querySelector('#sectionAuth'),
	backContinue = sectionAuth.querySelector('.backContinue'),
	potho = formAuthenticate.querySelector('.userPhoto'),
	username = formAuthenticate.querySelector('.userUsername')

backContinue.onclick = function () {
	formAuthenticate.reset()
	sectionContinue.setAttribute('data-hidden', 'false')
	sectionAuth.setAttribute('data-hidden', 'true')
	potho.src = 'images/users/unkown.png'
	username.innerHTML = ''
}

continueAuthenticate.onclick = function (){
	ajax({
		type : 'POST',
		URL : '/api/collection/user',
		async : true,
		contentType : 'application/json',
		onSuccess : (response) => {
			if (response.err) return notification.show({msg: response.err.message, type: 1})

			if (response.document) {
				var user = response.document

				potho.src = 'images/users/' + user.photo
				username.innerHTML = user.username

				sectionContinue.setAttribute('data-hidden', 'true')
				sectionAuth.setAttribute('data-hidden', 'false')

				formAuthenticate.password.focus()
			}else notification.show({msg: 'No existe un usuario registrado con este **username**', type: 2})
		},
		data : JSON.stringify({query: {username : formAuthenticate.username.value}, projection: {password : 0}})
	})
}
