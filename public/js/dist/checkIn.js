(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var formCheckIn = document.querySelector('#formCheckIn'),
    validator = new Validator(formCheckIn),
    notification = new NotificationC();

validator.config([{
	fn: 'notEquals',
	params: 'usernameChildren usernameParent',
	messageError: 'No pueden registrarse dos usuarios con el mismo **username**'
}, {
	fn: 'equals',
	params: 'passwordChildren confirmPasswordChildren',
	messageError: 'La contraseña del **niñ@** no **coincide**'
}, {
	fn: 'equals',
	params: 'passwordParent confirmPasswordParent',
	messageError: 'La contraseña del **pariente** no **coincide**'
}]);

formCheckIn.onsubmit = function (event) {
	var validation = validator.isValid();
	if (!validation.isValid) {
		event.preventDefault();
		validator.showErrors('.errors');
	}
};

formCheckIn.idChildren.onchange = function (e) {
	var target = e.target;
	if (target.validity.valid) {
		ajax({
			type: 'POST',
			URL: '/api/collection/children',
			async: true,
			contentType: 'application/json',
			onSuccess: response => {
				var container = document.querySelector('#dataChildren');

				if (response.err) return notification.show({ msg: response.err.message, type: 1 });
				if (response.document) {
					var documentDB = response.document;

					container.disabeldInputs(true, 'input, select', ['idChildren']);
					container.querySelector('#nameChildren').value = documentDB.name;
					container.querySelector('#ageChildren').value = documentDB.age;

					notification.show({ msg: 'Este numero de identificacion ya se encuentra registrado.', type: 2 });
				} else {
					container.disabeldInputs(false, 'input, select', ['idChildren']).emptyInputs('input, select', ['idChildren']);
				}
			},
			data: JSON.stringify({ query: { id: target.value }, projection: {} })
		});
	}
};

formCheckIn.idFamily.onchange = function (e) {
	var target = e.target;
	if (target.validity.valid) {
		ajax({
			type: 'POST',
			URL: '/api/collection/parent',
			async: true,
			contentType: 'application/json',
			onSuccess: response => {
				if (response.err) return notification.show({ msg: response.err.message, type: 1 });

				var container = document.querySelector('#dataParent');

				if (response.document) {
					var documentDB = response.document;

					container.readOnlyInputs(true, 'input, select', ['idFamily']);
					container.querySelector('#nameParent').value = documentDB.name;
					container.querySelector('#email').value = documentDB.user.email;

					console.log(documentDB);

					notification.show({ msg: 'Este numero de identificacion ya se encuentra registrado.', type: 2 });
				} else {
					container.readOnlyInputs(false, 'input, select', ['idFamily']).emptyInputs('input, select', ['idFamily']);
				}
			},
			data: JSON.stringify({ query: { id: target.value }, projection: {} })
		});
	}
};

},{}]},{},[1])