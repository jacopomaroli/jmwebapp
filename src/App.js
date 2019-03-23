import React, { Component } from 'react'
import Helmet from 'react-helmet'
import Header from 'components/Header'
import Content from 'components/Content'

import 'App.css'

class App extends Component {
  render () {
    return (
      <div id='page' className='App'>
        <Helmet>
          <title>jacopomaroli.com</title>
          <meta name='description' content='The React with Server Side Rendering' />
        </Helmet>
        <div id='mastheadPlaceHolder' />
        <Header />
        <Content />
      </div>
    )
  }
}

export default App
