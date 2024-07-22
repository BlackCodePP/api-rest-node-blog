const {Router} = require('express')
const router = Router()
const ArticuloControlador = require('../controladores/articulo')

// Rutas de prueba
router.get('/ruta-de-prueba', ArticuloControlador.prueba)
router.get('/curso', ArticuloControlador.curso)

// Ruta util
router.post('/crear', ArticuloControlador.crear)

module.exports = router