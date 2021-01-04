// Copied and pasted from https://github.com/joaonuno/tree-model-js
// Auto-updated by VS Code to use classes instead of constructors
//
// This file isn't required and I could just use the npm package, however it
// might be nice to change this to use mobx observables in the future and not
// have to worry about the state becoming out of sync with the UI.

import mergeSort from "mergesort"
import findInsertIndex from "find-insert-index"

var walkStrategies

walkStrategies = {}

function k(result) {
  return function () {
    return result
  }
}

class TreeModel {
  constructor(config) {
    config = config || {}
    this.config = config
    this.config.childrenPropertyName = config.childrenPropertyName || "children"
    this.config.modelComparatorFn = config.modelComparatorFn
  }

  parse(model) {
    var i, childCount, node

    if (!(model instanceof Object)) {
      throw new TypeError("Model must be of type object.")
    }

    node = new Node(this.config, model)
    if (model[this.config.childrenPropertyName] instanceof Array) {
      if (this.config.modelComparatorFn) {
        model[this.config.childrenPropertyName] = mergeSort(
          this.config.modelComparatorFn,
          model[this.config.childrenPropertyName]
        )
      }
      for (
        i = 0, childCount = model[this.config.childrenPropertyName].length;
        i < childCount;
        i++
      ) {
        addChildToNode(
          node,
          this.parse(model[this.config.childrenPropertyName][i])
        )
      }
    }
    return node
  }
}

function addChildToNode(node, child) {
  child.parent = node
  node.children.push(child)
  return child
}

class Node {
  constructor(config, model) {
    this.config = config
    this.model = model
    this.children = []
  }

  getChildren() {
    return this.children
  }

  toJS() {}

  isRoot() {
    return this.parent === undefined
  }

  hasChildren() {
    return this.children.length > 0
  }

  addChild(child) {
    return addChild(this, child)
  }

  addChildAtIndex(child, index) {
    if (hasComparatorFunction(this)) {
      throw new Error(
        "Cannot add child at index when using a comparator function."
      )
    }

    return addChild(this, child, index)
  }

  setIndex(index) {
    if (hasComparatorFunction(this)) {
      throw new Error("Cannot set node index when using a comparator function.")
    }

    if (this.isRoot()) {
      if (index === 0) {
        return this
      }
      throw new Error("Invalid index.")
    }

    if (index < 0 || index >= this.parent.children.length) {
      throw new Error("Invalid index.")
    }

    var oldIndex = this.parent.children.indexOf(this)

    this.parent.children.splice(
      index,
      0,
      this.parent.children.splice(oldIndex, 1)[0]
    )

    this.parent.model[this.parent.config.childrenPropertyName].splice(
      index,
      0,
      this.parent.model[this.parent.config.childrenPropertyName].splice(
        oldIndex,
        1
      )[0]
    )

    return this
  }

  getPath() {
    var path = []
    ;(function addToPath(node) {
      path.unshift(node)
      if (!node.isRoot()) {
        addToPath(node.parent)
      }
    })(this)
    return path
  }

  getIndex() {
    if (this.isRoot()) {
      return 0
    }
    return this.parent.children.indexOf(this)
  }

  walk() {
    var args
    args = parseArgs.apply(this, arguments)
    walkStrategies[args.options.strategy].call(this, args.fn, args.ctx)
  }

  all() {
    var args,
      all = []
    args = parseArgs.apply(this, arguments)
    args.fn = args.fn || k(true)
    walkStrategies[args.options.strategy].call(
      this,
      function (node) {
        if (args.fn.call(args.ctx, node)) {
          all.push(node)
        }
      },
      args.ctx
    )
    return all
  }

  first() {
    var args, first
    args = parseArgs.apply(this, arguments)
    args.fn = args.fn || k(true)
    walkStrategies[args.options.strategy].call(
      this,
      function (node) {
        if (args.fn.call(args.ctx, node)) {
          first = node
          return false
        }
      },
      args.ctx
    )
    return first
  }

  drop() {
    var indexOfChild
    if (!this.isRoot()) {
      indexOfChild = this.parent.children.indexOf(this)
      this.parent.children.splice(indexOfChild, 1)
      this.parent.model[this.config.childrenPropertyName].splice(
        indexOfChild,
        1
      )
      this.parent = undefined
      delete this.parent
    }
    return this
  }
}

function hasComparatorFunction(node) {
  return typeof node.config.modelComparatorFn === "function"
}

function addChild(self, child, insertIndex) {
  var index

  if (!(child instanceof Node)) {
    throw new TypeError("Child must be of type Node.")
  }

  child.parent = self
  if (!(self.model[self.config.childrenPropertyName] instanceof Array)) {
    self.model[self.config.childrenPropertyName] = []
  }

  if (hasComparatorFunction(self)) {
    // Find the index to insert the child
    index = findInsertIndex(
      self.config.modelComparatorFn,
      self.model[self.config.childrenPropertyName],
      child.model
    )

    // Add to the model children
    self.model[self.config.childrenPropertyName].splice(index, 0, child.model)

    // Add to the node children
    self.children.splice(index, 0, child)
  } else {
    if (insertIndex === undefined) {
      self.model[self.config.childrenPropertyName].push(child.model)
      self.children.push(child)
    } else {
      if (insertIndex < 0 || insertIndex > self.children.length) {
        throw new Error("Invalid index.")
      }
      self.model[self.config.childrenPropertyName].splice(
        insertIndex,
        0,
        child.model
      )
      self.children.splice(insertIndex, 0, child)
    }
  }
  return child
}

/**
 * Parse the arguments of traversal functions. These functions can take one optional
 * first argument which is an options object. If present, this object will be stored
 * in args.options. The only mandatory argument is the callback function which can
 * appear in the first or second position (if an options object is given). This
 * function will be saved to args.fn. The last optional argument is the context on
 * which the callback function will be called. It will be available in args.ctx.
 *
 * @returns Parsed arguments.
 */
function parseArgs() {
  var args = {}
  if (arguments.length === 1) {
    if (typeof arguments[0] === "function") {
      args.fn = arguments[0]
    } else {
      args.options = arguments[0]
    }
  } else if (arguments.length === 2) {
    if (typeof arguments[0] === "function") {
      args.fn = arguments[0]
      args.ctx = arguments[1]
    } else {
      args.options = arguments[0]
      args.fn = arguments[1]
    }
  } else {
    args.options = arguments[0]
    args.fn = arguments[1]
    args.ctx = arguments[2]
  }
  args.options = args.options || {}
  if (!args.options.strategy) {
    args.options.strategy = "pre"
  }
  if (!walkStrategies[args.options.strategy]) {
    throw new Error(
      "Unknown tree walk strategy. Valid strategies are 'pre' [default], 'post' and 'breadth'."
    )
  }
  return args
}

walkStrategies.pre = function depthFirstPreOrder(callback, context) {
  var i, childCount, keepGoing
  keepGoing = callback.call(context, this)
  for (i = 0, childCount = this.children.length; i < childCount; i++) {
    if (keepGoing === false) {
      return false
    }
    keepGoing = depthFirstPreOrder.call(this.children[i], callback, context)
  }
  return keepGoing
}

walkStrategies.post = function depthFirstPostOrder(callback, context) {
  var i, childCount, keepGoing
  for (i = 0, childCount = this.children.length; i < childCount; i++) {
    keepGoing = depthFirstPostOrder.call(this.children[i], callback, context)
    if (keepGoing === false) {
      return false
    }
  }
  keepGoing = callback.call(context, this)
  return keepGoing
}

walkStrategies.breadth = function breadthFirst(callback, context) {
  var queue = [this]
  ;(function processQueue() {
    var i, childCount, node
    if (queue.length === 0) {
      return
    }
    node = queue.shift()
    for (i = 0, childCount = node.children.length; i < childCount; i++) {
      queue.push(node.children[i])
    }
    if (callback.call(context, node) !== false) {
      processQueue()
    }
  })()
}

export default TreeModel
