import React from 'react'
import { Route } from 'react-router'
// import PropTypes from 'prop-types'

export const PropsRoute = ({ component: Component, ...props }) => (
  <Route
    {...props}
    render={renderProps => (<Component {...renderProps} {...props} />)}
  />
)

/* PropsRoute.propTypes = {
  component: React.Component,
  props: PropTypes.any
} */

export default PropsRoute
