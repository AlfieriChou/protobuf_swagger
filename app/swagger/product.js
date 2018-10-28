const _ = require('lodash')
const components = require('../models')
const Product = components.Product.properties

module.exports = {
  index: {
    path: '/products',
    method: 'get',
    tags: ['product'],
    summary: '获取产品列表',
    query: Object.assign(
      _.pick(Product, ['name', 'price'])
    ),
    output: {
      type: 'array',
      result: Product
    }
  },
  create: {
    path: '/products',
    method: 'post',
    tags: ['product'],
    summary: '创建产品信息',
    requestBody: {
      body: _.pick(Product, ['name', 'price', 'desc']),
      required: ['name', 'price']
    },
    output: {
      type: 'object',
      result: Product
    }
  },
  show: {
    path: '/products/:id',
    method: 'get',
    tags: ['product'],
    summary: '获取产品详情',
    params: _.pick(Product, ['id'])
  },
  update: {
    path: '/products/:id',
    method: 'put',
    tags: ['product'],
    summary: '修改产品信息',
    params: _.pick(Product, ['id']),
    requestBody: {
      body: _.pick(Product, ['name', 'price', 'desc'])
    },
    output: {
      type: 'number'
    }
  }
}
