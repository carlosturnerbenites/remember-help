var messages = document.querySelectorAll('.message'),
	text = new Text()

for (var message of Array.from(messages)){
	message.addEventListener('click', function (e){
		e.stopPropagation()
		text.toVoice(this.dataset.speech)
	})
}
