Array.prototype.getRandom = function (){
	return this[Math.floor(Math.random()*this.length)]
}

Date.prototype.getDatesUntil = function (dateEnd){
	var datesQuery = [],
		dateInit = this

	while (dateInit <= dateEnd){
		datesQuery.push(new Date(dateInit))
		dateInit.setDate(dateInit.getDate()+1)
	}
	return datesQuery

}

function Validator (){
	this.Dates = function () {
	}
}

var stylesPage = ['styleRed','styleYellow','styleBlue','styleGreen','styleOscure','stylePurple']

var statesHealth = [
	{value : 0, name : 'Ninguna'},
	{value : 1, name : 'Sord@'},
	{value : 2, name : 'Mud@'}
]

module.exports = {
	stylesPage : stylesPage,
	statesHealth : statesHealth,
	Validator : Validator
}
