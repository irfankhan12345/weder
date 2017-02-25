const yargs = require('yargs')
const axios = require('axios')
require('dotenv').config()

const API_KEY = process.env.API_KEY

const argv = yargs
  .options({
    a: {
      alias: 'address',
      describe: 'Address to fetch weather for. If omitted the program will use location based on IP address.',
      string: true
    }
  })
  .help()
  .alias('help', 'h')
  .argv

axios.get('http://ipinfo.io').then((response) => {
  if (argv.address === undefined) {
    argv.address = response.data.city
  }

  var encodedAddress = encodeURIComponent(argv.address)
  var locationUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}`

  return axios.get(locationUrl)
}).then((response) => {
  if (response.data.status === 'ZERO_RESULTS') {
    throw new Error('Unable to find the address. Try again.')
  }
  var address = response.data.results[0].formatted_address
  var latitude = response.data.results[0].geometry.location.lat
  var longitude = response.data.results[0].geometry.location.lng
  var weatherUrl = `https://api.darksky.net/forecast/${API_KEY}/${latitude},${longitude}?units=si`
  console.log(`Getting weather for ${address}`)
  return axios.get(weatherUrl)
}).then((response) => {
  var currently = response.data.currently
  console.log(`Current temperature is ${currently.temperature}\u00b0C`)
  console.log(`Although it feels like ${currently.apparentTemperature}\u00b0C`)
  console.log(`It's mostly ${currently.summary} with humidity at ${currently.humidity}`)
}).catch((error) => {
  if (error.code === 'ENOTFOUND') {
    console.log('Unable to connect to the server. Please try again later.')
  } else if (error.response.status === 404) {
    console.log('Unable to fetch weather.')
  } else {
    console.log(error.message)
  }
})
