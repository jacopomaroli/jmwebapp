import gql from 'graphql-tag'

const ArticlesListQuery = gql`
  query ArticlesListQuery($postsCategory: String, $permalink: String, $fromDate: String, $toDate: String, $direction: String) {
    category(name: $postsCategory) {
      name
      slug
      posts(post_type: "post", limit: 3, order: {orderBy: "post_date", direction: $direction}, from_date: $fromDate, to_date: $toDate) {
        id
        post_type
        post_name
        post_title
        post_date
        post_excerpt(excerpt_length: 100)
        permalink(permalink: $permalink)
      }
    }
  }
`

export default ArticlesListQuery
