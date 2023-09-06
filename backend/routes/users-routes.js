const express = require('express')
const userController = require('../controllers/users-controller')
const { check } = require('express-validator')
const fileUpload = require('../middleware/file-upload')

const router = express.Router()

router.get('/', userController.getAllUsers)

router.get('/:uid', userController.getUserById)

router.post('/signup',
    fileUpload.single('image'),
    [
        check('name').not().isEmpty().withMessage('Name is required'),
        check('email').normalizeEmail().isEmail().withMessage('Invalid email address'),
        check('password').isLength({ min:6 }).withMessage('Password must be at least 6')
], userController.signup)

router.post('/:login', [
    check('email').isEmail().withMessage('Not a valid email'),
    check('password').isLength({ min:6 }).withMessage('Password must be at least 6')
], userController.login)

module.exports = router
