import React from 'react'
import ReactDOM from 'react-dom'
import { Simulate } from 'react-dom/test-utils'
import { Router, Switch } from 'react-router-dom'
import { ApolloProvider, gql, ApolloClient } from 'react-apollo'
import { mockNetworkInterface } from 'react-apollo/test-utils'
import { addTypenameToDocument } from 'apollo-client'
import { print } from 'graphql'
import { step } from '../test-utils/step'

import history from '../../src/history'
import routes from '../../src/routes'
import PropsRoute from '../../src/components/routes/props-route'

let rawArticlesListQuery = gql`
  query ArticlesListQuery($postsCategory: String, $permalink: String, $fromDate: String, $toDate: String) {
    category(name: $postsCategory) {
      name
      slug
      posts(post_type: "post", limit: 3, order: {orderBy: "post_date", direction: "DESC"}, from_date: $fromDate, to_date: $toDate) {
        id
        post_type
        post_name
        post_title
        post_date
        post_excerpt(excerpt_length: 100)
        permalink(permalink: $permalink)
      }
    }
  }
`
let articlesListQuery = addTypenameToDocument(rawArticlesListQuery)
const serializedArticlesListQuery = print(articlesListQuery)
const articlesListQueryData = {
  'category': {
    'name': 'Root',
    'slug': 'root',
    '__typename': 'Category',
    'posts': [
      {
        'id': 1,
        'post_type': 'post',
        'post_name': 'article-a',
        'post_title': 'Article A',
        'post_date': 'Mon Jan 01 2018 00:00:00 GMT+0000 (UTC)',
        'post_status': 'publish',
        'post_excerpt': 'This is article A',
        'permalink': 'http://www.jacopomaroli.com/2018/01/article-a',
        '__typename': 'Post'
      },
      {
        'id': 2,
        'post_type': 'post',
        'post_name': 'article-b',
        'post_title': 'Article B',
        'post_date': 'Mon Jan 02 2018 00:00:00 GMT+0000 (UTC)',
        'post_status': 'publish',
        'post_excerpt': 'This is article B',
        'permalink': 'http://www.jacopomaroli.com/2018/01/article-b',
        '__typename': 'Post'
      },
      {
        'id': 3,
        'post_type': 'post',
        'post_name': 'article-b',
        'post_title': 'Article C',
        'post_date': 'Mon Jan 03 2018 00:00:00 GMT+0000 (UTC)',
        'post_status': 'publish',
        'post_excerpt': 'This is article C',
        'permalink': 'http://www.jacopomaroli.com/2018/01/article-c',
        '__typename': 'Post'
      }
    ]
  }
}

const articleContentQuery = addTypenameToDocument(gql`
  query ArticleContentQuery($id: Int!) {
      post(id:$id){
      post_content
    }
  }
`)
const serializedArticleContentQuery = print(articleContentQuery)

const networkInterface = mockNetworkInterface()

const apolloClient = new ApolloClient({ networkInterface })

networkInterface.addMockedResponse({ request: { query: articlesListQuery }, result: { data: articlesListQueryData }, variables: { permalink: '/%category%/%year%/%monthnum%/%postname%', postsCategory: 'root' } })

let gResolve
let gReject

const origFunc = networkInterface.query

function myMock () {
  const _this = this
  const _arguments = arguments

  return origFunc.apply(_this, _arguments)
    .then((res) => {
      gResolve()
      return res
    })
    .catch(() => {
      gReject()
    })

  /* return new Promise(function (resolve, reject) {
    origFunc.apply(_this, _arguments)
      .then(() => {
        return resolve.apply(_this, arguments)
      })
      .then(() => {
        gResolve()
      })
      .catch(() => {
        gReject()
      })
  }) */
}

//networkInterface.query = () => myMock.apply(networkInterface, arguments)
//networkInterface.query = myMock

function myWaitForCall() {
  return new Promise(function (resolve, reject) {
    gResolve = resolve
    gReject = reject
  })
}

apolloClient.watchQuery({
  query: articlesListQuery,
  variables: { permalink: '/%category%/%year%/%monthnum%/%postname%', postsCategory: 'root' }
}).subscribe(({data}) => {
  gResolve()
})

// const spy = jest.spyOn(networkInterface, 'query')

let mockStepResolve
let stepReject

function waitStep() {
  return new Promise(function (resolve, reject) {
    mockStepResolve = resolve
    stepReject = reject
  })
}

jest.mock('../../src/components/ArticlesList', () => {
  const theComponent = require.requireActual('../../src/components/ArticlesList').default
  const newComponent = (props, context) => {
    console.log('here')
    //theComponent.apply(this, arguments)
    const ret = theComponent(props, context)
    if (mockStepResolve) {
      mockStepResolve()
    }
    return ret
  }
  return newComponent
})

/*jest.mock('../somewhere/UserCom', () => () => <div id="mockUserCom">
   mockUserCom
</div>)*/

/* jest.mock('../src/ChildComponent');
ChildComponent.mockImplementation(() => 'ChildComponent'); */

/* routes.forEach((val) => {
  const __componentDidUpdate = val.component.prototype.componentDidUpdate
  const myMock2 = () => {
    __componentDidUpdate()
    stepResolve()
  }

  val.component.prototype.componentDidUpdate = val.component.prototype.componentDidUpdate || myMock2
}) */

class Assert extends React.Component {
  componentDidMount () {
    // this.assert()
  }

  componentDidUpdate () {
    this.assert()
  }

  assert () {
    /* const nextStep = steps.shift()
    if (nextStep) {
      nextStep({ ...this.props, div })
    } else {
      // unmountComponentAtNode(div)
    } */
    stepResolve()
  }

  render () {
    return this.props.children
  }
}

/* routes.forEach((val) => {
  const Assertable = <Assert>{val.component}</Assert>
  val.component = <Assertable />
}) */

const div = document.createElement('div')
ReactDOM.render(
  <ApolloProvider client={apolloClient}>
    <Router history={history}>
      <Switch>
        {routes.map(route => <PropsRoute key={route.name} {...route} />)}
      </Switch>
    </Router>
  </ApolloProvider>,
  div
)

describe('simple routing scenario', () => {
  step('when I open the homepage', () => {
    it('renders articles in the "home" section', () => {
      // const request = spy.mock.calls[0][0] // first call, first arg
      // const serializedRequestQuery = print(request.query)

      const foo = div.innerHTML
      console.log(foo)

      return waitStep()
        .then(() => {
          const bar = div.innerHTML
          console.log(bar)

          /* expect(spy).toHaveBeenCalledTimes(1)
          expect(serializedRequestQuery).toEqual(serializedArticlesListQuery)
          expect(request.variables.postsCategory).toEqual('root')

          spy.mockClear() */
        })
    })
  })
  /* describe('and if I open article A', () => {
    const articleContentData = {
      'post': {
        'post_content': 'This is article A. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla aliquet nulla dapibus, rhoncus diam id, porttitor ligula'
      }
    }

    networkInterface.addMockedResponse({ request: { query: articleContentQuery }, result: { data: articleContentData }, variables: { id: 1 } })

    const myTitle = div.querySelector('#post-1 .entry-title a')

    Simulate.click(myTitle)

    it('should load article A', () => {
      const request = spy.mock.calls[0][0] // first call, first arg
      const serializedRequestQuery = print(request.query)

      myWaitForCall
        .then(() => {
          expect(spy).toHaveBeenCalledTimes(1)
          expect(serializedRequestQuery).toEqual(serializedArticleContentQuery)
          expect(request.variables.postsCategory).toEqual('root')

          spy.mockClear()
        })
    })
  }) */
  step('and if I navigate to section "tutorials"', () => {
    it('renders articles in the "tutorials" section', () => {
    })
  })
  step('and if I go back in the history', () => {
    it('navigates to "home" and loads article A', () => {
      throw new Error('failed')
    })
  })
  step('and if I go forward in the history', () => {
    it('renders articles in the "tutorials" section', () => {
    })
  })
})

/* describe('routing scenario with more than loadMaxArticles(3) articles between two visited articles', () => {
  describe('when I open the homepage', () => {
    it('renders articles in the "home" section', () => {
    })
  })
  describe('and if I open article A', () => {
    it('should load article A', () => {
    })
  })
  describe('and if I open article E', () => {
    it('should load article E', () => {
    })
  })
  describe('and if I navigate to section "tutorials"', () => {
    it('renders articles in the "tutorials" section', () => {
    })
  })
  describe('and if I go back in the history', () => {
    it('navigates to "home" and loads article E', () => {
    })
  })
  describe('and if I go back in the history', () => {
    it('loads article A', () => {
      // TODO: assert that load newer/older are between A and E
    })
  })
  describe('and if I request articles newer than E', () => {
    it('loads loadMaxArticles', () => {
      // TODO: assert that load newer/older are between A and B
    })
  })
  describe('and if I request articles newer than B', () => {
    it('fetches 0 articles between A and B', () => {
      // TODO: assert that load newer/older are gone
    })
  })
})

describe('routing scenario with less than loadMaxArticles(3) articles between two visited articles', () => {
  describe('when I open the homepage', () => {
    it('renders articles in the "home" section', () => {
    })
  })
  describe('and if I open article A', () => {
    it('should load article A', () => {
    })
  })
  describe('and if I open article D', () => {
    it('should load article D', () => {
    })
  })
  describe('and if I navigate to section "tutorials"', () => {
    it('renders articles in the "tutorials" section', () => {
    })
  })
  describe('and if I go back in the history', () => {
    it('navigates to "home" and loads article D', () => {
    })
  })
  describe('and if I go back in the history', () => {
    it('loads article A', () => {
      // TODO: assert that load newer/older are between A and D
    })
  })
  describe('and if I request articles newer than D', () => {
    it('loads articles B and C', () => {
      // TODO: assert that load newer/older are gone
    })
  })
})

describe('routing scenario with 0 articles between two visited articles', () => {
  describe('when I open the homepage', () => {
    it('renders articles in the "home" section', () => {
    })
  })
  describe('and if I open article A', () => {
    it('should load article A', () => {
    })
  })
  describe('and if I open article B', () => {
    it('should load article B', () => {
    })
  })
  describe('and if I navigate to section "tutorials"', () => {
    it('renders articles in the "tutorials" section', () => {
    })
  })
  describe('and if I go back in the history', () => {
    it('navigates to "home" and loads article B', () => {
    })
  })
  describe('and if I go back in the history', () => {
    it('loads article A', () => {
      // TODO: assert that load newer/older are between A and B
    })
  })
  describe('and if I request articles newer than B', () => {
    it('fetches 0 articles between A and B', () => {
      // TODO: assert that load newer/older are gone
    })
  })
}) */
