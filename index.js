(function (root, factory) {
  'use strict'
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory)
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory()
  } else {
    // Browser globals (root is window)
    root.LineOut = factory()
  }
}(this, function () {
  'use strict'

  /**
   * Returns an instance of simplified Web Audio
   * Node creation APIs
   *
   * @param {AudioContext} ctx
   * @return Object
   **/

  function LineOut(ctx) {
    var nodes = []
    var pipings = []
    var api = Object.keys(AudioContext.prototype)
      .filter(function(k){ return k.startsWith('create') })
      .reduce(function(api, k) {
        api[k] = function(/* args */) {
          var args = [].slice.call(arguments)
          var name = 'string' == typeof args[0] ? args.shift() : 'no_name'
          var newNode = ctx[k].apply(ctx, args)
          nodes.push({ node: newNode , name: name })

          if (this._node) {
            this._node.connect(newNode)
          }

          var subApi = Object.create(api)
          subApi._node = newNode
          return subApi
        }
        return api
      }, {
        context: ctx,
        options: function(func) {
          func(this._node, ctx)
          return this
        },
        lineout: function() {
          pipings.forEach(function(p) {
            var expArr = p.expression.split('.')
            var node = nodes.find(function(desc){
              return desc.name === expArr[0]
            }).node
            if (expArr.length > 1) {
              node = node[expArr[1]]
            }
            p.node.connect.apply(p.node, [node].concat(p.args))
          })
          this._node.connect(ctx.destination)
          // cleanup
          nodes = []
          pipings = []
        },
        pipe: function(/* expression|node, ...args */){
          var args = [].slice.call(arguments)
          var expression = args.shift()

          if ('string' == typeof expression) {
            pipings.push({ args, expression, node: this._node, })
          } else {
            this._node.connect.apply(this._node, [expression._node].concat(args))
          }

          return this
        }
      })

    return api
  }

  /**
   * Load content from given url and decode the array buffer
   * to decoded audio data
   *
   * @param {String} url
   * @param {AudioContext} ctx
   * @return Promise
   **/

  LineOut.loadBuffer = function(url, ctx) {
    return new Promise(function(good, bad) {
      var request = new XMLHttpRequest()
      request.open('GET', url)
      request.responseType = 'arraybuffer'
      request.onload = function() {
        ctx.decodeAudioData(request.response, function(buffer){
          good(buffer)
        })
      }
      request.send()
    })
  }

  return LineOut
}));
