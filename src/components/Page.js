import React from 'react'
import PropTypes from 'prop-types'

import facebook from 'images/social/facebook.png'
import twitter from 'images/social/twitter.png'

const Page = ({ data }) => {
  return (
    <article id={'post-' + data.id} className={'post-' + data.id + ' page type-page status-publish hentry'}>
      <header>
        <h1 className='entry-title'>About Me</h1>
      </header>
      <div className='entry-container'>
        <div className='entrySocialContainer'>
          <div className='entrySocial'>
            <a className='facebook' href='#facebook'><img src={facebook} alt='facebook' title='share on FB' /></a>
            <a className='twitter' href='#twitter'><img src={twitter} alt='twitter' title='share on Twitter' /></a>
          </div>
        </div>
        <div className='entry-content' dangerouslySetInnerHTML={{ __html: data.post_content }} />
      </div>
    </article>
  )
}

Page.propTypes = {
  data: PropTypes.any
}

export default Page
