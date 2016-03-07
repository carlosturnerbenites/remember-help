Array.prototype.getRandom = function (){
	return this[Math.floor(Math.random()*this.length)]
}

var stylesPage = ['styleRed','styleYellow','styleBlue','styleGreen','styleOscure','stylePurple']

module.exports = {
	stylesPage : stylesPage
}
