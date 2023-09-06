const HttpError = require('../models/http-error')
const { validationResult } = require('express-validator')
const fs = require('fs')
const Place = require('../models/place')
const User = require('../models/user')

const getCoordsForAddress = require('../utils/location')
const { startSession } = require('mongoose')

const getPlaceById = async (req, res, next) => {
    try {
        const place = await Place.findById(req.params.pid)
        if (!place) {
            next(new HttpError('Could not find the place', 404))
        }
        return res.status(200).json({ place: place.toObject({ getters: true }) })
    } catch (err) {
        return next(new HttpError(`Failed to get place. Error: ${err.message}`, 500))
    }
}

const getPlacesByUserId = async (req, res, next) => {
    try {
        const places = await Place.find({ creator: req.params.uid })

        if (!places || places.length === 0) {
            next(new HttpError('Could not find a place for the user', 404))
        }

        return res.status(200).json({ places: places.map(place => place.toObject({ getters: true })) })
    } catch (err) {
        return next(new HttpError(`Failed to get places for user. Error: ${err.message}`, 500))
    }
}

const createPlace = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        // eslint-disable-next-line no-console
        console.log(errors)
        return next(new HttpError('Failed to process request due to one or more invalid parameters.', 422))
    }

    const { title, description, address } = req.body

    let coordinates
    try {
        coordinates = await getCoordsForAddress(address)
    } catch (err) {
        return next(err)
    }

    let user
    try {
        user = await User.findById(req.userData.userId)
        if (!user) {
            return next(new HttpError('Could not find a user', 404))
        }
    } catch (err) {
        return next(new HttpError(`Failed to find user. Error: ${err.message}`, 500))
    }

    const createdPlace = Place({
        title,
        description,
        location: coordinates,
        imageUrl: `${req.file.path}`,
        address,
        creator: user._id
    })

    try {
        const session = await startSession()
        session.startTransaction()
        await createdPlace.save({ session })
        user.places.push(createdPlace)
        await user.save({ session })
        await session.commitTransaction()
        res.status(201).json({ message: 'Place Created!', data: createdPlace.toObject({ getters: true }) })
    } catch (err) {
        return next(new HttpError(`Failed to create place. Error: ${err.message}`, 500))
    }
}

const updatePlace = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        // eslint-disable-next-line no-console
        console.log(errors)
        next(new HttpError('Failed to process request due to one or more invalid parameters.', 422))
    }

    let place
    try {
        place = await Place.findById(req.params.pid)
        if (!place) {
            next(new HttpError('Could not find a place', 404))
        }
    } catch (err) {
        return next(new HttpError(`An error occurred while trying to find the place. Error: ${err.message}`, 500))
    }

    if (place.creator.toString() !== req.userData.userId) {
        return next(new HttpError('You are not allowed to edit this place', 403))
    }

    try {
        const { title, description } = req.body
        place.title = title
        place.description = description
        await place.save()

        res.status(200).json({ message: 'Updated!', data: place })
    } catch (err) {
        return next(new HttpError(`Failed to update place. Error: ${err.message}`, 500))
    }
}

const deletePlace = async (req, res, next) => {
    let place
    try {
        place = await Place.findById(req.params.pid).populate('creator')
        if (!place) {
            return next(new HttpError('Could not find the place', 404))
        }
    } catch (err) {
        return next(new HttpError(`Failed to find place. Error: ${err.message}`, 500))
    }

    if (place.creator.id !== req.userData.userId) {
        return next(new HttpError('You are not allowed to delete this place', 403))
    }

    const imagePath = place.imageUrl

    try {
        const session = await startSession()
        session.startTransaction()
        await place.deleteOne({ session })
        place.creator.places.pull(place)
        await place.creator.save({ session })
        await session.commitTransaction({ session })

        res.status(200).json({ message: 'Deleted!' })
    } catch (err) {
        return next(new HttpError(`Failed to delete place. Error: ${err.message}`, 500))
    }

    fs.unlink(imagePath, err => { console.log(err) })
}

exports.getPlacesByUserId = getPlacesByUserId
exports.getPlaceById = getPlaceById
exports.createPlace = createPlace
exports.updatePlace = updatePlace
exports.deletePlace = deletePlace
