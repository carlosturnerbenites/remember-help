var text = new Text(),
	detailActivityActive = null,
	voice = new Voice( response ),
	buttonCaptureVoice = document.querySelector( '#buttonCaptureVoice' )

if ( buttonCaptureVoice ){
	buttonCaptureVoice.addEventListener( 'mousedown', event => {
		voice.listen()
		this.addEventListener( 'mouseup', voice.listen )
	} )
}

var answersAffirmation = [ 'si', 'sí', 'ya', 'efectivamente', 'evidentemente', 'sin duda' ],
	answersNegation = [ 'no', 'nones', 'nanai', 'naranjas', 'quia', 'ca' ],
	answers = answersAffirmation.concat( answersNegation )

function response ( resultText ){
	if ( resultText ) {
		if ( answers.indexOf( resultText ) < 0 ) {
			text.toVoice( 'No respondiste la pregunta.' )
		}else{
			if ( answersAffirmation.indexOf( resultText ) >= 0 ) {

				$.ajax( {
					'type' : 'POST',
					'url' : '/activities/valid-activity',
					'contentType' : 'application/json',
					'success' : ( response ) => {
						if( response.err ) return text.toVoice( response.err )

						var selector = '[data-id = "' + response.id +'"]',
							reminder = $( selector ).find( '.reminder' )

						reminder.attr( 'data-statereminder', response.classcss )
						text.toVoice( response.message )
						$( '#confirmActivityWindow' ).modal( 'hide' )
					},
					'data' : JSON.stringify( detailActivityActive )
				} )
			}else{
				text.toVoice( 'No olvides hacerlo.' )
				$( '#confirmActivityWindow' ).modal( 'hide' )
			}
		}
	}else text.toVoice( 'No te entendi.' )
}

function RangeTolerance ( options ){
	var developed = options.developed | false

	var currentTime = new Date(),
		date = options.date

	date.setDate( currentTime.getDate() )
	date.setFullYear( currentTime.getFullYear() )
	date.setMonth( currentTime.getMonth() )

	var lowerLimit = new Date( currentTime.setMinutes( currentTime.getMinutes() - options.tolerance ) ),
		upperLimit = new Date( currentTime.setMinutes( currentTime.getMinutes() + options.tolerance*2 ) )

	if ( !developed ){
		if( date < lowerLimit ) return options.onBefore()
		else if( date > upperLimit ) return options.onAfter()
		else if ( date >= lowerLimit && date <= upperLimit ) return options.onDuring()
	}else{
		return options.onDuring()
	}
}

$( '.activity' ).toArray().forEach( ( activity ) => {
	var date = new Date( $( activity ).data( 'time' ) ),
		dataDate = date.getHours() > 6 && date.getHours() < 18 ? { 'classcss' : 'morning' } : { 'classcss' : 'nigth' }

	$( activity ).find( '[rol=time]' ).html( date.toHour12() )
	$( activity ).find( '.date' ).addClass( dataDate.classcss )
	$( activity ).click( confirmActivity )
} )

function confirmActivity () {

	var reminder = this.querySelector( '[data-statereminder]' )

	if ( reminder.dataset.statereminder != 'inprocess' ) return text.toVoice( 'Ya has completado esta actiidad.' )

	RangeTolerance( {
		'developed' : false,
		'date' : new Date( this.dataset.date ),
		'tolerance' : parseInt( this.dataset.tolerance ),
		'onBefore' : () => {
			text.toVoice( 'Vas un poco tarde.' )
			registerActivity.bind( this )()
		},
		'onDuring' : registerActivity.bind( this ),
		'onAfter' : () => text.toVoice( 'Aun no es hora de realizar esta actividad.' )
	} )
}

function registerActivity (){
	detailActivityActive = this.dataset

	text.toVoice( this.dataset.speech )
	$( '#confirmActivityWindow' ).modal( 'show' )
}
