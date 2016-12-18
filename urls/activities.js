const express = require( 'express' ),
	router = express.Router(),
	models = require( './../models/' ),
	bodyParser = require( 'body-parser' )

const Children = models.children,
	Activity = models.activity,
	History = models.history

router.use( bodyParser.json() )

router.post( '/valid-activity', ( req, res ) => {
	if( req.user.type != 1 ) return res.json( { 'err' : 'Solo una niña ó un niño puede completar las actividades' } )

	var data = req.body,
		dateCurrent = new Date()
	dateCurrent.setHours( 0, 0, 0, 0 )

	Children.findOne( { 'user' : req.user._id }, ( err, oDbChildren ) => {
		if ( err ) {
			req.flash( 'error', err )
			return res.redirect( req.get( 'referer' ) )
		}

		Activity.findById( data.id, ( err, oDbActivity ) => {

			oDbActivity.getState( oDbChildren ).then( ( state ) => {

				if( state.code == 1 ) return res.json( { 'err' : 'Ya has completado esta actividad.' } )

				var response = { 'id' : oDbActivity._id }

				History.create( {
					'children' : oDbChildren._id,
					'activity' : oDbActivity._id,
					'date' : dateCurrent,
					'time' : new Date()
				}, ( err, history ) => {
					oDbActivity.getState( oDbChildren ).then( ( state ) => {
						if( state.detail.aClock ){
							response.message = 'Felicidades, has terminado ha tiempo la actividad',
							response.classcss = 'complete'
						}else{
							response.message = 'Has terminado la actividad, pero mejora la proxima vez.',
							response.classcss = 'warning'
						}
						res.json( response )
					} )
				} )

			} )

		} )
	} )
} )

module.exports = router
