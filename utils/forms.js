var dataModelsForForms = {
	activity : {
		fieldTextRef :'text',
		fieldValueRef :'_id',
		form:{
			'method': 'POST',
			'enctype' : 'multipart/form-data'
		},
		fields:{
			_id:{
				type:'hidden',
				label:''
			},
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
		fieldTextRef :'name',
		fieldValueRef :'_id',
		form:{
			'method': 'POST',
			'enctype' : 'application/x-www-form-urlencoded'
		},
		fields:{
			_id:{
				type:'hidden',
				label:''
			},
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
		fieldTextRef :'name',
		fieldValueRef :'_id',
		form:{
			'method': 'POST',
			'enctype' : 'application/x-www-form-urlencoded'
		},
		fields:{
			_id:{
				type:'hidden',
				label:''
			},
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
		fieldTextRef :'name',
		fieldValueRef :'_id',
		form:{
			'method': 'POST',
			'enctype' : 'application/x-www-form-urlencoded'
		},
		fields:{
			_id:{
				type:'hidden',
				label:''
			},
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
		fieldTextRef :'username',
		fieldValueRef :'_id',
		form:{
			'method': 'POST',
			'enctype' : 'multipart/form-data'
		},
		fields:{
			_id:{
				type:'hidden',
				label:''
			},
			active:{
				type:'checkbox',
				label:'Activo',
				default:true
			},
			photo :{
				type:'file',
				label:'Foto',
				accept: 'image/*',
				required:true
			},
			password:{
				type:'password',
				label:'Contraseña',
				required:true
			},
			email:{
				type:'email',
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
		fieldTextRef :'_id',
		fieldValueRef :'_id',
		form:{
			'method': 'POST',
			'enctype' : 'application/x-www-form-urlencoded'
		},
		fields:{
			_id:{
				type:'hidden',
				label:''
			},
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
