var HeadlinerTheme = HeadlinerTheme || {};

$(document).ready(function(){

  (function(){

    // Initializes sticky nav
    this.initNavigation = function(nav, navWrap, navContainer, supporterNav, mainContainer) {      
      if (nav.length && ($(window).width() >= 768)) {
        var transformWrap = mainContainer.find('.main-transform-wrap');
        if (nav.height()>75) {
          nav.css('text-align','left');
        }
        $(window).scroll(function(){
          var navContainerOffset = navContainer.offset().top;
          var relativePosition = navContainerOffset - $(window).scrollTop();
          if ((relativePosition <= 0) && (navContainerOffset >= transformWrap.offset().top)) {
            navContainer.css('position','fixed');
          } else {
            navContainer.css('position','absolute');
          }
        });
        if (supporterNav.length) {
          supporterNav.css('margin-top', navContainer.height() - 35 + 'px');
        }
        if (transformWrap.length) {
          var content = transformWrap.find('.main.width-container').eq(0);
          content.css('padding-top',navContainer.height() + parseInt(content.css('padding-top')) + 'px');
        }
      }
    }

    this.initUserMenu = function(userMenu, userMenuEmailButton) {
      if (userMenu.length) {
        $(window).load(function(){
          var profileImages = userMenu.find('img.profile_image');
          profileImages.each(function(){
            $(this).removeAttr('original-title');
          });
        });
      }
      if (userMenuEmailButton.length) {
        userMenuEmailButton.click(function(){

        })
      }
    }

    this.initMenuOverlay = function(menu, overlay) {
      if (menu.length && overlay.length) {
        overlay.click(function(){
          menu.click();
        });
      }
    }

    this.initLoginOverlay = function(triggers, loginOverlay, wrapOverlayDismiss) {
      if(triggers.length && loginOverlay.length) {
        triggers.each(function(){
          $(this).click(function(){
            loginOverlay.addClass('active');
          });
        });
        if (loginOverlay.find('.errorExplanation').length) {
          triggers.eq(0).click();
        }
      }
      if(wrapOverlayDismiss.length) {
        wrapOverlayDismiss.each(function(){
          $(this).click(function(){
            loginOverlay.removeClass('active');
          });
        });
      }
    }

    this.initSupporterNavOverlay = function(menu, wrap, supporterNav, mainContainer, navWrap) {
      var footerHeight = $('footer').eq(0).outerHeight();
      if (menu.length && wrap.length) {
        menu.each(function(){
          $(this).click(function(){
            $.each(wrap, function(){
              if ($(this).hasClass('active')) {
                $(this).removeClass('active');
              } else {
                $(this).addClass('active');
                var supporterNavHeight = supporterNav.outerHeight();
                var mainContainerHeight = mainContainer.height();
                var navWrapHeight = navWrap.height();
                var lastScrollTop = 0;
                var scrolledDistance = $(window).scrollTop();
                var contentOffset = mainContainer.offset().top;
                if (supporterNav.length && (scrolledDistance > contentOffset)) {
                  if ((mainContainerHeight - scrolledDistance + contentOffset - supporterNavHeight - navWrapHeight) > footerHeight) {
                    supporterNav.css('top', scrolledDistance - contentOffset + 'px');
                  } else {
                    supporterNav.css({'top':'auto','bottom':footerHeight + 'px'});
                  }
                } else {
                  supporterNav.css({'top':0,'bottom':'auto'});
                }
                // Subsequent scrolls only scroll the supporter nav if scroll direction is up
                $(window).scroll(function(){
                  var scrolledDistance = $(window).scrollTop();
                  var contentOffset = mainContainer.offset().top;
                  if (supporterNav.length && (scrolledDistance > contentOffset) && ((mainContainerHeight - scrolledDistance + contentOffset - supporterNavHeight - navWrapHeight) > footerHeight) && (scrolledDistance <= lastScrollTop)) {
                    supporterNav.css('top', scrolledDistance - contentOffset + 'px');
                  }
                  lastScrollTop = scrolledDistance;
                });
              }
            });
          });
        });
      }
    }

    this.initHomepageEventWrap = function(homepageEventWrap) {
      if (homepageEventWrap.length) {
        homepageEventWrap.each(function(){
          var eventList = $(this);
          if ($(this).children().length > 5) {
            $(this).before('<div class="scroller"><ul><li class="scroller-up disabled"></li><li class="scroller-down"></li></ul></div>');
          }
        });
      }
      if ($('.scroller').length) {
        $('.scroller').each(function(){
          var scroller = $(this);
          var scrollerUp = $(this).find('.scroller-up');
          var scrollerDown = $(this).find('.scroller-down');
          var scrollHeight = $(this).next('.event-wrap').children('li').eq(0).outerHeight() * 2;
          var eventWrap = $(this).next('.event-wrap');
          var lastScrollTop = 0;
          scrollerUp.click(function(){
            eventWrap.animate({scrollTop: '-=' + scrollHeight}, 200);
          });
          scrollerDown.click(function(){
            eventWrap.animate({scrollTop: '+=' + scrollHeight}, 200);
          });
          eventWrap.scroll(function(){
            var currentScrollTop = eventWrap.scrollTop();
            if (lastScrollTop < currentScrollTop) {
              scrollerUp.removeClass('disabled');
              if (eventWrap.scrollTop() >= (eventWrap[0].scrollHeight - eventWrap[0].offsetHeight + 9)) {
                scrollerDown.addClass('disabled');
              }
              lastScrollTop = currentScrollTop;
            } else {
              scrollerDown.removeClass('disabled');
              if (eventWrap.scrollTop() == 0) {
                scrollerUp.addClass('disabled');
              }
              lastScrollTop = currentScrollTop;
            }
          });
        });
      }
    }

    this.removeBlogTruncateText = function(pageExcerpts) {
      if (pageExcerpts.length) {
        pageExcerpts.each(function(){
          var truncateText = $(this).find('a[href="#show more content"]');
          var readMorelink = $(this).find('.read-more');
          if (truncateText.length) {
            var excerpt = $(this).find('.excerpt').eq(1);
            truncateText[0].previousSibling.nodeValue = ' … ';
            truncateText[0].nextSibling.nodeValue = '';
            truncateText.hide();
            excerpt.append(readMorelink);
            readMorelink.show();
          }
        });
      }
    }

    this.initForms = function(quantityInputs, otherInput, radioInline) {
      if (quantityInputs.length) {
        quantityInputs.each(function(){
          $(this).after('<div class="quantity-incrementor icon-plus-squared"></div>');
          $(this).attr('type','number');
          $(this).focus(function(){ $(this).parent().addClass('active'); });
          $(this).blur(function(){ $(this).parent().removeClass('active'); });
        });
        $('.quantity-incrementor').each(function(){
          $(this).click(function(){
            var currentValue = parseInt($(this).prev().val());
            $(this).prev().val(currentValue+1);
          });
        });
      }
      if (otherInput && otherInput.length) {
        otherInput.each(function(){
          $(this).next('input').andSelf().wrapAll('<div class="other-amount-wrap"></div>');
        });
      }
      if (radioInline && radioInline.length && ($('.page-pages-show-donation-wide').length == 0)) {
        radioInline.each(function(){
          var group = $(this);
          var buttons = group.find('label.radio');
          var buttonsCount = buttons.length;
          var parent = group.parent();
          var parentWidth = parent.innerWidth();
          if (($(window).width() >= 768) && (buttonsCount > 4)) {
            var marginWidth = parseInt(buttons.eq(0).css("marginRight"));
            var elemWidth = (parentWidth-(marginWidth*(buttonsCount-1)))/buttonsCount;
            buttons.each(function(){
              $(this).css('min-width',elemWidth+'px');
            });
          }
        });
      }
    }

    this.initHeader = function(scrollButton, mainContainer) {
      if(scrollButton && scrollButton.length && mainContainer && mainContainer.length) {
        scrollButton.click(function(){
          $('html, body').animate({
            scrollTop: mainContainer.offset().top
          }, 800);
        });
      }
    }

    // Footer sizing
    this.updateFooter = function(footer) {
      var heightDiff = $(window).height() - $('#body').height();
      if(footer.length) {
        var footerHeight = footer.height();
        if(heightDiff > 0) {
          footer.css({'height':footerHeight+heightDiff+'px'});
        }
      }
    }

    // Initialize on page load
    this.initialize = function() {

      var navBar = $('.topnav').eq(0);
      var navBarWrap = $('.topnav-wrap').eq(0);
      var navWrap = $('.nav-container').eq(0);
      var supporterNav = $('.twocolumn-container .right-column').eq(0);
      var mainContainer = $('.main-container').eq(0);
      var footer = $('footer').eq(0);
      var menu = $('.menu-link').eq(0);
      var wrap = $('#wrap');
      var wrapOverlay = $('#wrap-overlay');
      var wrapOverlayDismiss = $('.wrap-overlay-dismiss');
      var supporterNavMenu = $('.supporter-nav-toggle');
      var supporterNavMenuWrap = [$('.main-transform-wrap').eq(0), $('.user-menu.mobile-visible').eq(0), $('.user-menu.desktop-visible').eq(0)];
      var textInputs = $('.form label + .text');
      var quantityInputs = $('input.quantity');
      var selectInputs = $('.form label + select');
      var userMenu = $('.user-menu').eq(0);
      var userMenuEmailButton = $('.user menu .email-button').eq(0);
      var loginOverlayToggle = $('.login-overlay-toggle');
      var loginOverlay = $('#wrap-overlay-login');
      var homepageEventWrap = $('.homepage-excerpt .event-wrap');
      var blogExcerpts = $('.blog .page-excerpt');
      var otherInput = $('label[for="donation_amount_other"],label[for="pledge_amount_other"]');
      var radioInline = $('.radio-inline');
      var scrollButton = $('.feature-scroll-down').eq(0);

      this.initNavigation(navBar, navBarWrap, navWrap, supporterNav, mainContainer);

      this.initUserMenu(userMenu, userMenuEmailButton);

      this.initHeader(scrollButton, mainContainer);

      this.initMenuOverlay(menu, wrapOverlay);

      this.initLoginOverlay(loginOverlayToggle,loginOverlay,wrapOverlayDismiss);

      this.initSupporterNavOverlay(supporterNavMenu, supporterNavMenuWrap, supporterNav, mainContainer, navWrap);

      this.initForms(quantityInputs, otherInput);

      this.initHomepageEventWrap(homepageEventWrap);

      this.removeBlogTruncateText(blogExcerpts);

      this.updateFooter(footer);

      // OS-specific hacks
      var iOS = navigator.userAgent.match(/(iPod|iPhone|iPad)/);
      if(iOS){
        var featureImages = $('.feature-image');
        var backgroundImage = $('#main-transform-background');
        HeadlinerTheme.resizeImage = function(images) {
          if (images && images.length) {
            images.each(function(){
              $(this).height($(window).height());
            });
          }
        }
        HeadlinerTheme.resizeImage(featureImages);
        HeadlinerTheme.resizeImage(backgroundImage);
        $(window).resize(function(){
          HeadlinerTheme.resizeImage(featureImages);
          HeadlinerTheme.resizeImage(backgroundImage);
        });
      }

    }

  }).apply(HeadlinerTheme);

  HeadlinerTheme.initialize();

});