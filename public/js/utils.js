(function($, _) {

  $.fn.alertCall = function(options) {
    var template = _.template(
      '<div class="alert alert-<%= data.type %> alert-dismissible">' +
        '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
        '<%= data.html %>' +
      '</div>'
    );
    $(this).html(template({data: options}));
  }
  $.fn.btnAjax = function(container) {
    var $this = $(this);

    $this.on('click', function(e) {
      e.preventDefault();
      var link = $this.attr('href');

      $.get(link)
        .success(function(result) {
          $(container).alertCall({
            type: 'success',
            html: result.responseText || result
          });
        })
        .error(function(result) {
          $(container).alertCall({
            type: 'danger',
            html: result.responseText || result
          });
        });
    });
  };
}(jQuery, _));
