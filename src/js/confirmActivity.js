import {Voice,Text,ajax} from './speech'

var buttonCaptureVoice = document.querySelector('#buttonCaptureVoice'),
	voice = new Voice(response),
	text = new Text()

if (buttonCaptureVoice){
	buttonCaptureVoice.addEventListener('mousedown', event => {
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
					onSuccess : (response) => {
						if(response.err) return text.toVoice(response.err)

						var selector = '[data-id = "' + response.id +'"]',
							activity = document.querySelector(selector),
							reminder = activity.querySelector('.reminder')

						reminder.setAttribute('data-statereminder',response.classcss)
						text.toVoice(response.message)
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
