require('dotenv').config()
const axios = require('axios')
const HttpError = require('../models/http-error')

const apiKey = process.env.API_KEY

const getCoordsForAddress = async (address) => {

    const url = process.env.GOOGLE_GEOCODE_URL
        .replace('[INSERT_ADDRESS]', encodeURIComponent(address))
        .replace('[INSERT_APIKEY]', apiKey)

    const response = await axios
        .get(url)

    if (!response.data || response.data.status === 'ZERO_RESULTS'){
        throw new HttpError('Could not find location for specified address', 422)
    }

    const coordinates = response.data.results[0].geometry.location
    return {
        lat: coordinates.lat,
        lng: coordinates.lng
    }
}

module.exports = getCoordsForAddress
