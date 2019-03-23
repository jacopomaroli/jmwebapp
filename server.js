import 'isomorphic-fetch'
import path from 'path'
import express from 'express'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { StaticRouter as Router } from 'react-router-dom'
import Helmet from 'react-helmet'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { JSDOM } from 'jsdom'
import {
  ApolloProvider,
  getDataFromTree
} from 'react-apollo'
import Html from './Html'
import App from './src/App'
import assets from './assets'
import fs from 'fs'

const indexHtml = fs.readFileSync('build/index.html', {
  encoding: 'utf-8'
})

const app = express()

app.use(express.static(path.resolve(__dirname, '../build'), { index: false }))

app.use(async (req, res) => {
  // console.log(req.url)
  global.window = {}
  global.isSSR = true
  global.jsdom = new JSDOM(indexHtml)
  const client = new ApolloClient({
    ssrMode: true,
    link: new HttpLink({
      // uri: 'https://31zrkwkkv.lp.gql.zone/graphql',
      uri: 'https://jacopomaroli.com/graphql',
      opts: {
        /* credentials: 'include',
        headers: {
          cookie: req.header('Cookie'),
        }, */
      }
    }),
    cache: new InMemoryCache()
  })
  const app = (
    <ApolloProvider client={client}>
      <Router location={req.url} context={{}}>
        <App />
      </Router>
    </ApolloProvider>
  )
  // Executes all graphql queries for the current state of application
  await getDataFromTree(app)
  // Extracts apollo client cache
  const state = client.extract()
  const content = ReactDOMServer.renderToStaticMarkup(app)
  const helmet = Helmet.renderStatic()
  const root = global.jsdom.window.document.getElementById('root')
  root.innerHTML = content
  const apolloState = global.jsdom.window.document.createElement('script')
  apolloState.innerHTML = `window.__APOLLO_STATE__=${JSON.stringify(state).replace(
    /</g,
    '\\u003c'
  )};`
  root.parentNode.insertBefore(apolloState, root.nextSibling)
  global.jsdom.window.document.querySelector('title').outerHTML = helmet.title.toString()
  global.jsdom.window.document.head.innerHTML += helmet.meta.toString()
  const html = global.jsdom.serialize()
  res.status(200)
  res.send(html)
  res.end()
})

const port = process.env.PORT || 8888

app.listen(port, () => {
  console.log(`Server on http://localhost:${port} port`)
})
