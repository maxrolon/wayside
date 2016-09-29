import scroll from 'raf-scroll.js'

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

export default function(el) {
  const waypoints = fetchAnchors(el)
  const sticky = el.querySelector('.js-inner')
  let offset;
  let getAllOffsets;
  (getAllOffsets = function(){
    waypoints.map(el => el.dest).forEach(cacheOffsets)
    offset = getOffset(el)
  })();
  scroll( (scrollTop) => {
    if ( scrollTop >= offset) {
      sticky.classList.add('is-fixed')
    } else {
      sticky.classList.remove('is-fixed')
    }
    waypoints.forEach( el => el.anchor.classList.remove('is-active'))
    waypoints.reduce( reduceToClosest(scrollTop) ).anchor.classList.add('is-active')
  })
  waypoints.forEach( waypoint=> {
    waypoint.anchor.addEventListener('click', e => {
      e.preventDefault()
      e.returnValue = false
      //scroll here *TODO
    })
  })
  window.addEventListener('resize', getAllOffsets)
}
