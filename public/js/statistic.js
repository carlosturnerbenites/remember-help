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
}
