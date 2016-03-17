var buttonCaptureVoice = document.querySelector('#buttonCaptureVoice'),
	voice = new Voice(response),
	text = new Text()

if (buttonCaptureVoice){
	buttonCaptureVoice.addEventListener('mousedown', () => {
		voice.listen()
		this.addEventListener('mouseup',voice.listen)
	})
}

var answersAffirmation = ['si', 'sí','ya','efectivamente', 'evidentemente', 'sin duda'],
	answersNegation = ['no','nones', 'nanai', 'naranjas', 'quia', 'ca'],
	answers = answersAffirmation.concat(answersNegation)

function response (resultText){
	if (resultText) {
		if (answers.indexOf(resultText) < 0) {
			text.toVoice('No respondiste la pregunta.')
		}else{
			if (answersAffirmation.indexOf(resultText) >= 0) {

				ajax({
					type : 'POST',
					URL : '/activities/valid-activity',
					async : true,
					contentType : 'application/json',
					onSuccess : (result) => {
						var data = JSON.parse(result)
						if(data.err) return text.toVoice(data.err)

						var selector = '[data-id = "' + data.id +'"]',
							activity = document.querySelector(selector),
							reminder = activity.querySelector('.reminder')

						reminder.setAttribute('data-statereminder',data.classcss)
						text.toVoice(data.message)
						confirmActivityWindow.hide()
					},
					data : JSON.stringify(detailActivityActive)
				})

			}else{
				text.toVoice('No olvides hacerlo.')
				confirmActivityWindow.hide()
			}
		}
	}else text.toVoice('No te entendi.')
}
