import React from 'react'
import { Switch } from 'react-router-dom'
import routes from 'routes'
import PropsRoute from 'components/routes/props-route'

const Content = () => (
  <div id='content' className='site-content'>
    <div id='leftGearsContainer'>
      <div className='gear1' />
      <div className='gear2' />
      <div className='gear3' />
    </div>
    <div id='rightGearsContainer'>
      <div className='gear1' />
      <div className='gear2' />
      <div className='gear3' />
    </div>
    <div id='primary' className='content-area'>
      <main id='main' className='site-main ajaxContent' role='main' assetid='main' asseturl='/'>
        <Switch>
          {routes.map(route => <PropsRoute key={route.name} {...route} />)}
        </Switch>
      </main>
    </div>
  </div>
)

export default Content
