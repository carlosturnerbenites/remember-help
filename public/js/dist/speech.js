(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function Text() {
	/*
 	Abstraccion de la interfaz 'SpeechSynthesisUtterance' de la 'Web Speech API'
 	Convierte texto a voz
 */
	this.toVoice = function (text) {
		var msg = new SpeechSynthesisUtterance(),
		    voices = window.speechSynthesis.getVoices();

		msg.voice = voices[4];
		msg.voiceURI = 'native';
		msg.volume = 1;
		msg.rate = 1;
		msg.pitch = 1;
		msg.text = text;
		msg.lang = 'es-ES';

		speechSynthesis.speak(msg);
	};
}

function Voice(cb) {
	/*
 	Abstraccion de la interfaz 'webkitSpeechRecognition' de la 'Web Speech API'
 	Convierte voz a texto
 */
	var recognizing = false,
	    text,
	    recognition = new webkitSpeechRecognition();

	this.toText = function (event) {
		for (var i = event.resultIndex; i < event.results.length; i++) {
			if (event.results[i].isFinal) {
				text = event.results[i][0].transcript;
				cb(text);
			}
		}
	};

	recognition.lang = 'es-Es';
	recognition.continuous = true;
	recognition.interimResults = true;

	recognition.onstart = function () {
		recognizing = true;
	};

	recognition.onresult = this.toText;

	recognition.onerror = function () {};

	recognition.onend = function () {
		recognizing = false;
	};

	this.listen = function () {
		if (recognizing == false) {
			recognition.start();
			recognizing = true;
		} else {
			recognition.stop();
			recognizing = false;
		}
	};
}

},{}]},{},[1])