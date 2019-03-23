import React from 'react'
import ReactDOM from 'react-dom'
import { Simulate } from 'react-dom/test-utils'
import { Router, Switch } from 'react-router-dom'
import history from '../../src/history'
import { html as beautifyHTML } from 'js-beautify'

import routes from '../../src/routes'
import PropsRoute from '../../src/components/routes/props-route'
import ArticlesListQuery from '../../src/components/queries/ArticlesListQuery'
import ArticleContentQuery from '../../src/components/queries/ArticleContentQuery'
import * as ArticlesListUtils from 'components/ArticlesListUtils'

import { ApolloProvider } from 'react-apollo'
import { ApolloClient } from 'apollo-client'
import { addTypenameToDocument } from 'apollo-utilities'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { defineFeature, loadFeature } from 'jest-cucumber'

import mockResponses from '../mocks/responses'
import { permalink2abs, GenericMock } from '../test-utils/test-utils'
import { mockLink } from '../test-utils/mock-link.ts'

const feature = loadFeature('test/integration/routing4.feature')

jest.setTimeout(999999)
global.isSSR = true

defineFeature(feature, test => {
  beforeEach(() => {
    jest.resetModules()
  })

  test('Routing with 0 articles between two visited articles', ({ given, when, then }) => {
    let div
    let myComponent
    let threeArticlesRoot1 = mockResponses.ArticleListData.threeArticlesRoot1
    let articleA = mockResponses.PostContentData.articleA
    let articleB = mockResponses.PostContentData.articleB
    let threeArticlesTutorials1 = mockResponses.ArticleListData.threeArticlesTutorials1
    let threeArticlesRootNewerThanB = mockResponses.ArticleListData.threeArticlesRootNewerThanB

    const link = mockLink()

    const apolloClient = new ApolloClient({
      link,
      cache: new InMemoryCache()
    })

    const genericMockList = [
      '../../src/components/ArticlesList',
      '../../src/components/PostContent',
      '../../src/components/PostsPage'
    ]

    const mockedModules = []

    genericMockList.forEach(modulePath => {
      const moduleName = modulePath.substring(modulePath.lastIndexOf('/') + 1)
      const actualModule = require.requireActual(modulePath)
      mockedModules[moduleName] = new GenericMock(actualModule)

      jest.doMock(modulePath, () => {
        return function () {
          const _defaultExport = mockedModules[moduleName].component.default
          if (_defaultExport.constructor) {
            return new _defaultExport(...arguments)
          }
          return _defaultExport.apply(this, arguments)
        }
      })
    })

    mockedModules['ArticlesList'].mockMethod('default')
    mockedModules['PostContent'].mockMethod('default')
    mockedModules['PostsPage'].mockMethod('componentDidMount', mockedModules['PostsPage'].component.default.prototype)

    given('I am a visitor attempting to navigate the website', () => {
      div = document.createElement('div')

      myComponent = (
        <ApolloProvider client={apolloClient}>
          <Router history={history}>
            <Switch>
              {routes.map(route => <PropsRoute key={route.name} {...route} />)}
            </Switch>
          </Router>
        </ApolloProvider>
      )
    })

    when('I open the homepage', () => {
      link.flushMockedResponses()
      link.addMockedResponse({ request: { query: addTypenameToDocument(ArticlesListQuery), variables: { permalink: '/%category%/%year%/%monthnum%/%postname%', postsCategory: 'Root', direction: 'DESC' } }, result: { data: threeArticlesRoot1 } })

      let waitStep = mockedModules['ArticlesList'].getWaitingPromise('default')

      ReactDOM.render(
        myComponent,
        div
      )

      return waitStep()
    })

    then('the browser should render articles in the "home" section', () => {
      const paramsThreeArticlesRoot1 = { data: { loading: null, error: null, posts: threeArticlesRoot1.category.posts, baseUrl: '/' }, disabled: false, showLoadNewer: true, showLoadOlder: true }
      paramsThreeArticlesRoot1.data.loadNewer = (postData) => ArticlesListUtils.genLoadNewer('/', postData)
      paramsThreeArticlesRoot1.data.loadOlder = (postData) => ArticlesListUtils.genLoadOlder('/', postData)
      paramsThreeArticlesRoot1.articlesListInstances = [
        {
          wrappedInstance: {
            props: {
              data: paramsThreeArticlesRoot1.data
            }
          }
        }
      ]
      paramsThreeArticlesRoot1.articlesListComponents = [
        {
          props: {
            disabled: false
          }
        }
      ]
      paramsThreeArticlesRoot1.parentInstance = paramsThreeArticlesRoot1.articlesListInstances[0].wrappedInstance
      const RetThreeArticlesRoot1 = mockedModules['ArticlesList'].component.default(paramsThreeArticlesRoot1, {})

      const assertComponent = <React.Fragment>{ RetThreeArticlesRoot1 }</React.Fragment>

      const divBase = document.createElement('div')
      ReactDOM.render(
        assertComponent,
        divBase
      )

      const divHTML = beautifyHTML(div.innerHTML, { indent_size: 2, space_in_empty_paren: true })
      const divBaseHTML = beautifyHTML(divBase.innerHTML.replace('\\"', '"'), { indent_size: 2, space_in_empty_paren: true })

      expect(window.location.pathname).toEqual('/')
      expect(divHTML).toEqual(divBaseHTML)
    })

    then('if I open article A', () => {
      link.flushMockedResponses()
      link.addMockedResponse({ request: { query: addTypenameToDocument(ArticleContentQuery), variables: { name: articleA.post.post_name } }, result: { data: articleA } })

      let waitStep = mockedModules['PostContent'].getWaitingPromise('default')

      const myTitle = div.querySelector('#post-' + articleA.post.id + ' .entry-title a')
      Simulate.click(myTitle)

      return waitStep()
    })

    then('the browser should render article A for the first time', () => {
      const paramsThreeArticlesRoot1 = { data: { loading: null, error: null, posts: threeArticlesRoot1.category.posts, baseUrl: '/' }, disabled: false, showLoadNewer: true, showLoadOlder: true }
      paramsThreeArticlesRoot1.data.loadNewer = (postData) => ArticlesListUtils.genLoadNewer('/', postData)
      paramsThreeArticlesRoot1.data.loadOlder = (postData) => ArticlesListUtils.genLoadOlder('/', postData)
      paramsThreeArticlesRoot1.articlesListInstances = [
        {
          wrappedInstance: {
            props: {
              data: paramsThreeArticlesRoot1.data
            }
          }
        }
      ]
      paramsThreeArticlesRoot1.articlesListComponents = [
        {
          props: {
            disabled: false
          }
        }
      ]
      paramsThreeArticlesRoot1.parentInstance = paramsThreeArticlesRoot1.articlesListInstances[0].wrappedInstance
      const RetThreeArticlesRoot1 = mockedModules['ArticlesList'].component.default(paramsThreeArticlesRoot1, {})

      const paramsArticleA = { data: { loading: null, error: null, posts: [ articleA.post ], baseUrl: '/' }, disabled: false, showLoadNewer: false, showLoadOlder: false }
      paramsArticleA.data.loadNewer = (postData) => ArticlesListUtils.genLoadNewer('/', postData)
      paramsArticleA.data.loadOlder = (postData) => ArticlesListUtils.genLoadOlder('/', postData)
      paramsArticleA.articlesListInstances = [
        {
          wrappedInstance: {
            props: {
              data: paramsArticleA.data
            }
          }
        }
      ]
      paramsArticleA.articlesListComponents = [
        {
          props: {
            disabled: false
          }
        }
      ]
      paramsArticleA.parentInstance = paramsArticleA.articlesListInstances[0].wrappedInstance
      const retArticleA = mockedModules['ArticlesList'].component.default(paramsArticleA, {})

      RetThreeArticlesRoot1.props.children[1][0] = retArticleA.props.children[1][0]

      const assertComponent = <React.Fragment>{ RetThreeArticlesRoot1 }</React.Fragment>

      const divBase = document.createElement('div')
      ReactDOM.render(
        assertComponent,
        divBase
      )

      const absLink = permalink2abs(articleA.post.permalink)

      const divHTML = beautifyHTML(div.innerHTML, { indent_size: 2, space_in_empty_paren: true })
      const divBaseHTML = beautifyHTML(divBase.innerHTML.replace('\\"', '"'), { indent_size: 2, space_in_empty_paren: true })

      expect(window.location.pathname).toEqual(absLink)
      expect(divHTML).toEqual(divBaseHTML)
    })

    then('if I open article B', () => {
      link.flushMockedResponses()
      link.addMockedResponse({ request: { query: addTypenameToDocument(ArticleContentQuery), variables: { name: articleB.post.post_name } }, result: { data: articleB } })

      let waitStep = mockedModules['PostContent'].getWaitingPromise('default')

      const myTitle = div.querySelector('#post-' + articleB.post.id + ' .entry-title a')
      Simulate.click(myTitle)

      return waitStep()
    })

    then('the browser should render article B for the first time', () => {
      const paramsThreeArticlesRoot1 = { data: { loading: null, error: null, posts: threeArticlesRoot1.category.posts, baseUrl: '/' }, disabled: false, showLoadNewer: true, showLoadOlder: true }
      paramsThreeArticlesRoot1.data.loadNewer = (postData) => ArticlesListUtils.genLoadNewer('/', postData)
      paramsThreeArticlesRoot1.data.loadOlder = (postData) => ArticlesListUtils.genLoadOlder('/', postData)
      paramsThreeArticlesRoot1.articlesListInstances = [
        {
          wrappedInstance: {
            props: {
              data: paramsThreeArticlesRoot1.data
            }
          }
        }
      ]
      paramsThreeArticlesRoot1.articlesListComponents = [
        {
          props: {
            disabled: false
          }
        }
      ]
      paramsThreeArticlesRoot1.parentInstance = paramsThreeArticlesRoot1.articlesListInstances[0].wrappedInstance
      const RetThreeArticlesRoot1 = mockedModules['ArticlesList'].component.default(paramsThreeArticlesRoot1, {})

      const paramsArticleA = { data: { loading: null, error: null, posts: [ articleA.post ], baseUrl: '/' }, disabled: false, showLoadNewer: false, showLoadOlder: false }
      paramsArticleA.data.loadNewer = (postData) => ArticlesListUtils.genLoadNewer('/', postData)
      paramsArticleA.data.loadOlder = (postData) => ArticlesListUtils.genLoadOlder('/', postData)
      paramsArticleA.articlesListInstances = [
        {
          wrappedInstance: {
            props: {
              data: paramsArticleA.data
            }
          }
        }
      ]
      paramsArticleA.articlesListComponents = [
        {
          props: {
            disabled: false
          }
        }
      ]
      paramsArticleA.parentInstance = paramsArticleA.articlesListInstances[0].wrappedInstance
      const retArticleA = mockedModules['ArticlesList'].component.default(paramsArticleA, {})

      const paramsArticleB = { data: { loading: null, error: null, posts: [ articleB.post ], baseUrl: '/' }, disabled: false, showLoadNewer: false, showLoadOlder: false }
      paramsArticleB.data.loadNewer = (postData) => ArticlesListUtils.genLoadNewer('/', postData)
      paramsArticleB.data.loadOlder = (postData) => ArticlesListUtils.genLoadOlder('/', postData)
      paramsArticleB.articlesListInstances = [
        {
          wrappedInstance: {
            props: {
              data: paramsArticleB.data
            }
          }
        }
      ]
      paramsArticleB.articlesListComponents = [
        {
          props: {
            disabled: false
          }
        }
      ]
      paramsArticleB.parentInstance = paramsArticleB.articlesListInstances[0].wrappedInstance
      const retArticleB = mockedModules['ArticlesList'].component.default(paramsArticleB, {})

      RetThreeArticlesRoot1.props.children[1][0] = retArticleA.props.children[1][0]
      RetThreeArticlesRoot1.props.children[1][1] = retArticleB.props.children[1][0]

      const assertComponent = <React.Fragment>{ RetThreeArticlesRoot1 }</React.Fragment>

      const divBase = document.createElement('div')
      ReactDOM.render(
        assertComponent,
        divBase
      )

      const absLink = permalink2abs(articleB.post.permalink)

      const divHTML = beautifyHTML(div.innerHTML, { indent_size: 2, space_in_empty_paren: true })
      const divBaseHTML = beautifyHTML(divBase.innerHTML.replace('\\"', '"'), { indent_size: 2, space_in_empty_paren: true })

      expect(window.location.pathname).toEqual(absLink)
      expect(divHTML).toEqual(divBaseHTML)
    })

    then('if I navigate to section "tutorials"', () => {
      link.flushMockedResponses()
      link.addMockedResponse({ request: { query: addTypenameToDocument(ArticlesListQuery), variables: { permalink: '/%category%/%year%/%monthnum%/%postname%', postsCategory: 'Tutorials', direction: 'DESC' } }, result: { data: threeArticlesTutorials1 } })
      history.push('/tutorials')
      let waitStep = mockedModules['ArticlesList'].getWaitingPromise('default')
      return waitStep()
    })

    then('the browser should render articles in the "tutorials" section for the first time', () => {
      const paramsThreeArticlesTutorials1 = { data: { loading: null, error: null, posts: threeArticlesTutorials1.category.posts, baseUrl: '/tutorials' }, disabled: false, showLoadNewer: true, showLoadOlder: true }
      paramsThreeArticlesTutorials1.data.loadNewer = (postData) => ArticlesListUtils.genLoadNewer('/tutorials', postData)
      paramsThreeArticlesTutorials1.data.loadOlder = (postData) => ArticlesListUtils.genLoadOlder('/tutorials', postData)
      paramsThreeArticlesTutorials1.articlesListInstances = [
        {
          wrappedInstance: {
            props: {
              data: paramsThreeArticlesTutorials1.data
            }
          }
        }
      ]
      paramsThreeArticlesTutorials1.articlesListComponents = [
        {
          props: {
            disabled: false
          }
        }
      ]
      paramsThreeArticlesTutorials1.parentInstance = paramsThreeArticlesTutorials1.articlesListInstances[0].wrappedInstance
      const RetThreeArticlesTutorials1 = mockedModules['ArticlesList'].component.default(paramsThreeArticlesTutorials1, {})

      const assertComponent = <React.Fragment>{ RetThreeArticlesTutorials1 }</React.Fragment>

      const divBase = document.createElement('div')
      ReactDOM.render(
        assertComponent,
        divBase
      )

      const divHTML = beautifyHTML(div.innerHTML, { indent_size: 2, space_in_empty_paren: true })
      const divBaseHTML = beautifyHTML(divBase.innerHTML.replace('\\"', '"'), { indent_size: 2, space_in_empty_paren: true })

      expect(window.location.pathname).toEqual('/tutorials')
      expect(divHTML).toEqual(divBaseHTML)
    })

    then('if I go back in the history for the first time', () => {
      link.flushMockedResponses()
      link.addMockedResponse({ request: { query: addTypenameToDocument(ArticleContentQuery), variables: { name: articleB.post.post_name } }, result: { data: articleB } })
      let waitStep = mockedModules['ArticlesList'].getWaitingPromise('default')
      history.goBack()
      return waitStep()
    })

    then('the browser should render article B for the second time', () => {
      const paramsArticleB = { data: { loading: null, error: null, posts: [articleB.post], baseUrl: '/' }, disabled: false, showLoadNewer: true, showLoadOlder: true }
      paramsArticleB.data.loadNewer = (postData) => ArticlesListUtils.genLoadNewer('/', postData)
      paramsArticleB.data.loadOlder = (postData) => ArticlesListUtils.genLoadOlder('/', postData)
      paramsArticleB.articlesListInstances = [
        {
          wrappedInstance: {
            props: {
              data: paramsArticleB.data
            }
          }
        }
      ]
      paramsArticleB.articlesListComponents = [
        {
          props: {
            disabled: false
          }
        }
      ]
      paramsArticleB.parentInstance = paramsArticleB.articlesListInstances[0].wrappedInstance
      const RetArticleE = mockedModules['ArticlesList'].component.default(paramsArticleB, {})

      const assertComponent = <React.Fragment>{ RetArticleE }</React.Fragment>

      const divBase = document.createElement('div')
      ReactDOM.render(
        assertComponent,
        divBase
      )

      const absLink = permalink2abs(articleB.post.permalink)

      const divHTML = beautifyHTML(div.innerHTML, { indent_size: 2, space_in_empty_paren: true })
      const divBaseHTML = beautifyHTML(divBase.innerHTML.replace('\\"', '"'), { indent_size: 2, space_in_empty_paren: true })

      expect(window.location.pathname).toEqual(absLink)
      expect(divHTML).toEqual(divBaseHTML)
    })

    then('if I go back in the history for the second time', () => {
      link.flushMockedResponses()
      link.addMockedResponse({ request: { query: addTypenameToDocument(ArticleContentQuery), variables: { permalink: '/%category%/%year%/%monthnum%/%postname%', id: articleA.post.id } }, result: { data: articleA } })
      let waitArticlesList = mockedModules['ArticlesList'].getWaitingPromise('default')
      history.goBack()
      return waitArticlesList()
    })

    then('the browser should render article A for the second time', () => {
      const paramsArticleA = { data: { loading: null, error: null, posts: [ articleA.post ], baseUrl: '/' }, disabled: false, showLoadNewer: true, showLoadOlder: true }
      paramsArticleA.data.loadNewer = (postData) => ArticlesListUtils.genLoadNewer('/', postData)
      paramsArticleA.data.loadOlder = (postData) => ArticlesListUtils.genLoadOlder('/', postData)
      paramsArticleA.articlesListInstances = [
        {
          wrappedInstance: {
            props: {
              data: paramsArticleA.data
            }
          }
        }
      ]
      paramsArticleA.articlesListComponents = [
        {
          props: {
            disabled: false
          }
        }
      ]
      paramsArticleA.parentInstance = paramsArticleA.articlesListInstances[0].wrappedInstance
      const retArticleA = mockedModules['ArticlesList'].component.default(paramsArticleA, {})

      const paramsArticleB = { data: { loading: null, error: null, posts: [ articleB.post ], baseUrl: '/' }, disabled: false, showLoadNewer: true, showLoadOlder: true }
      paramsArticleB.data.loadNewer = (postData) => ArticlesListUtils.genLoadNewer('/', postData)
      paramsArticleB.data.loadOlder = (postData) => ArticlesListUtils.genLoadOlder('/', postData)
      paramsArticleB.articlesListInstances = [
        {
          wrappedInstance: {
            props: {
              data: paramsArticleB.data
            }
          }
        }
      ]
      paramsArticleB.articlesListComponents = [
        {
          props: {
            disabled: false
          }
        }
      ]
      paramsArticleB.parentInstance = paramsArticleB.articlesListInstances[0].wrappedInstance
      const retArticleB = mockedModules['ArticlesList'].component.default(paramsArticleB, {})

      const assertComponent = <React.Fragment>{ retArticleA }{ retArticleB }</React.Fragment>

      const divBase = document.createElement('div')
      ReactDOM.render(
        assertComponent,
        divBase
      )

      const absLink = permalink2abs(articleA.post.permalink)

      const divHTML = beautifyHTML(div.innerHTML, { indent_size: 2, space_in_empty_paren: true })
      const divBaseHTML = beautifyHTML(divBase.innerHTML.replace('\\"', '"'), { indent_size: 2, space_in_empty_paren: true })

      expect(window.location.pathname).toEqual(absLink)
      expect(divHTML).toEqual(divBaseHTML)
    })

    then('if I request articles newer than B', () => {
      let dateCursor = new Date(articleB.post.post_date)
      dateCursor.setSeconds(dateCursor.getSeconds() + 1)
      const fromDate = dateCursor.toISOString()
      link.flushMockedResponses()
      link.addMockedResponse({ request: { query: addTypenameToDocument(ArticlesListQuery), variables: { permalink: '/%category%/%year%/%monthnum%/%postname%', postsCategory: 'Root', direction: 'ASC', fromDate } }, result: { data: threeArticlesRootNewerThanB } })

      let waitStep = mockedModules['ArticlesList'].getWaitingPromise('default')

      const loadNewer = div.querySelector('.postWrapper[assetid="post-' + articleB.post.id + '"]').previousElementSibling
      Simulate.click(loadNewer)

      return waitStep()
    })

    then('the browser fetches 0 articles between A and B', () => {
      const paramsArticleA = { data: { loading: null, error: null, posts: [ articleA.post ], baseUrl: '/' }, disabled: false, showLoadNewer: false, showLoadOlder: false }
      paramsArticleA.data.loadNewer = (postData) => ArticlesListUtils.genLoadNewer('/', postData)
      paramsArticleA.data.loadOlder = (postData) => ArticlesListUtils.genLoadOlder('/', postData)
      paramsArticleA.articlesListInstances = [
        {
          wrappedInstance: {
            props: {
              data: paramsArticleA.data
            }
          }
        }
      ]
      paramsArticleA.articlesListComponents = [
        {
          props: {
            disabled: false
          }
        }
      ]
      paramsArticleA.parentInstance = paramsArticleA.articlesListInstances[0].wrappedInstance
      const retArticleA = mockedModules['ArticlesList'].component.default(paramsArticleA, {})

      const paramsArticleB = { data: { loading: null, error: null, posts: [ articleB.post ], baseUrl: '/' }, disabled: false, showLoadNewer: false, showLoadOlder: true }
      paramsArticleB.data.loadNewer = (postData) => ArticlesListUtils.genLoadNewer('/', postData)
      paramsArticleB.data.loadOlder = (postData) => ArticlesListUtils.genLoadOlder('/', postData)
      paramsArticleB.articlesListInstances = [
        {
          wrappedInstance: {
            props: {
              data: paramsArticleB.data
            }
          }
        }
      ]
      paramsArticleB.articlesListComponents = [
        {
          props: {
            disabled: false
          }
        }
      ]
      paramsArticleB.parentInstance = paramsArticleB.articlesListInstances[0].wrappedInstance
      const retArticleB = mockedModules['ArticlesList'].component.default(paramsArticleB, {})

      const assertComponent = <React.Fragment>{ retArticleA }{retArticleB}</React.Fragment>

      const divExpected = document.createElement('div')
      ReactDOM.render(
        assertComponent,
        divExpected
      )

      const absLink = permalink2abs(articleA.post.permalink)

      // defer status update to avoid update state recursion.
      // Use setTimeout instead of setImmediate to avoid exception in test
      return new Promise((resolve) => {
        setTimeout(() => {
          const divHTML = beautifyHTML(div.innerHTML, { indent_size: 2, space_in_empty_paren: true })
          const divExpectedHTML = beautifyHTML(divExpected.innerHTML.replace('\\"', '"'), { indent_size: 2, space_in_empty_paren: true })

          expect(window.location.pathname).toEqual(absLink)
          expect(divHTML).toEqual(divExpectedHTML)
          resolve()
        }, 0)
      })
    })
  })
})
