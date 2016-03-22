var text = new Text(),
	detailActivityActive = null

var activities = Array.from(document.querySelectorAll('.activity')),
	confirmActivityWindow = new Modal('confirmActivityWindow','.contentWidth')

activities.forEach((activity) => {

	var date = new Date(activity.dataset.date),
		dataDate = date.getHours() > 6 && date.getHours() < 18 ? {classcss:'morning'} : {classcss:'nigth'}

	activity.querySelector('[rol=time]').innerHTML = date.toHour12()
	activity.querySelector('.date').classList.add(dataDate.classcss)
	activity.addEventListener('click', confirmActivity)
})

function confirmActivity () {

	var reminder = this.querySelector('[data-statereminder]')

	if (reminder.dataset.statereminder != 'inprocess') return text.toVoice('Ya has completado esta actiidad.')

	RangeTolerance({
		developed: false,
		date: new Date(this.dataset.date),
		tolerance: parseInt(this.dataset.tolerance),
		onBefore : () => {
			text.toVoice('Vas un poco tarde.')
			registerActivity.bind(this)()
		},
		onDuring : registerActivity.bind(this),
		onAfter : () => text.toVoice('Aun no es hora de realizar esta actividad.')
	})
}

function registerActivity (){
	text.toVoice(this.dataset.speech)

	detailActivityActive = this.dataset

	var template = document.querySelector('#templateConfirmActivityWindow'),
		clone = document.importNode(template.content,true)

	confirmActivityWindow
	.setTitle(this.dataset.text)
	.addContent(clone)
	.show()
}
