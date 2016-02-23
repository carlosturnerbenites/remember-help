var buttonCaptureVoice = document.querySelector('#buttonCaptureVoice')
buttonCaptureVoice.addEventListener('mousedown', captureVoice)

function captureVoice(){
	console.log('Capture Voice')
	this.addEventListener('mouseup',captureVoice)
}
