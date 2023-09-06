const express = require('express')
const placeController = require('../controllers/places-controller')
const { check } = require('express-validator')

const checkAuth = require('../middleware/check-auth')
const fileUpload = require('../middleware/file-upload')

const router = express.Router()

router.get('/:pid', placeController.getPlaceById)

router.get('/user/:uid', placeController.getPlacesByUserId)

router.use(checkAuth)

router.post('/',
    fileUpload.single('image'),
    [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 5 }),
    check('address').not().isEmpty()
], placeController.createPlace)

router.patch('/:pid', [
    check('title').isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
    check('description').isLength({ min: 5 }).withMessage('Description must be at least 5 characters'),
], placeController.updatePlace)

router.delete('/:pid', placeController.deletePlace)

module.exports = router
