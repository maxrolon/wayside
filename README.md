##Description
Hijacks a nav menu with internally facing links. When a link is clicked, the window scrolls down to the element.

## Install 
```bash
npm i wayside --save
```

## Basic Usage
```javascript
import Wayside from 'wayside'

document.addEventListener('DOMContentLoaded', e => {
  const el = document.querySelector('.js-wayside')
  new Wayside(el)
})
```

## Styles
```css
/*An "is-fixed" class is added to the nav when the user scrolls past the top of the element*/
.is-fixed{
  position:fixed
  top:0;
}
```

## Markup
```html

<nav class="js-wayside">
  <div class="js-inner"><!-- This is the element that is fixed on scroll -->
    <a href="#Anchor1">Anchor 1</a>
    <a href="#Anchor2">Anchor 2</a>
    <a href="#Anchor3">Anchor 3</a>
    <a href="https://external.site">This is ignored</a>
  </div>
</nav>
```

## License 
MIT
