const validator = require('validator')
const Articulo = require('../modelos/Articulo')

const prueba = (req,res) => {
    return res.status(200).json({
        mensaje: 'Soy una accion de prueba en mi controlador de articulos'
    })
}

const curso = (req, res) => {
    console.log('Se ha ejecutado el endponit probando')

    return res.status(200).json([
        {
            curso: 'Master en React',
            autor: 'Victor Robles WEB',
            url: 'victorroblesweb.es/master-react'
        },
        {
            curso: 'Master en React',
            autor: 'Victor Robles WEB',
            url: 'victorroblesweb.es/master-react' 
        }
    ])
}

const crear = (req, res) => {

    // Recoger los datos por post
    let parametros = req.body

    // Validar los datos
    try {
        let validar_titulo = !validator.isEmpty(parametros.titulo) &&
        validator.isLength(parametros.titulo, {min: 5, max: undefined})

        let validar_contenido = !validator.isEmpty(parametros.contenido)

        if(!validar_titulo || !validar_contenido) {
            throw new Error('No de ha validado la información')
        }
    }catch(error) {
        return res.status(400).json({
            status: 'error',
            mensaje: 'Faltan datos por enviar'
        })
    }

    // Crear el objeto a guardar
    const articulo = new Articulo(parametros)

    // Guardar el articulo en la base de datos
    articulo.save().then((articuloGuardado) => {
        if(!articuloGuardado) {
            return res.status(400).json({
                status: 'error',
                mensaje: 'No se ha guardado el articulo'
            })
        }

        // Devolver el resultado
        return res.status(200).json({
            status: 'succes',
            articulo: articuloGuardado
        })
    })
    .catch((error) => {
            return res.status(500).json({
                status: 'error',
                mensaje: 'Ha ocurrido un error',
                error: error
            })
    })
}

module.exports = {
    prueba,
    curso,
    crear
}