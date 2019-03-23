import React from 'react'
import PropTypes from 'prop-types'
import { matchPath } from 'react-router'
import { graphql } from 'react-apollo'

import ArticlesList from 'components/ArticlesList'
import * as ArticlesListUtils from 'components/ArticlesListUtils'

import ArticlesListQuery from '../../src/components/queries/ArticlesListQuery'
import ArticleContentQuery from '../../src/components/queries/ArticleContentQuery'

class PostsPage extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}

    this.render = this.render.bind(this)
    this.componentDidMount = this.componentDidMount.bind(this)
    this.loadNewer = this.loadNewer.bind(this)
    this.loadOlder = this.loadOlder.bind(this)
    this.getArticlesListWithData = this.getArticlesListWithData.bind(this)
    this.getSingleArticleListWithData = this.getSingleArticleListWithData.bind(this)
    this.loadSamePage = this.loadSamePage.bind(this)
    this.insertArticleListByDate = this.insertArticleListByDate.bind(this)

    window.loadSamePage = this.loadSamePage

    // keep section chunk list cached globally for history purposes? (avoid load(newer/older) between subsequent loadmore chunks)
    this.chunkList = []
    this.chunkList[0] = []
    this.state = {}
    this.state.articlesList = []
    this.articlesListInstances = []
    if (props.location.pathname === props.baseUrl) {
      this.state.articlesList[0] = this.getArticlesListWithData()
    } else {
      this.state.articlesList[0] = this.getSingleArticleListWithData({ name: props.match.params.postname })
    }
  }

  componentDidMount () {
    if (typeof isSSR !== 'undefined') return

    // because waiting for article to mount might not be quick enough. move to constructor?
    let key = Math.random().toString(36).substr(2, 6)
    let historyState = {
      baseUrl: this.props.baseUrl
    }
    let state = {
      key: key,
      state: historyState
    }
    window.history.replaceState(state, null, this.props.location.pathname)
    window.stateObj = historyState
  }

  insertArticleListByDate (newComponent, date) {
    // TODO: check if I go forward in history I don't load articles already in page
    this.setState((state) => {
      let newArticlesList = [...state.articlesList]
      let index = this.articlesListInstances.findIndex(e => e.wrappedInstance.dateRange.to < date)
      newArticlesList.splice(index + 0, 0, newComponent) // +0 because it's BEFORE

      return { ...state, articlesList: newArticlesList }
    })
  }

  loadSamePage () {
    const match = matchPath(window.location.pathname, {
      path: this.props.path,
      exact: false,
      strict: false // whether or not /foo and /foo/ are the same
    })
    const articleList = this.getSingleArticleListWithData({ name: match.params.postname })
    this.insertArticleListByDate(articleList, window.history.state.state.date)
  }

  render () {
    const self = this
    self.articlesListInstances = []
    return (
      <React.Fragment>
        {
          self.state.articlesList.map((E, i) => {
            return <E key={i} {...E.props} ref={(instance) => { self.articlesListInstances[i] = instance }} />
          })
        }
      </React.Fragment>
    )
  }

  getArticlesListWithData (variables, adapterOptions) {
    // console.log(this.props)
    const options = {
      variables: {
        permalink: '/%category%/%year%/%monthnum%/%postname%',
        postsCategory: this.props.postsCategory,
        direction: (adapterOptions && adapterOptions.direction) || 'DESC'
      }
    }
    const self = this

    options.variables = { ...options.variables, ...variables }

    class AdapterList extends React.Component {
      constructor (props) {
        super(props)
        this.state = {}

        this.render = this.render.bind(this)
        this.state.showLoadNewer = props.showLoadNewer !== false
        this.state.showLoadOlder = props.showLoadOlder !== false
        this.state.reverse = adapterOptions && adapterOptions.reverse
        this.dateRange = {
          from: null,
          to: null
        }
      }

      render () {
        const data = this.props.data
        const { loading, error, category } = data
        if (!loading && !error) {
          data.posts = category.posts
          data.baseUrl = self.props.baseUrl
          // TODO: check if loaded 0 articles
          if (data.posts.length) {
            this.dateRange = {
              from: new Date(data.posts[0].post_date),
              to: new Date(data.posts[data.posts.length - 1].post_date)
            }
            data.loadNewer = (postData) => ArticlesListUtils.genLoadNewer(self.props.baseUrl, postData, this, self.loadNewer)
            data.loadOlder = (postData) => ArticlesListUtils.genLoadOlder(self.props.baseUrl, postData, this, self.loadOlder)
          }
        }
        const newProps = {
          ...this.props,
          disabled: this.props.disabled,
          showLoadNewer: this.state.showLoadNewer,
          showLoadOlder: this.state.showLoadOlder,
          reverse: this.state.reverse,
          parentInstance: this,
          articlesListInstances: self.articlesListInstances,
          articlesListComponents: self.state.articlesList
        }
        return <ArticlesList {...newProps} />
      }
    }

    AdapterList.propTypes = {
      data: PropTypes.any,
      showLoadNewer: PropTypes.any,
      showLoadOlder: PropTypes.any,
      disabled: PropTypes.bool
    }

    const ArticlesListWithData = graphql(ArticlesListQuery, { options, withRef: true })(AdapterList)
    ArticlesListWithData.props = {
      showLoadNewer: (adapterOptions && adapterOptions.showLoadNewer) !== false,
      showLoadOlder: (adapterOptions && adapterOptions.showLoadOlder) !== false,
      disabled: false
    }
    return ArticlesListWithData
  }

  getSingleArticleListWithData (variables, adapterOptions) {
    // console.log(this.props)
    const options = {
      variables: {
        permalink: '/%category%/%year%/%monthnum%/%postname%'
      }
    }
    const self = this

    options.variables = { ...options.variables, ...variables }

    class AdapterSingle extends React.Component {
      constructor (props) {
        super(props)
        this.state = {}

        this.render = this.render.bind(this)
        this.state.showLoadNewer = props.showLoadNewer !== false
        this.state.showLoadOlder = props.showLoadOlder !== false
        this.state.reverse = adapterOptions && adapterOptions.reverse
        this.dateRange = {
          from: null,
          to: null
        }
      }

      render () {
        const data = this.props.data
        const { loading, error, post } = data
        if (!loading && !error) {
          data.posts = [post]
          data.baseUrl = self.props.baseUrl
          // TODO: check if loaded 0 articles
          if (data.posts.length) {
            this.dateRange = {
              from: new Date(data.posts[0].post_date),
              to: new Date(data.posts[data.posts.length - 1].post_date)
            }
            data.loadNewer = (postData) => ArticlesListUtils.genLoadNewer(self.props.baseUrl, postData, this, self.loadNewer)
            data.loadOlder = (postData) => ArticlesListUtils.genLoadOlder(self.props.baseUrl, postData, this, self.loadOlder)
          }
        }
        const newProps = {
          ...this.props,
          disabled: this.props.disabled,
          showLoadNewer: this.state.showLoadNewer,
          showLoadOlder: this.state.showLoadOlder,
          reverse: this.state.reverse,
          parentInstance: this,
          articlesListInstances: self.articlesListInstances,
          articlesListComponents: self.state.articlesList
        }
        return <ArticlesList {...newProps} />
      }
    }

    AdapterSingle.propTypes = {
      data: PropTypes.any,
      showLoadNewer: PropTypes.any,
      showLoadOlder: PropTypes.any,
      disabled: PropTypes.bool
    }

    const ArticlesListWithData = graphql(ArticleContentQuery, { options, withRef: true })(AdapterSingle)
    ArticlesListWithData.props = {
      showLoadNewer: (adapterOptions && adapterOptions.showLoadNewer) !== false,
      showLoadOlder: (adapterOptions && adapterOptions.showLoadOlder) !== false,
      disabled: false
    }
    return ArticlesListWithData
  }

  loadNewer (dateCursor, instance) {
    const variables = {
      fromDate: dateCursor,
      toDate: undefined
    }

    const newComponent = this.getArticlesListWithData(variables, { showLoadOlder: false, reverse: true, direction: 'ASC' })
    const index = this.articlesListInstances.findIndex(e => e.wrappedInstance === instance)
    ArticlesListUtils.disableLoadNewer(this.state.articlesList[index], instance)

    this.setState((state) => {
      let newArticlesList = [...state.articlesList]
      newArticlesList.splice(index + 0, 0, newComponent) // +0 because it's BEFORE
      return { ...state, articlesList: newArticlesList }
    })
  }

  loadOlder (dateCursor, instance) {
    const variables = {
      fromDate: undefined,
      toDate: dateCursor
    }

    const newComponent = this.getArticlesListWithData(variables, { showLoadNewer: false, reverse: false, direction: 'DESC' })
    const index = this.articlesListInstances.findIndex(e => e.wrappedInstance === instance)
    ArticlesListUtils.disableLoadOlder(this.state.articlesList[index], instance)

    this.setState((state) => {
      let newArticlesList = [...state.articlesList]
      newArticlesList.splice(index + 1, 0, newComponent) // +1 because it's AFTER
      return { ...state, articlesList: newArticlesList }
    })
  }
}

PostsPage.propTypes = {
  postsCategory: PropTypes.string,
  baseUrl: PropTypes.string,
  location: PropTypes.any,
  match: PropTypes.any,
  path: PropTypes.string
}

export default PostsPage
