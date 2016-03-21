var text = new Text(),
	detailActivityActive = null

var activities = document.querySelectorAll('.activity'),
	confirmActivityWindow = new Modal('confirmActivityWindow','.contentWidth')

function RangeTolerance (options){
	var developed = options.developed | false

	var currentTime = new Date(),
		date = options.date

	date.setDate(currentTime.getDate())
	date.setFullYear(currentTime.getFullYear())
	date.setMonth(currentTime.getMonth())

	var lowerLimit = new Date(currentTime.setMinutes(currentTime.getMinutes() - options.tolerance)),
		upperLimit = new Date(currentTime.setMinutes(currentTime.getMinutes() + options.tolerance*2))

	if (!developed){
		if(date < lowerLimit) return options.onBefore()
		else if(date > upperLimit) return options.onAfter()
		else if (date >= lowerLimit && date <= upperLimit) return options.onDuring()
	}else{
		return options.onDuring()
	}
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

function confirmActivity () {

	var reminder = this.querySelector('[data-statereminder]'),
		tolerance = parseInt(this.dataset.tolerance),
		activityTime = new Date(this.dataset.date)

	if (reminder.dataset.statereminder != 'inprocess') return text.toVoice('Ya has completado esta actiidad.')

	RangeTolerance({
		developed: false,
		date: activityTime,
		tolerance: tolerance,
		onBefore : () => {
			text.toVoice('Vas un poco tarde.')
			registerActivity.bind(this)()
		},
		onDuring : registerActivity.bind(this),
		onAfter : () => text.toVoice('Aun no es hora de realizar esta actividad.')
	})
}

for (var activity of Array.from(activities)){

	var date = new Date(activity.dataset.date)

	activity.querySelector('[rol=time]').innerHTML = date.toHour12()

	var dataDate = date.getHours() > 6 && date.getHours() < 18 ? {meridiem: 'PM',classcss:'morning'} : {meridiem: 'AM',classcss:'nigth'}

	activity.querySelector('.date').classList.add(dataDate.classcss)

	activity.addEventListener('click', confirmActivity)
}
