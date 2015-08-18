# Morphing Carousel

Morphing carousel, that utilises 3D transformation of CSS3 in order to create "wheel" effect.

![alt tag](https://github.com/artemdemo/morphing-carousel/blob/master/img/morphing-carousel.png)

## Dependencies
* Hammer.js - http://hammerjs.github.io/

## Browser support
Currently supported modern browsers only (about 63% globally):

* Chrome (desktop and mobile) from version 42
* Firefox 38
* Edge

## Usage examples

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/hammer.js/2.0.4/hammer.min.js" type="text/javascript"></script>
<script src="MorphCarousel.js" type="text/javascript"></script>
<link href="MorphCarousel.css" type="text/css" rel="stylesheet" />
```

```javascript
<div id="carousel" class="morph-carousel-stage">
    <div class="morph-carousel__shadow"></div>
    <div class="morph-carousel">
        <div class="morph-carousel__item">1</div>
        <div class="morph-carousel__item">2</div>
        <div class="morph-carousel__item">3</div>
        <div class="morph-carousel__item">4</div>
        <div class="morph-carousel__item">5</div>
        <div class="morph-carousel__item">6</div>
        <div class="morph-carousel__item">7</div>
        <div class="morph-carousel__item">8</div>
        <div class="morph-carousel__item">9</div>
        <div class="morph-carousel__item">10</div>
        <div class="morph-carousel__item">11</div>
        <div class="morph-carousel__item">12</div>
        <div class="morph-carousel__item">13</div>
        <div class="morph-carousel__item">14</div>
        <div class="morph-carousel__item">15</div>
    </div>
</div>
```

```javascript
MorphCarousel( document.getElementById('carousel'), {
    onStop: function( itemIndex, el ){
        console.log('stopped on item # ', itemIndex);
        console.log('current element: ', el);
    },
    onDragging: function( angle ) {
        console.log('is dragging');
    },
    onAnimating: function( angle ) {
        console.log('is animating');
    }
});
```
