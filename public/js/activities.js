Date.prototype.getTimeHumanize = function () {
	var time = this.getHours() + ':' + this.getMinutes() + ':' + this.getSeconds()
	return time
}

var text = new Text(),
	detailActivityActive = null

var activities = document.querySelectorAll('.activity'),
	confirmActivityWindow = new Modal('confirmActivityWindow','.contentWidth')

for (var activity of Array.from(activities)){
	var date = new Date(activity.dataset.date)

	activity.querySelector('[rol=time]').innerHTML = date.getTimeHumanize()

	var span = document.createElement('span')
	span.classList.add('meridiem')

	if (date.getHours() > 12) {
		span.innerHTML = 'PM'
		activity.querySelector('.date').classList.add('nigth')
	}else{
		span.innerHTML = 'AM'
		activity.querySelector('.date').classList.add('morning')
	}

	activity.querySelector('[rol=time]').appendChild(span)

	activity.addEventListener('click', confirmActivity)
}

function validateRangeTolerance (date,tolerance){

	var currentTime = new Date()

	date.setDate(currentTime.getDate())
	date.setFullYear(currentTime.getFullYear())
	date.setMonth(currentTime.getMonth())

	var lowerLimit = new Date(currentTime.setMinutes(currentTime.getMinutes() - tolerance)),
		upperLimit = new Date(currentTime.setMinutes(currentTime.getMinutes() + tolerance*2))

	if (date >= lowerLimit && date <= upperLimit) return true
	return false
}

function confirmActivity () {

	var reminder = this.querySelector('[data-statereminder]'),
		tolerance = parseInt(this.dataset.tolerance),
		activityTime = new Date(this.dataset.date)

	if (reminder.dataset.statereminder == 'complete') return text.toVoice('Ya has completado esta actiidad.')

	/* Este condicional verifica que la hora de la tarea este en el rango de la tolerancia de la misma*/
	// if (!validateRangeTolerance(activityTime, tolerance)) return text.toVoice('Aun no es hora de realizar esta actividad.')

	text.toVoice(this.dataset.speech)

	detailActivityActive = this.dataset

	var template = document.querySelector('#templateConfirmActivityWindow'),
		clone = document.importNode(template.content,true)

	confirmActivityWindow
	.setTitle(this.dataset.text)
	.addContent(clone)
	.show()
}

