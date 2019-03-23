import PostsPage from './components/PostsPage'
import AboutPage from './components/AboutPage'

export default [
  {
    path: '/',
    exact: true,
    name: 'home',
    postsCategory: 'Root',
    baseUrl: '/',
    component: PostsPage
  },
  {
    path: '/tutorials',
    exact: true,
    name: 'tutorials',
    postsCategory: 'Tutorials',
    baseUrl: '/tutorials',
    component: PostsPage
  },
  {
    path: '/tutorials/:categories*/:year/:monthnum/:postname',
    name: 'tutorials',
    postsCategory: 'Tutorials',
    baseUrl: '/tutorials',
    component: PostsPage
  },
  {
    path: '/portfolio',
    exact: true,
    name: 'portfolio',
    postsCategory: 'Portfolio',
    baseUrl: '/portfolio',
    component: PostsPage
  },
  {
    path: '/portfolio/:categories*/:year/:monthnum/:postname',
    name: 'portfolio',
    postsCategory: 'Portfolio',
    baseUrl: '/portfolio',
    component: PostsPage
  },
  {
    path: '/:categories*/:year/:monthnum/:postname',
    name: 'home',
    postsCategory: 'Root',
    baseUrl: '/',
    component: PostsPage
  },
  {
    path: '/aboutme',
    exact: true,
    name: 'Aboutme',
    component: AboutPage
  }
]
