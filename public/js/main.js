const $ = jQuery
var $document
var $window
var $html
var $body

Prism.plugins.autoloader.languages_path = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.15.0/components/'

var headingOffsetDesktop = 221 + 10 + 20 + 5
var headingOffsetMobile = 75 + 20
var headingOffset = headingOffsetDesktop

document.addEventListener('keydown', function (e) {
  e = e || window.event

  if (e.keyCode === '40') {
    window.scrollBy(0, 1)
    return false
  } else if (e.keyCode === '38') {
    window.scrollBy(0, -1)
    return false
  }
})

function documentHeightUpdated () {
  // $(window).impulse({ range: 100, leap: 1.50 })
  Waypoint.refreshAll()
}

var settings = (function () {
  var data = null

  var defaultSettings = {
    selectedTags: {
      arduino: true,
      electronics: true,
      programming: true
    }
  }

  function load () {
    var settingsCookie = Cookies.get('settings')
    if (settingsCookie) {
      this.data = JSON.parse(settingsCookie)
    } else {
      this.data = defaultSettings
      save()
    }
  }

  function save () {
    cookieData = JSON.stringify(this.data)
    Cookies.set('settings', cookieData)
  }

  return {
    defaultSettings: defaultSettings,
    load: load,
    save: save,
    data: data
  }
}())

function initTagList () {
  tagList = []

  $('#filtersPanelCanvas > ul > li > input[type="checkbox"]').each(function (index, obj) {
    var tag = new Tag()
    tag.elm = obj
    tag.name = $(tag.elm).attr('name')
    tag.enabled = settings.data.selectedTags[tag.name]
    tagList.push(tag)

    obj.checked = tag.enabled
  })

  var newSelectedTags = {}
  for (var i = 0; i < tagList.length; i++) {
    newSelectedTags[tagList[i].name] = typeof settings.data.selectedTags[tagList[i].name] !== 'undefined' ? settings.data.selectedTags[tagList[i].name] : true
    hasFilters = hasFilters | !newSelectedTags[tagList[i].name]
  }
  settings.data.selectedTags = newSelectedTags
  settings.save()

  // $(objAToAByKey(tagList, "$elm")).map(function(){return this.toArray();})
  $(objAToAByKey(tagList, 'elm')).on('change', function (e) {
    settings.data.selectedTags[this.name] = this.checked
    settings.save()
    if (this.checked) addLoadWPToPlaceholderByTag(this.name)
    updatePostVisibility()
  })

  if (hasFilters) {
    $('#filtersPanelToggler').trigger('click')
  }
}

function AJAXifyComments ($posts) {
  var $posts = typeof $posts === 'undefined' ? $('.postWrapper').filter(function () { return !$(this).data('AJAXifiedComments') }) : $posts
  if (!$posts.length) return

  $posts.each(function (index, elm) {
    $this = $(this)
    $this.data('AJAXifiedComments', 'true')
    var $commentsArea = $this.find('.comments-area')
    if (!$commentsArea.length) return
    var $commentForm = $('.comment-form', $commentsArea)
    $commentForm.on('submit', function (e) {
      e.preventDefault()
      e.stopPropagation()
      var formData = $commentForm.serialize()
      var formURL = $commentForm.attr('action')
      $.ajax({
        type: 'post',
        url: formURL,
        data: formData,
        error: function (XMLHttpRequest, textStatus, errorThrown) {
          console.log('<p class="wdpajax-error" >You might have left one of the fields blank, or be posting too quickly</p>')
        },
        success: function (data, textStatus) {
          var data = JSON.parse(data)
          if (data.status == 'success') {
            // console.log('<p class="ajax-success" >Thanks for your comment. We appreciate your response.</p>');
            $.ajax({
              type: 'get',
              url: $this.data('anchorId'),
              data: { ajax: true, commentsOnly: true },
              error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log('error')
              },
              success: function (data, textStatus) {
                var $response = $('<div/>').append(data)
                $commentsArea.replaceWith($('.comments-area', $response))
                $this.removeData('AJAXifiedComments')
                documentHeightUpdated()
                AJAXifyComments($this)

                var $commentModal = $('<span>Your comment has been submitted and awaiting for moderation.</span>')
                $commentModal.modal({})
                $commentModal_modalAPI = $commentModal.data('modalAPI')
                $commentModal_modalAPI.addButton('Ok', function () {
                  $commentModal_modalAPI.close()
                })
                $commentModal_modalAPI.show()
              }
            })
          } else { console.log('<p class="ajax-error" >Please wait a while before posting your next comment</p>') }
          $('textarea[name=comment]', $commentForm).val('')
        }
      })
    })
  })
}

function updateCategoryInfo () {
  if (typeof stateObj === 'undefined') return
  categorySlugArray = stateObj.contentUrl.slice(1).split('/')
  baseSlug = categorySlugArray[0]
  sectionSlug = categorySlugArray.slice(-1)[0]

  document.title = stateObj.title
}

function initGlobals () {
  $document = $(document)
  $window = $(window)
  $html = $('html')
  $body = $('body')
  headingOffset = isMobile() ? headingOffsetMobile : headingOffsetDesktop
}

function initSearchEvts () {
  var $searchButton = $('#searchButton')
  if (!$searchButton.length) return

  $searchButton.on('click', function (e) {
    e.preventDefault()
    location.href = '/search/' + encodeURIComponent($('#searchField').val())
  })

  var $searchField = $('#searchField')
  $searchField.on('keypress', function (e) {
    var code = e.keyCode || e.which
    if (code == 13) { $searchButton.trigger('click') }
  })
}

function addOnResizeEvts () {
  $window.on('resize', function (e) {
    headingOffset = isMobile() ? headingOffsetMobile : headingOffsetDesktop
  })
}

function addFbButtonsAction () {
  $('.entrySocial .facebook').each(function (elm, index) {
    var $this = $(this)
    if ($this.data('fbOk')) return
    	$this.data('fbOk', 'true')

    $this.on('click.facebook', function (e) {
      e.preventDefault()
      var $postWrapper = $this.closest('.postWrapper')
      FB.ui({
			  method: 'share_open_graph',
			  action_type: 'og.likes',
			  action_properties: JSON.stringify({
			    object: ($postWrapper.length) ? getBaseURL() + $postWrapper.data('anchorId') : getMainURL()
			  })
      }, function (response) {
			  // Debug response (optional)
			  // console.log(response);
      })
    })
  })
}

function initFacebook () {
  // dev  1702650103338382
  // prod 1702641153339277
  window.fbAsyncInit = function () {
	    FB.init({
	      appId: '1702641153339277',
	      xfbml: true,
	      version: 'v2.5'
	    })
    // fb callback init
  };

  (function (d, s, id) {
    var js; var fjs = d.getElementsByTagName(s)[0]
    if (d.getElementById(id)) { return }
    js = d.createElement(s); js.id = id
    js.src = '//connect.facebook.net/en_US/sdk.js'
    fjs.parentNode.insertBefore(js, fjs)
  }(document, 'script', 'facebook-jssdk'))
}

function addTwitterButtonsAction () {
  $('.entrySocial .twitter').each(function (elm, index) {
    var $this = $(this)
    if ($this.data('twttrOk')) return
    	$this.data('twttrOk', 'true')

    $this.on('click.facebook', function (e) {
      e.preventDefault()
      var $postWrapper = $this.closest('.postWrapper')
      // var postText = $this.closest(".entry-container").find(".entry-content").text().trim().substr(0, 140);
      var postText = ''
      window.open('https://twitter.com/intent/tweet?' +
				'url=' + encodeURIComponent(($postWrapper.length) ? getBaseURL() + $postWrapper.data('anchorId') : getMainURL()) +
				'&via=' + encodeURIComponent('jacopomaroli') +
				// '&related=' + encodeURIComponent($(this).data("twitterReferer")) +
				// '&hashtags=' + encodeURIComponent($(this).data("twitterText")) +
				'&text=' + encodeURIComponent(postText),
      'twitter', 'width=626,height=436'
      )
    })
  })
}

function initTwitter () {
  // addTwitterButtonsAction()
}

function initSocials () {
  initFacebook()
  initTwitter()
}

// TODO: change current-menu-item & current-page-item
$(function () {
  setupSal()
  // settings.load()
  // initTagList()
  initGlobals()
  /* addOnResizeEvts()
  prepareMenuTriggers()
  updateCategoryInfo()
  tutorialsSection() // TODO: click before getpost error: cannot replace postsToLoad[i].$elm.replaceWith($responseObj);
  portfolioSection()
  scrollControl()
  mainMenuWp()
  setupFiltersPanel() */
  sideGears()
  // initSearchEvts()
  initUI()
  // SmoothScroll({ stepSize: 20 });
  initSocials()
  reloadAsync()
})
