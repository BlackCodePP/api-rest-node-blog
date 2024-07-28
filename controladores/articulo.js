const validator = require('validator')
const Articulo = require('../modelos/Articulo')
const res = require('express/lib/response')

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

const listar = async(req, res) => {

    try {
        let consulta = Articulo.find({})

        let articulos = await consulta.sort({fecha: -1}).exec();

        if(!articulos) {
            return res.status(404).json({
                status: 'error',
                mensaje: 'No se han encontrado articulos'
            });
        }
        
        return res.status(200).json({
            status:'succes',
            articulos
        });

    }catch(error) {
        return res.status(500).json({
            status:'error',
            mensaje: 'Se ha producido un error',
            error
        });
    }
}

const uno = async (req, res) => {
    try {
        // Recoger id por la URL
        let id = req.params.id;

        // Buscar el articulo por el id
        let articulo = await Articulo.findById(id);

        // Si no existe devolver un error
        if (!articulo) {
            return res.status(404).json({
                status: 'error',
                mensaje: 'No se ha encontrado el articulo'
            });
        }

        // Devolver el articulo si existe
        return res.status(200).json({
            status: 'success',
            articulo
        });
    } catch (error) {
        // Manejar errores del servidor
        return res.status(500).json({
            status: 'error',
            mensaje: 'Error al buscar el articulo'
        });
    }
};

const borrar = async (req, res) => {
    try {
        let id = req.params.id;

        // Usamos findOneAndDelete con await y sin callback
        let articuloBorrado = await Articulo.findOneAndDelete({ _id: id });

        if (!articuloBorrado) {
            return res.status(404).json({
                status: 'error',
                mensaje: 'No se ha encontrado el articulo'
            });
        }

        return res.status(200).json({
            status: 'success',
            articulo: articuloBorrado,
            mensaje: 'Articulo borrado'
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            error: error,
            mensaje: 'Error al borrar el articulo'
        });
    }
};



module.exports = {
    prueba,
    curso,
    crear,
    listar,
    uno,
    borrar
}