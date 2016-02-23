var recognition,
	recognizing = false,
	webkitSpeechRecognition = webkitSpeechRecognition,
	text

recognition = new webkitSpeechRecognition()
recognition.lang = 'es-Es'
recognition.continuous = true
recognition.interimResults = true

recognition.onstart = function() {recognizing = true}

recognition.onresult = function(event) {
	for (var i = event.resultIndex; i < event.results.length; i++) {
		if(event.results[i].isFinal){
			text =  event.results[i][0].transcript
			response(text)
		}
	}
}

recognition.onerror = function(event) {}

recognition.onend = function() {recognizing = false}

function listen() {
	if (recognizing == false) {
		recognition.start()
		recognizing = true
	} else {
		recognition.stop()
		recognizing = false
	}
}
