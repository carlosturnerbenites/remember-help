google.charts.load('current', {'packages':['corechart']})

var Stoday = document.querySelector('.statisticToday'),
	SRangeDate = document.querySelector('.statisticsRangeDates'),
	statisticsWindow = new Modal('statisticsWindow','.contentWidth'),
	buildSatistic = new BuildStatistic()

var statistics = document.querySelectorAll('.statistic'),
	containerOptionsStatistic = document.querySelector('.containerOptionsStatistic')

for (var statistic of Array.from(statistics)){
	statistic.addEventListener('click', showOptionStatistic)
}

function showOptionStatistic () {
	containerOptionsStatistic.innerHTML = ''

	var tOptionsStatistic = this.querySelector('.optionsStatistic'),
		cOptionsStatistic = document.importNode(tOptionsStatistic.content, true)

	containerOptionsStatistic.appendChild(cOptionsStatistic)
	FStatistics[this.dataset.statistic]()
}

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
	this.rangeDate = function (){
		var clone = SRangeDate.querySelector('.resultStatistics'),
			template = document.importNode(clone.content, true)
		return template
	}
}

var FStatistics = {
	today : function (){
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
	},
	rangeDate : function (){
		var formSRangeDate = document.querySelector('#rangeDate'),
			validator = new Validator(formSRangeDate)

		validator.config([
			{fn : 'mayor', params : 'dateEnd dateInit', messageError : 'La fecha Inicial debe ser mayor a la Final'}
		])

		formSRangeDate.addEventListener('submit',function (event) {
			event.preventDefault()
			var formValidation = validator.isValid()
			if(formValidation.isValid){
				ajax({
					type : 'POST',
					URL : '/statistics/rangeDate',
					async : true,
					contentType : 'application/json',
					onSuccess : (result) => {
						var data = JSON.parse(result),
							node = buildSatistic.rangeDate(),
							rows = []

						for (var record of data){
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

						google.charts.setOnLoadCallback(drawVisualization)

						function drawVisualization () {
							var data = new google.visualization.DataTable()

							data.addColumn('string', 'Date')
							data.addColumn('number', 'Completadas')
							data.addColumn('number', 'Incompletas')
							data.addRows(rows)

							var options = {
								title : 'Actividades Completas/Incompletas',
								legend:'bottom',
								width:500,
								height:300,
								vAxis: {title: '# de Actividades'},
								hAxis: {title: 'Fecha'},
								seriesType: 'bars',
								series: {5: {type: 'line'}
								}
							}

							var chart = new google.visualization.ComboChart(document.getElementById('chartRangeDate'))
							chart.draw(data, options)
						}

					},
					data : JSON.stringify({dateInit: formSRangeDate.dateInit.value ,dateEnd: formSRangeDate.dateEnd.value,children: formSRangeDate.children.value })
				})
			}else{
				console.error("form invalid")
				validator.showErrors()
			}
		})
	}
}
