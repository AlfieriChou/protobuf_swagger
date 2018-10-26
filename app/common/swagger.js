const path = require('path')
const compile = require('protobuf-jsonschema')
const dir = require('dir_filenames')
const appRoot = require('app-root-path')

async function getComponent () {
  let component = {}
  const filenames = dir(`${appRoot}/app/models`)
  filenames.map(async (filename) => {
    let filenameArray = filename.split('/')
    let popFileNameArr = filenameArray.pop()
    let filePath = path.join(`${appRoot}/app/models/` + popFileNameArr)
    let modelName = popFileNameArr.replace(/\.\w+$/, '')
    let schemaName = modelName.slice(0, 1).toUpperCase() + modelName.slice(1)
    let schema = await compile(filePath, schemaName)
    let type = schema.definitions[schemaName].type
    let properties = schema.definitions[schemaName].properties
    component[schemaName] = {
      type: type,
      properties: properties
    }
  })
  return component
}
