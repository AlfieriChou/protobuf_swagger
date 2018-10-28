const schema = require('../swagger')
const BaseController = require('../common/base_controller')

class ProductController extends BaseController {
  async index (req, res) {
    const params = req.query
    res.json(params)
  }
  async create (req, res) {
    const params = req.body
    try {
      await super.validate(schema.product.create, params)
      res.json(params)
    } catch (err) {
      res.status(422).send(err)
    }
  }
}

module.exports = new ProductController()
