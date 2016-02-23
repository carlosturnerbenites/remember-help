function voice(){
	this.speak = function(text){
		var msg = new SpeechSynthesisUtterance()
		var voices = window.speechSynthesis.getVoices()
		msg.voice = voices[5]
		msg.voiceURI = 'native'
		msg.volume = 1
		msg.rate = 1
		msg.pitch = 1
		msg.text = text
		msg.lang = 'es-ES'

		speechSynthesis.speak(msg)
	}
}
