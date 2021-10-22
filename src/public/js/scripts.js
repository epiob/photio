$('#post-comment').hide();

$('#btn-toggle-comment').click(e => {
    e.preventDefault();
    $('#post-comment').slideToggle();
});


$('#btn-like').click(function(e) {
    e.preventDefault();
    let imdId = $(this).data('id');

    $.post('/images/' + imdId + '/like')
        .done(data => {
            console.log(data);
            $('.likes-count').text(data.likes);
        });
});


$('#btn-delete').click(function(e) {
    e.preventDefault();
    let $this = $(this);
    const response = confirm('Se eliminara la Imagen?');
    if (response) {
        let imgId = $this.data('id');
        $.ajax({
                url: '/images/' + imgId,
                type: 'DELETE'
            })
            .done(function(result) {
                $this.removeClass('btn-danger').addClass('btn-success');
                window.location.replace('/');
                $this.find('i').removeClass('fa-times').addClass('fa-check');
                $this.append('<span></span>');
            });
    }
});