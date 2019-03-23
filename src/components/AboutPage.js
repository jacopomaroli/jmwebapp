import React from 'react'
import PropTypes from 'prop-types'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import Helmet from 'react-helmet'

import Page from 'components/Page'

const AboutPageElement = ({ data: { loading, error, post } }) => {
  if (loading) {
    return (<p>Loading ...</p>)
  }
  if (error) {
    // console.log(error)
    return (<p>{error.message}</p>)
  }
  return (<Page data={post} />)
}

AboutPageElement.propTypes = {
  data: PropTypes.any
}

const AboutPageQuery = gql`
  query AboutPageQuery($permalink: String) {
    post(id: 47){
      id
      post_type
      post_name
      post_title
      post_date
      post_content
      permalink(permalink: $permalink)
    }
  }
`
const options = {
  variables: {
    permalink: '/%category%/%year%/%monthnum%/%postname%'
  }
}

const AboutWithData = graphql(AboutPageQuery, { options })(AboutPageElement)

class About extends React.Component {
  constructor (props) {
    super(props)

    this.render = this.render.bind(this)
    this.componentDidMount = this.componentDidMount.bind(this)
  }

  componentDidMount () {
    if (typeof isSSR !== 'undefined') return

    let key = Math.random().toString(36).substr(2, 6)
    let historyState = {
      baseUrl: '/aboutme'
    }
    let state = {
      key: key,
      state: historyState
    }
    window.history.replaceState(state, null, this.props.location.pathname)
    window.stateObj = historyState

    window.reloadAsync()
  }

  render () {
    return (
      <div>
        <Helmet>
          <title>About</title>
          <meta name='description' content='The page about ...' />
        </Helmet>
        <AboutWithData />
      </div>
    )
  }
}

About.propTypes = {
  // year: PropTypes.string,
  // monthnum: PropTypes.string,
  // postname: PropTypes.string,
  location: PropTypes.any,
  match: PropTypes.any
}

export default About
