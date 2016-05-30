(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var _this = this;

var buttonCaptureVoice = document.querySelector('#buttonCaptureVoice'),
    voice = new Voice(response),
    text = new Text();

if (buttonCaptureVoice) {
	buttonCaptureVoice.addEventListener('mousedown', event => {
		voice.listen();
		_this.addEventListener('mouseup', voice.listen);
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

				ajax({
					type: 'POST',
					URL: '/activities/valid-activity',
					async: true,
					contentType: 'application/json',
					onSuccess: response => {
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

},{}]},{},[1])