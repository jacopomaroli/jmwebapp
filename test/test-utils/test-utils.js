
import { URL } from 'whatwg-url'

const permalink2abs = permalink => new URL(permalink.replace('/uncategorized', '')).pathname

const GenericMock = function (component) {
  const self = this
  self.component = component
  self.mocks = {}

  self.mockMethod = function (method, _component) {
    _component = _component || self.component
    self.mocks[method] = {}
    self.mocks[method].actual = _component[method]
    _component[method] = self.generateMethodMock(method)
  }

  self.generateMethodMock = function (method) {
    return function () {
      let ret
      if (self.mocks[method].actual) {
        ret = self.mocks[method].actual.apply(this, arguments)
      }
      if (self.mocks[method].resolve) {
        self.mocks[method].resolve()
      }
      return ret
    }
  }

  self.getWaitingPromise = function (method) {
    return function () {
      return new Promise(function (resolve, reject) {
        self.mocks[method].resolve = resolve
        self.mocks[method].reject = reject
      })
    }
  }
}

export {
  permalink2abs,
  GenericMock
}
