(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function effect(evento) {
	var span = document.createElement('span');
	this.appendChild(span);
	span.style.top = evento.offsetY + 'px';
	span.style.left = evento.offsetX + 'px';
	span.classList.add('effect-onda');
	window.setTimeout(() => {
		this.removeChild(span);
	}, 500);
}

document.addEventListener('DOMContentLoaded', function () {
	var btnLogout = document.querySelector('#btnLogout');
	if (btnLogout) {
		btnLogout.addEventListener('click', event => {
			if (!confirm('Desea Salir de la Aplicación')) event.preventDefault();
		});
	}
	var btnCloseMessage = Array.from(document.querySelectorAll('.message >.close'));
	if (btnCloseMessage.length) {
		btnCloseMessage.forEach(button => {
			button.onclick = function (e) {
				this.parentNode.remove();
			};
		});
	}
	var btnEffect = Array.from(document.querySelectorAll('.effect'));

	var formRememberData = document.querySelector('#formRememberData');
	if (formRememberData) {
		formRememberData.onsubmit = function () {
			var loader = new Loader('body');
			loader.show();
		};
	}

	btnEffect.forEach(function (element, index) {
		element.onmousedown = effect;
	});

	document.addEventListener('DOMNodeInserted', function (ev) {
		var btnEffect = Array.from(document.querySelectorAll('.effect'));
		btnEffect.forEach(function (element, index) {
			element.onmousedown = effect;
		});
	}, false);
}, false);

},{}]},{},[1])