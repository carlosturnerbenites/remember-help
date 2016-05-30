google.charts.load('current', {'packages':['corechart']})

var Stoday = document.querySelector('.statisticToday'),
	SRangeDate = document.querySelector('.statisticRangeDates'),
	statisticsWindow = new Modal('statisticsWindow','.contentWidth'),
	buildSatistic = new BuildStatistic(),
	notification = new NotificationC()

var statistics = Array.from(document.querySelectorAll('.statistic')),
	containerOptionsStatistic = document.querySelector('.containerOptionsStatistic')

statistics.forEach(statistic => {
	statistic.addEventListener('click', showOptionStatistic)
})

function showOptionStatistic () {
	containerOptionsStatistic.innerHTML = ''

	var tOptionsStatistic = this.querySelector('.optionsStatistic'),
		cOptionsStatistic = document.importNode(tOptionsStatistic.content, true)

	var btnClose = cOptionsStatistic.querySelector('#closeOptionsStatistic')

	btnClose.onclick = function (e){
		var parent = e.target.parentNode
		parent.remove()
	}

	containerOptionsStatistic.appendChild(cOptionsStatistic)
	FStatistics[this.dataset.statistic]()
}

function getDimensionsChart (){
	var width = document.querySelector('.bodyModal').offsetWidth,
		height = document.querySelector('.bodyModal').offsetWidth
	if (height > document.querySelector('.bodyModal').offsetHeight) height = document.querySelector('.bodyModal').offsetHeight
	return {width: width, height:height}
}

function BuildStatistic (){
	this.today = function (histories){
		var container = document.createElement('section')

		for (var history of histories){
			var clone = Stoday.querySelector('.resultStatistics'),
				template = document.importNode(clone.content, true),
				dateActivity = new Date(history.activity.hour),
				dateHistory = new Date(history.time)

			dateHistory.setDate(dateActivity.getDate())
			dateHistory.setFullYear(dateActivity.getFullYear())
			dateHistory.setMonth(dateActivity.getMonth())

			var timeText = dateHistory > dateActivity ? 'Despues' : 'A tiempo'

			template.querySelector('.nameActivity').innerHTML = history.activity.text
			template.querySelector('.timeActivity').innerHTML = dateActivity.toHour12()
			template.querySelector('.timeHistory').innerHTML = dateHistory.toHour12()
			template.querySelector('.timeText').innerHTML = timeText

			container.appendChild(template)
		}
		return container
	}
	this.rangeDate = function (){
		var clone = SRangeDate.querySelector('.resultStatistics'),
			template = document.importNode(clone.content, true)
		return template
	}
	this.evolution = function (){
		var clone = SRangeDate.querySelector('.resultStatistics'),
			template = document.importNode(clone.content, true)
		return template
	}
}

var FStatistics = {
	today : function (){
		var formSToday = document.querySelector('#today')
		formSToday.onsubmit = function (event) {
			event.preventDefault()
			ajax({
				type : 'POST',
				URL : '/statistics/today',
				async : true,
				contentType : 'application/json',
				onSuccess : response => {
					if(!response.histories.length) return notification.show({msg: '**No** se han **completado** actividades **hoy**', type: 2})

					var node = buildSatistic.today(response.histories)

					statisticsWindow
					.setTitle('Resumen de Actividad Actual')
					.addContent(node)
					.show()
				},
				data : JSON.stringify({children: formSToday.children.value })
			})
		}
	},
	rangeDate : function (){
		var formSRangeDate = document.querySelector('#rangeDate'),
			validator = new Validator(formSRangeDate)

		validator.config([
			{fn : 'mayor', params : 'dateEnd dateInit', messageError : 'La **Fecha Inicial** debe ser **mayor** a la **Fecha Final**'}
		])

		formSRangeDate.onsubmit = function (event) {
			event.preventDefault()
			var formValidation = validator.isValid()
			if(formValidation.isValid){
				ajax({
					type : 'POST',
					URL : '/statistics/rangeDate',
					async : true,
					contentType : 'application/json',
					onSuccess : response => {
						if(!response.length) return notification.show({msg: '**No** hay **datos** para generar la **estadistica**.', type: 2})

						var node = buildSatistic.rangeDate(),
							rows = []

						for (var record of response){
							var dataRecord = []
							dataRecord.push(record._id.day + '/' + record._id.month + '/' + record._id.year)
							dataRecord.push(record.complete)
							dataRecord.push(record.incomplete)
							rows.push(dataRecord)
						}

						statisticsWindow
						.setTitle('Actividades por Rango de Fechas')
						.addContent(node)
						.show()

						google.charts.setOnLoadCallback(drawRangeDates)

						function drawRangeDates () {
							var data = new google.visualization.DataTable()

							data.addColumn('string', 'Date')
							data.addColumn('number', 'Completadas')
							data.addColumn('number', 'Incompletas')
							data.addRows(rows)
							statisticsWindow.modal.addEventListener('fullOpen', (e) => {
								var dimensions = getDimensionsChart()

								var options = {
									title : 'Actividades Completas/Incompletas',
									legend:'bottom',
									width: dimensions.width,
									height: dimensions.height,
									vAxis: {title: '# de Actividades'},
									hAxis: {title: 'Fecha'},
									seriesType: 'bars'
								}

								var chart = new google.visualization.ComboChart(document.getElementById('chartRangeDate'))
								chart.draw(data, options)
							})
						}

					},
					data : JSON.stringify({dateInit: formSRangeDate.dateInit.value ,dateEnd: formSRangeDate.dateEnd.value,children: formSRangeDate.children.value })
				})
			}else{
				validator.showErrors('.errors')
			}
		}
	},
	evolution : function (){
		var formSEvolution = document.querySelector('#evolution'),
			validator = new Validator(formSEvolution)

		validator.config([
			{fn : 'mayor', params : 'dateEnd dateInit', messageError : 'La **Fecha Inicial** debe ser **mayor** a la **Fecha Final**'}
		])

		formSEvolution.onsubmit = function (event) {
			event.preventDefault()
			var formValidation = validator.isValid()
			if(formValidation.isValid){
				ajax({
					type : 'POST',
					URL : '/statistics/line-evolution',
					async : true,
					contentType : 'application/json',
					onSuccess : response => {
						if(!response.length) return notification.show({msg: '**No** hay **datos** para generar la **estadistica**.', type: 2})

						var node = buildSatistic.rangeDate(),
							rows = []

						for (var record of response){
							var dataRecord = []
							dataRecord.push(record._id.day + '/' + record._id.month + '/' + record._id.year)
							dataRecord.push(record.complete)
							dataRecord.push(record.incomplete)
							rows.push(dataRecord)
						}

						statisticsWindow
						.setTitle('Evolución')
						.addContent(node)
						.show()

						google.charts.setOnLoadCallback(drawEvolution)

						function drawEvolution () {
							var data = new google.visualization.DataTable()

							data.addColumn('string', 'Date')
							data.addColumn('number', 'Completadas')
							data.addColumn('number', 'Incompletas')
							data.addRows(rows)

							statisticsWindow.modal.addEventListener('fullOpen', (e) => {
								var dimensions = getDimensionsChart()
								var options = {
									title: 'Evolución',
									pointSize: 10,
									width: dimensions.width,
									height: dimensions.height,
									hAxis: {titleTextStyle: {color: '#333'}, direction:-1, slantedText:false, slantedTextAngle:90},
									colors: ['#34A853','#EA4235'],
									vAxis: {minValue: 0, title: '# de Actividades'},
									legend:'bottom'
								}

								var chart = new google.visualization.AreaChart(document.getElementById('chartRangeDate'))
								chart.draw(data, options)
							}, false)
						}

					},
					data : JSON.stringify({dateInit: formSEvolution.dateInit.value ,dateEnd: formSEvolution.dateEnd.value,children: formSEvolution.children.value })
				})
			}else{
				validator.showErrors('.errors')
			}
		}
	}
}
