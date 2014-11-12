jQuery.fn.oilpainting = function(opt) {

    opt = $.extend({
        radius: 5,
        intensity: 15,
        success: function () {},
    }, opt || {});

    console.log(opt);

    function startPosition(origin, r) {
        var p = {};
        p.x = origin.x - r;
        p.y = origin.y - r;
        return p;
    }

    function endPosition(origin, r) {
        var p = {};
        p.x = origin.x + r;
        p.y = origin.y + r;
        return p;
    }

    function distance(start, end) {
        var x = Math.pow(end.x - start.x, 2),
            y = Math.pow(end.y - start.y, 2);
        return Math.sqrt(x+y);
    }

    function copyImageData(ctx, src){
        var dst = ctx.createImageData(src.width, src.height);
        dst.data.set(src.data);
        return dst;
    }

    function cloneCanvas(oldCanvas) {
        var newCanvas = document.createElement('canvas');
        var context = newCanvas.getContext('2d');
        newCanvas.width = oldCanvas.width;
        newCanvas.height = oldCanvas.height;
        context.drawImage(oldCanvas, 0, 0);
        return newCanvas;
    }

    var OilPainting = function (canvas) {
        this.height = canvas.height;
        this.width = canvas.width;

        var buffer = cloneCanvas(canvas);
        var c = buffer.getContext('2d');

        var imgdata = c.getImageData(0, 0, buffer.width, buffer.height);
        var res = this.process(imgdata, copyImageData(c, imgdata));
        c.putImageData(res, 0, 0);
        opt.success(buffer);
    };

    OilPainting.prototype.initArray = function () {
        var res = [];
        for (var i = opt.intensity; i >= 0; i--) {
            res.push(0);
        }
        return res;
    };

    OilPainting.prototype.resetArray = function (array, o) {
        for (var i = array.length - 1; i >= 0; i--) {
            array[i] = o;
        }
    };

    OilPainting.prototype.process = function (src, dest) {
        var imgdata = src;
        var intensityCount = this.initArray(),
            averageR = this.initArray(),
            averageG = this.initArray(),
            averageB = this.initArray();
        for (var i = 0, leni = imgdata.data.length; i < leni; i += 4) {
            // step 1: fill the intensity array
            var p = this.pixPosition(i),
                points = this.roundPositions(p, opt.radius),
                j = 0,
                lenj = 0,
                curMax = 0,
                maxIndex = 0;
            for (j = 0,lenj = points.length; j < lenj; j++ ) {
                var pixel = this.pixIndex(points[j]);
                var r = imgdata.data[pixel + 0],
                    g = imgdata.data[pixel + 1],
                    b = imgdata.data[pixel + 2];
                var curIntensity = parseInt((((r+g+b)/3.0)*opt.intensity)/255.0, 10);
                intensityCount[curIntensity]++;
                averageR[curIntensity] += r;
                averageG[curIntensity] += g;
                averageB[curIntensity] += b;
                // Step 2, find the maximum level of intensity
                if (intensityCount[curIntensity] > curMax) {
                    curMax = intensityCount[curIntensity];
                    maxIndex = curIntensity;
                }
            }
            // Step 3, calculate the final value
            dest.data[i + 0] = parseInt(averageR[maxIndex] / curMax, 10);
            dest.data[i + 1] = parseInt(averageG[maxIndex] / curMax, 10);
            dest.data[i + 2] = parseInt(averageB[maxIndex] / curMax, 10);
            // reset array
            this.resetArray(intensityCount, 0);
            this.resetArray(averageR, 0);
            this.resetArray(averageG, 0);
            this.resetArray(averageB, 0);
        }
        return dest;
    };

    OilPainting.prototype.pixIndex = function (p) {
        return p.x*4 + this.width*4*p.y;
    };

    OilPainting.prototype.pixPosition = function (i) {
        var p = {};
        i = i/4;
        p.x = parseInt(i%this.width, 10);
        p.y = parseInt(i/this.width, 10);
        return p;
    };

    OilPainting.prototype.inMap = function (p) {
        if (p.x >= 0 && p.y >= 0 && p.x < this.width && p.y < this.height) {
            return true;
        }
        return false;
    };

    OilPainting.prototype.roundPositions = function (origin, r) {
        var start = startPosition(origin, r),
            end = endPosition(origin, r),
            res = [];
        for (var x=start.x, lenx=this.width; x<lenx; x++) {
            for (var y=start.y, leny=this.height; y<leny; y++) {
                var p = {x: x,y: y};
                if (this.inMap(p) && distance(origin, p) - r < 0) {
                    res.push(p);
                }
            }
        }
        return res;
    };

    this.each(function() {
        new OilPainting(this);
    });
};