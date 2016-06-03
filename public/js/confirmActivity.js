(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _speech = require('./speech');

var buttonCaptureVoice = document.querySelector('#buttonCaptureVoice'),
    voice = new _speech.Voice(response),
    text = new _speech.Text();

if (buttonCaptureVoice) {
	buttonCaptureVoice.addEventListener('mousedown', function (event) {
		voice.listen();
		undefined.addEventListener('mouseup', voice.listen);
	});
}

var answersAffirmation = ['si', 'sí', 'ya', 'efectivamente', 'evidentemente', 'sin duda'],
    answersNegation = ['no', 'nones', 'nanai', 'naranjas', 'quia', 'ca'],
    answers = answersAffirmation.concat(answersNegation);

function response(resultText) {
	if (resultText) {
		if (answers.indexOf(resultText) < 0) {
			text.toVoice('No respondiste la pregunta.');
		} else {
			if (answersAffirmation.indexOf(resultText) >= 0) {

				(0, _speech.ajax)({
					type: 'POST',
					URL: '/activities/valid-activity',
					async: true,
					contentType: 'application/json',
					onSuccess: function onSuccess(response) {
						if (response.err) return text.toVoice(response.err);

						var selector = '[data-id = "' + response.id + '"]',
						    activity = document.querySelector(selector),
						    reminder = activity.querySelector('.reminder');

						reminder.setAttribute('data-statereminder', response.classcss);
						text.toVoice(response.message);
						confirmActivityWindow.hide();
					},
					data: JSON.stringify(detailActivityActive)
				});
			} else {
				text.toVoice('No olvides hacerlo.');
				confirmActivityWindow.hide();
			}
		}
	} else text.toVoice('No te entendi.');
}

},{"./speech":2}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
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

exports.Text = Text;
exports.Voice = Voice;

},{}]},{},[1]);
