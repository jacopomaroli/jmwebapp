import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'

const apolloClient = new ApolloClient({
  ssrForceFetchDelay: 100,
  link: new HttpLink({
    // uri: 'https://31zrkwkkv.lp.gql.zone/graphql',
    uri: 'https://jacopomaroli.com/graphql',
    opts: {
      // credentials: 'include',
    }
  }),
  queryDeduplication: true,
  cache: new InMemoryCache().restore(window.__APOLLO_STATE__)
})

export default apolloClient
