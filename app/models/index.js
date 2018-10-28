const convert = require('protobuf-model-schema')
const appRoot = require('app-root-path')

const jsonschema = convert(`${appRoot}/app/models`)

module.exports = jsonschema
