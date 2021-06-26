// JS stuff! 
// TODO add image zoom


const exposed = {};
if (location.search) {
  var a = document.createElement("a");
  a.href = location.href;
  a.search = "";
  history.replaceState(null, null, a.href);
}

function tweet_(url) {
  open(
    "https://twitter.com/intent/tweet?url=" + encodeURIComponent(url),
    "_blank"
  );
}
function tweet(anchor) {
  tweet_(anchor.getAttribute("href"));
}
expose("tweet", tweet);

function share(anchor) {
  var url = anchor.getAttribute("href");
  event.preventDefault();
  if (navigator.share) {
    navigator.share({
      url: url,
    });
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(url);
    message("Article URL copied to clipboard.");
  } else {
    tweet_(url);
  }
}
expose("share", share);

function message(msg) {
  var dialog = document.getElementById("message");
  dialog.textContent = msg;
  dialog.setAttribute("open", "");
  setTimeout(function () {
    dialog.removeAttribute("open");
  }, 3000);
}

function prefetch(e) {
  if (e.target.tagName != "A") {
    return;
  }
  if (e.target.origin != location.origin) {
    return;
  }
  var l = document.createElement("link");
  l.rel = "prefetch";
  l.href = e.target.href;
  document.head.appendChild(l);
}
document.documentElement.addEventListener("mouseover", prefetch, {
  capture: true,
  passive: true,
});
document.documentElement.addEventListener("touchstart", prefetch, {
  capture: true,
  passive: true,
});

const GA_ID = document.documentElement.getAttribute("ga-id");
window.ga =
  window.ga ||
  function () {
    if (!GA_ID) {
      return;
    }
    (ga.q = ga.q || []).push(arguments);
  };
ga.l = +new Date();
ga("create", GA_ID, "auto");
ga("set", "transport", "beacon");
var timeout = setTimeout(
  (onload = function () {
    clearTimeout(timeout);
    ga("send", "pageview");
  }),
  1000
);

var ref = +new Date();
function ping(event) {
  var now = +new Date();
  if (now - ref < 1000) {
    return;
  }
  ga("send", {
    hitType: "event",
    eventCategory: "page",
    eventAction: event.type,
    eventLabel: Math.round((now - ref) / 1000),
  });
  ref = now;
}
addEventListener("pagehide", ping);
addEventListener("visibilitychange", ping);
addEventListener(
  "click",
  function (e) {
    var button = e.target.closest("button");
    if (!button) {
      return;
    }
    ga("send", {
      hitType: "event",
      eventCategory: "button",
      eventAction: button.getAttribute("aria-label") || button.textContent,
    });
  },
  true
);
var selectionTimeout;
addEventListener(
  "selectionchange",
  function () {
    clearTimeout(selectionTimeout);
    var text = String(document.getSelection()).trim();
    if (text.split(/[\s\n\r]+/).length < 3) {
      return;
    }
    selectionTimeout = setTimeout(function () {
      ga("send", {
        hitType: "event",
        eventCategory: "selection",
        eventAction: text,
      });
    }, 2000);
  },
  true
);

if (window.ResizeObserver && document.querySelector("header nav #nav")) {
  var progress = document.getElementById("reading-progress");

  var timeOfLastScroll = 0;
  var requestedAniFrame = false;
  function scroll() {
    if (!requestedAniFrame) {
      requestAnimationFrame(updateProgress);
      requestedAniFrame = true;
    }
    timeOfLastScroll = Date.now();
  }
  addEventListener("scroll", scroll);

  var winHeight = 1000;
  var bottom = 10000;
  function updateProgress() {
    requestedAniFrame = false;
    var percent = Math.min(
      (document.scrollingElement.scrollTop / (bottom - winHeight)) * 100,
      100
    );
    progress.style.transform = `translate(-${100 - percent}vw, 0)`;
    if (Date.now() - timeOfLastScroll < 3000) {
      requestAnimationFrame(updateProgress);
      requestedAniFrame = true;
    }
  }

  new ResizeObserver(() => {
    bottom =
      document.scrollingElement.scrollTop +
      document.querySelector("#comments,footer").getBoundingClientRect().top;
    winHeight = window.innerHeight;
    scroll();
  }).observe(document.body);
}

function expose(name, fn) {
  exposed[name] = fn;
}

addEventListener("click", (e) => {
  const handler = e.target.closest("[on-click]");
  if (!handler) {
    return;
  }
  e.preventDefault();
  const name = handler.getAttribute("on-click");
  const fn = exposed[name];
  if (!fn) {
    throw new Error("Unknown handler" + name);
  }
  fn(handler);
});

// There is a race condition here if an image loads faster than this JS file. But
// - that is unlikely
// - it only means potentially more costly layouts for that image.
// - And so it isn't worth the querySelectorAll it would cost to synchronously check
//   load state.
document.body.addEventListener(
  "load",
  (e) => {
    if (e.target.tagName != "IMG") {
      return;
    }
    // Ensure the browser doesn't try to draw the placeholder when the real image is present.
    e.target.style.backgroundImage = "none";
  },
  /* capture */ "true"
);

// add the image zoom functionality
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):(t=t||self).Zooming=e()}(this,function(){"use strict";var t="auto",e="zoom-in",i="zoom-out",n="grab",s="move";function o(t,e,i){var n={passive:!1};!(arguments.length>3&&void 0!==arguments[3])||arguments[3]?t.addEventListener(e,i,n):t.removeEventListener(e,i,n)}function r(t,e){if(t){var i=new Image;i.onload=function(){e&&e(i)},i.src=t}}function a(t){return t.dataset.original?t.dataset.original:"A"===t.parentNode.tagName?t.parentNode.getAttribute("href"):null}function l(t,e,i){!function(t){var e=h.transitionProp,i=h.transformProp;if(t.transition){var n=t.transition;delete t.transition,t[e]=n}if(t.transform){var s=t.transform;delete t.transform,t[i]=s}}(e);var n=t.style,s={};for(var o in e)i&&(s[o]=n[o]||""),n[o]=e[o];return s}var h={transitionProp:"transition",transEndEvent:"transitionend",transformProp:"transform",transformCssProp:"transform"},c=h.transformCssProp,u=h.transEndEvent;var d=function(){},f={enableGrab:!0,preloadImage:!1,closeOnWindowResize:!0,transitionDuration:.4,transitionTimingFunction:"cubic-bezier(0.4, 0, 0, 1)",bgColor:"rgb(255, 255, 255)",bgOpacity:1,scaleBase:1,scaleExtra:.5,scrollThreshold:40,zIndex:998,customSize:null,onOpen:d,onClose:d,onGrab:d,onMove:d,onRelease:d,onBeforeOpen:d,onBeforeClose:d,onBeforeGrab:d,onBeforeRelease:d,onImageLoading:d,onImageLoaded:d},p={init:function(t){var e,i;e=this,i=t,Object.getOwnPropertyNames(Object.getPrototypeOf(e)).forEach(function(t){e[t]=e[t].bind(i)})},click:function(t){if(t.preventDefault(),m(t))return window.open(this.target.srcOriginal||t.currentTarget.src,"_blank");this.shown?this.released?this.close():this.release():this.open(t.currentTarget)},scroll:function(){var t=document.documentElement||document.body.parentNode||document.body,e=window.pageXOffset||t.scrollLeft,i=window.pageYOffset||t.scrollTop;null===this.lastScrollPosition&&(this.lastScrollPosition={x:e,y:i});var n=this.lastScrollPosition.x-e,s=this.lastScrollPosition.y-i,o=this.options.scrollThreshold;(Math.abs(s)>=o||Math.abs(n)>=o)&&(this.lastScrollPosition=null,this.close())},keydown:function(t){(function(t){return"Escape"===(t.key||t.code)||27===t.keyCode})(t)&&(this.released?this.close():this.release(this.close))},mousedown:function(t){if(y(t)&&!m(t)){t.preventDefault();var e=t.clientX,i=t.clientY;this.pressTimer=setTimeout(function(){this.grab(e,i)}.bind(this),200)}},mousemove:function(t){this.released||this.move(t.clientX,t.clientY)},mouseup:function(t){y(t)&&!m(t)&&(clearTimeout(this.pressTimer),this.released?this.close():this.release())},touchstart:function(t){t.preventDefault();var e=t.touches[0],i=e.clientX,n=e.clientY;this.pressTimer=setTimeout(function(){this.grab(i,n)}.bind(this),200)},touchmove:function(t){if(!this.released){var e=t.touches[0],i=e.clientX,n=e.clientY;this.move(i,n)}},touchend:function(t){(function(t){t.targetTouches.length})(t)||(clearTimeout(this.pressTimer),this.released?this.close():this.release())},clickOverlay:function(){this.close()},resizeWindow:function(){this.close()}};function y(t){return 0===t.button}function m(t){return t.metaKey||t.ctrlKey}var g={init:function(t){this.el=document.createElement("div"),this.instance=t,this.parent=document.body,l(this.el,{position:"fixed",top:0,left:0,right:0,bottom:0,opacity:0}),this.updateStyle(t.options),o(this.el,"click",t.handler.clickOverlay.bind(t))},updateStyle:function(t){l(this.el,{zIndex:t.zIndex,backgroundColor:t.bgColor,transition:"opacity\n        "+t.transitionDuration+"s\n        "+t.transitionTimingFunction})},insert:function(){this.parent.appendChild(this.el)},remove:function(){this.parent.removeChild(this.el)},fadeIn:function(){this.el.offsetWidth,this.el.style.opacity=this.instance.options.bgOpacity},fadeOut:function(){this.el.style.opacity=0}},v="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},b=function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")},w=function(){function t(t,e){for(var i=0;i<e.length;i++){var n=e[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}return function(e,i,n){return i&&t(e.prototype,i),n&&t(e,n),e}}(),x=Object.assign||function(t){for(var e=1;e<arguments.length;e++){var i=arguments[e];for(var n in i)Object.prototype.hasOwnProperty.call(i,n)&&(t[n]=i[n])}return t},O={init:function(t,e){this.el=t,this.instance=e,this.srcThumbnail=this.el.getAttribute("src"),this.srcset=this.el.getAttribute("srcset"),this.srcOriginal=a(this.el),this.rect=this.el.getBoundingClientRect(),this.translate=null,this.scale=null,this.styleOpen=null,this.styleClose=null},zoomIn:function(){var t=this.instance.options,e=t.zIndex,s=t.enableGrab,o=t.transitionDuration,r=t.transitionTimingFunction;this.translate=this.calculateTranslate(),this.scale=this.calculateScale(),this.styleOpen={position:"relative",zIndex:e+1,cursor:s?n:i,transition:c+"\n        "+o+"s\n        "+r,transform:"translate3d("+this.translate.x+"px, "+this.translate.y+"px, 0px)\n        scale("+this.scale.x+","+this.scale.y+")",height:this.rect.height+"px",width:this.rect.width+"px"},this.el.offsetWidth,this.styleClose=l(this.el,this.styleOpen,!0)},zoomOut:function(){this.el.offsetWidth,l(this.el,{transform:"none"})},grab:function(t,e,i){var n=k(),o=n.x-t,r=n.y-e;l(this.el,{cursor:s,transform:"translate3d(\n        "+(this.translate.x+o)+"px, "+(this.translate.y+r)+"px, 0px)\n        scale("+(this.scale.x+i)+","+(this.scale.y+i)+")"})},move:function(t,e,i){var n=k(),s=n.x-t,o=n.y-e;l(this.el,{transition:c,transform:"translate3d(\n        "+(this.translate.x+s)+"px, "+(this.translate.y+o)+"px, 0px)\n        scale("+(this.scale.x+i)+","+(this.scale.y+i)+")"})},restoreCloseStyle:function(){l(this.el,this.styleClose)},restoreOpenStyle:function(){l(this.el,this.styleOpen)},upgradeSource:function(){if(this.srcOriginal){var t=this.el.parentNode;this.srcset&&this.el.removeAttribute("srcset");var e=this.el.cloneNode(!1);e.setAttribute("src",this.srcOriginal),e.style.position="fixed",e.style.visibility="hidden",t.appendChild(e),setTimeout(function(){this.el.setAttribute("src",this.srcOriginal),t.removeChild(e)}.bind(this),50)}},downgradeSource:function(){this.srcOriginal&&(this.srcset&&this.el.setAttribute("srcset",this.srcset),this.el.setAttribute("src",this.srcThumbnail))},calculateTranslate:function(){var t=k(),e=this.rect.left+this.rect.width/2,i=this.rect.top+this.rect.height/2;return{x:t.x-e,y:t.y-i}},calculateScale:function(){var t=this.el.dataset,e=t.zoomingHeight,i=t.zoomingWidth,n=this.instance.options,s=n.customSize,o=n.scaleBase;if(!s&&e&&i)return{x:i/this.rect.width,y:e/this.rect.height};if(s&&"object"===(void 0===s?"undefined":v(s)))return{x:s.width/this.rect.width,y:s.height/this.rect.height};var r=this.rect.width/2,a=this.rect.height/2,l=k(),h={x:l.x-r,y:l.y-a},c=h.x/r,u=h.y/a,d=o+Math.min(c,u);if(s&&"string"==typeof s){var f=i||this.el.naturalWidth,p=e||this.el.naturalHeight,y=parseFloat(s)*f/(100*this.rect.width),m=parseFloat(s)*p/(100*this.rect.height);if(d>y||d>m)return{x:y,y:m}}return{x:d,y:d}}};function k(){var t=document.documentElement;return{x:Math.min(t.clientWidth,window.innerWidth)/2,y:Math.min(t.clientHeight,window.innerHeight)/2}}function S(t,e,i){["mousedown","mousemove","mouseup","touchstart","touchmove","touchend"].forEach(function(n){o(t,n,e[n],i)})}return function(){function i(t){b(this,i),this.target=Object.create(O),this.overlay=Object.create(g),this.handler=Object.create(p),this.body=document.body,this.shown=!1,this.lock=!1,this.released=!0,this.lastScrollPosition=null,this.pressTimer=null,this.options=x({},f,t),this.overlay.init(this),this.handler.init(this)}return w(i,[{key:"listen",value:function(t){if("string"==typeof t)for(var i=document.querySelectorAll(t),n=i.length;n--;)this.listen(i[n]);else"IMG"===t.tagName&&(t.style.cursor=e,o(t,"click",this.handler.click),this.options.preloadImage&&r(a(t)));return this}},{key:"config",value:function(t){return t?(x(this.options,t),this.overlay.updateStyle(this.options),this):this.options}},{key:"open",value:function(t){var e=this,i=arguments.length>1&&void 0!==arguments[1]?arguments[1]:this.options.onOpen;if(!this.shown&&!this.lock){var n="string"==typeof t?document.querySelector(t):t;if("IMG"===n.tagName){if(this.options.onBeforeOpen(n),this.target.init(n,this),!this.options.preloadImage){var s=this.target.srcOriginal;null!=s&&(this.options.onImageLoading(n),r(s,this.options.onImageLoaded))}this.shown=!0,this.lock=!0,this.target.zoomIn(),this.overlay.insert(),this.overlay.fadeIn(),o(document,"scroll",this.handler.scroll),o(document,"keydown",this.handler.keydown),this.options.closeOnWindowResize&&o(window,"resize",this.handler.resizeWindow);return o(n,u,function t(){o(n,u,t,!1),e.lock=!1,e.target.upgradeSource(),e.options.enableGrab&&S(document,e.handler,!0),i(n)}),this}}}},{key:"close",value:function(){var e=this,i=arguments.length>0&&void 0!==arguments[0]?arguments[0]:this.options.onClose;if(this.shown&&!this.lock){var n=this.target.el;this.options.onBeforeClose(n),this.lock=!0,this.body.style.cursor=t,this.overlay.fadeOut(),this.target.zoomOut(),o(document,"scroll",this.handler.scroll,!1),o(document,"keydown",this.handler.keydown,!1),this.options.closeOnWindowResize&&o(window,"resize",this.handler.resizeWindow,!1);return o(n,u,function t(){o(n,u,t,!1),e.shown=!1,e.lock=!1,e.target.downgradeSource(),e.options.enableGrab&&S(document,e.handler,!1),e.target.restoreCloseStyle(),e.overlay.remove(),i(n)}),this}}},{key:"grab",value:function(t,e){var i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:this.options.scaleExtra,n=arguments.length>3&&void 0!==arguments[3]?arguments[3]:this.options.onGrab;if(this.shown&&!this.lock){var s=this.target.el;this.options.onBeforeGrab(s),this.released=!1,this.target.grab(t,e,i);return o(s,u,function t(){o(s,u,t,!1),n(s)}),this}}},{key:"move",value:function(t,e){var i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:this.options.scaleExtra,n=arguments.length>3&&void 0!==arguments[3]?arguments[3]:this.options.onMove;if(this.shown&&!this.lock){this.released=!1,this.body.style.cursor=s,this.target.move(t,e,i);var r=this.target.el;return o(r,u,function t(){o(r,u,t,!1),n(r)}),this}}},{key:"release",value:function(){var e=this,i=arguments.length>0&&void 0!==arguments[0]?arguments[0]:this.options.onRelease;if(this.shown&&!this.lock){var n=this.target.el;this.options.onBeforeRelease(n),this.lock=!0,this.body.style.cursor=t,this.target.restoreOpenStyle();return o(n,u,function t(){o(n,u,t,!1),e.lock=!1,e.released=!0,i(n)}),this}}}]),i}()});
