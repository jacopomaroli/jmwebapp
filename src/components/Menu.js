import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'

const MenuItem = ({ label, url }) => {
  url = (url === 'http://www.jacopomaroli.com/') ? '/' : url
  return (
    <li>
      <Link to={url}>{label}</Link>
    </li>
  )
}

MenuItem.propTypes = {
  label: PropTypes.string,
  url: PropTypes.string
}

const MenuList = ({ data: { loading, error, menus } }) => {
  if (loading) {
    return (<p>Loading ...</p>)
  }
  if (error) {
    // console.log(error)
    return (<p>{error.message}</p>)
  }
  return (
    <ul id='primary-menu' className='menu'>
      {
        menus.items.map(item => {
          let menuItemUrl = item.navitem.post_meta.find(element => element.meta_key === '_menu_item_url').meta_value
          return (<MenuItem key={item.navitem.id} label={item.navitem.post_title} url={menuItemUrl} />)
        })
      }
    </ul>
  )
}

MenuList.propTypes = {
  data: PropTypes.any
}

const menuListQuery = gql`
  query MenuListQuery {
    menus (name: "primary-menu") {
      items {
        navitem {
          id
          post_title
          post_meta {
            meta_key
            meta_value
          }
        }
      }
    }
  }
`
const MenuListWithData = graphql(menuListQuery)(MenuList)

const Menu = () => <div className='menu-primary-menu-container'><MenuListWithData /></div>

export default Menu
