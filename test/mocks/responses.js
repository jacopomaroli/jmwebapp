const ArticleListData = {}
const PostContentData = {}
const Articles = {}

function getArticleSingleResponse (article) {
  const fields = [
    'id',
    'post_type',
    'post_name',
    'post_title',
    'post_date',
    'post_status',
    'post_content',
    'permalink',
    '__typename'
  ]

  return Object.keys(article)
    .filter(key => fields.includes(key))
    .reduce((obj, key) => {
      obj[key] = article[key]
      return obj
    }, {})
}

function getArticlesListResponse (article) {
  const fields = [
    'id',
    'post_type',
    'post_name',
    'post_title',
    'post_date',
    'post_status',
    'post_excerpt',
    'permalink',
    '__typename'
  ]

  return Object.keys(article)
    .filter(key => fields.includes(key))
    .reduce((obj, key) => {
      obj[key] = article[key]
      return obj
    }, {})
}

Articles.articleA = {
  'id': 12,
  'post_type': 'post',
  'post_name': 'article-a',
  'post_title': 'Article A',
  'post_date': 'Mon Jan 12 2018 00:00:00 GMT+0000 (UTC)',
  'post_status': 'publish',
  'post_excerpt': 'This is article A',
  'post_content': 'This is article A. Duis erat sapien, sodales id magna at, maximus facilisis neque. Praesent elementum lobortis volutpat',
  'permalink': 'http://www.jacopomaroli.com/2018/01/article-a',
  '__typename': 'Post'
}

Articles.articleB = {
  'id': 11,
  'post_type': 'post',
  'post_name': 'article-b',
  'post_title': 'Article B',
  'post_date': 'Mon Jan 11 2018 00:00:00 GMT+0000 (UTC)',
  'post_status': 'publish',
  'post_excerpt': 'This is article B',
  'post_content': 'This is article B. Sed dapibus quis eros at porttitor. Sed elementum interdum libero. Nulla facilisi. Integer ut auctor magna',
  'permalink': 'http://www.jacopomaroli.com/2018/01/article-b',
  '__typename': 'Post'
}

Articles.articleC = {
  'id': 10,
  'post_type': 'post',
  'post_name': 'article-c',
  'post_title': 'Article C',
  'post_date': 'Mon Jan 10 2018 00:00:00 GMT+0000 (UTC)',
  'post_status': 'publish',
  'post_excerpt': 'This is article C',
  'post_content': 'This is article C. Proin eget nunc mollis, iaculis lacus quis, aliquet mi. Praesent aliquam, augue id tincidunt aliquet',
  'permalink': 'http://www.jacopomaroli.com/2018/01/article-c',
  '__typename': 'Post'
}

Articles.articleD = {
  'id': 9,
  'post_type': 'post',
  'post_name': 'article-d',
  'post_title': 'Article D',
  'post_date': 'Mon Jan 09 2018 00:00:00 GMT+0000 (UTC)',
  'post_status': 'publish',
  'post_excerpt': 'This is article D',
  'post_content': 'This is article D. Cras ac tortor in erat imperdiet iaculis. Donec quis viverra lorem. Pellentesque non est in ex tempus iaculis',
  'permalink': 'http://www.jacopomaroli.com/2018/01/article-d',
  '__typename': 'Post'
}

Articles.articleE = {
  'id': 8,
  'post_type': 'post',
  'post_name': 'article-e',
  'post_title': 'Article E',
  'post_date': 'Mon Jan 08 2018 00:00:00 GMT+0000 (UTC)',
  'post_status': 'publish',
  'post_excerpt': 'This is article E',
  'post_content': 'This is article E. Aliquam et ligula quis quam semper elementum vitae at nibh. Aliquam id massa lacus',
  'permalink': 'http://www.jacopomaroli.com/2018/01/article-e',
  '__typename': 'Post'
}

Articles.articleF = {
  'id': 7,
  'post_type': 'post',
  'post_name': 'article-f',
  'post_title': 'Article F',
  'post_date': 'Mon Jan 07 2018 00:00:00 GMT+0000 (UTC)',
  'post_status': 'publish',
  'post_excerpt': 'This is article F',
  'post_content': 'This is article F. Maecenas eget ex elit. Etiam blandit suscipit ipsum quis lacinia. Nullam sed luctus nisi',
  'permalink': 'http://www.jacopomaroli.com/2018/01/article-f',
  '__typename': 'Post'
}

Articles.articleTutorialA = {
  'id': 6,
  'post_type': 'post',
  'post_name': 'tutorial-a',
  'post_title': 'Tutorial A',
  'post_date': 'Mon Jan 06 2018 00:00:00 GMT+0000 (UTC)',
  'post_status': 'publish',
  'post_excerpt': 'This is Tutorial A',
  'post_content': 'This is Tutorial A. Praesent pretium leo nibh, et mollis arcu fermentum at. Morbi quis nisi felis',
  'permalink': 'http://www.jacopomaroli.com/2018/01/tutorial-a',
  '__typename': 'Post'
}

Articles.articleTutorialB = {
  'id': 5,
  'post_type': 'post',
  'post_name': 'tutorial-b',
  'post_title': 'Tutorial B',
  'post_date': 'Mon Jan 05 2018 00:00:00 GMT+0000 (UTC)',
  'post_status': 'publish',
  'post_excerpt': 'This is Tutorial B',
  'post_content': 'This is Tutorial B. Etiam commodo nisl quis ex pretium porttitor. Sed consequat, diam id porttitor posuere',
  'permalink': 'http://www.jacopomaroli.com/2018/01/tutorial-b',
  '__typename': 'Post'
}

Articles.articleTutorialC = {
  'id': 4,
  'post_type': 'post',
  'post_name': 'tutorial-c',
  'post_title': 'Tutorial C',
  'post_date': 'Mon Jan 04 2018 00:00:00 GMT+0000 (UTC)',
  'post_status': 'publish',
  'post_excerpt': 'This is Tutorial C',
  'post_content': 'This is Tutorial C. Donec nec quam mattis, pretium ipsum vitae, molestie sapien. Vivamus lobortis scelerisque augue eu malesuada',
  'permalink': 'http://www.jacopomaroli.com/2018/01/tutorial-c',
  '__typename': 'Post'
}

Articles.articleTutorialD = {
  'id': 3,
  'post_type': 'post',
  'post_name': 'tutorial-d',
  'post_title': 'Tutorial D',
  'post_date': 'Mon Jan 03 2018 00:00:00 GMT+0000 (UTC)',
  'post_status': 'publish',
  'post_excerpt': 'This is Tutorial D',
  'post_content': 'This is Tutorial D. Duis sem nunc, pretium sit amet justo at, finibus laoreet ligula. Curabitur eget tempor lacus. Sed gravida viverra ornare',
  'permalink': 'http://www.jacopomaroli.com/2018/01/tutorial-d',
  '__typename': 'Post'
}

Articles.articleTutorialE = {
  'id': 2,
  'post_type': 'post',
  'post_name': 'tutorial-e',
  'post_title': 'Tutorial E',
  'post_date': 'Mon Jan 02 2018 00:00:00 GMT+0000 (UTC)',
  'post_status': 'publish',
  'post_excerpt': 'This is Tutorial E',
  'post_content': 'This is Tutorial E. Quisque rutrum arcu sed ligula feugiat, quis lobortis leo mollis. Vivamus euismod rutrum ligula',
  'permalink': 'http://www.jacopomaroli.com/2018/01/tutorial-e',
  '__typename': 'Post'
}

Articles.articleTutorialF = {
  'id': 1,
  'post_type': 'post',
  'post_name': 'tutorial-f',
  'post_title': 'Tutorial F',
  'post_date': 'Mon Jan 01 2018 00:00:00 GMT+0000 (UTC)',
  'post_status': 'publish',
  'post_excerpt': 'This is Tutorial F',
  'post_content': 'This is Tutorial F. Sed turpis dolor, aliquam et felis tincidunt, molestie consectetur nulla. Phasellus venenatis finibus erat',
  'permalink': 'http://www.jacopomaroli.com/2018/01/tutorial-f',
  '__typename': 'Post'
}

PostContentData.articleA = {
  'post': getArticleSingleResponse(Articles.articleA)
}

PostContentData.articleB = {
  'post': getArticleSingleResponse(Articles.articleB)
}

PostContentData.articleC = {
  'post': getArticleSingleResponse(Articles.articleC)
}

PostContentData.articleD = {
  'post': getArticleSingleResponse(Articles.articleD)
}

PostContentData.articleE = {
  'post': getArticleSingleResponse(Articles.articleE)
}

PostContentData.articleF = {
  'post': getArticleSingleResponse(Articles.articleF)
}

PostContentData.articleTutorialA = {
  'post': getArticleSingleResponse(Articles.articleTutorialA)
}

PostContentData.articleTutorialB = {
  'post': getArticleSingleResponse(Articles.articleTutorialB)
}

PostContentData.articleTutorialC = {
  'post': getArticleSingleResponse(Articles.articleTutorialC)
}

PostContentData.articleTutorialD = {
  'post': getArticleSingleResponse(Articles.articleTutorialD)
}

PostContentData.articleTutorialE = {
  'post': getArticleSingleResponse(Articles.articleTutorialE)
}

PostContentData.articleTutorialF = {
  'post': getArticleSingleResponse(Articles.articleTutorialF)
}

ArticleListData.oneArticleRoot1 = {
  'category': {
    'name': 'Root',
    'slug': 'root',
    '__typename': 'Category',
    'posts': [
      getArticlesListResponse(Articles.articleA)
    ]
  }
}

ArticleListData.threeArticlesRoot1 = {
  'category': {
    'name': 'Root',
    'slug': 'root',
    '__typename': 'Category',
    'posts': [
      getArticlesListResponse(Articles.articleA),
      getArticlesListResponse(Articles.articleB),
      getArticlesListResponse(Articles.articleC)
    ]
  }
}

ArticleListData.threeArticlesRoot15 = {
  'category': {
    'name': 'Root',
    'slug': 'root',
    '__typename': 'Category',
    'posts': [
      getArticlesListResponse(Articles.articleB),
      getArticlesListResponse(Articles.articleC),
      getArticlesListResponse(Articles.articleD)
    ]
  }
}

ArticleListData.threeArticlesRoot2 = {
  'category': {
    'name': 'Root',
    'slug': 'root',
    '__typename': 'Category',
    'posts': [
      getArticlesListResponse(Articles.articleD),
      getArticlesListResponse(Articles.articleE),
      getArticlesListResponse(Articles.articleF)
    ]
  }
}

ArticleListData.threeArticlesRootNewerThanE = {
  'category': {
    'name': 'Root',
    'slug': 'root',
    '__typename': 'Category',
    'posts': [
      getArticlesListResponse(Articles.articleD),
      getArticlesListResponse(Articles.articleC),
      getArticlesListResponse(Articles.articleB)
    ]
  }
}

ArticleListData.threeArticlesRootNewerThanD = {
  'category': {
    'name': 'Root',
    'slug': 'root',
    '__typename': 'Category',
    'posts': [
      getArticlesListResponse(Articles.articleC),
      getArticlesListResponse(Articles.articleB),
      getArticlesListResponse(Articles.articleA)
    ]
  }
}

ArticleListData.threeArticlesRootNewerThanB = {
  'category': {
    'name': 'Root',
    'slug': 'root',
    '__typename': 'Category',
    'posts': [
      getArticlesListResponse(Articles.articleA)
    ]
  }
}

ArticleListData.threeArticlesTutorials1 = {
  'category': {
    'name': 'Tutorials',
    'slug': 'tutorials',
    '__typename': 'Category',
    'posts': [
      getArticlesListResponse(Articles.articleTutorialA),
      getArticlesListResponse(Articles.articleTutorialB),
      getArticlesListResponse(Articles.articleTutorialC)
    ]
  }
}

ArticleListData.threeArticlesTutorials2 = {
  'category': {
    'name': 'Tutorials',
    'slug': 'tutorials',
    '__typename': 'Category',
    'posts': [
      getArticlesListResponse(Articles.articleTutorialF),
      getArticlesListResponse(Articles.articleTutorialE),
      getArticlesListResponse(Articles.articleTutorialD)
    ]
  }
}

export default {
  ArticleListData,
  PostContentData
}
