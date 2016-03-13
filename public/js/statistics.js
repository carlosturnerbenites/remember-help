var Stoday = document.querySelector('#today')

Stoday.addEventListener('submit',function (event) {
	console.log(this)
	event.preventDefault()
	ajax({
		type : 'POST',
		URL : '/statistics/today',
		async : true,
		contentType : 'application/json',
		onSuccess : (result) => {
			console.log(result)
		},
		data : JSON.stringify({children: Stoday.children.value })
	})
})
