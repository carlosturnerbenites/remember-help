function BuildStatistic (){
	this.today = function (histories){
		var container = document.createElement('section')
		for (var history of histories){
			var clone = Stoday.querySelector('.resultStatistics'),
				template = document.importNode(clone.content, true)

			template.querySelector('.nameActivity').innerHTML = history.activity.text
			template.querySelector('.timeActivity').innerHTML = history.activity.hour
			template.querySelector('.stateActivity').innerHTML = 'Estado'

			container.appendChild(template)
		}
		return container
	}
}

var Stoday = document.querySelector('.statisticToday'),
	statisticsWindow = new Modal('statisticsWindow','.contentWidth'),
	buildSatistic = new BuildStatistic()

var formSToday = document.querySelector('#today')

formSToday.addEventListener('submit',function (event) {
	event.preventDefault()
	ajax({
		type : 'POST',
		URL : '/statistics/today',
		async : true,
		contentType : 'application/json',
		onSuccess : (result) => {
			var data = JSON.parse(result),
				node = buildSatistic.today(data.histories)

			statisticsWindow
			.setTitle('Resumen de Actividad Actual')
			.addContent(node)
			.show()
		},
		data : JSON.stringify({children: formSToday.children.value })
	})
})
