$(document).ready(function(){
    var canvas = document.getElementById('demo-canvas');
    var result = document.getElementById('result-canvas');
    var $canvas = $('#demo-canvas');
    if (!canvas) {
        return false;
    }
    var context,img = new Image();
    var df = $.Deferred();
    img.onload = function () {
        // console.log(canvas);
        canvas.height = result.height = this.height;
        canvas.width = result.width = this.width;
        context = canvas.getContext('2d');
        context.drawImage(img, 0, 0);
        df.resolve();
    };
    img.src = 'css/img/img01.jpg';
    df.done(function () {
        console.log('done');
        $canvas.oilpainting({
            success: function (c) {
                var ctx = result.getContext('2d');
                ctx.drawImage(c, 0, 0);
            }
        });
    });

    $('input[name=confirm]').on('click', function () {
        console.log($('input[name=radius]').val());
        console.log($('input[name=intensity]').val());
        $canvas.oilpainting({
            radius: $('input[name=radius]').val(),
            intensity: $('input[name=intensity]').val(),
            success: function (c) {
                var ctx = result.getContext('2d');
                ctx.drawImage(c, 0, 0);
            }
        });
    });
});