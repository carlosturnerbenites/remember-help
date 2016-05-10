var dataModelsForForms = {
	activity : {
		form:{
			'method': 'POST',
			'enctype' : 'multipart/form-data'
		},
		fields:{
			date :{
				type:'date',
				label:'Fecha',
				required:true
			},
			hour :{
				type:'date',
				label:'Hora',
				required:true
			},
			text :{
				type:'text',
				label:'Descripcion',
				required:true
			},
			img :{
				type:'file',
				label:'Imagen',
				accept: 'image/*',
				required:true
			},
			textSpeech :{
				type:'text',
				label:'Texo De Lectura',
				required:true
			},
			tolerance :{
				type:'number',
				label:'Tolerancia',
				default:20,
				required:true

			}
		}
	},
	children: {
		form:{
			'method': 'POST',
			'enctype' : 'application/x-www-form-urlencoded'
		},
		fields:{
			age:{
				type:'number',
				label:'Edad',
				min:5,
				required:true
			},
			parent :{
				type:'ref',
				label:'Pariente',
				ref:'parent',
				readOnly: true,
				input:{
					text: 'name',
					value:'_id'
				}
			},
			id:{
				type:'number',
				label:'Identificacion',
				required:true, unique:true
			},
			name:{
				type:'text',
				label:'Nombre',
				required:true
			},
			stateHealth:{
				type:'number',
				label:'Estado De Salud',
				required:true
			},
			user :{
				type:'ref',
				label:'Usuario',
				ref:'user',
				readOnly: true,
				required:true,
				input:{
					text: 'username',
					value:'_id'
				}
			}
		}
	},
	administrator: {
		form:{
			'method': 'POST',
			'enctype' : 'application/x-www-form-urlencoded'
		},
		fields:{
			id:{
				type:'number',
				label:'identificacion',
				required:true,
				unique:true
			},
			name:{
				type:'text',
				label:'Nombre',
				required:true
			},
			user :{
				type:'ref',
				label:'Usuario',
				ref:'user',
				readOnly: true,
				required:true,
				input:{
					text: 'username',
					value:'_id'
				}
			}
		}
	},
	parent: {
		form:{
			'method': 'POST',
			'enctype' : 'application/x-www-form-urlencoded'
		},
		fields:{
			children:{
				type:'ref',
				label:'Niñ@',
				ref:'children',
				readOnly: true,
				required:true,
				input:{
					text: 'name',
					value:'_id'
				}
			},
			id:{
				type:'number',
				label:'identificacion',
				required:true, unique:true
			},
			name:{
				type:'text',
				label:'Nombre',
				required:true
			},
			user :{
				type:'ref',
				label:'Usuario',
				ref:'user',
				readOnly: true,
				required:true,
				input:{
					text: 'username',
					value:'_id'
				}
			}
		}
	},
	user: {
		form:{
			'method': 'POST',
			'enctype' : 'application/x-www-form-urlencoded'
		},
		fields:{
			active:{
				type:'checkbox',
				label:'Activo',
				required:true,
				default:true
			},
			photo:{
				type:'text',
				label:'Foto',
				default: 'unkown.png'
			},
			password:{
				type:'text',
				label:'Contraseña',
				required:true
			},
			email:{
				type:'text',
				label:'Correo Electronico',
				required:true
			},
			type:{
				type:'number',
				label:'Tipo',
				emum:[777,776,0,1],
				required:true
			},
			username:{
				type:'text',
				label:'Nombre De Usuario',
				required:true,
				unique:true
			}
		}
	},
	history: {
		form:{
			'method': 'POST',
			'enctype' : 'application/x-www-form-urlencoded'
		},
		fields:{
			activity:{
				type:'ref',label:'Actividad',
				ref:'activity',
				readOnly: true,
				required:true,
				input:{
					text: 'text',
					value:'_id'
				}
			},
			children:{
				type:'ref',label:'Niñ2',
				ref:'children',
				readOnly: true,
				required:true
			},
			date :{
				type:'date',
				label:'Fecha',
				required:true
			},
			time :{
				type:'date',
				label:'Fecha Y Hora',
				required:true
			}
		}
	}
}

module.exports = dataModelsForForms
