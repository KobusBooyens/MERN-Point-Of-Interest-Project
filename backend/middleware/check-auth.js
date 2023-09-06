const jwt = require('jsonwebtoken')
require('dotenv').config()

const HttpError = require('../models/http-error')

module.exports = (req, res, next) => {
    try {
        if(req.method === 'OPTIONS') {
            return next()
        }

        const token = req.headers.authorization?.split(' ')[1]
        if(!token) {
           throw new Error('Auth token not provided')
        }

        const decodedToken = jwt.verify(token, process.env.JWT_KEY)
        req.userData = { userId: decodedToken.userId }
        next()
    } catch (err) {
        console.error(err)
        return next(new HttpError('Authentication failed.', 403))
    }
}
