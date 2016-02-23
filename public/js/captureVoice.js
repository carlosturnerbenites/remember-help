var buttonCaptureVoice = document.querySelector('#buttonCaptureVoice')

buttonCaptureVoice.addEventListener('mousedown', () => {
	listen()
	this.addEventListener('mouseup',listen)
})

function response(text){
	if (text) {
		text = text.replace('í','i')
		if (text.search('si') < 0 && text.search('no') < 0) {
			voice.speak('No respondiste la pregunta.')
		}else{
			if (text.search('si') >= 0) {
				voice.speak('perfecto sigue asi')
			}else{
				voice.speak('No olvides hacerlo')
			}

		}
	}else{
		voice.speak('No te entendi.')
	}
	console.log(text)
}
