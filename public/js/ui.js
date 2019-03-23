function mainMenuWp () {
  return
  var $masthead = $('#masthead')
  if (!$masthead.length) return
  $('#site-navigation').waypoint(function (direction) {
    if (direction === 'down') {
      $masthead.addClass('stuck')
      $('#leftGearsContainer').addClass('stuck')
      $('#rightGearsContainer').addClass('stuck')
      $('body').addClass('headerStuck')
    }
    if (direction === 'up') {
      $masthead.removeClass('stuck')
      $('#leftGearsContainer').removeClass('stuck')
      $('#rightGearsContainer').removeClass('stuck')
      $('body').removeClass('headerStuck')
    }
  })
}

function sideGears () {
  var body = document.body
  var html = document.documentElement
  var mastheadHeight = $('#masthead').outerHeight(true) - $('#site-navigation').outerHeight(true)

  var $leftGearsContainer = $('#leftGearsContainer')
  var $rightGearsContainer = $('#rightGearsContainer')
  if (!($leftGearsContainer.length + $rightGearsContainer.length)) return
  var gears = {
    rotation: [0, 0, 0],
    left: [
      $leftGearsContainer.find('.gear1'),
      $leftGearsContainer.find('.gear2'),
      $leftGearsContainer.find('.gear3')
    ],
    right: [
      $rightGearsContainer.find('.gear1'),
      $rightGearsContainer.find('.gear2'),
      $rightGearsContainer.find('.gear3')]
  }
  // var prevScroll = mastheadHeight;
  var prevScroll = 0
  var lastTime = 0

  $(window).on('scrolldelta', function (e) {
    // if((new Date().getTime() - lastTime) < (1000/1000))
    // return;
    // if((e.timeStamp - lastTime) < (1000/24)) return;
    // lastTime = e.timeStamp;
    var scrollTop = e.scrollTop
    var deltaScroll = e.scrollTopDelta

    // if(scrollTop < mastheadHeight)
    if (scrollTop == 0) {
      gears.rotation[0] = 0
      gears.rotation[1] = 0
      gears.rotation[2] = 0
      // prevScroll = mastheadHeight;
      prevScroll = 0
    } else {
      /* var deltaScroll = scrollTop - prevScroll;
	    	prevScroll = scrollTop; */
      gears.rotation[0] += (deltaScroll * 360) / (11 * 12)
      gears.rotation[0] %= 360
      gears.rotation[1] += (deltaScroll * 360) / ((11 * 12) * 5)
      gears.rotation[1] %= 360
      gears.rotation[2] += (deltaScroll * 360) / ((11 * 12) * 10)
      gears.rotation[2] %= 360
    }
    var mobileComp = isMobile() ? -1 : 1
    gears.left[0].css({
	        'transform': 'rotate(' + -gears.rotation[0] * mobileComp + 'deg)'
	    })
    gears.right[0].css({
	        'transform': 'rotate(' + gears.rotation[0] * mobileComp + 'deg)'
	    })
    gears.left[1].css({
	        'transform': 'rotate(' + gears.rotation[1] * mobileComp + 'deg)'
	    })
    gears.right[1].css({
	        'transform': 'rotate(' + -gears.rotation[1] * mobileComp + 'deg)'
	    })
    gears.left[2].css({
	        'transform': 'rotate(' + -gears.rotation[1] * mobileComp + 'deg)'
	    })
    gears.right[2].css({
	        'transform': 'rotate(' + gears.rotation[2] * mobileComp + 'deg)'
	    })
	    // lastTime = new Date().getTime();
  })
}

function setupFiltersPanel () {
  var filtersPanelWrapper = $('#filtersPanelWrapper')
  if (!filtersPanelWrapper.length) return
  var filtersPanel = $('#filtersPanel')
  var filtersPanelCanvas = $('#filtersPanelCanvas')
  var filtersPanelToggler = filtersPanelWrapper.find('#filtersPanelToggler')
  var filtersPanelTogglerGear = filtersPanelWrapper.find('#filtersPanelTogglerGear')

  var gears = {
    rotation: [-16, 0],
    left: [
      filtersPanelWrapper.find('.leftGears .gear1'),
      filtersPanelWrapper.find('.leftGears .gear3')
    ],
    right: [
      filtersPanelWrapper.find('.rightGears .gear1'),
      filtersPanelWrapper.find('.rightGears .gear3')
    ]
  }
  filtersPanelWrapper.data('animateBeaconGreen', 'true')

  filtersPanelToggler.on('click', function (e) {
    e.preventDefault()
    if (filtersPanelWrapper.data('animateBeaconGreen') == 'false') return
    filtersPanelWrapper.data('animateBeaconGreen', 'false')
    var offset
    var ratio = 2
    var easing
    if (filtersPanel.hasClass('open')) {
      nextPanelHeight = 95 - (isMobile() ? 45 : 0)
      offset = 0
      easing = 'easeInOutElastic'
      // easing = "easeInElastic";
    }
    if (filtersPanel.hasClass('closed')) {
      nextPanelHeight = filtersPanel.outerHeight() + 15 - (isMobile() ? 45 : 0)
      offset = -180
      easing = 'easeInOutElastic'
      // easing = "easeOutBounce";
    }

    var panelHeight = filtersPanelWrapper.outerHeight()
    var prevPanelHeight = panelHeight

    filtersPanelWrapper.animate({ height: nextPanelHeight + 'px' }, {// easeInBack easeInOutElastic
      duration: 2000,
      easing: easing,
      progress: function (animation, progress, remainingMs) {
        if (progress <= (1 / ratio)) {
          filtersPanelToggler.add(filtersPanelTogglerGear).css({
			        'transform': 'rotate(' + (offset + (180 * (progress * ratio) / 1)) + 'deg)'
			    })
		    } else {
		    	filtersPanelToggler.add(filtersPanelTogglerGear).css({
			        'transform': 'rotate(' + (offset + 180) + 'deg)'
			    })
		    }
      },
      step: function (now, tween) {
        if (tween.prop != 'height') return

	    	panelHeight = tween.now
		    var deltaHeight = panelHeight - prevPanelHeight
        gears.rotation[0] += (deltaHeight * 360) / (11 * 12)
        gears.rotation[0] %= 360
        gears.rotation[1] += (deltaHeight * 360) / ((11 * 12) * 5)
        gears.rotation[1] %= 360
        gears.left[0].css({
		        'transform': 'rotate(' + -gears.rotation[0] + 'deg)'
		    })
        gears.right[0].css({
		        'transform': 'rotate(' + gears.rotation[0] + 'deg)'
		    })
        gears.left[1].css({
		        'transform': 'rotate(' + gears.rotation[1] + 'deg)'
		    })
        gears.right[1].css({
		        'transform': 'rotate(' + -gears.rotation[1] + 'deg)'
		    })

		    prevPanelHeight = panelHeight
      },
      complete: function () {
        filtersPanel.toggleClass('open closed')
        filtersPanelWrapper.data('animateBeaconGreen', 'true')
      } })
  })
}

function articleSocialWP () {
  var $entrySocialContainer = $('.entrySocialContainer').filter(function () { return $(this).data('waypoint') != 'true' })
  var $entryContent = $entrySocialContainer.parent().find('.entry-content')

  /* $entrySocialContainer.each(function(index, elm){
		var $elm = $(elm); */
  $entrySocialContainer.waypoint(function (direction) {
    if (!isMobile()) return
    var $entrySocial = $(this.element).find('.entrySocial')
    if (direction === 'down') {
      $entrySocial.css({
        'position': 'fixed',
        'top': 100 + 'px',
        'width': 'auto',
        'left': '30px',
        'right': '30px'
      })
    }
    if (direction === 'up') {
      $entrySocial.css({
        'position': '',
        'top': '',
        'width': '',
        'left': '',
        'right': ''
      })
    }
  }, { offset: function () { return 100 } })

  $entryContent.waypoint(function (direction) {
    if (!isMobile()) return
    var $entrySocial = $(this.element).parent().find('.entrySocial')
    if (direction === 'down') {
      $entrySocial.css({
        'position': 'absolute',
        'top': $(this.element).outerHeight(false) - $entrySocial.outerHeight(false) + 'px',
        'width': '',
        'left': '0',
        'right': '0'
      })
    }
    if (direction === 'up') {
      $entrySocial.css({
        'position': 'fixed',
        'top': 100 + 'px',
        'width': 'auto',
        'left': '30px',
        'right': '30px'
      })
    }
  }, { offset: function () { return 100 - $(this.element).outerHeight(false) + $(this.element).parent().find('.entrySocial').outerHeight(false) } })

  $entrySocialContainer.waypoint(function (direction) {
    if (isMobile()) return
    var $entrySocial = $(this.element).find('.entrySocial')
    if (direction === 'down') {
      $entrySocial.css({
        'position': 'fixed',
        'top': headingOffset + 'px'
      })
    }
    if (direction === 'up') {
      $entrySocial.css({
        'position': '',
        'top': ''
      })
    }
  }, { offset: function () { return headingOffset } })

  $entrySocialContainer.waypoint(function (direction) {
    if (isMobile()) return
    var $entrySocial = $(this.element).find('.entrySocial')
    if (direction === 'down') {
      $entrySocial.css({
        'position': '',
        'top': 'auto',
        'bottom': '0'
      })
    }
    if (direction === 'up') {
      $entrySocial.css({
        'position': 'fixed',
        'top': headingOffset + 'px',
        'bottom': ''
      })
    }
  }, { offset: function () { return headingOffset - $(this.element).outerHeight(false) + $(this.element).find('.entrySocial').outerHeight(false) } })

  $entrySocialContainer.data('waypoint', 'true')
  $entryContent.data('waypoint', 'true')
  // });
}

function social () {
  $('#masthead .socialContainer .socialToggler').on('click', function (e) {
    e.preventDefault()
    var $this = $(this)
    var $socialContainer = $this.closest('.socialContainer')
    var newRot = 180
    var newSize = 256
    if ($this.data('rotation') == 180) {
      newRot = 0
      newSize = 46
    }
    $(this).css({
      'transform': 'rotateY(' + newRot + 'deg)'
    })
    $socialContainer.css({
      'width': newSize + 'px'
    })
    $this.data('rotation', newRot)
  })

  articleSocialWP()
}

function mobileMenu () {
  var $siteNavigation = $('#site-navigation')

  var gearsDriver = 0
  var gearsDriverNew = 0
  var gearsDriverEnd = 0

  function step (timestamp) {
    updateMenuGears(gearsDriverNew)
    if (gearsDriver != gearsDriverEnd) { window.requestAnimationFrame(step) }
  }

  $('#mobileMenuToggler').on('click', function (e) {
    e.preventDefault()
    var $this = $(this)
    if ($this.hasClass('closed')) {
      gearsDriver = 0
      $siteNavigation.stop().animate({
        'marginRight': -$siteNavigation.outerWidth(true) + 'px'
      }, {
        duration: 1000,
        step: function (now, tween) {
          if (tween.prop != 'marginRight') return
          gearsDriverNew = tween.now
        },
        complete: function () {
          gearsDriver = gearsDriverEnd
        }
      })
      gearsDriverEnd = -236
      window.requestAnimationFrame(step)
    } else {
      gearsDriver = -236
      $siteNavigation.animate({
        'marginRight': ''
      }, {
        duration: 1000,
        step: function (now, tween) {
          if (tween.prop != 'marginRight') return
          gearsDriverNew = tween.now
        },
        complete: function () {
          gearsDriver = gearsDriverEnd
        }
      })
      gearsDriverEnd = 0
      window.requestAnimationFrame(step)
    }
    $this.toggleClass('closed open')
  })

  var $mobileMenuGears = $('#mobileMenuGears')
  var gears = {
    rotation: [0, 0, 0],
    left: [
      $mobileMenuGears.find('.gear1'),
      $mobileMenuGears.find('.gear2'),
      $mobileMenuGears.find('.gear3')
    ]
  }

  function updateMenuGears (newVal) {
	    var delta = newVal - gearsDriver
	    gearsDriver += delta

    gears.rotation[0] += (delta * 360) / (11 * 12)
    gears.rotation[0] %= 360
    gears.rotation[1] += (delta * 360) / ((11 * 12) * 5)
    gears.rotation[1] %= 360
    gears.rotation[2] += (delta * 360) / ((11 * 12) * 4)
    gears.rotation[2] %= 360
    gears.left[0].css({
	        'transform': 'rotate(' + gears.rotation[0] + 'deg)'
	    })
    gears.left[1].css({
	        'transform': 'rotate(' + -gears.rotation[1] + 'deg)'
	    })
    gears.left[2].css({
	        'transform': 'rotate(' + gears.rotation[2] + 'deg)'
	    })
  }
}

function searchTogglerDesktop () {
  var $searchToggler = $('#searchToggler')
  var $searchFieldWrapper = $('#searchFieldWrapper')

  $searchToggler.on('click', function (e) {
    e.preventDefault()
    $searchFieldWrapper.toggleClass('open closed')
    if ($searchFieldWrapper.hasClass('open')) { $searchFieldWrapper.animate({ 'marginTop': '0' }) }
    if ($searchFieldWrapper.hasClass('closed')) { $searchFieldWrapper.animate({ 'marginTop': '-47px' }, { complete: function () { $searchFieldWrapper.css({ 'marginTop': '' }) } }) }
  })

  $window.on('resize', function (e) {
    if (!isMobile()) return
    if ($searchFieldWrapper.hasClass('open')) {
      $searchFieldWrapper.toggleClass('open closed')
      $searchFieldWrapper.css({ 'marginTop': '' })
    }
  })
}
var steam_canvasAnimAPI = null
var $steam = null
var steamEngine_canvasAnimAPI = null
var $steamEngine = null
function setupSteamEngine () {
  $steamEngine = $('#steamEngine')
  $steamEngine.canvasAnim()
  // $("#steamEngine").canvasAnim({callbacks:{endCycle: function(){console.log("end");}},});
  steamEngine_canvasAnimAPI = $('#steamEngine').data('canvasAnimAPI')
  // steamEngine_canvasAnimAPI.config({callbacks : {endCycle: function(){console.log("end2");}}});
  // steamEngine_canvasAnimAPI.play(5);

  $steam = $('#steam')
  $steam.canvasAnim()
  steam_canvasAnimAPI = $('#steam').data('canvasAnimAPI')
  // steam_canvasAnimAPI.play(-1);
}

function reloadUI () {
  social()
}

function initUI () {
  mobileMenu()
  // searchTogglerDesktop();
  setupSteamEngine()
  reloadUI()
}
