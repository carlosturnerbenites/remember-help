// abstraccion de la interfaz 'SpeechSynthesisUtterance' de la 'Web Speech API'
// convierte texto a voz

function Text (){
	this.toVoice = function (text){
		var msg = new SpeechSynthesisUtterance(),
			voices = window.speechSynthesis.getVoices()

		msg.voice = voices[4]
		msg.voiceURI = 'native'
		msg.volume = 1
		msg.rate = 1
		msg.pitch = 1
		msg.text = text
		msg.lang = 'es-ES'

		speechSynthesis.speak(msg)
	}
}
