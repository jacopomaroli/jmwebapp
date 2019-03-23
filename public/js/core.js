var prevScroll = -1
var canScroll = true
var nativeScrollRestoration = false
var hasFilters = false
var tagList = null

var baseSlug = null
var sectionSlug = null
var categorySlugArray = null

var currentAsyncReqs = []

function reqIsStillValid (reqToCheck) {
  for (var i = 0; i < currentAsyncReqs.length; i++) {
    if (currentAsyncReqs[i].req == reqToCheck) { return true }
  }
  return false
}

function removeReqByAction (action) {
  var elmToRemove = null
  var index = -1
  for (var i = 0; i < currentAsyncReqs.length; i++) {
    if (currentAsyncReqs[i].action == action) {
      index = i
      break
    }
  }
  if (index > -1) { currentAsyncReqs.splice(index, 1) }
}

var Tag = function () {
  this.elm = null
  this.name = ''
  this.enabled = true
}

var Post = function () {
  this.$elm
  this.id
  this.tags = []
  this.url
}

Post.prototype.constructor = Post

Post.prototype.isFilteredOut = function () {
  var isFilteredOut = true

  if (!this.tags.length) { isFilteredOut = false }
  for (key in this.tags) {
    if (JSQL.select(tagList, ['*'], [['name', this.tags[key]]])[0].enabled) {
      isFilteredOut = false
      break
    }
  }

  // add here other filters matching criteria (by section, by date ecc...)

  return isFilteredOut
}

Post.prototype.getExcerpt = function (callback) {
  $.ajax({
    type: 'post',
    url: '/fetcher',
    method: 'GET',
    data: { action: 'getPostExcerpt', id: this.id },
    error: function (XMLHttpRequest, textStatus, errorThrown) {
      console.log('error')
    },
    success: function (data, textStatus) {
      var $response = $('<div class="responseContainer"/>').append(data)
      var $responseObj = $('> *', $response)

      callback.call(null, $responseObj)
    }
  })
}

function addLoadEvts () {
  function loadingsEnd () {
    trackPageView()

    /* var targetArray = e.detail.target.getElements()
    smoothScroll($(targetArray[0]), -10, function () {
      postList.enablePlaceholderWp()
    }) */
    $('#loadProgress .liquid').animate({ 'width': '0' })

    if ($steamEngine.is(':visible')) { steamEngine_canvasAnimAPI.end() }
    steam_canvasAnimAPI.config({
      callbacks: {
        endCycle: function () {
          steam_canvasAnimAPI.config({
            callbacks: {
              endCycle: function () {}
            }
          })
        }
      }
    })
    steam_canvasAnimAPI.play(1)

    // if (!$('.postWrapper').length) { loadOlderPosts() }
  }

  window.addEventListener('load.mainProgress', function (e) {
    let callback = () => {}
    if (e.detail.totalProgress === 100) {
      callback = loadingsEnd
      // documentHeightUpdated()
      // updateCategoryInfo()
    }
    $('#loadProgress .liquid').animate({ 'width': e.detail.totalProgress + '%' }, 500, callback)
  })
  window.addEventListener('load.loadingsStart', function (e) {
    if ($steamEngine.is(':visible')) { steamEngine_canvasAnimAPI.play(-1) }
  })
  /* window.addEventListener('load.loadingsEnd', function (e) {
    loadingsEnd()
  }) */
}

function loadUrlBeforeCallback (url, target, options, next) {
  var targetElm = sal.getTargetByAttr('id', target)

  if (target.indexOf('main') === 0) {
    next()
  } else if (target.indexOf('post-') === 0) {
    if (!targetElm) {
      var oldPost = postList.getPostByAttr('url', stateObj.contentUrl)
      var newPost = postList.getPostByAttr('id', parseInt(target.split('-')[1]))
      var direction = (oldPost && postList.list.indexOf(oldPost) >
					postList.list.indexOf(newPost)) ? 'before' : 'after'
      addMissingPostPlaceholder(newPost, direction)
      var url = newPost.$elm.attr('asseturl')
      sal.addTarget(target, url, 'main')
    }
    reloadAsyncArticle()
    next()
  } else {
    next()
  }
}

function loadUrlAfterCallback (url, target, options, response, next) {
  var target = sal.getTargetByAttr('id', target)
  var targetArray = target.getElements()
  var $response = $('<div/>').append(response) // article wrapper needed in home & articles!
  var croppers = []

  	var animSemaphore = new Semaphore()
  var i = 0
  for (var key in targetArray) {
    var elem = targetArray[key]
    var $elem = $(elem)

  		var $cropper = $('<div class="cropper">')
  		$cropper.css('height', outerHeight(elem) + 'px')

  		var $objToReplace = $('.ajaxContent[assetid=' + target.id + ']', $response).clone(true, true)
  		$objToReplace.find('> *').wrapAll($cropper)

	  	$elem.replaceWith($objToReplace)
	  	var $cropperDOM = $objToReplace.find('.cropper')

    $response.find('script').each(function () {
	        eval($(this).html())
	    })

	  	var totalHeight = 0
	  	$cropperDOM.children().each(function () {
		    totalHeight += outerHeight(this)
    })
	  	$cropperDOM.data('finalHeight', totalHeight)
	  	croppers.push({ index: i, elm: $cropperDOM.get(0), finalHeight: totalHeight })
	  	animSemaphore.setupLight(i, false)
	  	i++
  	};

  	postList.reloadPostsFromDOM() // because of "$elem.replaceWith($objToReplace);"

  	var animEnd = function () {
  		sal.updateHistory(url, target, options, $response.get(0))
 	  	manageByType()
  }

  	animSemaphore.setupCallback(animEnd)

  for (var key in croppers) {
    (function (cropper) {
      $(cropper.elm).animate({ 'height': cropper.finalHeight + 'px' }, {
	      		duration: 700,
	      		complete: function () {
	      			$(this).find('> *').unwrap()
	      			animSemaphore.updateLight(cropper.index, true)
	      		}
	      	})
    })(croppers[key])
  }

  function manageByType () {
    if (target.id.indexOf('main') === 0) {
      postList.loadPostListCallbacks = []
      postList.addCallback(function () {
        next()
      })
      reloadAsync()
    } else if (target.id.indexOf('post-') === 0) {
      next()
    } else {
      next()
    }
  }
}

function setupSal () {
  /* sal.init()
  sal.setLoadUrlBeforeCallback(loadUrlBeforeCallback)
  sal.setLoadUrlAfterCallback(loadUrlAfterCallback) */
  // addSalEvts()
  addLoadEvts()
  /* setupTargets()
  sal.setHistoryHierarchyFromUrl() */
}

function prepareMenuTriggers () {
  $('#primary-menu li a').each(function (index, elm) {
    this.classList.add('ajaxLoad')
    this.setAttribute('targetid', 'main')
  })
}

function preparePostTriggers ($elm) {
  $elm.each(function (index, postWrapper) {
    var selector = '.entry-title > a, .comments-link > a , .readMore'
    var $triggerElems = $(selector, postWrapper).filter(function () {
      return typeof this.sal === 'undefined' || !this.sal.init
    }).each(function (index, elm) {
      elm.classList.add('ajaxLoad')
      elm.setAttribute('targetid', postWrapper.getAttribute('assetid'))
    })
  })
}

function setupTriggers ($elm) {
  $('.ajaxLoad', $elm).filter(function () {
    return typeof this.sal === 'undefined' || !this.sal.init
  }).each(function (index, elm) {
    sal.addTrigger(elm)
  })
}

function setupTargets ($elm) {
  $('.ajaxContent', $elm).each(function (index, elm) {
    var parentTargetid = ''
    var assetid = $(this).attr('assetid')
    var asseturl = $(this).attr('asseturl')
    if (assetid === 'main') parentTargetid = 'root'
    if (!assetid.indexOf('post-')) parentTargetid = 'main'
    sal.addTarget(assetid, asseturl, parentTargetid)
  })
}

function addMissingPostPlaceholder (post, direction) // direction needed because of intermediate placeholders placement
{
  // could have been loaded other posts between the prevhistory state and the current history state.
  // no anchor to prev post.
  // anchor to first/last dom postWrapper. if is a placeholder fill it.
  // load until first element inbetween
  var postIndex = postList.list.indexOf(post)

  if (post.$elm && post.$elm.is('.placeholder') && post.placeholderWP) {
    post.placeholderWP.up.destroy()
    post.placeholderWP.down.destroy()
    delete post.placeholderWP
  } else {
    var placeholderList = []
    var i = postIndex
    var dirOffset = (direction == 'before') ? 1 : -1
    var j = postIndex + dirOffset

    // find hole before/after first existing element inbetween
    while (j > -1 && j < postList.list.length && !postList.list[j].$elm) j += dirOffset

    var $prevAnchor = null
    if (j > -1 && j < postList.list.length) {
      $prevAnchor = (direction == 'before') ? postList.list[j].$elm.prev() : postList.list[j].$elm.next()

      while (i > -1 && i < postList.list.length && !postList.list[i].$elm) {
        postList.list[i].$elm = $('<div class="postWrapper placeholder" assetid="post-' + postList.list[i].id + '" />')
        if (direction == 'before') $prevAnchor.after(postList.list[i].$elm); else $prevAnchor.before(postList.list[i].$elm)
        $prevAnchor = postList.list[i].$elm
        if (i != postIndex) placeholderList.push(postList.list[i]) // don't push current post
        i += dirOffset
      }
    } else {
      // if no posts are found just load the requested one
      if (j == -1) { $prevAnchor = $('#loadNewer'); direction = 'before' }
      if (j == postList.list.length) { $prevAnchor = $('#loadOlder'); direction = 'after' }

      postList.list[i].$elm = $('<div class="postWrapper placeholder" assetid="post-' + postList.list[i].id + '" />')
      if (direction == 'before') $prevAnchor.after(postList.list[i].$elm); else $prevAnchor.before(postList.list[i].$elm)
    }
  }

  // use setupAjaxLoad($elm)

  post.$elm.attr('asseturl', post.url)
  post.$elm.removeClass('placeholder')

  addPostsPlaceholders(placeholderList)
}

function updatePostVisibility () {
  for (var i = 0; i < postList.list.length; i++) {
    if (typeof postList.list[i].$elm === 'undefined') continue
    var visible = !postList.list[i].tags.length
    for (var j = 0; j < postList.list[i].tags.length; j++) {
      visible = visible || settings.data.selectedTags[postList.list[i].tags[j]]
    }
    if (visible) { postList.list[i].$elm.show() } else { postList.list[i].$elm.hide() }
  };
}

function addPostsPlaceholdersWp (post) {
  post.placeholderWP = { up: null, down: null }

  post.placeholderWP.up = new Waypoint({
	  element: post.$elm.get(0),
	  handler: function (direction) {
	    if (sal.isManagingHistory()) return
	    if (direction === 'down') {
      }
      if (direction === 'up') {
        this.destroy()
        post.placeholderWP = undefined
        loadPreviewInterval([post], 'after')
      }
	  },
	  offset: function () { return headingOffset }
  })

  post.placeholderWP.down = new Waypoint({
	  element: post.$elm.get(0),
	  handler: function (direction) {
	    if (sal.isManagingHistory()) return
	    if (direction === 'down') {
        // why this fires up?! -> context.js (freshWaypoint && axis.oldScroll >= waypoint.triggerPoint) -> check if we're in viewport!
        if (
          $window.scrollTop() >= this.triggerPoint && // top
				$window.scrollTop() < this.triggerPoint + (Waypoint.viewportHeight() - headingOffset + 10) // bottom //10 = margintop/2
			  ) {
          this.destroy()
          post.placeholderWP = undefined
          loadPreviewInterval([post], 'after')
        }
      }
      if (direction === 'up') {
      }
	  },
	  offset: function () { return Waypoint.viewportHeight() }
  })
}

function addPostsPlaceholders (placeholderList) {
  // if existing2 - existing1 > 3 add load inbetween else add wp
  // remember load newer/older placeholders! Stop when first/last available reached!
  // results are surely post or preview. no placeholder or undefined is possible

  $('.inbetweenLoader').remove()

  var firstPostIndex = 0
  var placeholderWpCounter = 0
  var newSection = true
  var lastPostIndex = postList.list.length - 1
  for (; firstPostIndex < postList.list.length && typeof postList.list[firstPostIndex].$elm === 'undefined'; firstPostIndex++);
  for (; lastPostIndex >= 0 && typeof postList.list[lastPostIndex].$elm === 'undefined'; lastPostIndex--);

  var lastStartIndex = firstPostIndex
  // for(var i = 0; i < postList.list.length; i++)
  for (var i = firstPostIndex; i <= lastPostIndex; i++) {
    // proceed until first post (non placeholder)
    if (postList.list[i].$elm.is('.placeholder') && !postList.list[i].$elm.is('.loading')) {
      placeholderWpCounter++
      newSection = true // avoid adding wp in case we are in a post block
      // without this it would be added in the following wrong case (T -> true (post) / F -> false (placeholder))
      // FFFTTTFTFF
      //     ^^
    } else {
      if (placeholderWpCounter > 3 && newSection) {
        // add load before lastStartIndex
        var $inBetweenOlder = $('<a class="framedPaperInset postLoaderTrigger show inbetweenLoader" href="#"><span>Load older posts</span></a>')
        $inBetweenOlder.insertBefore(postList.list[lastStartIndex].$elm)
        $inBetweenOlder.on('click', function (e) {
          e.preventDefault()
          loadOlderPosts($(this).prev('.postWrapper'))
          addPostsPlaceholders()
        })

        // add load before current post element
        var $inBetweenNewer = $('<a class="framedPaperInset postLoaderTrigger show inbetweenLoader" href="#"><span>Load newer posts</span></a>')
        $inBetweenNewer.insertBefore(postList.list[i].$elm)
        $inBetweenNewer.on('click', function (e) {
          e.preventDefault()
          loadNewerPosts($(this).next('.postWrapper'))
          addPostsPlaceholders()
        })
      }
      if (placeholderWpCounter <= 3 && newSection) {
        // add load on waypoint to all previous posts
        for (var j = lastStartIndex; j < i; j++) {
          addPostsPlaceholdersWp(postList.list[j])
        }
      }
      placeholderWpCounter = 0
      newSection = false
      lastStartIndex = i + 1 // next elm might be the start of new block of placeholders
    }
  };
}

function addLoadWPToPlaceholderByTag (tagName) {
  var placeholderList = []

  for (key in postList.list) {
    if (postList.list[key].tags.indexOf(tagName) > -1 && typeof postList.list[key].$elm !== 'undefined' && postList.list[key].$elm.is('.placeholder')) { placeholderList.push(postList.list[key]) }
  }

  addPostsPlaceholders(placeholderList)
}

var postList = (function () {
  var loadPostListCallbacks = []
  var list = []
  var dirtyState = true

  function addCallback (callback) {
    // if(dirtyState)
    loadPostListCallbacks.push(callback)
    // else
    // callback.call(null);
  }

  function load (categorySlug) {
    if (categorySlugArray === null) return

    removeReqByAction('listAll')
    var categorySlug = (typeof categorySlug !== undefined) ? categorySlug : null
    dirtyState = true
    var curReq = $.ajax({
      type: 'post',
      url: '/fetcher',
      method: 'GET',
      data: { action: 'listAll', categorySlug: categorySlug },
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        console.log('error')
      },
      success: function (data, textStatus) {
        if (!reqIsStillValid(curReq)) return
        postList.list = []
        var postListData = JSON.parse(data)
        for (key in postListData) {
          var post = new Post()
          $.extend(post, postListData[key])
          postList.list.push(post)
        }
        // debug start
        postIds = []
        for (key in postList.list) { postIds.push(postList.list[key].id) }
        console.log(postIds)
        // debug end

        // addPrevNextLoaders(); // TODO: keep an eye on to see if everything's ok
        updatePrevNextVisibility()
        var $postWrapper = $('.postWrapper')
        if ($postWrapper.length) {
          for (var i = 0; i < $postWrapper.length; i++) {
            var id = parseInt($postWrapper.eq(i).attr('assetid').replace('post-', ''))
            var postListObj = postList.getPostByAttr('id', id)
            if (!postListObj) continue
            postListObj.$elm = $postWrapper.eq(i)
          }
        } else { loadOlderPosts() }

        for (key in loadPostListCallbacks) {
          loadPostListCallbacks[key]()
        }
        loadPostListCallbacks = []
        dirtyState = false
      }
    })

    currentAsyncReqs.push({ action: 'listAll', req: curReq })
  }

  function loadFromDOM () {
    postList.clear()
    postList.list = []
    var $postWrapper = $('.postWrapper')
    for (var i = 0; i < $postWrapper.length; i++) {
      var post = new Post()
      post.$elm = $postWrapper.eq(i)
      post.id = parseInt(post.$elm.attr('assetid').replace('post-', ''))
      post.url = post.$elm.attr('asseturl')
      post.tags = post.$elm.find('.entry-footer .tags-links a').map(function () { return $(this).text() })
      postList.list.push(post)
    }
    addPrevNextLoaders()
    updatePrevNextVisibility()
  }

  function reloadPostsFromDOM () {
    $('.postWrapper:not(.placeholder)').each(function (index, elm) {
      var $this = $(this)
      var postListObj = postList.getPostByAttr('id', $this.attr('assetid').replace('post-', ''))
      postListObj.$elm = $this
    })
  }

  function enablePlaceholderWp () {
    for (key in postList.list) {
      if (!!postList.list[key].$elm && !!postList.list[key].placeholderWP) {
        postList.list[key].placeholderWP.up.enable()
        postList.list[key].placeholderWP.down.enable()
      }
    }
  }

  function disablePlaceholderWp () {
    for (key in postList.list) {
      if (!!postList.list[key].$elm && !!postList.list[key].placeholderWP) {
        postList.list[key].placeholderWP.up.disable()
        postList.list[key].placeholderWP.down.disable()
        // var wplist = Waypoint.Context.findByElement(window).vertical;
      }
    }
  }

  function getPostByAttr (attr, val) {
    for (var i = 0; i < postList.list.length; i++) {
      if (postList.list[i][attr] == val) { return postList.list[i] }
    }
    return undefined
  }

  function clear () {
    if (!postList.list) return
    postList.removeAll()
    postList.list = null
  }

  function removeAll () {
    if (!postList.list) return
    var $collection = $([])
    for (var i = 0; i < postList.list.length; i++) {
      $collection = $collection.add(postList.list[i].$elm)
      postList.list[i].$elm = undefined
    }
    $collection.remove()
  }

  return {
    loadPostListCallbacks: loadPostListCallbacks,
    addCallback: addCallback,
    load: load,
    loadFromDOM: loadFromDOM,
    reloadPostsFromDOM: reloadPostsFromDOM,
    list: list,
    dirtyState: dirtyState,
    enablePlaceholderWp: enablePlaceholderWp,
    disablePlaceholderWp: disablePlaceholderWp,
    dirtyState: dirtyState,
    getPostByAttr: getPostByAttr,
    clear: clear,
    removeAll: removeAll
  }
})()

// TODO put in postList obj
function loadPreviewInterval (postsToLoad, direction) {
  var myCallback = null;

  (function (postsToLoad) {
    myCallback = function () {
      for (var i = 0; i < postsToLoad.length; i++) {
        postsToLoad[i].$elm.removeClass('loading')
      }
      reloadAsyncArticle()
    }
  })(postsToLoad)

  var scrollSemaphore = new Semaphore(myCallback)

  for (var i = 0; i < postsToLoad.length; i++) {
    scrollSemaphore.setupLight('' + i, false);

    (function (i, scrollSemaphore) {
      postsToLoad[i].$elm.addClass('loading')
      postsToLoad[i].getExcerpt(function ($responseObj) {
        if (!postsToLoad[i].$elm.is('.placeholder')) return
        var old_height = $(document).height()
        var old_scroll = $(window).scrollTop()
        postsToLoad[i].$elm.replaceWith($responseObj)
        postsToLoad[i].$elm = $responseObj
        if (direction == 'before') { $(document).scrollTop(old_scroll + $(document).height() - old_height) }

        scrollSemaphore.updateLight('' + i, true)
      })
    })(i, scrollSemaphore)
  }
}

function getSubcategories (slug, callback) {
  removeReqByAction('getSubcategories')
  var curReq = $.ajax({
    type: 'post',
    url: '/fetcher',
    method: 'GET',
    data: { action: 'getSubcategories', categorySlug: slug },
    error: function (XMLHttpRequest, textStatus, errorThrown) {
      console.log('error')
    },
    success: function (data, textStatus) {
      if (!reqIsStillValid(curReq)) return
      var sections = JSON.parse(data)
      callback.call(null, sections)
    }
  })
  currentAsyncReqs.push({ action: 'getSubcategories', req: curReq })
}

// TODO merge with loadOlder
function loadNewerPosts ($prevAnchor) {
  if (!postList.list || sal.isManagingHistory()) return
  var postToLoadCount = 3
  var postListToLoad = []
  var startIndex = 0
  var $postWrapper = $('.postWrapper')

  if ($postWrapper.length) {
    $prevAnchor = ($prevAnchor) || $postWrapper.first()
    var postListObj = postList.getPostByAttr('id', parseInt($prevAnchor.attr('assetid').replace('post-', '')))
    startIndex = postList.list.indexOf(postListObj) - 1
    if (startIndex < 0) return
  } else {
    $prevAnchor = $('#loadOlder, #main > nav.navigation.posts-navigation a')
  }

  for (var i = startIndex; postListToLoad.length < postToLoadCount && i >= 0; i--) {
    postList.list[i].$elm = (postList.list[i].$elm) ? postList.list[i].$elm : $('<div class="postWrapper placeholder" assetid="post-' + postList.list[i].id + '" />')
    $prevAnchor.before(postList.list[i].$elm)
    $prevAnchor = postList.list[i].$elm
    if (!postList.list[i].isFilteredOut()) { postListToLoad.push(postList.list[i]) }
  }
  postListToLoad.reverse()

  loadPreviewInterval(postListToLoad, 'before')
}

// TODO merge with loadNewer
function loadOlderPosts ($prevAnchor) {
  if (!postList.list || sal.isManagingHistory()) return
  var postToLoadCount = 3
  var postListToLoad = []
  var startIndex = 0
  var $postWrapper = $('.postWrapper')

  if ($postWrapper.length) {
    $prevAnchor = ($prevAnchor) || $postWrapper.last()
    var postListObj = postList.getPostByAttr('id', parseInt($prevAnchor.attr('assetid').replace('post-', '')))
    startIndex = postList.list.indexOf(postListObj) + 1
    if (startIndex > postList.list.length) return
  } else {
    $prevAnchor = $('#loadNewer')
  }

  for (var i = startIndex; postListToLoad.length < postToLoadCount && i < postList.list.length; i++) {
    postList.list[i].$elm = (postList.list[i].$elm) ? postList.list[i].$elm : $('<div class="postWrapper placeholder" assetid="post-' + postList.list[i].id + '" />')
    $prevAnchor.after(postList.list[i].$elm)
    $prevAnchor = postList.list[i].$elm
    if (!postList.list[i].isFilteredOut()) { postListToLoad.push(postList.list[i]) }
  }

  loadPreviewInterval(postListToLoad, 'after')
}

var loadOlderWP = [{}]
var loadNewerWP = [{}]

function addPrevNextLoaders () {
  if (typeof stateObj === 'undefined') return

  var $loadNewer = $('#loadNewer')
  var $loadOlder = $('#loadOlder, #main > nav.navigation.posts-navigation a')
  var baseCategorySlug = stateObj.baseUrl.slice(1).split('/')[0]

  if (baseCategorySlug == 'tutorials') {
    $loadNewer.on('click', function (e) {
      e.preventDefault()
      loadNewerPosts()
    })
    $loadNewer.css('cursor', 'pointer')
  } else {
    loadNewerWP = $loadNewer.waypoint(function (direction) {
      if (!$loadNewer.hasClass('show')) return

      if (direction === 'down') {
      }
      if (direction === 'up') {
        loadNewerPosts()
      }
    }, { offset: function () { return headingOffset } })
  }

  loadOlderWP = $loadOlder.waypoint(function (direction) {
    if (!$loadOlder.hasClass('show')) return

    if (direction === 'down') {
      loadOlderPosts()
    }
    if (direction === 'up') {
    }
  }, { offset: function () { return Waypoint.viewportHeight() - $loadOlder.outerHeight(false) - 15 } })
}

function updatePrevNextVisibility () {
  var $loadNewer = $('#loadNewer')
  var $loadOlder = $('#loadOlder, #main > nav.navigation.posts-navigation a')
  var $postWrapper = $('.postWrapper')
  var documentHeight = $(document).height()

  if (!$postWrapper.length || !postList.list || !postList.list.length) {
    $loadNewer.removeClass('show')
    $loadOlder.removeClass('show')
    documentHeightUpdated()
    return
  }

  var firstId = ($postWrapper.length) ? parseInt($postWrapper.first().attr('assetid').replace('post-', '')) : postList.list[0].id
  var lastId = ($postWrapper.length) ? parseInt($postWrapper.last().attr('assetid').replace('post-', '')) : postList.list[0].id

  var heightChanged = false

  if (postList.list[0].id == firstId) {
    prependNoScroll($loadNewer, function () {
      $loadNewer.removeClass('show')
    })
    heightChanged = true
  } else {
    if (!$loadNewer.hasClass('show')) {
      prependNoScroll($loadNewer, function () {
        $loadNewer.addClass('show')
        loadNewerWP[0].triggerPoint = null // act as fresh WP (trigger if in view)
      })
      heightChanged = true
    }
  }
  if (postList.list[postList.list.length - 1].id == lastId) {
    $loadOlder.removeClass('show')
    heightChanged = true
  } else {
    $loadOlder.addClass('show')
    loadOlderWP[0].triggerPoint = null // act as fresh WP (trigger if in view)
    heightChanged = true
  }

  if (heightChanged) { documentHeightUpdated() }
}

function reloadAsync () {
  /* updateCategoryInfo()
  postList.loadFromDOM()
  postList.load(sectionSlug)
  updatePostVisibility() */
  buildAllGenericCarousels()
  reloadAsyncArticle()
}

function reloadAsyncArticle () {
  // updateCategoryInfo()
  // AJAXifyComments()
  addFbButtonsAction()
  addTwitterButtonsAction()
  articleSocialWP()
  /* updatePrevNextVisibility()
  setupTargets()
  preparePostTriggers($('.postWrapper'))
  setupTriggers() */
  documentHeightUpdated()
  reloadUI()
  // postList.reloadPostsFromDOM()
}
