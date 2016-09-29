##Description
Activates a nav menu with internally facing links that, when clicked, scroll down to an anchored element.

## Install 
```bash
npm i wayside --save
```

## Basic Usage
```javascript
import Wayside from 'wayside'

const el = document.querySelector('.js-wayside')

new Wayside(el)
```

## Styles
```css
/*An "is-fixed" class is added to the nav when the user scrolls past the top of the element*/
.anchored-nav.is-fixed{
	position:fixed
}
```

## Markup
```html

<nav class="js-wayside anchored-nav">
	<a href="#Anchor1">Anchor 1</a>
	<a href="#Anchor2">Anchor 2</a>
	<a href="#Anchor3">Anchor 3</a>
	<a href="https://external.site">This is ignored</a>
</nav>
```

## License 
MIT
