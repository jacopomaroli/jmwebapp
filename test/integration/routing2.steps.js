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

const feature = loadFeature('test/integration/routing2.feature')

jest.setTimeout(999999)
global.isSSR = true

defineFeature(feature, test => {
  beforeEach(() => {
    jest.resetModules()
  })

  test('Routing with more than loadMaxArticles(3) articles between two visited articles', ({ given, when, then }) => {
    let div
    let myComponent
    let oneArticleRoot1 = mockResponses.ArticleListData.oneArticleRoot1
    let threeArticlesRoot1 = mockResponses.ArticleListData.threeArticlesRoot1
    let threeArticlesRoot2 = mockResponses.ArticleListData.threeArticlesRoot2
    let threeArticlesRootNewerThanE = mockResponses.ArticleListData.threeArticlesRootNewerThanE
    let articleA = mockResponses.PostContentData.articleA
    let articleB = mockResponses.PostContentData.articleB
    let articleE = mockResponses.PostContentData.articleE
    let threeArticlesTutorials1 = mockResponses.ArticleListData.threeArticlesTutorials1

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

    then('if I click load older', () => {
      let dateCursor = new Date(threeArticlesRoot1.category.posts[2].post_date)
      dateCursor.setSeconds(dateCursor.getSeconds() - 1)
      const toDate = dateCursor.toISOString()
      link.flushMockedResponses()
      link.addMockedResponse({ request: { query: addTypenameToDocument(ArticlesListQuery), variables: { permalink: '/%category%/%year%/%monthnum%/%postname%', postsCategory: 'Root', direction: 'DESC', toDate } }, result: { data: threeArticlesRoot2 } })

      let waitStep = mockedModules['ArticlesList'].getWaitingPromise('default')

      const loadOlder = div.querySelector('.postWrapper[assetid="post-' + threeArticlesRoot1.category.posts[2].id + '"]').nextElementSibling
      Simulate.click(loadOlder)

      return waitStep()
    })

    then('the browser should load loadMaxArticles(3) home page articles', () => {
      const paramsThreeArticlesRoot1 = { data: { loading: null, error: null, posts: threeArticlesRoot1.category.posts, baseUrl: '/' }, disabled: false, showLoadNewer: true, showLoadOlder: false }
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

      const paramsThreeArticlesRoot2 = { data: { loading: null, error: null, posts: threeArticlesRoot2.category.posts, baseUrl: '/' }, disabled: false, showLoadNewer: false, showLoadOlder: true }
      paramsThreeArticlesRoot2.data.loadNewer = (postData) => ArticlesListUtils.genLoadNewer('/', postData)
      paramsThreeArticlesRoot2.data.loadOlder = (postData) => ArticlesListUtils.genLoadOlder('/', postData)
      paramsThreeArticlesRoot2.articlesListInstances = [
        {
          wrappedInstance: {
            props: {
              data: paramsThreeArticlesRoot2.data
            }
          }
        }
      ]
      paramsThreeArticlesRoot2.articlesListComponents = [
        {
          props: {
            disabled: false
          }
        }
      ]
      paramsThreeArticlesRoot2.parentInstance = paramsThreeArticlesRoot2.articlesListInstances[0].wrappedInstance
      const RetThreeArticlesRoot2 = mockedModules['ArticlesList'].component.default(paramsThreeArticlesRoot2, {})

      RetThreeArticlesRoot1.props.children[1][0] = retArticleA.props.children[1][0]

      const assertComponent = <React.Fragment>{ RetThreeArticlesRoot1 }{ RetThreeArticlesRoot2 }</React.Fragment>

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

    then('if I open article E', () => {
      link.flushMockedResponses()
      link.addMockedResponse({ request: { query: addTypenameToDocument(ArticleContentQuery), variables: { name: articleE.post.post_name } }, result: { data: articleE } })

      let waitStep = mockedModules['PostContent'].getWaitingPromise('default')

      const myTitle = div.querySelector('#post-' + articleE.post.id + ' .entry-title a')
      Simulate.click(myTitle)

      return waitStep()
    })

    then('the browser should render article E for the first time', () => {
      const paramsThreeArticlesRoot1 = { data: { loading: null, error: null, posts: threeArticlesRoot1.category.posts, baseUrl: '/' }, disabled: false, showLoadNewer: true, showLoadOlder: false }
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

      const paramsThreeArticlesRoot2 = { data: { loading: null, error: null, posts: threeArticlesRoot2.category.posts, baseUrl: '/' }, disabled: false, showLoadNewer: false, showLoadOlder: true }
      paramsThreeArticlesRoot2.data.loadNewer = (postData) => ArticlesListUtils.genLoadNewer('/', postData)
      paramsThreeArticlesRoot2.data.loadOlder = (postData) => ArticlesListUtils.genLoadOlder('/', postData)
      paramsThreeArticlesRoot2.articlesListInstances = [
        {
          wrappedInstance: {
            props: {
              data: paramsThreeArticlesRoot2.data
            }
          }
        }
      ]
      paramsThreeArticlesRoot2.articlesListComponents = [
        {
          props: {
            disabled: false
          }
        }
      ]
      paramsThreeArticlesRoot2.parentInstance = paramsThreeArticlesRoot2.articlesListInstances[0].wrappedInstance
      const RetThreeArticlesRoot2 = mockedModules['ArticlesList'].component.default(paramsThreeArticlesRoot2, {})

      const paramsArticleE = { data: { loading: null, error: null, posts: [ articleE.post ], baseUrl: '/' }, disabled: false, showLoadNewer: false, showLoadOlder: false }
      paramsArticleE.data.loadNewer = (postData) => ArticlesListUtils.genLoadNewer('/', postData)
      paramsArticleE.data.loadOlder = (postData) => ArticlesListUtils.genLoadOlder('/', postData)
      paramsArticleE.articlesListInstances = [
        {
          wrappedInstance: {
            props: {
              data: paramsArticleE.data
            }
          }
        }
      ]
      paramsArticleE.articlesListComponents = [
        {
          props: {
            disabled: false
          }
        }
      ]
      paramsArticleE.parentInstance = paramsArticleE.articlesListInstances[0].wrappedInstance
      const retArticleE = mockedModules['ArticlesList'].component.default(paramsArticleE, {})

      RetThreeArticlesRoot1.props.children[1][0] = retArticleA.props.children[1][0]
      RetThreeArticlesRoot2.props.children[1][1] = retArticleE.props.children[1][0]

      const assertComponent = <React.Fragment>{ RetThreeArticlesRoot1 }{ RetThreeArticlesRoot2 }</React.Fragment>

      const divBase = document.createElement('div')
      ReactDOM.render(
        assertComponent,
        divBase
      )

      const absLink = permalink2abs(articleE.post.permalink)

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
      link.addMockedResponse({ request: { query: addTypenameToDocument(ArticleContentQuery), variables: { name: articleE.post.post_name } }, result: { data: articleE } })
      let waitStep = mockedModules['ArticlesList'].getWaitingPromise('default')
      history.goBack()
      return waitStep()
    })

    then('the browser should render article E for the second time', () => {
      const paramsArticleE = { data: { loading: null, error: null, posts: [articleE.post], baseUrl: '/' }, disabled: false, showLoadNewer: true, showLoadOlder: true }
      paramsArticleE.data.loadNewer = (postData) => ArticlesListUtils.genLoadNewer('/', postData)
      paramsArticleE.data.loadOlder = (postData) => ArticlesListUtils.genLoadOlder('/', postData)
      paramsArticleE.articlesListInstances = [
        {
          wrappedInstance: {
            props: {
              data: paramsArticleE.data
            }
          }
        }
      ]
      paramsArticleE.articlesListComponents = [
        {
          props: {
            disabled: false
          }
        }
      ]
      paramsArticleE.parentInstance = paramsArticleE.articlesListInstances[0].wrappedInstance
      const RetArticleE = mockedModules['ArticlesList'].component.default(paramsArticleE, {})

      const assertComponent = <React.Fragment>{ RetArticleE }</React.Fragment>

      const divBase = document.createElement('div')
      ReactDOM.render(
        assertComponent,
        divBase
      )

      const absLink = permalink2abs(articleE.post.permalink)

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

      const paramsArticleE = { data: { loading: null, error: null, posts: [ articleE.post ], baseUrl: '/' }, disabled: false, showLoadNewer: true, showLoadOlder: true }
      paramsArticleE.data.loadNewer = (postData) => ArticlesListUtils.genLoadNewer('/', postData)
      paramsArticleE.data.loadOlder = (postData) => ArticlesListUtils.genLoadOlder('/', postData)
      paramsArticleE.articlesListInstances = [
        {
          wrappedInstance: {
            props: {
              data: paramsArticleE.data
            }
          }
        }
      ]
      paramsArticleE.articlesListComponents = [
        {
          props: {
            disabled: false
          }
        }
      ]
      paramsArticleE.parentInstance = paramsArticleE.articlesListInstances[0].wrappedInstance
      const retArticleE = mockedModules['ArticlesList'].component.default(paramsArticleE, {})

      const assertComponent = <React.Fragment>{ retArticleA }{ retArticleE }</React.Fragment>

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

    then('if I request articles newer than E', () => {
      let dateCursor = new Date(articleE.post.post_date)
      dateCursor.setSeconds(dateCursor.getSeconds() + 1)
      const fromDate = dateCursor.toISOString()
      link.flushMockedResponses()
      link.addMockedResponse({ request: { query: addTypenameToDocument(ArticlesListQuery), variables: { permalink: '/%category%/%year%/%monthnum%/%postname%', postsCategory: 'Root', direction: 'ASC', fromDate } }, result: { data: threeArticlesRootNewerThanE } })

      let waitStep = mockedModules['ArticlesList'].getWaitingPromise('default')

      const loadNewer = div.querySelector('.postWrapper[assetid="post-' + articleE.post.id + '"]').previousElementSibling
      Simulate.click(loadNewer)

      return waitStep()
    })

    then('the browser loads loadMaxArticles(3)', () => {
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

      const paramsThreeArticlesRootNewerThanE = { data: { loading: null, error: null, posts: threeArticlesRootNewerThanE.category.posts, baseUrl: '/' }, disabled: false, showLoadNewer: true, showLoadOlder: false, reverse: true, direction: 'ASC' }
      paramsThreeArticlesRootNewerThanE.data.loadNewer = (postData) => ArticlesListUtils.genLoadNewer('/', postData)
      paramsThreeArticlesRootNewerThanE.data.loadOlder = (postData) => ArticlesListUtils.genLoadOlder('/', postData)
      paramsThreeArticlesRootNewerThanE.articlesListInstances = [
        {
          wrappedInstance: {
            props: {
              data: paramsThreeArticlesRootNewerThanE.data
            }
          }
        }
      ]
      paramsThreeArticlesRootNewerThanE.articlesListComponents = [
        {
          props: {
            disabled: false
          }
        }
      ]
      paramsThreeArticlesRootNewerThanE.parentInstance = paramsThreeArticlesRootNewerThanE.articlesListInstances[0].wrappedInstance
      const RetthreeArticlesRootNewerThanE = mockedModules['ArticlesList'].component.default(paramsThreeArticlesRootNewerThanE, {})

      const paramsArticleE = { data: { loading: null, error: null, posts: [ articleE.post ], baseUrl: '/' }, disabled: false, showLoadNewer: false, showLoadOlder: true }
      paramsArticleE.data.loadNewer = (postData) => ArticlesListUtils.genLoadNewer('/', postData)
      paramsArticleE.data.loadOlder = (postData) => ArticlesListUtils.genLoadOlder('/', postData)
      paramsArticleE.articlesListInstances = [
        {
          wrappedInstance: {
            props: {
              data: paramsArticleE.data
            }
          }
        }
      ]
      paramsArticleE.articlesListComponents = [
        {
          props: {
            disabled: false
          }
        }
      ]
      paramsArticleE.parentInstance = paramsArticleE.articlesListInstances[0].wrappedInstance
      const retArticleE = mockedModules['ArticlesList'].component.default(paramsArticleE, {})

      const assertComponent = <React.Fragment>{ retArticleA }{RetthreeArticlesRootNewerThanE}{ retArticleE }</React.Fragment>

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
      link.addMockedResponse({ request: { query: addTypenameToDocument(ArticlesListQuery), variables: { permalink: '/%category%/%year%/%monthnum%/%postname%', postsCategory: 'Root', direction: 'ASC', fromDate } }, result: { data: oneArticleRoot1 } })

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

      const paramsThreeArticlesRootNewerThanE = { data: { loading: null, error: null, posts: threeArticlesRootNewerThanE.category.posts, baseUrl: '/' }, disabled: false, showLoadNewer: false, showLoadOlder: false, reverse: true, direction: 'ASC' }
      paramsThreeArticlesRootNewerThanE.data.loadNewer = (postData) => ArticlesListUtils.genLoadNewer('/', postData)
      paramsThreeArticlesRootNewerThanE.data.loadOlder = (postData) => ArticlesListUtils.genLoadOlder('/', postData)
      paramsThreeArticlesRootNewerThanE.articlesListInstances = [
        {
          wrappedInstance: {
            props: {
              data: paramsThreeArticlesRootNewerThanE.data
            }
          }
        }
      ]
      paramsThreeArticlesRootNewerThanE.articlesListComponents = [
        {
          props: {
            disabled: false
          }
        }
      ]
      paramsThreeArticlesRootNewerThanE.parentInstance = paramsThreeArticlesRootNewerThanE.articlesListInstances[0].wrappedInstance
      const RetthreeArticlesRootNewerThanE = mockedModules['ArticlesList'].component.default(paramsThreeArticlesRootNewerThanE, {})

      const paramsArticleE = { data: { loading: null, error: null, posts: [ articleE.post ], baseUrl: '/' }, disabled: false, showLoadNewer: false, showLoadOlder: true }
      paramsArticleE.data.loadNewer = (postData) => ArticlesListUtils.genLoadNewer('/', postData)
      paramsArticleE.data.loadOlder = (postData) => ArticlesListUtils.genLoadOlder('/', postData)
      paramsArticleE.articlesListInstances = [
        {
          wrappedInstance: {
            props: {
              data: paramsArticleE.data
            }
          }
        }
      ]
      paramsArticleE.articlesListComponents = [
        {
          props: {
            disabled: false
          }
        }
      ]
      paramsArticleE.parentInstance = paramsArticleE.articlesListInstances[0].wrappedInstance
      const retArticleE = mockedModules['ArticlesList'].component.default(paramsArticleE, {})

      const assertComponent = <React.Fragment>{ retArticleA }{RetthreeArticlesRootNewerThanE}{ retArticleE }</React.Fragment>

      const divBase = document.createElement('div')
      ReactDOM.render(
        assertComponent,
        divBase
      )

      const absLink = permalink2abs(articleA.post.permalink)

      // defer status update to avoid update state recursion.
      // Use setTimeout instead of setImmediate to avoid exception in test
      return new Promise((resolve) => {
        setTimeout(() => {
          const divHTML = beautifyHTML(div.innerHTML, { indent_size: 2, space_in_empty_paren: true })
          const divBaseHTML = beautifyHTML(divBase.innerHTML.replace('\\"', '"'), { indent_size: 2, space_in_empty_paren: true })

          expect(window.location.pathname).toEqual(absLink)
          expect(divHTML).toEqual(divBaseHTML)
          resolve()
        }, 0)
      })
    })
  })
})
