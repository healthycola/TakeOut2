(function ($) {
  $('#ageDays .btn:first-of-type').on('click', function() {
    $('#ageDays input').val( parseInt($('#ageDays input').val(), 10) + 1);
  });
  $('#ageDays .btn:last-of-type').on('click', function() {
    $('#ageDays input').val(Math.max(parseInt($('#ageDays input').val(), 10) - 1, 0));
  });
})(jQuery);

(function ($) {
  $('#ageHours .btn:first-of-type').on('click', function() {
    $('#ageHours input').val( parseInt($('#ageHours input').val(), 10) + 1);
  });
  $('#ageHours .btn:last-of-type').on('click', function() {
    $('#ageHours input').val(Math.max(parseInt($('#ageHours input').val(), 10) - 1,0));
  });
})(jQuery);