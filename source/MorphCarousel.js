
(function(){
    "use strict";

    //Declare root variable - window in the browser, global on the server
    var root = this,
        previous = root.MorphCarousel;

    var defaultOptions = {
        itemWidth: 200
    };

    var stageEl = null;
    var carouselEl = null;

    var minRotateAngle = 0;

    // current position of carousel rotation
    var carouselRotateAngle = 0;

    var MorphCarousel = {};

    root.MorphCarousel = function( _stageEl, options ) {
        var itemsList,
            angleRad,
            itemWidth,
            radius;

        mergeOptions(options);

        stageEl = _stageEl;

        carouselEl = stageEl.getElementsByClassName('morph-carousel')[0];
        itemsList = carouselEl.getElementsByClassName('morph-carousel__item');

        attachHammerEvents(itemsList.length);

        minRotateAngle = 360 / itemsList.length;

        // Angle (half of it) in radians
        angleRad = (minRotateAngle / 2) * Math.PI / 180;

        radius = stageEl.offsetWidth / 2;

        itemWidth = radius * Math.sin(angleRad) * 2;

        for (var i=0, len=itemsList.length; i<len; i++) {
            var _angle = i * minRotateAngle;
            itemsList[i].style.setProperty('transform', 'rotateY('+ _angle +'deg) translateZ('+ radius +'px)', null);
            itemsList[i].style.width = itemWidth + 'px';
        }

        return MorphCarousel;
    };

    function attachHammerEvents( itemsAmount ) {
        var hammertime = new Hammer(stageEl);
        var currentAngle = 0;
        var len = Math.ceil(itemsAmount / 2);
        hammertime.on('pan', function(ev) {
            currentAngle = carouselRotateAngle + ev.deltaX / stageEl.offsetWidth * ( minRotateAngle * len );
            setRotation( currentAngle );
        });
        hammertime.on('panend', function(ev) {
            finishAnimation(ev.velocityX);
            currentAngle = normalizeAngle( currentAngle );
            setRotation( currentAngle );
            carouselRotateAngle = currentAngle;
        });
    }

    /**
     * Normalize given angle to the closest one, based on minRotateAngle
     * @param angle
     * @returns {number}
     */
    function normalizeAngle( angle ) {
        var angleF = Math.floor(angle / minRotateAngle) * minRotateAngle;
        var angleS = angleF + minRotateAngle;
        switch (true) {
            case angle - angleF > angleS - angle:
                return angleS;
            default:
                return angleF;
        }
    }

    /**
     * Ending movement of the carousel animation
     *
     * Simple Easing Functions in Javascript
     * https://gist.github.com/gre/1650294
     * @param velocity
     */
    function finishAnimation( velocity ) {
        var direction = velocity < 0 ? 1 : -1;
        var endAngle = normalizeAngle( Math.abs(velocity) * minRotateAngle );
        var angle = 0;
        var currentAngle = 0;
        var last = +new Date();
        var speed = 500; // how much time will take animation
        var tick = function() {
            angle += direction * endAngle * (new Date() - last) / speed;
            last = +new Date();
            currentAngle = carouselRotateAngle + angle;
            setRotation( currentAngle );
            if (Math.abs(angle) < endAngle) {
                (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16)
            } else {
                currentAngle = normalizeAngle( currentAngle );
                setRotation( currentAngle );
                carouselRotateAngle = currentAngle;
            }
        };
        tick()
    }

    /**
     * Set rotation of the carousel
     * @param angle {number} - carousel
     */
    function setRotation( angle ) {
        carouselEl.style.setProperty('transform', 'rotateY('+ angle +'deg)', null);
    }

    /**
     * Merge default options with provided
     * @param options
     */
    function mergeOptions( options ) {
        MorphCarousel.options = defaultOptions;
    }

}).call(this);