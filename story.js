/*!
 * Progression.js
 * Original author: @aaronlumsden
 * Further changes, comments: @aaronlumsden
 * Licensed under the MIT license
 */
;(function ( $, window, document, undefined ) {

  var pluginName = "progression",
      defaults = {
        tooltipWidth: '200',
        tooltipPosition: 'right',
        tooltipOffset: '50',
        showProgressBar: true,
        showHelper: true,
        validator: false,
        tooltipFontSize: '14',
        tooltipFontColor: 'ffffff',
        progressBarBackground: 'ffffff',
        progressBarColor: '6EA5E1',
        tooltipBackgroundColor: 'a2cbfa',
        tooltipPadding:'10',
        tooltipAnimate:true
      };

  // $('<style>body { background-color: red; color: white; }</style>').appendTo('head');

  function Plugin( element, options ) {
    this.element = element;
    this.$elem = $(this.element);
    this.options = $.extend( {}, defaults, options );
    this._defaults = defaults;
    this._name = pluginName;
    this.init();
  }

  Plugin.prototype = {

    init: function() {

      data_prog = this.$elem.css('position','relative').find('[data-progression]');   







      items =  data_prog.length;
      thisid = this.$elem.attr('id');
      firstoffset =  data_prog.first().position().top;
      firsthelper =  data_prog.first().attr('data-helper');

      function GetPercentage(a, b) {
        return ((b / a) * 100);
      }

      if (data_prog.first().attr('data-helper') !== undefined) {
        firsthelper =  data_prog.first().attr('data-helper');
      } else {
        firsthelper = '';
      }

      if (this.options.showProgressBar === false) { 
        $display = 'display:none;';
      } else {
        $display = '';
      }

      if (this.options.showHelper === false) {
        $display2 = 'display:none;';
      } else {
        $display2 = '';
      }

      var animate = (this.options.tooltipAnimate) ? '-webkit-transition: top .3s ease-in-out;-moz-transition: top .3s ease-in-out;-o-transition: top .3s ease-in-out;transition: top .3s ease-in-out;' : '';
      var animate2 = (this.options.tooltipAnimate) ? '-webkit-transition: width .3s ease-in-out;-moz-transition: width .3s ease-in-out;-o-transition: width .3s ease-in-out;transition: width .3s ease-in-out;' : '';
      var arrowPosition = (this.options.tooltipPosition == 'right') ? 'border-color: transparent #'+this.options.tooltipBackgroundColor+' transparent transparent;' : 'border-color: transparent transparent transparent #'+this.options.tooltipBackgroundColor+'';


      marginRight = parseInt(this.options.tooltipWidth) + parseInt(this.options.tooltipOffset);
      myhtml = $('<div class="syco_tooltip" data-tooltip="'+thisid+'" style="'+animate+'padding:'+this.options.tooltipPadding+'px;top:'+firstoffset+'px;position:absolute;background:#'+this.options.tooltipBackgroundColor+';'+this.options.tooltipPosition+':-'+marginRight+'px;width:'+this.options.tooltipWidth+'px" ><span class="triangle_'+this.options.tooltipPosition+'" style="'+arrowPosition+'"></span><p style="'+$display2+'font-size:'+this.options.tooltipFontSize+'px;color:#'+this.options.tooltipFontColor+'"><span class="tooltip_helper"><span data-index="1" >1</span>/'+items+'</span> '+firsthelper+'</p><div class="percentagebar" style="'+$display+'background:#'+this.options.progressBarBackground+'""><div class="percentagebarinner" style="'+animate2+'background:#'+this.options.progressBarColor+'"></div><span class="percent" '+$display+'>0%</span></div></div>');
      this.$elem.prepend(myhtml);
      thiswidth = this.$elem.find('.syco_tooltip').width();

      data_prog.each(function(){

        var $this1 = $(this);
        var offset = $this1.position().top;

        $this1.bind('live focus change',function(){

          thisprogressionlength = $this1.closest('form').find('[data-progression]').length;
          alldataprogression = $this1.closest('form').find('[data-progression]');

          thisid2=$this1.closest('form').attr('id');
          thistooltip = $('[data-tooltip="'+thisid2+'"]');
          thishelper= $this1.attr('data-helper');

          if ($this1.attr('data-helper') !== undefined) {
            thishelper= $this1.attr('data-helper');
          } else {
            thishelper = '';
          }

          index = parseInt($('#'+thisid2).find('[data-progression]').index($this1)) + 1;
          percentage = GetPercentage(thisprogressionlength, index).toFixed(0);
          thistooltip.find('p').html('<span class="tooltip_helper"><span data-index="1" >'+index+'</span>/'+thisprogressionlength+'</span> '+thishelper).parent().find('.percentagebarinner').css( "width",parseInt(percentage)+'%').next().html(parseInt(percentage)+'%');
          thistooltip.css( "top", offset+'px' );

        });

      });



    },

    yourOtherFunction: function(el, options) {
      // some logic
    }
  };

  // A really lightweight plugin wrapper around the constructor,
  // preventing against multiple instantiations
  $.fn[pluginName] = function ( options ) {
    return this.each(function () {
      if (!$.data(this, "plugin_" + pluginName)) {
        $.data(this, "plugin_" + pluginName, new Plugin( this, options ));
      }
    });
  };

})( jQuery, window, document );
$(document).ready(function () {

  $(document).ready(function() {

    $(function () {
      var input = document.getElementById('petition_signature_content'),
          tagify = new Tagify(input, {
            callbacks        : {
              add    : console.log,  // callback when adding a tag
              remove : console.log   // callback when removing a tag
            }

          });
      tagify.on('add', onAddTag)
      .on('remove', onRemoveTag)
      .on('invalid', onInvalidTag);

      // tag added callback
      function onAddTag(e){
        console.log(e, e.detail);
        console.log( tagify.DOM.originalInput.value )
        tagify.off('add', onAddTag) // exmaple of removing a custom Tagify event
      }

      // tag remvoed callback
      function onRemoveTag(e){
        console.log(e, e.detail);
      }

      // invalid tag added callback
      function onInvalidTag(e){
        console.log(e, e.detail);
      }
    });

    $(function () {
      var input = document.getElementById('petition_signature_signup_custom_values_how_do_you_identify_enter_all_that_appl_custom'),
          // init Tagify script on the above inputs
          tagify = new Tagify(input, {
            whitelist : [ "Trans / transgender", "Two Spirit", "Queer", "Black", "Brown", "Disabled", "Indigenous/ Native", "Woman", "Butch Queen", "Man", "Genderqueer", "Queen", "Latinx/a/o", "Gender fluid", "Femme", "Muslim", "Non Binary", "Gay", "Lesbian", "Pansexual", "Bisexual", "cis", "Puerto Rican"],
            blacklist : ["facist", "racist", "Trump"]
          });

      // "remove all tags" button event listener

      // Chainable event listeners
      tagify.on('add', onAddTag)
      .on('remove', onRemoveTag)
      .on('invalid', onInvalidTag);

      // tag added callback
      function onAddTag(e){
        console.log(e, e.detail);
        console.log( tagify.DOM.originalInput.value )
        tagify.off('add', onAddTag) // exmaple of removing a custom Tagify event
      }

      // tag remvoed callback
      function onRemoveTag(e){
        console.log(e, e.detail);
      }

      // invalid tag added callback
      function onInvalidTag(e){
        console.log(e, e.detail);
      }
      console.log(  tagify.value )
    });
  });

  $(document).ready(function() {

    $('#petition_signature_signup_custom_values_select_an_experience_to_write_about__custom').change(function() {

      var val = $(this).val();
      var excerpt = '#' + val;
      $(excerpt).each(function(){
        $(excerpt).toggle();
      })
    });



    $(function () {
      $("#petition_signature_signup_custom_values_select_an_experience_to_write_about__custom").change(function() {
        var val = $(this).val();
        var excerpt = '#' + val;
        $('.experience-description').hide();
        if(val === "reset") {

          $('#custag').html('');
        } else {
          $(excerpt).show();

          $('form').click(function() {
            $('.tagify #FeedBContent p').removeClass('focus');
          });
          $('.tagify #FeedBContent p').click(function () {
            event.stopPropagation();
            $('.tagify #FeedBContent p').removeClass('focus');
            $(this).addClass('focus');
          });
          $('.tagify .close').click(function(e) {
            e.preventDefault();
            $(this).parent().remove();
          });
        }

      });
    });
    $( ".tagify.textarea.md-form.d-none.form-control.autogrow.experience-box .tagify__input kbd.answer" ).each(function(index) {
      $(this).on("click", function(){
        // For the boolean value
        if ($(this).is(':empty')){
          //do something
          $(this).prev('samp').addClass('answered');
        } else {
          if ($(this).prev('samp').hasClass('answered')){
            $(this).prev('samp').removeClass('answered');
          }
        }
      });
    });
    $(".tagify.textarea.experience-box #FeedBContent").keyup(function() {

      var contents = $(".tagify.textarea.experience-box #FeedBContent").html();
      $('tags.tagify.textarea.md-form.d-none.form-control.autogrow.experience-box .tagify__input').html(contents);
      $('tags.tagify.textarea.md-form.d-none.form-control.autogrow.experience-box .tagify__input kbd.answer').each(function() {
        var $this = $(this);
        var ifQ = $this.prev();
        if (ifQ.is( "samp" ) ) {
          ifQ.html('');
          ifQ.remove();
        } 

        if($this.html().replace(/\s|&nbsp;/g, '').length == 0)
          $this.remove();
      });

      var fcontents = $("tags.tagify.textarea.md-form.d-none.form-control.autogrow.experience-box .tagify__input").html();
      var encoded = $('<div/>').text(fcontents).html();
      $('textarea#petition_signature_content').html(encoded);




    });
    $("#find_btn").click(function  (e) {
      e.preventDefault(); //user clicks button
      if ("geolocation" in navigator){ //check geolocation available 
        //try to get user current location using getCurrentPosition() method
        navigator.geolocation.getCurrentPosition(function(position){ 
          $("#petition_signature_signup_custom_values_experience_as_you_feel_comfortable_list_the_location_of_where_this_happened_custom").val("Couldn't determine the name of this location (business, street building etc) "+position.coords.latitude+","+ position.coords.longitude);
        });
      }else{
        console.log("Browser doesn't support geolocation!");
      }
    });


    //Toggle fullscreen
    $("#panel-fullscreen").click(function (e) {
      e.preventDefault();

      var $this = $(this);

      if ($this.children('i').hasClass('fa-expand-arrows-alt'))
      {
        $this.children('i').removeClass('fa-expand-arrows-alt');
        $this.children('i').addClass('fa-compress');
      }
      else if ($this.children('i').hasClass('fa-compress'))
      {
        $this.children('i').removeClass('fa-compress');
        $this.children('i').addClass('fa-expand-arrows-alt');
      }
      $(this).closest('#sysplatform').toggleClass('panel-fullscreen');
    });
  });
});  

