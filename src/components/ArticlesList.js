import React from 'react'
import PropTypes from 'prop-types'
import Article from 'components/Article'
import * as ArticlesListUtils from 'components/ArticlesListUtils'

function dispatchLoadingsEnd () {
  if (typeof isSSR !== 'undefined') return

  const progressData = {
    totalProgress: 100
  }

  var mainProgressEvt = new CustomEvent('load.mainProgress', {
    detail: progressData
  })
  window.dispatchEvent(mainProgressEvt)

  var loadingStartEvt = new CustomEvent('load.loadingsEnd', {
    detail: {
      target: null
    }
  })
  window.dispatchEvent(loadingStartEvt)
}

function dispatchProgress () {
  if (typeof isSSR !== 'undefined') return

  const progressData = {
    totalProgress: 50
  }

  var mainProgressEvt = new CustomEvent('load.mainProgress', {
    detail: progressData
  })
  window.dispatchEvent(mainProgressEvt)
}

function maybeReverse (array, condition) {
  return condition ? array.slice().reverse() : array.slice()
}

const ArticlesList = ({ data: { loading, error, posts, baseUrl, loadNewer, loadOlder }, disabled, showLoadNewer, showLoadOlder, reverse, parentInstance, articlesListInstances, articlesListComponents }) => {
  if (loading) {
    dispatchProgress()
    return (<p>Loading ...</p>)
  }
  if (error) {
    // console.log(error)
    dispatchLoadingsEnd()
    return (<p>{error.message}</p>)
  }
  if (disabled) {
    dispatchLoadingsEnd()
    return (null)
  }

  let renderposts = maybeReverse(posts, reverse)

  let curIndex = -1

  function maybeDisableLoaders (chunkIndex, articleIndex, totalLen) {
    const foundIndexIsFirst = articleIndex === 0
    const foundIndexIsLast = articleIndex === totalLen - 1
    if (!foundIndexIsFirst && !foundIndexIsLast) {
      return
    }
    let disableFns = []
    // foundIndex can be first AND last in case of a single article in the chunk
    if (foundIndexIsFirst) {
      showLoadNewer = false
      disableFns.push(ArticlesListUtils.disableLoadOlder)
    }
    if (foundIndexIsLast) {
      showLoadOlder = false
      disableFns.push(ArticlesListUtils.disableLoadNewer)
    }
    if (!articlesListComponents[chunkIndex].props.disabled && disableFns.length) {
      // defer status update to avoid update state recursion.
      // Use setTimeout instead of setImmediate to avoid exception in tests
      // call all the disable loaders functions
      setTimeout(() => {
        disableFns.forEach(fn => fn(articlesListComponents[chunkIndex], articlesListInstances[chunkIndex].wrappedInstance))
      }, 0)
    }
  }

  renderposts = renderposts.reduce((acc, e) => {
    let foundAlreadyExistingPost = false
    articlesListInstances.forEach((el, chunkIndex) => {
      if (parentInstance === el.wrappedInstance) {
        curIndex = chunkIndex
        return
      }
      if (!el.wrappedInstance.props.data.posts) return

      const existingPostIds = el.wrappedInstance.props.data.posts.map(post => post.id)
      const articleIndex = existingPostIds.indexOf(e.id)
      if (articleIndex > -1) {
        maybeDisableLoaders(chunkIndex, articleIndex, existingPostIds.length)
        if (!articlesListComponents[chunkIndex].props.disabled) {
          foundAlreadyExistingPost = true
          const parentPostsIds = parentInstance.props.data.posts.map(post => post.id)
          const parentPostIndex = parentPostsIds.indexOf(e.id)
          delete parentInstance.props.data.posts[parentPostIndex]
        }
      }
    })
    return foundAlreadyExistingPost ? acc : [...acc, e]
  }, [])

  if (!renderposts.length) {
    showLoadNewer = false
    showLoadOlder = false
    if (curIndex !== -1 && articlesListComponents[curIndex]) {
      articlesListComponents[curIndex].props.disabled = true
    }
  }

  dispatchLoadingsEnd()

  return (
    <React.Fragment>
      {(showLoadNewer && renderposts.length) ? loadNewer(renderposts[0]) : null}
      {renderposts.map(post => <Article key={post.id} data={post} baseUrl={baseUrl} />)}
      {(showLoadOlder && renderposts.length) ? loadOlder(renderposts[renderposts.length - 1]) : null}
    </React.Fragment>
  )
}

ArticlesList.propTypes = {
  data: PropTypes.any,
  disabled: PropTypes.bool,
  showLoadNewer: PropTypes.bool,
  showLoadOlder: PropTypes.bool,
  reverse: PropTypes.bool,
  articlesListInstances: PropTypes.array,
  articlesListComponents: PropTypes.array,
  parentInstance: PropTypes.any
}

export default ArticlesList
