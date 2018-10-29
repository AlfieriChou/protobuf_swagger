// const path = require('path')
// const compile = require('protobuf-jsonschema')

// async function getComponent () {
//   let component = {}
//   const filenames = dir(`${appRoot}/app/models`)
//   let filenameArray, popFileNameArr, filePath, modelName, schemaName, schema, type, properties
//   await Promise.all(
//     filenames.map(async (filename) => {
//       filenameArray = filename.split('/')
//       popFileNameArr = filenameArray.pop()
//       filePath = path.join(`${appRoot}/app/models/` + popFileNameArr)
//       modelName = popFileNameArr.replace(/\.\w+$/, '')
//       schemaName = modelName.slice(0, 1).toUpperCase() + modelName.slice(1)
//       schema = await compile(filePath, schemaName)
//       type = schema.definitions[schemaName].type
//       properties = schema.definitions[schemaName].properties
//       component[schemaName] = {
//         type: type,
//         properties: properties
//       }
//     })
//   )
//   return component
// }

const dir = require('dir_filenames')
const appRoot = require('app-root-path')
const _ = require('lodash')
const component = require('../models')
component.ErrorModel = {
  'type': 'object',
  'required': [
    'message',
    'code'
  ],
  'properties': {
    'message': {
      'type': 'string'
    },
    'code': {
      'type': 'integer',
      'minimum': 100,
      'maximum': 600
    }
  }
}

const swaggerPath = (item) => {
  const content = {
    tags: item.tags,
    summary: item.summary
  }
  if (item.query) {
    content.parameters = []
    for (let prop in item.query) {
      let field = {}
      field.name = prop
      field.in = 'query'
      field.description = item.query[prop].description
      field.schema = {
        'type': item.query[prop].type
      }
      field.required = false
      content.parameters.push(field)
    }
  }
  if (item.requestBody) {
    let request = {}
    let params = item.requestBody.body
    request.requestBody = {}
    let bodySchema = request.requestBody
    bodySchema.required = true
    bodySchema.content = {
      'application/json': {
        'schema': {
          'type': 'object',
          'properties': params,
          'required': item.requestBody.required
        }
      }
    }
    content.requestBody = request.requestBody
  }
  if (item.params) {
    content.parameters = []
    for (let prop in item.params) {
      let field = {}
      field.name = prop
      field.in = 'path'
      field.description = item.params[prop].description
      field.schema = {
        'type': item.params[prop].type
      }
      field.required = true
      content.parameters.push(field)
    }
  }
  return content
}

const swaggerResponse = (item) => {
  let result = {}
  const typeList = ['array', 'object', 'number', 'string']
  if (typeList.indexOf(item.type) < 0) throw new Error('output type mast ba array, object, number or string!')
  switch (item.type) {
    case 'array':
      const arrayResult = item.result ? item.result : { type: 'object', properties: {} }
      result = {
        type: 'array',
        items: {
          type: 'object',
          properties: arrayResult
        }
      }
      break
    case 'object':
      const objectResult = item.result ? item.result : { type: 'object', properties: {} }
      result = {
        type: 'object',
        properties: objectResult
      }
      break
    case 'number':
      const code = { type: 'number', description: '返回标识' }
      result = {
        type: 'object',
        properties: {
          result: code
        }
      }
      break
    case 'string':
      const stringDesc = { type: 'string', description: '返回描述' }
      result = {
        type: 'object',
        properties: {
          result: stringDesc
        }
      }
      break
  }
  return result
}

const generateSwagger = (info) => {
  const items = dir(`${appRoot}/app/swagger`)
  _.remove(items, n => {
    return n === `${appRoot}/app/swagger/index.js`
  })
  let methods = []
  let components = {}
  components.schemas = component
  items.map(item => {
    let model = require(item)
    const fileName = item.split('/').pop().replace(/\.\w+$/, '')
    let schemaName = fileName.slice(0, 1).toUpperCase() + fileName.slice(1)
    for (let index in model) {
      const content = swaggerPath(model[index])
      let result
      if (model[index].output) {
        result = swaggerResponse(model[index].output)
      }
      const schema = model[index].output ? result : { $ref: `#/components/schemas/${schemaName}` }
      content.responses = {
        200: {
          'description': 'response success',
          'content': {
            'application/json': {
              'schema': schema
            }
          }
        },
        default: {
          'description': 'error payload',
          'content': {
            'application/json': {
              'schema': {
                '$ref': '#/components/schemas/ErrorModel'
              }
            }
          }
        }
      }
      let swaggerMethod = {}
      swaggerMethod[(model[index].method).toString()] = content
      let swaggerItem = {}
      swaggerItem[(model[index].path).toString()] = swaggerMethod
      methods.push(swaggerItem)
    }
  })
  let mergeMethod = {}
  for (let i = 0; i < methods.length; ++i) {
    mergeMethod = _.merge(mergeMethod, methods[i])
  }
  let swagger = {}
  swagger.openapi = '3.0.0'
  swagger.info = info
  swagger.paths = mergeMethod
  swagger.components = components
  return swagger
}

module.exports = {
  generateSwagger
}
