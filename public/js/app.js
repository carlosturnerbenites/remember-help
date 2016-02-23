Date.prototype.getTimeHumanize = function(){
	var time = this.getHours() + ':' + this.getMinutes() + ':' + this.getSeconds()
	return time
}

var activities = document.querySelectorAll('.activity')

for (var activity of Array.from(activities)){
	var date = new Date(activity.getAttribute('data-date'))

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
}
