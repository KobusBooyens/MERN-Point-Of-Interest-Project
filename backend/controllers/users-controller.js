const HttpError = require('../models/http-error')
const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({}, '-password')
        res.status(200).json({ users: users.map(user => user.toObject({ getters: true })) })
    } catch (err) {
        return next(new HttpError(`Failed to get users. Error: ${err.message}`, 500))
    }
}

const getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.uid)
        if (!user) {
            return next(new HttpError('Could not find the user', 404))
        }

        res.status(200).json({ result: user })
    } catch (err) {
        return next(new HttpError(`Failed to get users. Error: ${err.message}`, 500))
    }
}

const signup = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        // eslint-disable-next-line no-console
        console.log(errors)
        return next(new HttpError('Failed to process request due to one or more invalid parameters.', 422))
    }

    const { name, email, password } = req.body

    try {
        if (await User.findOne({ email: email })) {
            return next(new HttpError('The email provided already exists. Please try again.', 500))
        }

        let hashedPassword
        try {
            hashedPassword = await bcrypt.hash(password, 12)
        } catch (err) {
            console.error(err)
            return next(new HttpError('Could not create a user. Please try again.', 500))
        }

        const user = await User({
            name,
            email,
            password: hashedPassword,
            imageUrl: `${req.file.path}`,
            places: []
        }).save()

        let token
        try {
             token = jwt.sign(
                { userId: user.id, email: user.email },
                 process.env.JWT_KEY,
                { expiresIn: '1h' }
            )
        } catch (err) {
            return next(new HttpError(`Something went wrong while signing up user. Error: ${err.message}`, 500))
        }

        res.status(201).json( {
                userId: user.id,
                email: user.email,
                token: token
        })
    } catch (err) {
        return next(new HttpError(`Failed to sign up user. Error: ${err.message}`, 500))
    }
}

const login = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        // eslint-disable-next-line no-console
        console.log(errors)
        return next(new HttpError('Failed to process request due to one or more invalid parameters.', 422))
    }

    const { email, password } = req.body

    try {
        const userByEmail = await User.findOne({ email: email })

        if (!userByEmail) {
            return next(new HttpError('Invalid credentials provided. Please try again.', 403))
        }

        let isValidPassword = false
        try {
            isValidPassword = await bcrypt.compare(password, userByEmail.password)
            if(isValidPassword) {

                let token
                try {
                    token = jwt.sign(
                        { userId: userByEmail.id, email: userByEmail.email },
                        process.env.JWT_KEY,
                        { expiresIn: '1h' }
                    )
                } catch (err) {
                    return next(new HttpError(`Something went wrong while logging up user. Error: ${err.message}`, 500))
                }

                res.status(200).json({
                        userId: userByEmail.id,
                        email: userByEmail.email,
                        token: token
                })
            } else {
                return next(new HttpError('Invalid credentials provided. Please try again.', 500))
            }
        } catch (err) {
            return next(new HttpError(`Failed to authenticate user. Please try again. `, 500))
        }
    } catch (err) {
        return next(new HttpError(`Failed to login user. Error: ${err.message}`, 500))
    }
}

exports.getAllUsers = getAllUsers
exports.getUserById = getUserById
exports.signup = signup
exports.login = login
