// abstraccion de la interfaz 'webkitSpeechRecognition' de la 'Web Speech API'
// convierte voz a texto

function Voice (cb){
	var recognizing = false,
		text,
		recognition = new webkitSpeechRecognition()

	this.toText = function (event){
		console.log(event)
		for (var i = event.resultIndex; i < event.results.length; i++){
			if(event.results[i].isFinal){
				text = event.results[i][0].transcript
				cb(text)
			}
		}
	}

	recognition.lang = 'es-Es'
	recognition.continuous = true
	recognition.interimResults = true

	recognition.onstart = function (){recognizing = true;console.log("inicio")}

	recognition.onresult = this.toText

	recognition.onerror = function (event){}

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
