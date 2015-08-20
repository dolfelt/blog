var navWrapper = $('.menu-wrapper'),
  scrollPast = navWrapper.offset().top;

if (!scrollPast) {
  $('.menu-wrapper').addClass('scrolling');
} else {
  $(window).on('scroll', function() {
    navWrapper.toggleClass('scrolling', $(window).scrollTop() >= scrollPast);
  });
  $(window).on('resize', function() {
    scrollPast = navWrapper.offset().top;
  });

  $(window).trigger('scroll');
}
