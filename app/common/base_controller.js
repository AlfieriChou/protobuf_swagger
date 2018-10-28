const Validator = require('jsonschema').Validator
const v = new Validator()

class BaseController {
  /**
   * @param {object} model swagger requestBody
   * @param {object} params request params
   */
  async validate (model, params) {
    const jsonSchema = { type: 'object' }
    jsonSchema.properties = model.requestBody.body
    jsonSchema.required = model.requestBody.required
    const result = await v.validate(params, jsonSchema)
    return new Promise((resolve, reject) => {
      if (result.errors[0]) {
        const err = result.errors[0].stack
        reject(err)
      } else {
        resolve(result)
      }
    })
  }
}

module.exports = BaseController
