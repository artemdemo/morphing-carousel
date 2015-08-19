
(function(){
    "use strict";

    //Declare root variable - window in the browser, global on the server
    var root = this,
        previous = root.MorphCarousel;

    var options = {
        onStop: null,
        onDragging: null,
        onAnimating: null
    };

    var stageEl = null;
    var carouselEl = null;
    var itemsList = null;

    var minRotateAngle = 0;

    // current position of carousel rotation
    var carouselRotateAngle = 0;

    var isDragging = false;

    // Main object
    var MorphCarousel;

    /**
     * Initialization
     * @param _stageEl
     * @param _options
     * @returns {object}
     * @constructor
     */
    root.MorphCarousel = function( _stageEl, _options ) {
        var angleRad,
            itemWidth,
            itemHeight,
            radius;

        mergeOptions(_options);

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
            setItemRotation( itemsList[i], _angle, radius );
            itemsList[i].style.width = itemWidth + 'px';
        }

        itemHeight = itemsList[0].offsetHeight +'px';
        stageEl.style.height = itemHeight;
        carouselEl.style.height = itemHeight;
        carouselEl.style.width = itemWidth + 'px';

        return MorphCarousel;
    };

    /**
     * Attaching hammer JS events
     * @param itemsAmount
     */
    function attachHammerEvents( itemsAmount ) {
        var hammertime = new Hammer(stageEl);
        var currentAngle = 0;
        var len = Math.ceil(itemsAmount / 2);
        hammertime.on('pan', function(ev) {
            currentAngle = carouselRotateAngle + ev.deltaX / stageEl.offsetWidth * ( minRotateAngle * len );
            isDragging = true;
            setRotation( currentAngle );
            if ( !! options.onDragging ) options.onDragging.call(this, currentAngle);
        });
        hammertime.on('panend', function(ev) {
            isDragging = false;
            currentAngle = stabilizeAngle( currentAngle );
            setRotation( currentAngle );
            carouselRotateAngle = currentAngle;
            finishAnimation(ev.velocityX);
        });
        hammertime.on('pancancel', function(ev) {
            isDragging = false;
        });
    }

    /**
     * Stabilize given angle to the closest one, based on minRotateAngle
     * @param angle
     * @returns {number}
     */
    function stabilizeAngle( angle ) {
        var mod = Math.floor(angle / minRotateAngle),
            angleF = mod * minRotateAngle,
            angleS = angleF + minRotateAngle;
        switch (true) {
            case angle - angleF > angleS - angle:
                return angleS;
            default:
                return angleF;
        }
    }

    /**
     * Normalize angle into range between 0 and 360. Converts invalid angle to 0.
     * @param angle
     * @returns {number}
     */
    function normalizeAngle( angle ) {
        var result;
        if (angle == null) {
            angle = 0;
        }
        result = isNaN(angle) ? 0 : angle;
        result %= 360;
        if (result < 0) {
            result += 360;
        }
        return result;
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
        var endAngle = stabilizeAngle( Math.abs(velocity) * minRotateAngle );
        var angle = 0;
        var currentAngle = 0;
        var last = +new Date();
        var speed = 500; // how much time will take animation
        var tick = function() {

            if ( isDragging ) return false;

            angle += direction * endAngle * (new Date() - last) / speed;
            last = +new Date();
            currentAngle = carouselRotateAngle + angle;
            setRotation( currentAngle );

            if ( !! options.onAnimating ) options.onAnimating.call(this, currentAngle);

            if (Math.abs(angle) < endAngle) {
                (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16)
            } else {
                currentAngle = stabilizeAngle( currentAngle );
                setRotation( currentAngle );
                carouselRotateAngle = currentAngle;

                if ( !! options.onAnimating ) options.onAnimating.call(this, currentAngle);

                if ( !! options.onStop ) {
                    var itemIndex,
                        el;
                    itemIndex = normalizeAngle(carouselRotateAngle) / minRotateAngle;
                    itemIndex = itemIndex > 0 ? 360 / minRotateAngle - itemIndex : itemIndex;
                    el = itemsList[itemIndex];
                    options.onStop.call(this, itemIndex, el);
                }
            }
        };
        tick()
    }

    /**
     * Set rotation of the carousel
     * @param angle {number} - carousel
     */
    function setRotation( angle ) {
        //carouselEl.style.setProperty('transform', 'rotateY('+ angle +'deg)', null);

        switch (true) {
            case carouselEl.style.hasOwnProperty('transform'):
                carouselEl.style.transform = 'rotateY('+ angle +'deg)';
                break;
            case carouselEl.style.hasOwnProperty('webkitTransform'):
                carouselEl.style.webkitTransform = 'rotateY('+ angle +'deg)';
                break;
            case carouselEl.style.hasOwnProperty('mozTransform'):
                carouselEl.style.MozTransform = 'rotateY('+ angle +'deg)';
                break;
            case carouselEl.style.hasOwnProperty('oTransform'):
                carouselEl.style.oTransform = 'rotateY('+ angle +'deg)';
                break;
            case carouselEl.style.hasOwnProperty('msTransform'):
                carouselEl.style.msTransform = 'rotateY('+ angle +'deg)';
                break;
        }
    }

    /**
     * Set item rotation parameters
     * @param itemEl
     * @param y
     * @param z
     */
    function setItemRotation( itemEl, y, z ) {
        switch (true) {
            case itemEl.style.hasOwnProperty('transform'):
                itemEl.style.transform = 'rotateY('+ y +'deg) translateZ('+ z +'px)';
                break;
            case itemEl.style.hasOwnProperty('webkitTransform'):
                itemEl.style.webkitTransform = 'rotateY('+ y +'deg) translateZ('+ z +'px)';
                break;
            case itemEl.style.hasOwnProperty('mozTransform'):
                itemEl.style.MozTransform = 'rotateY('+ y +'deg) translateZ('+ z +'px)';
                break;
            case itemEl.style.hasOwnProperty('oTransform'):
                itemEl.style.oTransform = 'rotateY('+ y +'deg) translateZ('+ z +'px)';
                break;
            case itemEl.style.hasOwnProperty('msTransform'):
                itemEl.style.msTransform = 'rotateY('+ y +'deg) translateZ('+ z +'px)';
                break;
        }
    }

    function mergeOptions(_options) {
        options = _options;
    }

}).call(this);