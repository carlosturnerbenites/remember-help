// abstraccion de la interfaz 'SpeechSynthesisUtterance' de la 'Web Speech API'
// convierte texto a voz

function Text (){
	console.info("to voice")
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

// abstraccion de la interfaz 'webkitSpeechRecognition' de la 'Web Speech API'
// convierte voz a texto

function Voice (cb){
	var recognizing = false,
		text,
		recognition = new webkitSpeechRecognition()

	this.toText = function (event){
		for (var i = event.resultIndex; i < event.results.length; i++){
			if(event.results[i].isFinal){
				text = event.results[i][0].transcript
				console.log(text)
				cb(text)
			}
		}
	}

	recognition.lang = 'es-Es'
	recognition.continuous = true
	recognition.interimResults = true

	recognition.onstart = function (){recognizing = true;console.log("inicio")}

	recognition.onresult = this.toText

	recognition.onerror = function (){}

	recognition.onend = function (){recognizing = false}

	this.listen = function (){
		if (recognizing == false){
			recognition.start()
			recognizing = true
		} else {
			recognition.stop()
			recognizing = false
		}
	}
}
