import React from 'react'
import ReactDOM from 'react-dom'
import { Router } from 'react-router-dom'
import { ApolloProvider } from 'react-apollo'
import client from 'client'
import history from './history'
import 'index.css'
import App from 'App'
import registerServiceWorker from 'registerServiceWorker'

const renderMethod = module.hot ? ReactDOM.render : ReactDOM.hydrate

renderMethod(
  <ApolloProvider client={client}>
    <Router history={history}>
      <App />
    </Router>
  </ApolloProvider>,
  document.getElementById('root')
)
registerServiceWorker()
