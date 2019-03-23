import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import 'moment-timezone'
import { graphql } from 'react-apollo'
// import history from '../history'
import { URL } from 'whatwg-url'
import EntryContent from 'components/EntryContent'
import PostContent from 'components/PostContent'
import ArticleContentQuery from '../../src/components/queries/ArticleContentQuery'

import facebook from 'images/social/facebook.png'
import twitter from 'images/social/twitter.png'

class Article extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}
    let data = props.data

    this.data = this.props.data
    this.articleDate = new Date(data.post_date)
    let momentArticleDate = moment(this.articleDate)
    let tz = moment.tz.guess()
    let momentArticleDateTz = momentArticleDate.tz(tz)
    this.articleDateStr = momentArticleDateTz.format('DD MMMM YYYY')
    this.articleDateISO = momentArticleDateTz.format()
    this.fixedPermalink = this.data.permalink.replace('/uncategorized', '')
    this.absLink = new URL(this.fixedPermalink).pathname

    if (data.post_type === 'post' && !!data.post_excerpt) {
      this.state.contentType = 'excerpt'
      this.state.entryContent = <EntryContent content={data.post_excerpt} type={this.state.contentType} />
    }

    if (data.post_type === 'post' && !!props.data.post_content) {
      this.state.contentType = 'post'
      this.state.entryContent = <EntryContent content={data.post_content} type={this.state.contentType} />
    }

    this.handleReadMore = this.handleReadMore.bind(this)
    this.componentDidMount = this.componentDidMount.bind(this)
    this.componentDidUpdate = this.componentDidUpdate.bind(this)
  }

  componentDidMount () {
    // no need to replace state here for contentType === "post" because we do it elsewhere:
    // from initial visit: PostsPage
    // from load more: in handleLoadMore
    // from history back/forward: in PostsPage
    // if done here it might break, because we re-render all the articles and would end up setting
    // the url always to the one corresponding to the last article at the bottom
    /* if (this.state.contentType === 'post') {
      let key = Math.random().toString(36).substr(2, 6)
      let historyState = {
        baseUrl: this.props.baseUrl,
        date: this.articleDate
      }
      let state = {
        key: key,
        state: historyState
      }
      window.history.replaceState(state, null, this.absLink)
      window.stateObj = historyState
    } */
    if (typeof isSSR !== 'undefined') return

    window.reloadAsync()
  }

  componentDidUpdate () {
    if (typeof isSSR !== 'undefined') return

    window.reloadAsync()
  }

  handleReadMore (e) {
    e.preventDefault()

    var loadingStartEvt = new CustomEvent('load.loadingsStart', {
      detail: null
    })
    window.dispatchEvent(loadingStartEvt)

    let key = Math.random().toString(36).substr(2, 6)
    let historyState = {
      baseUrl: this.props.baseUrl,
      articleDate: this.articleDate
    }
    let state = {
      key: key,
      state: historyState
    }

    // history.push(this.absLink, historyState)

    window.history.pushState(state, null, this.absLink)
    window.stateObj = historyState

    // unblock()

    const options = {
      variables: {
        name: this.props.data.post_name
      }
    }

    const PostContentWithData = graphql(ArticleContentQuery, { options })(PostContent)
    this.setState({
      contentType: 'post',
      entryContent: <PostContentWithData />
    })
  }

  render () {
    var previewClass = this.state.contentType === 'excerpt' ? ' preview' : ''
    return (
      <div className={'postWrapper ajaxContent' + previewClass} assetid={'post-' + this.data.id} asseturl={this.absLink}>
        <article id={'post-' + this.data.id} className={'post-' + this.data.id + ' post type-post status-publish format-standard hentry category-uncategorized'}>
          <header className='entry-header'>
            <h2 className='entry-title'><a href={this.fixedPermalink} onClick={this.handleReadMore}>{ this.data.post_title.replace('-', '–') }</a></h2>
            <div className='entry-meta'>
              <span className='posted-on'>
                Posted on&nbsp;
                <a href={this.fixedPermalink}>
                  <time className='entry-date published' dateTime={this.articleDateISO}>{this.articleDateStr}</time>
                </a>
              </span>
            </div>
          </header>
          <div className='entry-container'>
            <div className='entrySocialContainer'>
              <div className='entrySocial'>
                <a className='facebook' href='#facebook'><img src={facebook} alt='facebook' title='share on FB' /></a>
                <a className='twitter' href='#twitter'><img src={twitter} alt='twitter' title='share on Twitter' /></a>
              </div>
            </div>
            {this.state.entryContent}
          </div>
          <footer className='entry-footer'>
            <span className='comments-link'>
              <a href={this.fixedPermalink + '#respond'} targetid={'post-' + this.data.id}>Leave a comment</a>
            </span>
            {(this.state.contentType === 'excerpt') &&
            <a className='readMore' href={this.fixedPermalink} rel='bookmark' onClick={this.handleReadMore}>read more</a>
            }
          </footer>
        </article>
      </div>
    )
  }
}

Article.propTypes = {
  data: PropTypes.any,
  baseUrl: PropTypes.any
}

export default Article
