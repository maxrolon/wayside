## Description
This little library does a few things:
- It hijacks a nav menu with internally facing links. When a link is clicked, the window scrolls down to the #element.
- It updates the active state of a nav link to show when an #element is in viewport
- It adds a class to the nav so that it can be fixed on scroll 

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
/* An "is-fixed" class is added to the nav when the user scrolls past the top of the nav */
.is-fixed{
  position:fixed;
  top:0;
}
/* An "is-active" class is added to a nav item when the user scrolls past the #element it corresponds to */
.is-active{
  color:gold;
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
