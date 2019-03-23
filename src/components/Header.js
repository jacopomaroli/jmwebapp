import React from 'react'

import Menu from 'components/Menu'

import heading from 'images/heading.png'
import headingMobile from 'images/headingMobile.png'
import steamEngine from 'images/anim/steamEngine.png'
import steam from 'images/anim/steam.png'
import boiler from 'images/boiler.png'
import whistle from 'images/whistle.png'
import magGlass from 'images/magGlass.png'
import filtersPanelArrow from 'images/arrow.png'

import facebook from 'images/social/facebook.png'
import twitter from 'images/social/twitter.png'
import linkedIn from 'images/social/linkedIn.png'
import gitHub from 'images/social/gitHub.png'
import socialTogglerFront from 'images/social/social.png'
import socialTogglerBack from 'images/social/close.png'

const Header = () => (
  <header id='masthead' className='App-header'>

    <div className='socialContainer'>
      <div className='leftContainer'>
        <a href='https://www.facebook.com/jacopomarolicom' target='_blank' rel='noopener noreferrer'><img src={facebook} alt='facebook' title='like me on FB' /></a>
        <a href='https://twitter.com/jacopomaroli' target='_blank' rel='noopener noreferrer'><img src={twitter} alt='twitter' title='tweet me' /></a>
      </div>
      <div className='rightContainer'>
        <a href='https://it.linkedin.com/in/jacopo-maroli-50615a8b' target='_blank' rel='noopener noreferrer'><img src={linkedIn} alt='linkedin' title='check my skills' /></a>
        <a href='https://github.com/jacopomaroli' target='_blank' rel='noopener noreferrer'><img src={gitHub} alt='github' title='fork me on gitHub' /></a>
      </div>
      <a className='socialToggler' href='#socialPanel'>
        <img className='front' alt='social front' src={socialTogglerFront} />
        <img className='back' alt='social back' src={socialTogglerBack} />
      </a>
    </div>

    <div className='site-branding'>
      <div id='mobileMenuTogglerContainer'>
        <a id='mobileMenuToggler' className='closed' href='#menuMobile'>&nbsp;</a>
      </div>
      <h1 className='site-title'>
        <a className='ajaxLoad' href='/' rel='home' targetid='main'>
          <img className='desktop' src={heading} alt="<?php bloginfo( 'name' ); ?>" />
          <img className='mobile' src={headingMobile} alt="<?php bloginfo( 'name' ); ?>" />
        </a>
      </h1>
      <div id='steamWhistleContainer'>
        <img src={whistle} alt='whistle' />
      </div>
      <canvas id='steamEngine' width='200' height='150' data-img-path={steamEngine} />
      <canvas id='steam' width='320' height='240' data-img-path={steam} />
      <img id='steamBoiler' src={boiler} alt='steam boiler' width='109' height='136' />
    </div>

    <nav id='site-navigation' className='main-navigation'>
      <div id='mobileMenuGears'>
        <div className='gear1' />
        <div className='gear2' />
        <div className='gear3' />
      </div>
      <Menu menu_id='primary-menu' />
      <div id='searchTogglerContainer'>
        <a id='searchToggler' href='#search'><img src={magGlass} alt='magnifier glass' /></a>
        <div id='searchFieldWrapper' className='closed'>
          <span id='searchFieldContainer' className='frame'><input id='searchField' type='text' hint='Search...' /></span>
          <span id='searchButtonContainer' className='frame'><button id='searchButton'>Go</button></span>
        </div>
      </div>
      <div className='socialContainerMobile'>
        <a href='https://www.facebook.com/jacopomarolicom' target='_blank' rel='noopener noreferrer'><img src={facebook} alt='facebook' title='like me on FB' /></a>
        <a href='https://twitter.com/jacopomaroli' target='_blank' rel='noopener noreferrer'><img src={twitter} alt='twitter' title='tweet me' /></a>
        <a href='https://it.linkedin.com/in/jacopo-maroli-50615a8b' target='_blank' rel='noopener noreferrer'><img src={linkedIn} alt='linkedin' title='check my skills' /></a>
        <a href='https://github.com/evildevil1990' target='_blank' rel='noopener noreferrer'><img src={gitHub} alt='github' title='fork me on gitHub' /></a>
      </div>
    </nav>

    <span className='liquidProgressbar' id='loadProgress'>
      <span className='liquid' />
      <span className='glass' />
    </span>
    <div id='filtersPanelWrapper'>
      <div className='leftGears'>
        <div className='gear1' />
        <div className='gear3' />
      </div>
      <div className='rightGears'>
        <div className='gear1' />
        <div className='gear3' />
      </div>
      <div id='filtersPanel' className='closed'>
        <div id='filtersPanelCanvas'>
          <ul className='noselect' />
        </div>
        <a id='filtersPanelToggler' href='#filtersPanel'><img src={filtersPanelArrow} alt='' width='41' height='31' /></a>
        <div id='filtersPanelTogglerGear' />
      </div>
    </div>

  </header>
)

export default Header
