// import React, { Component } from 'react'
// import ReactDOM from 'react-dom'
import { createBrowserHistory } from 'history'

const history = createBrowserHistory()

function maybeLoadContent () {
  // location.pathname
}

function myprompt (location, action) {
  if (typeof location.state === 'undefined') return true
  if (location.state.baseUrl === window.stateObj.baseUrl) {
    window.loadSamePage()
    /* if (window.stateObj.loadSamePage) {
      // window.stateObj.loadSamePage()
      window.loadSamePage()
    } */
    /* if (action === 'POP') {
      return true
    } */
    // TODO: maybeload and scroll to content
    maybeLoadContent()
    return false
  }
  return true
}

history.block(myprompt)

export default history
