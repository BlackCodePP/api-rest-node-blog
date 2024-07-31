const fs = require('fs')
const path = require('path')
const Articulo = require('../modelos/Articulo')
const res = require('express/lib/response')
const { validar } = require('../helpers/validar')
const { error } = require('console')

// Crear un articulo
const crear = (req, res) => {

    // Recoger los datos por post
    let parametros = req.body

    // Validar los datos
    try {
        validar(parametros) // Helper de validacion
    } catch (error) {
        return res.status(404).json({
            status: 'error',
            error: error,
            mensaje: 'Faltan campos requeridos'
        });
    }

    // Crear el objeto a guardar
    const articulo = new Articulo(parametros)

    // Guardar el articulo en la base de datos
    articulo.save().then((articuloGuardado) => {
        if (!articuloGuardado) {
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

// Mostrar todos los articulos
const listar = async (req, res) => {

    try {
        let consulta = Articulo.find({})

        let articulos = await consulta.sort({ fecha: -1 }).exec();

        if (!articulos) {
            return res.status(404).json({
                status: 'error',
                mensaje: 'No se han encontrado articulos'
            });
        }

        return res.status(200).json({
            status: 'succes',
            articulos
        });

    } catch (error) {
        return res.status(500).json({
            status: 'error',
            mensaje: 'Se ha producido un error',
            error
        });
    }
}

// Mostrar un articulo en concreto
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

// Eliminar un articulo
const borrar = async (req, res) => {
    try {
        let id = req.params.id;

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

// Modificar un articulo
const editar = async (req, res) => {
    try {
        let id = req.params.id;
        let parametros = req.body

        try {
            validar(parametros)
        } catch (error) {
            return res.status(404).json({
                status: 'error',
                error: error,
                mensaje: 'Faltan campos requeridos'
            });
        }

        let articuloEditado = await Articulo.findOneAndUpdate({ _id: id }, parametros, { new: true })

        if (!articuloEditado) {
            return res.status(404).json({
                status: 'error',
                mensaje: 'No se ha encontrado el articulo'
            });
        }

        return res.status(200).json({
            status: 'success',
            articulo: articuloEditado,
            mensaje: 'Articulo editado'
        });

    } catch (error) {
        return res.status(400).json({
            status: 'error',
            error: error,
            mensaje: 'Ha ocurrido un error'
        })
    }
}

// Subir una imagen a un articulo
const subir = async (req, res) => {

    // Recoger el fichero de imagen subido
    if (!req.file && !req.files) {
        return res.status(404).json({
            status: 'error',
            mensaje: 'Petición invalida'
        })
    }

    // Nombre del archivo
    let nombreArchivo = req.file.originalname

    // Extension del archivo
    let archivo_split = nombreArchivo.split('\.')
    let archivo_extension = archivo_split[1]

    // Comprobar extension correcta
    if (archivo_extension != 'png' && archivo_extension != 'jpg' &&
        archivo_extension != 'jpeg' && archivo_extension != 'gif') {
        // Borrar archivo y dar respuesta
        fs.unlink(req.file.path, (error) => {
            return res.status(400).json({
                status: 'error',
                error: error,
                mensaje: 'Imagen invalida'
            })
        })
    } else {
        try {
            let id = req.params.id;

            let articuloEditado = await Articulo.findOneAndUpdate({ _id: id }, { imagen: req.file.filename }, { new: true })

            if (!articuloEditado) {
                return res.status(404).json({
                    status: 'error',
                    mensaje: 'No se ha encontrado el articulo'
                });
            }

            return res.status(200).json({
                status: 'success',
                articulo: articuloEditado,
                mensaje: 'Articulo editado'
            });

        } catch (error) {
            return res.status(400).json({
                status: 'error',
                error: error,
                mensaje: 'Ha ocurrido un error'
            })
        }
    }
}

// Buscar una imagen de un articulo
const imagen = (req, res) => {
    let fichero = req.params.fichero
    let ruta_fisica = './imagenes/articulos/' + fichero

    fs.stat(ruta_fisica, (error, existe) => {
        if (existe) {
            return res.sendFile(path.resolve(ruta_fisica))
        } else {
            return res.status(404).json({
                status: 'error',
                error: error,
                mensaje: 'La imagen no existe'
            })
        }
    })
}

// Filtrado de articulos
const buscador = async (req, res) => {
    try {
        // Sacar string de búsqueda
        let busqueda = req.params.busqueda;

        // Find OR
        let articulosEncontrados = await Articulo.find({
            '$or': [
                { 'titulo': { '$regex': busqueda, '$options': 'i' } },
                { 'contenido': { '$regex': busqueda, '$options': 'i' } }
            ]
        })
            // Ordenar
            .sort({ fecha: -1 })

            // Ejecutar consulta
            .exec();

        // Si no se encuentran artículos
        if (!articulosEncontrados || articulosEncontrados.length <= 0) {
            return res.status(404).json({
                status: 'error',
                mensaje: 'No se han encontrado artículos'
            });
        }

        // Devolver resultado
        return res.status(200).json({
            status: 'success',
            articulos: articulosEncontrados
        });

    } catch (error) {
        return res.status(500).json({
            status: 'error',
            mensaje: 'Error en la búsqueda',
            error: error.message
        });
    }
}


module.exports = {
    crear,
    listar,
    uno,
    borrar,
    editar,
    subir,
    imagen,
    buscador
}