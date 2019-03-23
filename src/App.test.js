import React from 'react'
import ReactDOM from 'react-dom'
import { Router } from 'react-router-dom'
import { ApolloProvider, gql, ApolloClient } from 'react-apollo'
import App from './App'
import { mockNetworkInterface } from 'react-apollo/test-utils'
import { addTypenameToDocument } from 'apollo-client'

it('renders without crashing', () => {
  var query = gql`
    query ArticlesListQuery {
      posts(post_type: "page", limit: 2) {
        id
        post_name
        post_date
      }
    }
  `
  var data = { posts: [ { post_type: 'page', id: '2', post_name: 'foo', post_date: 'bar' } ] }
  query = addTypenameToDocument(query)

  const networkInterface = mockNetworkInterface(
    { request: { query }, result: { data } }
  )

  const apolloClient = new ApolloClient({ networkInterface })

  const div = document.createElement('div')
  ReactDOM.render(
    <ApolloProvider client={apolloClient}>
      <Router>
        <App />
      </Router>
    </ApolloProvider>,
    div
  )
})
