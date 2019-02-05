import scroll from 'raf-scroll.js'
import Tweezer from 'tweezer.js'

const fetchAnchors = el => {
  let anchors = [].slice.call( el.querySelectorAll('[href]') )
  return anchors.filter( restrictToHash ).map( fetchDestinations )
}
const restrictToHash = el => /#/.test( el.anchor = el.getAttribute('href') )
const fetchDestinations = el => (
  {
    anchor: el,
    dest: document.getElementById( /.*#(.*)/.exec(el.anchor).pop() )
  }
)
const reduceToClosest = scrollTop => (prev, curr) => {
  //Create a new object, with the key being the offset
  let obj = [prev,curr].reduce( (a,b) => (a[ Math.abs( b.dest.offsetY - scrollTop) ] = b, a), {})
  let closest = Math.min( ...Object.keys(obj) )
  return obj[closest]
}
const getOffset = (el, win=window, docElem=document.documentElement, box=false) => (
  box = el.getBoundingClientRect(),
  box.top + (win.pageYOffset || docElem.scrollTop) - (docElem.clientTop || 0)
)
const cacheOffsets = el => el.offsetY = getOffset(el)
const addActiveClass = el => (
  el.parentNode.hasAttribute('wayside-link')
    ? el.parentNode.classList.add('is-active')
    : el.classList.add('is-active'),
  el
)
const removeActiveClass = el => (
  el.parentNode.hasAttribute('wayside-link')
    ? el.parentNode.classList.remove('is-active')
    : el.classList.remove('is-active'),
  el
)

export default function(el, {
  afterChange = function () {},
  getOffsetTop = function () {}
} = {}) {
  const waypoints = fetchAnchors(el)
  const sticky = el.querySelector('.js-inner')
  let offset;
  let getAllOffsets;
  let lastActive;
  (getAllOffsets = function(){
    waypoints.map(el => el.dest).forEach(cacheOffsets)
    offset = getOffset(el)
  })();
  scroll( (scrollTop) => {
    sticky.classList[scrollTop >= offset ? 'add' : 'remove']('is-fixed')
    const closest = waypoints.reduce( reduceToClosest(scrollTop) ).anchor
    if (lastActive === closest) {
      return
    }
    waypoints.forEach( el => removeActiveClass(el.anchor) )
    addActiveClass(
      waypoints.reduce( reduceToClosest(scrollTop) ).anchor
    )
    afterChange(closest, lastActive)
    lastActive = closest
  })
  waypoints.forEach( waypoint=> {
    waypoint.anchor.addEventListener('click', e => {
      e.preventDefault()
      e.returnValue = false
      new Tweezer({
        start: window.scrollY,
        end: (getOffsetTop() || 0) + getOffset(waypoint.dest)
      })
      .on('tick', v => window.scrollTo(0, v))
      .begin()
    })
  })
  window.addEventListener('resize', getAllOffsets)
}
