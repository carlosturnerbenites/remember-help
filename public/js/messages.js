var messages = document.querySelectorAll('.message'),
	voice = new voice()

for (var message of Array.from(messages)){
	message.addEventListener('click', (e) => {
		e.stopPropagation()
		var text = e.target.getAttribute('data-speech')
		console.log(text)
		voice.speak(text)
	},true)
}
