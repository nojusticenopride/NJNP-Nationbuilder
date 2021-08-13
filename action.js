/**
* jquery-match-height master by @liabru
* http://brm.io/jquery-match-height/
* License: MIT
*/

;(function(factory) { // eslint-disable-line no-extra-semi
  'use strict';
  if (typeof define === 'function' && define.amd) {
    // AMD
    define(['jquery'], factory);
  } else if (typeof module !== 'undefined' && module.exports) {
    // CommonJS
    module.exports = factory(require('jquery'));
  } else {
    // Global
    factory(jQuery);
  }
})(function($) {
  /*
    *  internal
    */

  var _previousResizeWidth = -1,
      _updateTimeout = -1;

  /*
    *  _parse
    *  value parse utility function
    */

  var _parse = function(value) {
    // parse value and convert NaN to 0
    return parseFloat(value) || 0;
  };

  /*
    *  _rows
    *  utility function returns array of jQuery selections representing each row
    *  (as displayed after float wrapping applied by browser)
    */

  var _rows = function(elements) {
    var tolerance = 1,
        $elements = $(elements),
        lastTop = null,
        rows = [];

    // group elements by their top position
    $elements.each(function(){
      var $that = $(this),
          top = $that.offset().top - _parse($that.css('margin-top')),
          lastRow = rows.length > 0 ? rows[rows.length - 1] : null;

      if (lastRow === null) {
        // first item on the row, so just push it
        rows.push($that);
      } else {
        // if the row top is the same, add to the row group
        if (Math.floor(Math.abs(lastTop - top)) <= tolerance) {
          rows[rows.length - 1] = lastRow.add($that);
        } else {
          // otherwise start a new row group
          rows.push($that);
        }
      }

      // keep track of the last row top
      lastTop = top;
    });

    return rows;
  };

  /*
    *  _parseOptions
    *  handle plugin options
    */

  var _parseOptions = function(options) {
    var opts = {
      byRow: true,
      property: 'height',
      target: null,
      remove: false
    };

    if (typeof options === 'object') {
      return $.extend(opts, options);
    }

    if (typeof options === 'boolean') {
      opts.byRow = options;
    } else if (options === 'remove') {
      opts.remove = true;
    }

    return opts;
  };

  /*
    *  matchHeight
    *  plugin definition
    */

  var matchHeight = $.fn.matchHeight = function(options) {
    var opts = _parseOptions(options);

    // handle remove
    if (opts.remove) {
      var that = this;

      // remove fixed height from all selected elements
      this.css(opts.property, '');

      // remove selected elements from all groups
      $.each(matchHeight._groups, function(key, group) {
        group.elements = group.elements.not(that);
      });

      // TODO: cleanup empty groups

      return this;
    }

    if (this.length <= 1 && !opts.target) {
      return this;
    }

    // keep track of this group so we can re-apply later on load and resize events
    matchHeight._groups.push({
      elements: this,
      options: opts
    });

    // match each element's height to the tallest element in the selection
    matchHeight._apply(this, opts);

    return this;
  };

  /*
    *  plugin global options
    */

  matchHeight.version = 'master';
  matchHeight._groups = [];
  matchHeight._throttle = 80;
  matchHeight._maintainScroll = false;
  matchHeight._beforeUpdate = null;
  matchHeight._afterUpdate = null;
  matchHeight._rows = _rows;
  matchHeight._parse = _parse;
  matchHeight._parseOptions = _parseOptions;

  /*
    *  matchHeight._apply
    *  apply matchHeight to given elements
    */

  matchHeight._apply = function(elements, options) {
    var opts = _parseOptions(options),
        $elements = $(elements),
        rows = [$elements];

    // take note of scroll position
    var scrollTop = $(window).scrollTop(),
        htmlHeight = $('html').outerHeight(true);

    // get hidden parents
    var $hiddenParents = $elements.parents().filter(':hidden');

    // cache the original inline style
    $hiddenParents.each(function() {
      var $that = $(this);
      $that.data('style-cache', $that.attr('style'));
    });

    // temporarily must force hidden parents visible
    $hiddenParents.css('display', 'block');

    // get rows if using byRow, otherwise assume one row
    if (opts.byRow && !opts.target) {

      // must first force an arbitrary equal height so floating elements break evenly
      $elements.each(function() {
        var $that = $(this),
            display = $that.css('display');

        // temporarily force a usable display value
        if (display !== 'inline-block' && display !== 'flex' && display !== 'inline-flex') {
          display = 'block';
        }

        // cache the original inline style
        $that.data('style-cache', $that.attr('style'));

        $that.css({
          'display': display,
          'padding-top': '0',
          'padding-bottom': '0',
          'margin-top': '0',
          'margin-bottom': '0',
          'border-top-width': '0',
          'border-bottom-width': '0',
          'height': '100px',
          'overflow': 'hidden'
        });
      });

      // get the array of rows (based on element top position)
      rows = _rows($elements);

      // revert original inline styles
      $elements.each(function() {
        var $that = $(this);
        $that.attr('style', $that.data('style-cache') || '');
      });
    }

    $.each(rows, function(key, row) {
      var $row = $(row),
          targetHeight = 0;

      if (!opts.target) {
        // skip apply to rows with only one item
        if (opts.byRow && $row.length <= 1) {
          $row.css(opts.property, '');
          return;
        }

        // iterate the row and find the max height
        $row.each(function(){
          var $that = $(this),
              style = $that.attr('style'),
              display = $that.css('display');

          // temporarily force a usable display value
          if (display !== 'inline-block' && display !== 'flex' && display !== 'inline-flex') {
            display = 'block';
          }

          // ensure we get the correct actual height (and not a previously set height value)
          var css = { 'display': display };
          css[opts.property] = '';
          $that.css(css);

          // find the max height (including padding, but not margin)
          if ($that.outerHeight(false) > targetHeight) {
            targetHeight = $that.outerHeight(false);
          }

          // revert styles
          if (style) {
            $that.attr('style', style);
          } else {
            $that.css('display', '');
          }
        });
      } else {
        // if target set, use the height of the target element
        targetHeight = opts.target.outerHeight(false);
      }

      // iterate the row and apply the height to all elements
      $row.each(function(){
        var $that = $(this),
            verticalPadding = 0;

        // don't apply to a target
        if (opts.target && $that.is(opts.target)) {
          return;
        }

        // handle padding and border correctly (required when not using border-box)
        if ($that.css('box-sizing') !== 'border-box') {
          verticalPadding += _parse($that.css('border-top-width')) + _parse($that.css('border-bottom-width'));
          verticalPadding += _parse($that.css('padding-top')) + _parse($that.css('padding-bottom'));
        }

        // set the height (accounting for padding and border)
        $that.css(opts.property, (targetHeight - verticalPadding) + 'px');
      });
    });

    // revert hidden parents
    $hiddenParents.each(function() {
      var $that = $(this);
      $that.attr('style', $that.data('style-cache') || null);
    });

    // restore scroll position if enabled
    if (matchHeight._maintainScroll) {
      $(window).scrollTop((scrollTop / htmlHeight) * $('html').outerHeight(true));
    }

    return this;
  };

  /*
    *  matchHeight._applyDataApi
    *  applies matchHeight to all elements with a data-match-height attribute
    */

  matchHeight._applyDataApi = function() {
    var groups = {};

    // generate groups by their groupId set by elements using data-match-height
    $('[data-match-height], [data-mh]').each(function() {
      var $this = $(this),
          groupId = $this.attr('data-mh') || $this.attr('data-match-height');

      if (groupId in groups) {
        groups[groupId] = groups[groupId].add($this);
      } else {
        groups[groupId] = $this;
      }
    });

    // apply matchHeight to each group
    $.each(groups, function() {
      this.matchHeight(true);
    });
  };

  /*
    *  matchHeight._update
    *  updates matchHeight on all current groups with their correct options
    */

  var _update = function(event) {
    if (matchHeight._beforeUpdate) {
      matchHeight._beforeUpdate(event, matchHeight._groups);
    }

    $.each(matchHeight._groups, function() {
      matchHeight._apply(this.elements, this.options);
    });

    if (matchHeight._afterUpdate) {
      matchHeight._afterUpdate(event, matchHeight._groups);
    }
  };

  matchHeight._update = function(throttle, event) {
    // prevent update if fired from a resize event
    // where the viewport width hasn't actually changed
    // fixes an event looping bug in IE8
    if (event && event.type === 'resize') {
      var windowWidth = $(window).width();
      if (windowWidth === _previousResizeWidth) {
        return;
      }
      _previousResizeWidth = windowWidth;
    }

    // throttle updates
    if (!throttle) {
      _update(event);
    } else if (_updateTimeout === -1) {
      _updateTimeout = setTimeout(function() {
        _update(event);
        _updateTimeout = -1;
      }, matchHeight._throttle);
    }
  };

  /*
    *  bind events
    */

  // apply on DOM ready event
  $(matchHeight._applyDataApi);

  // update heights on load and resize events
  $(window).bind('load', function(event) {
    matchHeight._update(false, event);
  });

  // throttled update heights on resize events
  $(window).bind('resize orientationchange', function(event) {
    matchHeight._update(true, event);
  });






});



// This is custom implementation for the file upload functionality throughout the theme.

var inputs = document.querySelectorAll( '.file' );

Array.prototype.forEach.call( inputs, function( input ) {
  var label  = input.nextElementSibling,
      labelVal = label.innerHTML;

  input.addEventListener( 'change', function( e )
                         {
                           var fileName = '';
                           if( this.files && this.files.length > 1 )
                             fileName = ( this.getAttribute( 'data-multiple-caption' ) || '' ).replace( '{count}', this.files.length );
                           else
                             fileName = e.target.value.split( '\\' ).pop();

                           if( fileName )
                             label.innerHTML = fileName;
                           else
                             label.innerHTML = labelVal;
                         });
});



$(document).ready(function() {

  $('input, textarea').each(function() {
    // check if the input has any value (if we've typed into it)
    if ($(this).val().length > 0) {
      $(this).addClass('used');
    } else {
      $(this).removeClass('used');
    }
  });
  $('input, textarea').on('change', function() {
    // check if the input has any value (if we've typed into it)
    if ($(this).val().length > 0) {
      $(this).addClass('used');
    } else {
      $(this).removeClass('used');
    }
  });


  // activate jquery.matchHeight for all elements with class .equal

  $('.equal').matchHeight({
    byRow: true,
    property: 'height',
    target: null,
    remove: false
  });
  $('.equal a[href*="#show "]').on('click', function() {
    $('.equal').matchHeight({
      byRow: true,
      property: 'height',
      target: null,
      remove: false
    });
  });
  $( ".effects-expand" ).click(function(event) {
    event.preventDefault();
    $( ".page-excerpt > .effects" ).toggleClass( "full", 1000 );
  });
  var $root = $('html, body');

});
/**
 * @preserve  textfill
 * @name      jquery.textfill.js
 * @author    Russ Painter (GeekyMonkey)
 * @author    Yu-Jie Lin
 * @author    Alexandre Dantas
 * @version   0.6.2
 * @date      2018-02-24
 * @copyright (c) 2009
 * @license   MIT License
 * @homepage  https://github.com/jquery-textfill/jquery-textfill
 * @example   http://jquery-textfill.github.io/jquery-textfill/index.html
 */
; (function($) {

	/**
	 * Resizes an inner element's font so that the
	 * inner element completely fills the outer element.
	 *
	 * @param {Object} options User options that take
	 *                         higher precedence when
	 *                         merging with the default ones.
	 *
	 * @return All outer elements processed
	 */
	$.fn.textfill = function(options) {

		// ______  _______ _______ _______ _     _        _______ _______
		// |     \ |______ |______ |_____| |     | |         |    |______
		// |_____/ |______ |       |     | |_____| |_____    |    ______|
		//
		// Merging user options with the default values

		var defaults = {
			debug            : false,
			maxFontPixels    : 40,
			minFontPixels    : 4,
			innerTag         : 'span',
			widthOnly        : false,
			success          : null, // callback when a resizing is done
			fail             : null, // callback when a resizing is failed
			complete         : null, // callback when all is done
			explicitWidth    : null,
			explicitHeight   : null,
			changeLineHeight : false,
			truncateOnFail   : false,
			allowOverflow    : false // If true, text will stay at minFontPixels but overflow container w/out failing 
		};

		var Opts = $.extend(defaults, options);

		// _______ _     _ __   _ _______ _______ _____  _____  __   _ _______
		// |______ |     | | \  | |          |      |   |     | | \  | |______
		// |       |_____| |  \_| |_____     |    __|__ |_____| |  \_| ______|
		//
		// Predefining the awesomeness

		// Output arguments to the Debug console
		// if "Debug Mode" is enabled
		function _debug() {
			if (!Opts.debug
				||  typeof console       == 'undefined'
				||  typeof console.debug == 'undefined') {
				return;
			}
			console.debug.apply(console, arguments);
		}

		// Output arguments to the Warning console
		function _warn() {
			if (typeof console      == 'undefined' ||
				typeof console.warn == 'undefined') {
				return;
			}
			console.warn.apply(console, arguments);
		}

		// Outputs all information on the current sizing
		// of the font.
		function _debug_sizing(prefix, ourText, maxHeight, maxWidth, minFontPixels, maxFontPixels) {

			function _m(v1, v2) {

				var marker = ' / ';

				if (v1 > v2) {
					marker = ' > ';
				}
				else if (v1 == v2) {
					marker = ' = ';
				}
				return marker;
			}

			_debug(
				'[TextFill] '  + prefix + ' { ' +
				'font-size: ' + ourText.css('font-size') + ',' +
				'Height: '    + ourText.height() + 'px ' + _m(ourText.height(), maxHeight) + maxHeight + 'px,' +
				'Width: '     + ourText.width()  + _m(ourText.width() , maxWidth)  + maxWidth + ',' +
				'minFontPixels: ' + minFontPixels + 'px, ' +
				'maxFontPixels: ' + maxFontPixels + 'px }'
			);
		}

		/**
		 * Calculates which size the font can get resized,
		 * according to constrains.
		 *
		 * @param {String} prefix Gets shown on the console before
		 *                        all the arguments, if debug mode is on.
		 * @param {Object} ourText The DOM element to resize,
		 *                         that contains the text.
		 * @param {function} func Function called on `ourText` that's
		 *                        used to compare with `max`.
		 * @param {number} max Maximum value, that gets compared with
		 *                     `func` called on `ourText`.
		 * @param {number} minFontPixels Minimum value the font can
		 *                               get resized to (in pixels).
		 * @param {number} maxFontPixels Maximum value the font can
		 *                               get resized to (in pixels).
		 *
		 * @return Size (in pixels) that the font can be resized.
		 */
		function _sizing(prefix, ourText, func, max, maxHeight, maxWidth, minFontPixels, maxFontPixels) {

			_debug_sizing(
				prefix, ourText,
				maxHeight, maxWidth,
				minFontPixels, maxFontPixels
			);

			// The kernel of the whole plugin, take most attention
			// on this part.
			//
			// This is a loop that keeps increasing the `font-size`
			// until it fits the parent element.
			//
			// - Start from the minimal allowed value (`minFontPixels`)
			// - Guesses an average font size (in pixels) for the font,
			// - Resizes the text and sees if its size is within the
			//   boundaries (`minFontPixels` and `maxFontPixels`).
			//   - If so, keep guessing until we break.
			//   - If not, return the last calculated size.
			//
			// I understand this is not optimized and we should
			// consider implementing something akin to
			// Daniel Hoffmann's answer here:
			//
			//     http://stackoverflow.com/a/17433451/1094964
			//
			
			while (minFontPixels < (Math.floor(maxFontPixels) - 1)) {

				var fontSize = Math.floor((minFontPixels + maxFontPixels) / 2);
				ourText.css('font-size', fontSize);
				var curSize = func.call(ourText);

				if (curSize <= max) {
					minFontPixels = fontSize;

					if (curSize == max) {
						break;
					}
				}
				else {
					maxFontPixels = fontSize;
				}

				_debug_sizing(
					prefix, ourText,
					maxHeight, maxWidth,
					minFontPixels, maxFontPixels
				);
			}

			ourText.css('font-size', maxFontPixels);

			if (func.call(ourText) <= max) {
				minFontPixels = maxFontPixels;

				_debug_sizing(
					prefix + '* ', ourText,
					maxHeight, maxWidth,
					minFontPixels, maxFontPixels
				);
			}
			return minFontPixels;
		}

		// _______ _______ _______  ______ _______
		// |______    |    |_____| |_____/    |
		// ______|    |    |     | |    \_    |
        //
		// Let's get it started (yeah)!

		_debug('[TextFill] Start Debug');

		this.each(function() {

			// Contains the child element we will resize.
			// $(this) means the parent container
			var ourText = $(Opts.innerTag + ':first', this);

			_debug('[TextFill] Inner text: ' + ourText.text());
			_debug('[TextFill] All options: ', Opts);
			_debug('[TextFill] Maximum sizes: { ' +
				   'Height: ' + maxHeight + 'px, ' +
				   'Width: '  + maxWidth  + 'px' + ' }'
				  );

			if (!ourText.is(':visible')) {
				// Failure callback
				if (Opts.fail)
					Opts.fail(this);

				_debug(
					'[TextFill] Failure { ' +
					'Current Width: '  + ourText.width()  + ', ' +
					'Maximum Width: '  + maxWidth         + ', ' +
					'Current Height: ' + ourText.height() + ', ' +
					'Maximum Height: ' + maxHeight        + ' }'
				);

				return;
			}

			// Will resize to this dimensions.
			// Use explicit dimensions when specified
			var maxHeight = Opts.explicitHeight || $(this).height();
			var maxWidth  = Opts.explicitWidth  || $(this).width();

			var oldFontSize = ourText.css('font-size');

			var lineHeight  = parseFloat(ourText.css('line-height')) / parseFloat(oldFontSize);

			var minFontPixels = Opts.minFontPixels;

			// Remember, if this `maxFontPixels` is negative,
			// the text will resize to as long as the container
			// can accomodate
			var maxFontPixels = (Opts.maxFontPixels <= 0 ?
								 maxHeight :
								 Opts.maxFontPixels);

			// Let's start it all!

			// 1. Calculate which `font-size` would
			//    be best for the Height
			var fontSizeHeight = undefined;

			if (Opts.widthOnly) {
				// We need to measure with nowrap otherwise wrapping occurs and the measurement is wrong
      			ourText.css('white-space', 'nowrap' );
			} else {
				fontSizeHeight = _sizing(
					'Height', ourText,
					$.fn.height, maxHeight,
					maxHeight, maxWidth,
					minFontPixels, maxFontPixels
				);
			}

			// 2. Calculate which `font-size` would
			//    be best for the Width
			var fontSizeWidth = undefined;

			fontSizeWidth = _sizing(
				'Width', ourText,
				$.fn.width, maxWidth,
				maxHeight, maxWidth,
				minFontPixels, maxFontPixels
			);

			// 3. Actually resize the text!

			if (Opts.widthOnly) {
				ourText.css({
					'font-size'  : fontSizeWidth
				});

				if (Opts.changeLineHeight) {
					ourText.parent().css(
						'line-height',
						(lineHeight * fontSizeWidth + 'px')
					);
				}
			}
			else {
				var fontSizeFinal = Math.min(fontSizeHeight, fontSizeWidth);

				ourText.css('font-size', fontSizeFinal);

				if (Opts.changeLineHeight) {
					ourText.parent().css(
						'line-height',
						(lineHeight * fontSizeFinal) + 'px'
					);
				}
			}

			_debug(
				'[TextFill] Finished { ' +
				'Old font-size: ' + oldFontSize              + ', ' +
				'New font-size: ' + ourText.css('font-size') + ' }'
			);

			// Oops, something wrong happened!
			// If font-size increasing, we weren't supposed to exceed the original size 
			// If font-size decreasing, we hit minFontPixels, and still won't fit 
			if ((ourText.width()  > maxWidth && !Opts.allowOverflow) ||
				(ourText.height() > maxHeight && !Opts.widthOnly && !Opts.allowOverflow)) { 

				ourText.css('font-size', oldFontSize);

				// Failure callback
				if (Opts.fail) {
					Opts.fail(this);
				}

				_debug(
					'[TextFill] Failure { ' +
					'Current Width: '  + ourText.width()  + ', ' +
					'Maximum Width: '  + maxWidth         + ', ' +
					'Current Height: ' + ourText.height() + ', ' +
					'Maximum Height: ' + maxHeight        + ' }'
				);
			}
			else if (Opts.success) {
				Opts.success(this);
			}
		});

		// Complete callback
		if (Opts.complete) {
			Opts.complete(this);
		}

		_debug('[TextFill] End Debug');
		return this;
	};

})(function() {
	if (typeof module !== 'undefined' && module.exports) {
		return require('jquery');
	}
	return window.jQuery;
}());
/*! jquery-dateFormat 18-05-2015 */
var DateFormat={};!function(a){var b=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],c=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],d=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],e=["January","February","March","April","May","June","July","August","September","October","November","December"],f={Jan:"01",Feb:"02",Mar:"03",Apr:"04",May:"05",Jun:"06",Jul:"07",Aug:"08",Sep:"09",Oct:"10",Nov:"11",Dec:"12"},g=/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.?\d{0,3}[Z\-+]?(\d{2}:?\d{2})?/;a.format=function(){function a(a){return b[parseInt(a,10)]||a}function h(a){return c[parseInt(a,10)]||a}function i(a){var b=parseInt(a,10)-1;return d[b]||a}function j(a){var b=parseInt(a,10)-1;return e[b]||a}function k(a){return f[a]||a}function l(a){var b,c,d,e,f,g=a,h="";return-1!==g.indexOf(".")&&(e=g.split("."),g=e[0],h=e[e.length-1]),f=g.split(":"),3===f.length?(b=f[0],c=f[1],d=f[2].replace(/\s.+/,"").replace(/[a-z]/gi,""),g=g.replace(/\s.+/,"").replace(/[a-z]/gi,""),{time:g,hour:b,minute:c,second:d,millis:h}):{time:"",hour:"",minute:"",second:"",millis:""}}function m(a,b){for(var c=b-String(a).length,d=0;c>d;d++)a="0"+a;return a}return{parseDate:function(a){var b,c,d={date:null,year:null,month:null,dayOfMonth:null,dayOfWeek:null,time:null};if("number"==typeof a)return this.parseDate(new Date(a));if("function"==typeof a.getFullYear)d.year=String(a.getFullYear()),d.month=String(a.getMonth()+1),d.dayOfMonth=String(a.getDate()),d.time=l(a.toTimeString()+"."+a.getMilliseconds());else if(-1!=a.search(g))b=a.split(/[T\+-]/),d.year=b[0],d.month=b[1],d.dayOfMonth=b[2],d.time=l(b[3].split(".")[0]);else switch(b=a.split(" "),6===b.length&&isNaN(b[5])&&(b[b.length]="()"),b.length){case 6:d.year=b[5],d.month=k(b[1]),d.dayOfMonth=b[2],d.time=l(b[3]);break;case 2:c=b[0].split("-"),d.year=c[0],d.month=c[1],d.dayOfMonth=c[2],d.time=l(b[1]);break;case 7:case 9:case 10:d.year=b[3],d.month=k(b[1]),d.dayOfMonth=b[2],d.time=l(b[4]);break;case 1:c=b[0].split(""),d.year=c[0]+c[1]+c[2]+c[3],d.month=c[5]+c[6],d.dayOfMonth=c[8]+c[9],d.time=l(c[13]+c[14]+c[15]+c[16]+c[17]+c[18]+c[19]+c[20]);break;default:return null}return d.date=d.time?new Date(d.year,d.month-1,d.dayOfMonth,d.time.hour,d.time.minute,d.time.second,d.time.millis):new Date(d.year,d.month-1,d.dayOfMonth),d.dayOfWeek=String(d.date.getDay()),d},date:function(b,c){try{var d=this.parseDate(b);if(null===d)return b;for(var e,f=d.year,g=d.month,k=d.dayOfMonth,l=d.dayOfWeek,n=d.time,o="",p="",q="",r=!1,s=0;s<c.length;s++){var t=c.charAt(s),u=c.charAt(s+1);if(r)"'"==t?(p+=""===o?"'":o,o="",r=!1):o+=t;else switch(o+=t,q="",o){case"ddd":p+=a(l),o="";break;case"dd":if("d"===u)break;p+=m(k,2),o="";break;case"d":if("d"===u)break;p+=parseInt(k,10),o="";break;case"D":k=1==k||21==k||31==k?parseInt(k,10)+"st":2==k||22==k?parseInt(k,10)+"nd":3==k||23==k?parseInt(k,10)+"rd":parseInt(k,10)+"th",p+=k,o="";break;case"MMMM":p+=j(g),o="";break;case"MMM":if("M"===u)break;p+=i(g),o="";break;case"MM":if("M"===u)break;p+=m(g,2),o="";break;case"M":if("M"===u)break;p+=parseInt(g,10),o="";break;case"y":case"yyy":if("y"===u)break;p+=o,o="";break;case"yy":if("y"===u)break;p+=String(f).slice(-2),o="";break;case"yyyy":p+=f,o="";break;case"HH":p+=m(n.hour,2),o="";break;case"H":if("H"===u)break;p+=parseInt(n.hour,10),o="";break;case"hh":e=0===parseInt(n.hour,10)?12:n.hour<13?n.hour:n.hour-12,p+=m(e,2),o="";break;case"h":if("h"===u)break;e=0===parseInt(n.hour,10)?12:n.hour<13?n.hour:n.hour-12,p+=parseInt(e,10),o="";break;case"mm":p+=m(n.minute,2),o="";break;case"m":if("m"===u)break;p+=n.minute,o="";break;case"ss":p+=m(n.second.substring(0,2),2),o="";break;case"s":if("s"===u)break;p+=n.second,o="";break;case"S":case"SS":if("S"===u)break;p+=o,o="";break;case"SSS":var v="000"+n.millis.substring(0,3);p+=v.substring(v.length-3),o="";break;case"a":p+=n.hour>=12?"PM":"AM",o="";break;case"p":p+=n.hour>=12?"p.m.":"a.m.",o="";break;case"E":p+=h(l),o="";break;case"'":o="",r=!0;break;default:p+=t,o=""}}return p+=q}catch(w){return console&&console.log&&console.log(w),b}},prettyDate:function(a){var b,c,d;return("string"==typeof a||"number"==typeof a)&&(b=new Date(a)),"object"==typeof a&&(b=new Date(a.toString())),c=((new Date).getTime()-b.getTime())/1e3,d=Math.floor(c/86400),isNaN(d)||0>d?void 0:60>c?"just now":120>c?"1 minute ago":3600>c?Math.floor(c/60)+" minutes ago":7200>c?"1 hour ago":86400>c?Math.floor(c/3600)+" hours ago":1===d?"Yesterday":7>d?d+" days ago":31>d?Math.ceil(d/7)+" weeks ago":d>=31?"more than 5 weeks ago":void 0},toBrowserTimeZone:function(a,b){return this.date(new Date(a),b||"MM/dd/yyyy HH:mm:ss")}}}()}(DateFormat),function(a){a.format=DateFormat.format}(jQuery);
$(function () {
	var $content = $('#transjusticeContent');
  var $updates =$('#updates-transjustice');
	var data = {
		rss_url: 'https://medium.com/feed/nojusticenopride/tagged/transjustice'
	};
	$.get('https://api.rss2json.com/v1/api.json', data, function (response) {
		if (response.status == 'ok') {
			var output = '';
       var updateLink = '';
			$.each(response.items, function (k, item) {
				var visibleSm;
				if(k < 1){
					visibleSm = 'active';
				 } else {
					 visibleSm = ' ';
				 }
				output += '<div class="card ' + visibleSm + ' carousel-item border-success" style="overflow:hidden"><div class="view overlay" style="height: auto;position: relative;">';
				var tagIndex = item.description.indexOf('<img'); // Find where the img tag starts
				var srcIndex = item.description.substring(tagIndex).indexOf('src=') + tagIndex; // Find where the src attribute starts
				var srcStart = srcIndex + 5; // Find where the actual image URL starts; 5 for the length of 'src="'
				var srcEnd = item.description.substring(srcStart).indexOf('"') + srcStart; // Find where the URL ends
				var src = item.description.substring(srcStart, srcEnd); // Extract just the URL
        updateLink += '<li><a href="'+ item.link + '">' + item.title + '</a></li>';
				output += '  <img class="card-img-top img-responsive" src="' + src + '" width="360px" height="240px">';
        output += '<a href="'+ item.link + '"><div class="mask rgba-success-slight waves-effect waves-light"></div></a></div><a href="'+ item.link + '" class="abnormal-icon btn-floating btn-action ml-auto mr-4 btn-success lighten-3 waves-effect waves-light" style="font-size: inherit;"><i class="text-dark fas fa-chevron-right pl-1"></i></a>';
				output += ' <div class="card-body"><h4 class="card-title"><a href="'+ item.link + '">' + item.title + '</a></h4><div class="widget-fill"></div>';
      
				
				
				output += '<div class="post-meta"><span>By ' + item.author + '</span></div>';
				var yourString = item.description.replace(/<img[^>]*>/g,""); //replace with your string.
				var maxLength = 120 // maximum number of characters to extract
				//trim the string to the maximum length
				var trimmedString = yourString.substr(0, maxLength);
				//re-trim if we are in the middle of a word  output += '<p class="card-text"></p></div>';
				trimmedString = trimmedString.substr(0, Math.min(trimmedString.length, trimmedString.lastIndexOf(" ")))
				output += '<p class="card-text">' + trimmedString + '...</p><a class="btn btn-danger text-dark btn-lg-tablet margintopmore waves-effect waves-light" href="'+ item.link + '">Read more</a></div>';
        output += '<div class="rounded-bottom bg-success lighten-3 text-center pt-3"><ul class="list-unstyled list-inline font-small"><li class="list-inline-item pr-2 text-dark text-dark text-dark"><i class="far fa-clock pr-1"></i>' + $.format.date(item.pubDate, "MM/dd/yyyy") + '</li><li class="list-inline-item pr-2 text-dark text-dark"><a href="https://www.facebook.com/sharer/sharer.php?u='+ item.link + '" class="white-text">Share <i class="fab fa-facebook-f pr-1"> </i></a></li><li class="list-inline-item">';
        output +='<a href="https://twitter.com/home?status=' + item.title + '%21%20-%20'+ item.link + '" class="white-text">Tweet <i class="fab fa-twitter pr-1"> </i></a></li></ul></div>';
				output += '</div>';
				return k < 8;
			});
			$content.html(output);
      $updates.html(updateLink);
		}
	});
});
$(function () {
	var $rootcontent = $('#rootsContent');
  var $rupdates =$('#updates-roots');
	var rdata = {
		rss_url: 'https://medium.com/feed/nojusticenopride/tagged/back-to-the-roots'
	};
	$.get('https://api.rss2json.com/v1/api.json', rdata, function (response) {
		if (response.status == 'ok') {
			var routput = '';
       var rupdateLink = '';
			$.each(response.items, function (k, item) {
				var visibleSm;
				if(k < 1){
					visibleSm = 'active';
				 } else {
					 visibleSm = ' ';
				 }
				routput += '<div class="card ' + visibleSm + ' carousel-item border-success" style="overflow:hidden"><div class="view overlay" style="height: auto;position: relative;">';				var tagIndex = item.description.indexOf('<img'); // Find where the img tag starts
				var srcIndex = item.description.substring(tagIndex).indexOf('src=') + tagIndex; // Find where the src attribute starts
				var srcStart = srcIndex + 5; // Find where the actual image URL starts; 5 for the length of 'src="'
				var srcEnd = item.description.substring(srcStart).indexOf('"') + srcStart; // Find where the URL ends
				var src = item.description.substring(srcStart, srcEnd); // Extract just the URL
        rupdateLink += '<li><a href="'+ item.link + '">' + item.title + '</a></li>';
				routput += '  <img class="card-img-top img-responsive" src="' + src + '" width="360px" height="240px">';
        routput += '<a href="'+ item.link + '"><div class="mask rgba-success-slight waves-effect waves-light"></div></a></div><a href="'+ item.link + '" class="abnormal-icon btn-floating btn-action ml-auto mr-4 btn-success lighten-3 waves-effect waves-light" style="font-size: inherit;"><i class="text-dark fas fa-chevron-right pl-1"></i></a>';
				routput += ' <div class="card-body"><h4 class="card-title"><a href="'+ item.link + '">' + item.title + '</a></h4><div class="widget-fill"></div>';
      
				
				
				routput += '<div class="post-meta"><span>By ' + item.author + '</span></div>';
				var yourString = item.description.replace(/<img[^>]*>/g,""); //replace with your string.
				var maxLength = 120 // maximum number of characters to extract
				//trim the string to the maximum length
				var trimmedString = yourString.substr(0, maxLength);
				//re-trim if we are in the middle of a word  output += '<p class="card-text"></p></div>';
				trimmedString = trimmedString.substr(0, Math.min(trimmedString.length, trimmedString.lastIndexOf(" ")))
				routput += '<p class="card-text">' + trimmedString + '...</p><a class="btn btn-danger text-dark btn-lg-tablet margintopmore waves-effect waves-light" href="'+ item.link + '">Read more</a></div>';
        routput += '<div class="rounded-bottom bg-success lighten-3 text-center pt-3"><ul class="list-unstyled list-inline font-small"><li class="list-inline-item pr-2 text-dark text-dark text-dark"><i class="far fa-clock pr-1"></i>' + $.format.date(item.pubDate, "MM/dd/yyyy") + '</li><li class="list-inline-item pr-2 text-dark text-dark"><a href="https://www.facebook.com/sharer/sharer.php?u='+ item.link + '" class="white-text">Share <i class="fab fa-facebook-f pr-1"> </i></a></li><li class="list-inline-item">';
        routput +='<a href="https://twitter.com/home?status=' + item.title + '%21%20-%20'+ item.link + '" class="white-text">Tweet <i class="fab fa-twitter pr-1"> </i></a></li></ul></div>';
				routput += '</div>';
				return k < 8;
			});
			$rootcontent.html(routput);
      $rupdates.html(rupdateLink);
		}
	});
});

$(function () {
	var $Collectivecontent = $('#collectiveContent');
  var $Collectiveupdates =$('#updates-collective');
 var NCdata = {
            rss_url: 'https://medium.com/feed/nojusticenopride/tagged/the-njnp-collective',
            api_key: 'jmrjyuy7nmblluukkbyikaxy04uirhgjc0ngxzd6'
          };
	$.get('https://api.rss2json.com/v1/api.json', NCdata, function (response) {
		if (response.status == 'ok') {
			var NCoutput = '';
       var NCupdateLink = '';
			$.each(response.items, function (k, item) {
				var visibleSm;
				if(k < 1){
					visibleSm = 'active';
				 } else {
					 visibleSm = ' ';
				 }
				NCoutput += '<div class="card ' + visibleSm + ' carousel-item border-success" style="overflow:hidden"><div class="view overlay" style="height: auto;position: relative;">';				var tagIndex = item.description.indexOf('<img'); // Find where the img tag starts
				var srcIndex = item.description.substring(tagIndex).indexOf('src=') + tagIndex; // Find where the src attribute starts
				var srcStart = srcIndex + 5; // Find where the actual image URL starts; 5 for the length of 'src="'
				var srcEnd = item.description.substring(srcStart).indexOf('"') + srcStart; // Find where the URL ends
				var src = item.description.substring(srcStart, srcEnd); // Extract just the URL
        NCupdateLink += '<li><a href="'+ item.link + '">' + item.title + '</a></li>';
				NCoutput += '  <img class="card-img-top img-responsive" src="' + src + '" width="360px" height="240px">';
        NCoutput += '<a href="'+ item.link + '"><div class="mask rgba-success-slight waves-effect waves-light"></div></a></div><a href="'+ item.link + '" class="abnormal-icon btn-floating btn-action ml-auto mr-4 btn-success lighten-3 waves-effect waves-light" style="font-size: inherit;"><i class="text-dark fas fa-chevron-right pl-1"></i></a>';
				NCoutput += ' <div class="card-body"><h4 class="card-title"><a href="'+ item.link + '">' + item.title + '</a></h4><div class="widget-fill"></div>';
      
				
				
				NCoutput += '<div class="post-meta"><span>By ' + item.author + '</span></div>';
				var yourString = item.description.replace(/<img[^>]*>/g,""); //replace with your string.
				var maxLength = 120 // maximum number of characters to extract
				//trim the string to the maximum length
				var trimmedString = yourString.substr(0, maxLength);
				//re-trim if we are in the middle of a word  output += '<p class="card-text"></p></div>';
				trimmedString = trimmedString.substr(0, Math.min(trimmedString.length, trimmedString.lastIndexOf(" ")))
				NCoutput += '<p class="card-text">' + trimmedString + '...</p><a class="btn btn-danger text-dark btn-lg-tablet margintopmore waves-effect waves-light" href="'+ item.link + '">Read more</a></div>';
        NCoutput += '<div class="rounded-bottom bg-success lighten-3 text-center pt-3"><ul class="list-unstyled list-inline font-small"><li class="list-inline-item pr-2 text-dark text-dark text-dark"><i class="far fa-clock pr-1"></i>' + $.format.date(item.pubDate, "MM/dd/yyyy") + '</li><li class="list-inline-item pr-2 text-dark text-dark"><a href="https://www.facebook.com/sharer/sharer.php?u='+ item.link + '" class="white-text">Share <i class="fab fa-facebook-f pr-1"> </i></a></li><li class="list-inline-item">';
        NCoutput +='<a href="https://twitter.com/home?status=' + item.title + '%21%20-%20'+ item.link + '" class="white-text">Tweet <i class="fab fa-twitter pr-1"> </i></a></li></ul></div>';
				NCoutput += '</div>';
				return k < 8;
			});
			$Collectivecontent.html(NCoutput);
      $Collectiveupdates.html(NCupdateLink);
		}
	});
});

(function($) {
    "use strict";

    // manual carousel controls
    $('.next').click(function(){ $('.carousel').carousel('next');return false; });
    $('.prev').click(function(){ $('.carousel').carousel('prev');return false; });
    
})(jQuery);
$(document).ready(function() {
	$(".megamenu").on("click", function(e) {
		e.stopPropagation();
	});
});
