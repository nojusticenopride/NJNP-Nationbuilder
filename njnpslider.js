$(document).ready(function() { //-- See full documentation for TypeIt at https://typeitjs.com. to keep one another safe, fed, and housed, while fighting for a world that affirms us.
  $('#feature-item1 .carousel-loading-image').delay(1000).queue(function(){
    $(this).removeClass('show').dequeue();

  });
  const mySiema = new Siema({
    duration: 250,
    loop: true,
  });
  var siemaContainerWidth = $('#story-feature').width();
  var siemaCount = $('.siema div.item').length;
  var siemaWidth = siemaCount * $('#story-feature').width() - 45;
  $('.siema > div').css('width',siemaWidth +'px');

  // listen for keydown event
  setInterval(() => mySiema.next(), 10000);
  $('#feature-item1 .carousel-instance').delay(1000).queue(function(){
    $(this).addClass('show').dequeue();
  }); 
  $('#feature-item1 .carousel-loading-image').delay(1200).queue(function(){
    $(this).addClass('d-none').dequeue();
  });
  var $root = $('html, body');

  var instance = new TypeIt('#itemText1', {
    //-- See full documentation for TypeIt at https://typeitjs.com. to keep one another safe, fed, and housed, while fighting for a world that affirms us.

    speed: 30,
    deleteSpeed: 40,
    afterComplete: function(instance){
      $('html, body').animate({
        scrollTop: $( $.attr(this, '#stories') ).offset().top
      }, 500);
    }
  }, false)
  .type('Understanding the countless barriers that Trans people face in DC ')
  .pause(200)
  .options({speed: 60})
  .type('<i class="text-orange font-weight-normal"> — Particularly for Black & Brown Communities — </i>')
  .pause(600)

  .delete(55)
  .type(' — to access')
  .pause(200)
  .type('<em class="text-primary"> employment, housing, healthcare,</ em> and other <em class="text-primary">basic needs</em> — ')
  .pause(500)
  .options({speed: 45})
  .delete(10)
  .pause(300)
  .empty()
  .options({speed: 60})
  .type('Centering those most on the margins also requires us to support <i class="font-weight-light">each other.</i>')
  .pause(600)
  .delete(11)
  .type('<em class="text-pink">our communities.❤</em>')
  .pause(800)
  .delete(2)
  .type('')
  .type(', to keep one another: ')
  .pause(100)
  .type('<em class="text-pink">safe, </em>')
  .pause(900)
  .delete(6)
  .type('<em class="text-red">fed,</em>')
  .pause(900)
  .delete(4)
  .type('<em class="text-deep-orange">and housed, </em>')
  .pause(1000)
  .options({speed: 20})
  .delete(24)
  .type('<em class="text-pink">safe, </em>')
  .type('<em class="text-red">fed,</em>')
  .pause(300)
  .empty()
  .options({speed: 60})
  .type('<span class="text-uppercase text-deep-orange font-weight-bold h1 display-1 mt-5 d-inline-block">while fighting for a world that affirms us all ❤❤❤</span>')
  .pause(3500);



  //-- See full documentation for TypeIt at https://typeitjs.com.
  var instance2 =   new TypeIt('#formText1', {
    strings: ["<i>Sign up to get involved</i>"],
    cursor:false,
    autoStart: true,
    afterComplete: function(instance2){
      instance.init();
      $('.form-container1').addClass('position-absolute');
      $('#feature-item1 h2.fade').delay(1000).queue(function(){
        $(this).addClass('show').dequeue();
      });
    }
  }, false);
  instance2.init();
  if(instance2.hasStarted) {
    $('#featureSignup').delay(4000).queue(function(){
      $(this).addClass('show').dequeue();
    });
  }


});
(() => {
 'use strict';
 // Page is loaded
 const objects = document.getElementsByClassName('carousel-image');
Array.from(objects).map((item) => {
  // Start loading image
  const img = new Image();
  img.src = item.dataset.src;
  // Once image is loaded replace the src of the HTML element
  img.onload = () => {
    return item.nodeName === 'IMG' ? 
      item.src = item.dataset.src :        
    item.style.backgroundImage = `url(${item.dataset.src})`;
};
});
})();
