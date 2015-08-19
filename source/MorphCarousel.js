
(function(){
    "use strict";

    //Declare root variable - window in the browser, global on the server
    var root = this,
        previous = root.MorphCarousel;

    /**
     * Initialization
     * @param _stageEl
     * @param _options
     * @returns {object}
     */
    root.MorphCarousel = function( _stageEl, _options ) {
        new CarouselConstructor(_stageEl, _options);
    };

    /**
     * Constructor
     * @param _stageEl
     * @param _options
     * @constructor
     */
    var CarouselConstructor = function( _stageEl, _options ) {
        var angleRad,
            itemWidth,
            itemHeight,
            radius;

        this.options = {
            onStop: null,
            onDragging: null,
            onAnimating: null
        };

        this.stageEl = _stageEl;
        this.carouselEl = _stageEl.getElementsByClassName('morph-carousel')[0];
        this.itemsList = this.carouselEl.getElementsByClassName('morph-carousel__item');

        this.minRotateAngle = 0;

        // current position of carousel rotation
        this.carouselRotateAngle = 0;

        this.isDragging = false;

        this.mergeOptions(_options);

        this.attachHammerEvents(this.itemsList.length);

        this.minRotateAngle = 360 / this.itemsList.length;

        // Angle (half of it) in radians
        angleRad = (this.minRotateAngle / 2) * Math.PI / 180;

        radius = this.stageEl.offsetWidth / 2;

        itemWidth = radius * Math.sin(angleRad) * 2;

        for (var i=0, len=this.itemsList.length; i<len; i++) {
            var _angle = i * this.minRotateAngle;
            setItemRotation( this.itemsList[i], _angle, radius );
            this.itemsList[i].style.width = itemWidth + 'px';
        }

        itemHeight = this.itemsList[0].offsetHeight +'px';
        this.stageEl.style.height = itemHeight;
        this.carouselEl.style.height = itemHeight;
        this.carouselEl.style.width = itemWidth + 'px';
    };

    /**
     * Attaching hammer JS events
     * @param itemsAmount
     */
    CarouselConstructor.prototype.attachHammerEvents = function( itemsAmount ) {
        var hammertime = new Hammer(this.stageEl);
        var currentAngle = 0;
        var len = Math.ceil(itemsAmount / 2);
        hammertime.on('pan', function(ev) {
            currentAngle = this.carouselRotateAngle + ev.deltaX / this.stageEl.offsetWidth * ( this.minRotateAngle * len );
            this.isDragging = true;
            this.setRotation( currentAngle );
            if ( !! this.options.onDragging ) this.options.onDragging.call(this, currentAngle);
        }.bind(this));
        hammertime.on('panend', function(ev) {
            this.isDragging = false;
            currentAngle = this.stabilizeAngle( currentAngle );
            this.setRotation( currentAngle );
            this.carouselRotateAngle = currentAngle;
            this.finishAnimation(ev.velocityX);
        }.bind(this));
        hammertime.on('pancancel', function(ev) {
            this.isDragging = false;
        }.bind(this));
    };

    /**
     * Stabilize given angle to the closest one, based on minRotateAngle
     * @param angle
     * @returns {number}
     */
    CarouselConstructor.prototype.stabilizeAngle = function( angle ) {
        var mod = Math.floor(angle / this.minRotateAngle),
            angleF = mod * this.minRotateAngle,
            angleS = angleF + this.minRotateAngle;
        switch (true) {
            case angle - angleF > angleS - angle:
                return angleS;
            default:
                return angleF;
        }
    };

    /**
     * Ending movement of the carousel animation
     *
     * Simple Easing Functions in Javascript
     * https://gist.github.com/gre/1650294
     * @param velocity
     */
    CarouselConstructor.prototype.finishAnimation = function( velocity ) {
        var direction = velocity < 0 ? 1 : -1;
        var endAngle = this.stabilizeAngle( Math.abs(velocity) * this.minRotateAngle );
        var angle = 0;
        var currentAngle = 0;
        var last = +new Date();
        var speed = 500; // how much time will take animation
        var tick = function() {

            if ( this.isDragging ) return false;

            angle += direction * endAngle * (new Date() - last) / speed;
            last = +new Date();
            currentAngle = this.carouselRotateAngle + angle;
            this.setRotation( currentAngle );

            if ( !! this.options.onAnimating ) this.options.onAnimating.call(this, currentAngle);

            if (Math.abs(angle) < endAngle) {
                (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16)
            } else {
                currentAngle = this.stabilizeAngle( currentAngle );
                this.setRotation( currentAngle );
                this.carouselRotateAngle = currentAngle;

                if ( !! this.options.onAnimating ) this.options.onAnimating.call(this, currentAngle);

                if ( !! this.options.onStop ) {
                    var itemIndex,
                        el;
                    itemIndex = normalizeAngle(this.carouselRotateAngle) / this.minRotateAngle;
                    itemIndex = itemIndex > 0 ? 360 / this.minRotateAngle - itemIndex : itemIndex;
                    el = this.itemsList[itemIndex];
                    this.options.onStop.call(this, itemIndex, el);
                }
            }
        }.bind(this);
        tick()
    };

    /**
     * Set rotation of the carousel
     * @param angle {number} - carousel
     */
    CarouselConstructor.prototype.setRotation = function( angle ) {
        //carouselEl.style.setProperty('transform', 'rotateY('+ angle +'deg)', null);

        switch (true) {
            case this.carouselEl.style.hasOwnProperty('transform'):
                this.carouselEl.style.transform = 'rotateY('+ angle +'deg)';
                break;
            case this.carouselEl.style.hasOwnProperty('webkitTransform'):
                this.carouselEl.style.webkitTransform = 'rotateY('+ angle +'deg)';
                break;
            case this.carouselEl.style.hasOwnProperty('mozTransform'):
                this.carouselEl.style.MozTransform = 'rotateY('+ angle +'deg)';
                break;
            case this.carouselEl.style.hasOwnProperty('oTransform'):
                this.carouselEl.style.oTransform = 'rotateY('+ angle +'deg)';
                break;
            case this.carouselEl.style.hasOwnProperty('msTransform'):
                this.carouselEl.style.msTransform = 'rotateY('+ angle +'deg)';
                break;
        }
    };

    CarouselConstructor.prototype.mergeOptions = function(_options) {
        this.options = _options;
    };

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

}).call(this);