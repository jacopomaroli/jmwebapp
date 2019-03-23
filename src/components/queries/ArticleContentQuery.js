import gql from 'graphql-tag'

const ArticleContentQuery = gql`
query ArticleContentQuery($name: String!, $permalink: String) {
  post(name:$name){
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

export default ArticleContentQuery
