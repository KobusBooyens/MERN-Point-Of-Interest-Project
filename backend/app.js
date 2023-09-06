const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')
const cors = require('cors')
require('dotenv').config()

const HttpError = require('./models/http-error')
const placesRoutes = require('./routes/places-routes')
const usersRoutes = require('./routes/users-routes')

const app = express()
app.use(cors())
const PORT = process.env.PORT || 7000

app.use(bodyParser.json())
app.use('/uploads/images', express.static(path.join('uploads', 'images')))
app.use('/api/places', placesRoutes)
app.use('/api/users', usersRoutes)

app.use(() => {
    throw new HttpError('Invalid route provided', 403)
})

app.use((err, req, res, next) => {
    if (req.file) {
        fs.unlink(req.file.path, (err) => {
            // eslint-disable-next-line no-console
            console.log(err)
        })
    }

    if (res.headerSent) {
        return next(err)
    }
    res.status(err.code || 500).json({ message: err.message || 'An unknown error occurred!' })
})

mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.cejknaj.mongodb.net` +
    `/${process.env.DB_NAME}?retryWrites=true&w=majority`)
    .then(() => {
        app.listen(PORT, () => {
            // eslint-disable-next-line no-console
            console.info(`Server is listening on port ${PORT}.`)
        })
    })
    .catch(err => {
        // eslint-disable-next-line no-console
        console.log('Failed to connect to database', err)
    })
