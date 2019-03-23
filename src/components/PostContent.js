import React from 'react'
import PropTypes from 'prop-types'
import EntryContent from 'components/EntryContent'

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

const PostContent = ({ data: { loading, error, post } }) => {
  if (loading) {
    dispatchProgress()
    return (<p>Loading ...</p>)
  }
  if (error) {
    // console.log(error)
    dispatchLoadingsEnd()
    return (<p>{error.message}</p>)
  }

  dispatchLoadingsEnd()

  return <EntryContent content={post.post_content} />
}

PostContent.propTypes = {
  data: PropTypes.any
}

export default PostContent
