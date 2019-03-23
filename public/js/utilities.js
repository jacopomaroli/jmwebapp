var JSQL = (function(){
	Object.byString = function(o, s) {
		s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
		s = s.replace(/^\./, '');           // strip a leading dot
		var a = s.split('.');
		for (var i = 0, n = a.length; i < n; ++i) {
			var k = a[i];
			if (k in o) {
				o = o[k];
			} else {
				return;
			}
		}
		return o;
	};

	function select(obj, columns, where, operand)
	{
		operand = typeof operand !== 'undefined' ? operand : "or";
		var result = [];
		if(typeof(obj) != "undefined" && obj.length)
		{
			for(var i = 0; i < obj.length; i++)
			{
				var found = true;
				if(typeof where !== "undefined")
				{
					found = false;
					for(var j = 0; j < where.length; j++)
					{
						//var objParam = obj[i][where[j][0]];
						var objParam = Object.byString(obj[i], where[j][0]);
						var whereParam = where[j][1];
						if(typeof(objParam) == "string")
						{
							objParam = objParam.toLowerCase();
							whereParam = whereParam.toLowerCase();
						}
						if(typeof(objParam) == "object")
						{
							objParam = JSON.stringify(objParam);
							whereParam = JSON.stringify(whereParam);
						}
						if(objParam == whereParam)
						{
							found = true;
							if(operand == "or")
								break;
						}
						else
						{
							if(operand == "and")
							{
								found = false;
								break;
							}
						}
					}
				}
				if(found)
				{
					if(columns.indexOf("*") > -1)
						result.push(obj[i]);
					else
					{
						var tmpObj = {};
						for(var j = 0; j < columns.length; j++)
						{
							tmpObj[columns[j]] = obj[i][columns[j]];
						}
						result.push(tmpObj);
					}
				}
			}
		}
		return result;
	}

	function groupBy(obj, attr)
	{
		var result = [];
		for(var i = 0; i < obj.length; i++)
		{
			if(!JSQL.select(result, ["*"], [["attr", obj[i][attr]]]).length)
			{
				result.push({
					attr : obj[i][attr],
					elements : JSQL.select(obj, ["*"], [[attr, obj[i][attr]]])
				});
			}
		}
		return result;
	}

	function orderBy(obj, attr, sortOrder)
	{
		var result = obj;
		var swap = "";
		for(var i = 0; i < result.length; i++)
		{
			for(var j = 0; j < result.length; j++)
			{
				if(result[i][attr] < result[j][attr])
				{
					/*swap = result[i][attr];
					 result[i][attr] = result[j][attr];
					 result[j][attr] = swap;*/
					swap = jQuery.extend(true, {}, result[i]);
					result[i] = jQuery.extend(true, {}, result[j]);
					result[j] = jQuery.extend(true, {}, swap);
				}
			}
		}
		return result;
	}

	return {
		select: select,
		groupBy: groupBy,
		orderBy: orderBy
	};
}());

function objAToAByKey(origObj, key)
{
	var obj = [];
	for(k in origObj)
	{
		obj.push(origObj[k][key]);
	}
	return obj;
}

Object.byString = function(o, s) {
	s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
	s = s.replace(/^\./, '');           // strip a leading dot
	var a = s.split('.');
	for (var i = 0, n = a.length; i < n; ++i) {
		var k = a[i];
		if (k in o) {
			o = o[k];
		} else {
			return;
		}
	}
	return o;
};

function escapeRegExp(str) {
	return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function fillSnippetWithObjectKeys(snippet, obj)
{
	return snippet.replace(/(%)(.*?)(%)/g, function(match, $1, $2, $3, offset, original) {return Object.byString(obj, $2);});
}

var Semaphore = function(pcallback){
	this.callback = pcallback;
	this.semaphoreLights = {};
};

Semaphore.prototype.setupLight = function(key, value)
{
	this.semaphoreLights[key] = value;
};

Semaphore.prototype.setupCallback = function(pcallback)
{
	this.callback = pcallback;
};

Semaphore.prototype.updateLight = function(key, value)
{
	this.semaphoreLights[key] = value;
	var redIsPresent = false;
	for(key in this.semaphoreLights)
	{
		if(!this.semaphoreLights[key])
			redIsPresent = true;
	}
	if(!redIsPresent && typeof this.callback !== "undefined")
		this.callback();
};

Semaphore.prototype.isAllGreen = function(key, value)
{
	for(key in this.semaphoreLights)
		if(!this.semaphoreLights[key]) return false;
	return true;
};

function capitalize(string) { return string.charAt(0).toUpperCase() + string.slice(1); }

/*
imgsLoadedSemaphore = new Semaphore(function(){imgsLoaded(imgs);});
imgsLoadedSemaphore.setupLight("init", false);
startupSemaphore.updateLight("init", true);
 */
(function($) {

if ( $.fn.modals ) return;

var Modal = function($elm, pOptions)
{
	var defaults = {
		content: ""
    };
    
	var options = $.extend(true, defaults, pOptions);
	
	var thisTop = this;
	var elm = $elm.get(0);
	var $modalElm = $('' + 
		'<div class="modal framedPaperInset">' +
			'<div class="messageContainer"></div>' +
			'<div class="buttonsContainer"></div>' +
		'</div>' +
	'');
	var $messageContainer = $modalElm.find(".messageContainer");
	var $buttonsContainer = $modalElm.find(".buttonsContainer");
	var $overlappedCanvas = $('<div class="overlappedCanvas">');
	var buttons = [];
	
	this.config = function(pOptions)
	{
		options = $.extend(true, defaults, pOptions);
	};
	
	this.addButton = function(label, callback)
	{
		buttons.push({
			label: label,
			callback: callback
		});
		refreshButtons();
	};
	
	this.show = function()
	{
		$overlappedCanvas.appendTo("html");
		$modalElm.appendTo($overlappedCanvas);
	};
	
	this.close = function()
	{
		$overlappedCanvas.remove();
	};
	
	function refreshButtons()
	{
		for(var i = 0; i < buttons.length; i++)
		{
			(function(i){
				var $button = $("<button>" + buttons[i].label + "</button>").appendTo($buttonsContainer);
				$button.on("click", function(e){
					e.preventDefault();
					buttons[i].callback.call($button);
				});
			})(i);
		}
	}
	
	$messageContainer.append($elm);
};

$.fn.modal = function(pOptions) {
	if (!this.length) return this; 
	
	if (this.length > 1)
	{
		return this.each(function() {
			$(this).modals(pOptions);
		});
	}
	
	if (this.data('modalAPI')) return;
	
    this.data('modalAPI', new Modal(this, pOptions));
    
	return this;
};
})(jQuery);

(function($) {
if ( $.fn.canvasAnim ) return;

var CanvasAnim = function($elm, pOptions)
{
   var defaults = {
        fps: 27,
        frameWidth: 640,
        callbacks : {
			endCycle: function(){},
			startCycle: function(){},
			beforeFrame: function(){},
			afterFrame: function(){}
		}
    };
    
	var options = $.extend(true, defaults, pOptions);
	
	var thisTop = this;
	var elm = $elm.get(0);
	var obj = this;
	var isPlaying = false;
	var playSemaphore = false;
	var ctx = elm.getContext("2d");
	
	var eFPSCount = null;
	var fps = 27;
	var now;
	var then = 0;
	var interval = 1000/fps;
	var delta;
	var fpsDebounce = 500;
	
	var frameCount = 47;
	var reelWidth = 0;
	var reelHeight = 0;
	var canvasWidth = elm.offsetWidth;
	var canvasHeight = elm.offsetHeight;
	var ratio = options.frameWidth / canvasWidth;
	var endCurrentAnim = false;
	var playTimes = -1;
	
	var i = 0;
	var engineReel = null;
	
	this.config = function(pOptions)
	{
		options = $.extend(true, defaults, pOptions);
	};
	
	this.getCtx = function()
	{
		return ctx;
	};
	
	this.play = function(pPlayTimes)
	{
		if(pPlayTimes === 0) return;
		if(typeof pPlayTimes !== "undefined") playTimes = pPlayTimes;
		if(isPlaying && !endCurrentAnim)
		{
			thisTop.end(function(){
				thisTop.play(playTimes);
			});
			return;
		}
		playSemaphore.updateLight("play", true);
	};
	
	this.pause = function()
	{
		isPlaying = false;
		playSemaphore.updateLight("play", false);
	};
	
	this.end = function(callback)
	{
		endCurrentAnim = true;
		endCallback = callback;
	};

	buildAnimCanvas($elm);
	function buildAnimCanvas($elm)
	{
		playSemaphore = new Semaphore(function(){
			isPlaying = true;
			window.requestAnimationFrame(step);
		});
		playSemaphore.setupLight("reelLoaded", false);
		playSemaphore.setupLight("play", false);
		
		function loadEngineReel()
		{
			engineReel = new Image();
			engineReel.src = elm.dataset.imgPath;
			engineReel.onload = function() {
				reelWidth = engineReel.width;
				reelHeight = engineReel.height;
  				frameCount = (reelWidth/options.frameWidth)-1;
				playSemaphore.updateLight("reelLoaded", true);
				drawFrame(0);
			};
		}
		
		function drawFrame(frameIndex)
		{
			options.callbacks.beforeFrame.call(null);
			ctx.clearRect(0,0,canvasWidth,canvasHeight);
			ctx.drawImage(engineReel, options.frameWidth/ratio*frameIndex*-1, 0, (options.frameWidth * (frameCount+1))/ratio, 480 / ratio);
			options.callbacks.afterFrame.call(null);
		}
		
		function step(timestamp) {
			if(i == frameCount)
			{
				options.callbacks.endCycle.call(null);
				if(endCurrentAnim)
				{
					i = 0;
					playSemaphore.updateLight("play", false);
					isPlaying = false;
					endCallback = false;
					endCurrentAnim = false;
					drawFrame(0);
					if(endCallback) endCallback.call(null);
					return;
				}
				if(playTimes && playTimes != -1) playTimes--;
				if(!playTimes)
				{
					isPlaying = false;
					i = 0;
					return;
				}
				i = 0;
			}
			if(!i) options.callbacks.startCycle.call(null);
			drawFrame(i);
			i++;
			if(playSemaphore.isAllGreen()) window.requestAnimationFrame(step);
		}
		
		loadEngineReel();
	}
};

$.fn.canvasAnim = function(pOptions) {
	
	//	no element
	if (this.length == 0)
	{
		debug( true, 'No element found for "' + this.selector + '".' );
		return this;
	}

	//	multiple elements
	if (this.length > 1)
	{
		return this.each(function() {
			$(this).canvasAnim(pOptions);
		});
	}
	
	var $ca = this;
	if ($ca.data('canvasAnim')) return;
	
	var canvasAnim = new CanvasAnim(this, pOptions);
    
    $ca.data('canvasAnimAPI', canvasAnim);
	
	return $ca;
};
})(jQuery);

jQuery.fn.getEvent = function(event) {
	var collection = new Array();
	var namespace = false;
	var eventsArray = event.split(".");
	if (eventsArray.length > 0) {
		event = eventsArray[0];
		namespace = eventsArray[1];
	}
	this.each(function() {
		var oEvents = $._data($(this).get(0), "events");
		if (!oEvents)
			return true;
		var oEvent = oEvents[event];
		if (oEvent.length && !namespace) {
			collection.push(oEvent);
			return true;
		}
		var oNamespaceEvent = [];
		$.each(oEvent, function(index, val) {
			if (val.namespace == namespace) {
				oNamespaceEvent.push(val);
			}
		});
		if (oNamespaceEvent.length)
			collection.push(oNamespaceEvent);
	});
	return collection;
};

jQuery.fn.mousehold = function(timeout, f) {
	if (timeout && typeof timeout == 'function') {
		f = timeout;
		timeout = 100;
	}
	if (f && typeof f == 'function') {
		var timer = 0;
		var fireStep = 0;
		return this.each(function() {
			jQuery(this).mousedown(function() {
				fireStep = 1;
				var ctr = 0;
				var t = this;
				timer = setInterval(function() {
					ctr++;
					f.call(t, ctr);
					fireStep = 2;
				}, timeout);
			});

			clearMousehold = function() {
				clearInterval(timer);
				if (fireStep == 1) f.call(this, 1);
				fireStep = 0;
			};

			jQuery(this).mouseout(clearMousehold);
			jQuery(this).mouseup(clearMousehold);
		});
	}
};

function getBaseURL(){ return window.location.protocol + '//' + window.location.host; }
function getMainURL(){ return window.location.protocol + '//' + window.location.host + window.location.pathname; }
function getFullURL(){ return window.location.protocol + '//' + window.location.host + window.location.pathname + window.location.search + window.location.hash; }

jQuery.fn.shuffle = function() {
	var allElems = this.get(),
		getRandom = function(max) {
			return Math.floor(Math.random() * max);
		},
		shuffled = $.map(allElems, function(){
			var random = getRandom(allElems.length),
				randEl = $(allElems[random]).clone(true)[0];
			allElems.splice(random, 1);
			return randEl;
		});
	this.each(function(i){
		$(this).replaceWith($(shuffled[i]));
	});
	return $(shuffled);
};

jQuery.expr[':'].regex = function(elem, index, match) {
	var matchParams = match[3].split(','),
		validLabels = /^(data|css):/,
		attr = {
			method: matchParams[0].match(validLabels) ?
				matchParams[0].split(':')[0] : 'attr',
			property: matchParams.shift().replace(validLabels,'')
		},
		regexFlags = 'ig',
		regex = new RegExp(matchParams.join('').replace(/^\s+|\s+$/g,''), regexFlags);
	return regex.test(jQuery(elem)[attr.method](attr.property));
};

// custom 'scrolldelta' event extends 'scroll' event
jQuery.event.special.scrolldelta = {
    delegateType: "scroll",
    bindType: "scroll",
    handle: function (event) {
        var handleObj = event.handleObj;
        var targetData = jQuery.data(event.target);
        var ret = null;
        var elem = event.target;
        var isDoc = elem === document;
        var oldTop = targetData.top || 0;
        var oldLeft = targetData.left || 0;
        targetData.top = isDoc ? elem.documentElement.scrollTop + elem.body.scrollTop : elem.scrollTop;
        targetData.left = isDoc ? elem.documentElement.scrollLeft + elem.body.scrollLeft : elem.scrollLeft;
        event.scrollTopDelta = targetData.top - oldTop;
        event.scrollTop = targetData.top;
        event.scrollLeftDelta = targetData.left - oldLeft;
        event.scrollLeft = targetData.left;
        event.type = handleObj.origType;
        ret = handleObj.handler.apply(this, arguments);
        event.type = handleObj.type;
        return ret;
    }
};

jQuery.extend(jQuery.easing,
{
    def: 'easeOutQuad',
    swing: function (x, t, b, c, d) {
        //alert($.easing.default);
        return $.easing[$.easing.def](x, t, b, c, d);
    },
    easeInQuad: function (x, t, b, c, d) {
        return c*(t/=d)*t + b;
    },
    easeOutQuad: function (x, t, b, c, d) {
        return -c *(t/=d)*(t-2) + b;
    },
    easeInOutQuad: function (x, t, b, c, d) {
        if ((t/=d/2) < 1) return c/2*t*t + b;
        return -c/2 * ((--t)*(t-2) - 1) + b;
    },
    easeInCubic: function (x, t, b, c, d) {
        return c*(t/=d)*t*t + b;
    },
    easeOutCubic: function (x, t, b, c, d) {
        return c*((t=t/d-1)*t*t + 1) + b;
    },
    easeInOutCubic: function (x, t, b, c, d) {
        if ((t/=d/2) < 1) return c/2*t*t*t + b;
        return c/2*((t-=2)*t*t + 2) + b;
    },
    easeInQuart: function (x, t, b, c, d) {
        return c*(t/=d)*t*t*t + b;
    },
    easeOutQuart: function (x, t, b, c, d) {
        return -c * ((t=t/d-1)*t*t*t - 1) + b;
    },
    easeInOutQuart: function (x, t, b, c, d) {
        if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
        return -c/2 * ((t-=2)*t*t*t - 2) + b;
    },
    easeInQuint: function (x, t, b, c, d) {
        return c*(t/=d)*t*t*t*t + b;
    },
    easeOutQuint: function (x, t, b, c, d) {
        return c*((t=t/d-1)*t*t*t*t + 1) + b;
    },
    easeInOutQuint: function (x, t, b, c, d) {
        if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
        return c/2*((t-=2)*t*t*t*t + 2) + b;
    },
    easeInSine: function (x, t, b, c, d) {
        return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
    },
    easeOutSine: function (x, t, b, c, d) {
        return c * Math.sin(t/d * (Math.PI/2)) + b;
    },
    easeInOutSine: function (x, t, b, c, d) {
        return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
    },
    easeInExpo: function (x, t, b, c, d) {
        return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
    },
    easeOutExpo: function (x, t, b, c, d) {
        return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
    },
    easeInOutExpo: function (x, t, b, c, d) {
        if (t==0) return b;
        if (t==d) return b+c;
        if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
        return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
    },
    easeInCirc: function (x, t, b, c, d) {
        return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
    },
    easeOutCirc: function (x, t, b, c, d) {
        return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
    },
    easeInOutCirc: function (x, t, b, c, d) {
        if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
        return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
    },
    easeInElastic: function (x, t, b, c, d) {
        var s=1.70158;var p=0;var a=c;
        if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
        if (a < Math.abs(c)) { a=c; var s=p/4; }
        else var s = p/(2*Math.PI) * Math.asin (c/a);
        return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
    },
    easeOutElastic: function (x, t, b, c, d) {
        var s=1.70158;var p=0;var a=c;
        if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
        if (a < Math.abs(c)) { a=c; var s=p/4; }
        else var s = p/(2*Math.PI) * Math.asin (c/a);
        return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
    },
    easeInOutElastic: function (x, t, b, c, d) {
        var s=1.70158;var p=0;var a=c;
        if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
        if (a < Math.abs(c)) { a=c; var s=p/4; }
        else var s = p/(2*Math.PI) * Math.asin (c/a);
        if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
        return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
    },
    easeInBack: function (x, t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        return c*(t/=d)*t*((s+1)*t - s) + b;
    },
    easeOutBack: function (x, t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
    },
    easeInOutBack: function (x, t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
        return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
    },
    easeInBounce: function (x, t, b, c, d) {
        return c - $.easing.easeOutBounce (x, d-t, 0, c, d) + b;
    },
    easeOutBounce: function (x, t, b, c, d) {
        if ((t/=d) < (1/2.75)) {
            return c*(7.5625*t*t) + b;
        } else if (t < (2/2.75)) {
            return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
        } else if (t < (2.5/2.75)) {
            return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
        } else {
            return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
        }
    },
    easeInOutBounce: function (x, t, b, c, d) {
        if (t < d/2) return $.easing.easeInBounce (x, t*2, 0, c, d) * .5 + b;
        return $.easing.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;
    }
});

var isMobileUA = (function(a){return (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)));})(navigator.userAgent||navigator.vendor||window.opera);

function prependNoScroll($elm, action){
	var $document = $(document);
	var $window = $(window);
	var $html = $("html");
	var $body = $("body");
	
	var $this = $(this);
	var styleBak = $elm.attr("style");
	$elm.css({
	        position:   'absolute',
	        visibility: 'hidden',
	        display:    'block'
	});
	action.call(this);
	var $elmHeight = $elm.outerHeight(true);
	var old_height = $body.height();
	var old_scroll = $window.scrollTop();
	//if ($document.height() - headingOffset <= $window.height())
	if(old_scroll + $elmHeight > $html.height() - $window.height())
	{
		$html.css("min-height", $document.height() + $elmHeight + "px"); //TODO: copy from here
		old_height = $body.height();
		old_scroll = $window.scrollTop();
	}
	$elm.attr("style", styleBak ? styleBak : "");
	$document.scrollTop(old_scroll + $body.height() - old_height);
};

function triggerStoppedCarousel(carouElem, fn)
{
	var autoPlay = null;
	autoPlay = carouElem.triggerHandler("configuration").auto.play;
	if(!autoPlay)
	{
		carouElem.trigger("play", true);
		fn.call(carouElem);
		carouElem.trigger("stop");
	}
	else
	{
		fn.call(carouElem);
	}
}

function createGenericCarousel($carouElem)
{
	var genericCarouselData = $carouElem.data("genericCarousel");
	var visibleImages = (genericCarouselData.visibleImages)? parseInt(genericCarouselData.visibleImages) : 0;
	var autoScroll = (genericCarouselData.autoScroll == true)? true : false;
	/*var direction = (carouElem.data("direction"))? carouElem.data("direction") : "left";
	var thumbsArePresent = (galleryThumbs.length)? true : false;
	var didaArePresent = (galleryDida.length)? true : false;*/
	var stillIfLess = (genericCarouselData.stillIfLess)? parseInt(genericCarouselData.stillIfLess) : 0;
	var start = (Number.isInteger(parseInt(genericCarouselData.start)))? parseInt(genericCarouselData.start) : genericCarouselData.start;
	var offset = (genericCarouselData.offset)? parseInt(genericCarouselData.offset) : 0;
	//var scrollDuration = (carouElem.data("scrollDuration"))? parseInt(carouElem.data("scrollDuration")) : 500;
	var timeoutDuration = (genericCarouselData.timeoutDuration)? parseInt(genericCarouselData.timeoutDuration) : 500;
	//var scrollFx = (carouElem.data("scrollFx"))? carouElem.data("scrollFx") : "scroll";
	$carouElem.data("initOk", false);
	
	var $genericCarouselWrapper = $carouElem.closest(".genericCarouselWrapper");
	var $caroufredsel_wrapper = null;
	
	var prevNextBtns = $(".prev, .next", $genericCarouselWrapper);
	if(prevNextBtns.length)
	{
		prevNextBtns.on("click", function(e){
			e.preventDefault();
			if($(this).hasClass("prev"))
				triggerStoppedCarousel($carouElem, function(){
					$carouElem.trigger('prev', 1);
				});
			if($(this).hasClass("next"))
				triggerStoppedCarousel($carouElem, function(){
					$carouElem.trigger('next', 1);
				});
		});
	}
	
	$carouElem.carouFredSel({
		/*direction : direction,*/
		auto : {
			play: autoScroll,
			timeoutDuration: timeoutDuration
		},
		items : {
			visible : visibleImages,
			width : 'variable',
			start: start
		},
		scroll : {
			/*fx: scrollFx,
			easing: 'linear',*/
			items: 1,
			offset: offset,
			/*duration: scrollDuration,
			pauseOnHover: 'immediate',*/
	        onBefore: function(data){
	        	$carouElem.triggerHandler("slider_onBefore");
	        },
	        onAfter: function(data){
	        	$carouElem.triggerHandler("slider_onAfter");
	        }
		},
		onCreate: function( data ) {
			$carouElem.data("initOk", true);
			$caroufredsel_wrapper = $carouElem.closest(".caroufredsel_wrapper");
			if($caroufredsel_wrapper.outerWidth() > $genericCarouselWrapper.outerWidth())
			{
				//$carouElem.trigger("configuration", ["items.visible", "1"]);
				//$carouElem.trigger("configuration", ["scroll.offset", "0"]);
				if(prevNextBtns.length)
				{
					prevNextBtns.show();
				}
			}
		}
	});
}

function buildGenericCarousel($carouElem)
{
	var genericCarouselData = $carouElem.data("genericCarousel");
	if(genericCarouselData.semaphore == true)
	{
		var carouselSemaphore = new Semaphore(function(){createGenericCarousel($carouElem);});
		var imgs = $carouElem.find("img");

		for(var i = 0; i < imgs.length; i++)
		{
			carouselSemaphore.setupLight("img" + i, false);
			if(imgs[i].complete)
				carouselSemaphore.updateLight("img"+i, true);
			else
				(function(i){
					imgs[i].addEventListener('load', function(){carouselSemaphore.updateLight("img"+i, true);});
				})(i);
		}
	}
	else
		createGenericCarousel($carouElem);
}

function buildAllGenericCarousels()
{
	$(".genericCarousel").each(function(index, value){
		var $this = $(this);
		if(!$this.data("_cfs_isCarousel") && $this.find("> *").length > $this.data("genericCarousel").initIfMoreThan)
		{
			buildGenericCarousel($this);
		}
	});
}

function tutorialAppendSubsections(subsections, parentSection, noScroll)
{
	var subcategoriesSnippet = '\
		<div class="genericCarouselWrapper carouselRowWrapper categories" data-section-path="' + parentSection + '">\
			<div class="carouselRowContainer">\
				<ul class="genericCarousel carouselRow" data-generic-carousel=\'{"semaphore": true, "initIfMoreThan": 1, "visibleImages": 3, "autoScroll": false, "stillIfLess": 2, "start": -1, "offset": -1}\'>\
					%loopResult%\
				</ul>\
			</div>\
			<a class="arrow left prev" href="#" /></a>\
			<a class="arrow right next" href="#" /></a>\
		</div>\
	';
	
	var subcategoriesLoopSnippet = '\
		<li>\
			<a href="%cat_url%">\
				<img src="%taxonomy_image.0%" width="%taxonomy_image.1%" height="%taxonomy_image.2%" alt="%cat_name%" />\
				<span class="slideOverlayWrapper">\
					<span class="slideOverlayText">%cat_name%</span>\
				</span>\
			</a>\
		</li>\
	';
	
	var loopResult = "";
	for(var i = 0; i < subsections.length; i++)
	{
		loopResult += fillSnippetWithObjectKeys(subcategoriesLoopSnippet, subsections[i]);
	}
	
	var subcategoriesSnippetFinal = subcategoriesSnippet.replace("%loopResult%", loopResult);
	var $subcategoriesSnippetFinal = $(subcategoriesSnippetFinal);
	
	if(noScroll)
	{		
		prependNoScroll($subcategoriesSnippetFinal, function(){
			$("#main > .entry-title, .categories").last().after($subcategoriesSnippetFinal);
			buildGenericCarousel($subcategoriesSnippetFinal.find(".genericCarousel"));
		});
	}
	else
	{
		$("#main > .entry-title, .categories").last().after($subcategoriesSnippetFinal);
		buildGenericCarousel($subcategoriesSnippetFinal.find(".genericCarousel"));
	}
	
	tutorialsAddSlidesClickEvt($subcategoriesSnippetFinal.find(".genericCarousel > li > a"));
}

function tutorialsAddSlidesClickEvt($carouselLink)
{
	$carouselLink.on("click.appendSections", function(e){ //todo: merge with portfolio
		e.preventDefault();
		var $this = $(this);		
		var new_contentUrl = $this.attr("href");
		var $thisCarouselWrapper = $this.closest(".genericCarouselWrapper.categories");
		var thisCarouselIndex = $thisCarouselWrapper.index(".genericCarouselWrapper.categories");
		var $thisCarousel = $thisCarouselWrapper.find(".genericCarousel");
		
		var new_categorySlugArray = new_contentUrl.slice(1).split("/");
		var new_baseSlug = new_categorySlugArray[0];
		var new_sectionSlug = new_categorySlugArray.slice(-1)[0];
		
		var $childCarousel = $(".categories:eq(" + (thisCarouselIndex + 1) + ")");
		if(stateObj.contentUrl == new_contentUrl)
			return;
			
		$this.closest("li").parent().find("> li.selected").removeClass("selected");
		$this.closest("li").addClass("selected");
		$this.closest(".carouselRowWrapper").addClass("selected");
		triggerStoppedCarousel($thisCarousel, function(){
	        $thisCarousel.trigger("slideTo", $this.closest("li"));
	    });
		
		$childCarousel.remove();
		postList.clear();
		updatePrevNextVisibility();
		
		(function(new_contentUrl){
			getSubcategories(new_sectionSlug, function(sections){ //todo: review update view chain
				if(sections.length)
				{
					tutorialAppendSubsections(sections, new_contentUrl, false);
					documentHeightUpdated();
				}
				postList.clear();
				updatePrevNextVisibility();
				postList.load(new_sectionSlug);
			});
		})(new_contentUrl);
		
		stateObj = {
			contentType: "fullPage",
			baseUrl: '/' + new_baseSlug,
			contentUrl: new_contentUrl
		};
		history.pushState(stateObj, "", stateObj.contentUrl);
		updateCategoryInfo();
	});
}

function tutorialsSection()
{
	if(baseSlug != "tutorials") return;
	
	if(stateObj.contentType == "fullPage")
	{
		tutorialsAddSlidesClickEvt($(".categories .genericCarousel > li > a"));
	}
	else
	{		
		$body.removeClass("home blog");
		$body.addClass("archive category category-tutorials category-6");
		$entryTitle = $('<h1 class="entry-title">Tutorials</h1>');
		prependNoScroll($entryTitle, function(){
			$("#main").prepend($entryTitle)
		});
	
		getSubcategories("tutorials", function(sections){
			tutorialAppendSubsections(sections, "tutorials", true);
			documentHeightUpdated();
			
			getSubcategories(categorySlugArray[1], function(sections){
				tutorialAppendSubsections(sections, categorySlugArray[1], true);
				documentHeightUpdated();
			});
		});
	}	
}

function portfolioSection()
{
	if(baseSlug != "portfolio") return;
	
	if(stateObj.contentType == "fullPage")
	{
		$(".categories:eq(0) .genericCarousel > li > a").on("click", function(e){ //todo: merge with tutorials 
			e.preventDefault();
			var $this = $(this);		
			var new_contentUrl = $this.attr("href");
			var $thisCarouselWrapper = $this.closest(".genericCarouselWrapper.categories");
			var thisCarouselIndex = $thisCarouselWrapper.index(".genericCarouselWrapper.categories");
			var $thisCarousel = $thisCarouselWrapper.find(".genericCarousel");
			
			var new_categorySlugArray = new_contentUrl.slice(1).split("/");
			var new_baseSlug = new_categorySlugArray[0];
			var new_sectionSlug = new_categorySlugArray.slice(-1)[0];
			
			var $childCarousel = $(".categories:eq(" + (thisCarouselIndex + 1) + ")");
			if(stateObj.contentUrl == new_contentUrl)
				return;
				
			$(".postWrapper").remove();
			var ajaxId = $this.data("ajaxId");
			var postListObj = {};
			postListObj.id = ajaxId;
			postListObj.$elm = $('<div class="postWrapper ajaxContent" data-ajax-id="' + ajaxId + '" data-anchor-id="' + new_contentUrl + '" />').insertAfter(".categories")
			postListObj.url = new_contentUrl;
			ajaxLoadUrl(new_contentUrl, false, ajaxId, "rollDown");
			
			stateObj = {
				contentType: "fullPage",
				baseUrl: '/' + new_baseSlug,
				contentUrl: new_contentUrl
			};
			history.pushState(stateObj, "", stateObj.contentUrl);
			updateCategoryInfo();
		});
	}
}

function outerHeight(elm)
{
	var height = elm.clientHeight;
    var computedStyle = window.getComputedStyle(elm); 
    height += parseInt(computedStyle.marginTop, 10);
    height += parseInt(computedStyle.marginBottom, 10);
    height += parseInt(computedStyle.borderTopWidth, 10);
    height += parseInt(computedStyle.borderBottomWidth, 10);
    return height;
}

function isMobile()
{
	return document.documentElement.clientWidth < 720;
}

function trackPageView()
{
	if(typeof __gaTracker !== "undefined")
	{
		__gaTracker('set', { title: document.title, location: location.origin + location.pathname, page: location.pathname});
		__gaTracker('send', 'pageview');
	}
}

function smoothScroll(target, offset, callback)
{
	var $target = $(target);
	if(!$target.length) return;
	canScroll = false;
	$('html, body').animate({
		scrollTop: $target.offset().top - headingOffset + offset
	}, {
		duration: 1000,
		complete: function(){
			canScroll = true;
			if(callback)
			callback.call(this);
		}
	});
}

function scrollControl()
{
	$('html, body').on("mousewheel DOMMouseScroll", function(e){
		if(!canScroll)
			return false;
	});
}