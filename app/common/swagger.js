const path = require('path')
const compile = require('protobuf-jsonschema')
const dir = require('dir_filenames')
const appRoot = require('app-root-path')


async function getComponent () {
  let component = {}
  const filenames = dir(`${appRoot}/app/models`)
  let filenameArray, popFileNameArr, filePath, modelName, schemaName, schema, type, properties
  await Promise.all(
    filenames.map(async (filename) => {
      filenameArray = filename.split('/')
      popFileNameArr = filenameArray.pop()
      filePath = path.join(`${appRoot}/app/models/` + popFileNameArr)
      modelName = popFileNameArr.replace(/\.\w+$/, '')
      schemaName = modelName.slice(0, 1).toUpperCase() + modelName.slice(1)
      schema = await compile(filePath, schemaName)
      type = schema.definitions[schemaName].type
      properties = schema.definitions[schemaName].properties
      component[schemaName] = {
        type: type,
        properties: properties
      }
    })
  )
  return component
}
