// Throttle
//
const throttle = (callback, limit) => {
  let timeoutHandler = null;
  return () => {
    if (timeoutHandler == null) {
      timeoutHandler = setTimeout(() => {
        callback();
        timeoutHandler = null;
      }, limit);
    }
  };
};

// addEventListener Helper
//
const listen = (ele, e, callback) => {
  if (document.querySelector(ele) !== null) {
    document.querySelector(ele).addEventListener(e, callback);
  }
}

/**
 * Functions
 */

// Auto Hide Header
//
let header = document.getElementById('site-header');
let lastScrollPosition = window.pageYOffset;

const autoHideHeader = () => {
  let currentScrollPosition = Math.max(window.pageYOffset, 0);
  if (currentScrollPosition > lastScrollPosition) {
    header.classList.remove('slideInUp');
    header.classList.add('slideOutDown');
  } else {
    header.classList.remove('slideOutDown');
    header.classList.add('slideInUp');
  }
  lastScrollPosition = currentScrollPosition;
}

// Mobile Menu Toggle
//
let mobileMenuVisible = false;

const toggleMobileMenu = () => {
  let mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenuVisible == false) {
    mobileMenu.style.animationName = 'bounceInRight';
    mobileMenu.style.webkitAnimationName = 'bounceInRight';
    mobileMenu.style.display = 'block';
    mobileMenuVisible = true;
  } else {
    mobileMenu.style.animationName = 'bounceOutRight';
    mobileMenu.style.webkitAnimationName = 'bounceOutRight';
    mobileMenu.style.display = 'none';
    mobileMenuVisible = false;
  }
}

// Social Share Toggle
//
let shareMenuVisible = false;
const shareMobileMenu = () => {
  let shareMenu = document.getElementById('share-links');
  if (shareMenuVisible == false) {
    shareMenu.style.animationName = 'bounceInRight';
    shareMenu.style.webkitAnimationName = 'bounceInRight';
    shareMenu.style.display = 'block';
    shareMenuVisible = true;
  } else {
    shareMenu.style.animationName = 'bounceOutRight';
    shareMenu.style.webkitAnimationName = 'bounceOutRight';
    shareMenu.style.display = 'none';
    shareMenuVisible = false;
  }
}

// Featured Image Toggle
//
const showImg = () => {
  document.querySelector('.bg-img').classList.add('show-bg-img');
}

const hideImg = () => {
  document.querySelector('.bg-img').classList.remove('show-bg-img');
}

// ToC Toggle
//
const toggleToc = () => {
  document.getElementById('toc').classList.toggle('show-toc');
}


// Theme switcher
//
const THEMES = [
  ['light', 'light'],
  ['dark', 'dark'],
];

const applyTheme = (id) => {
  document.documentElement.dataset.theme = id;
  try { localStorage.setItem('theme', id); } catch (e) {}
  const entry = THEMES.find((t) => t[0] === id) || THEMES[0];
  const label = document.getElementById('theme-name');
  if (label) label.textContent = entry[1];
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
};

const cycleTheme = () => {
  const current = document.documentElement.dataset.theme || THEMES[0][0];
  const idx = THEMES.findIndex((t) => t[0] === current);
  applyTheme(THEMES[(idx + 1) % THEMES.length][0]);
};

applyTheme(document.documentElement.dataset.theme || THEMES[0][0]);
listen('#theme-btn', 'click', cycleTheme);

// Mascot: squishy hop when you click the drawn art (not the blank space around it)
//
const mascot = document.querySelector('pre.mascot');

if (mascot) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Is there a visible (non-blank braille) glyph under the point?
  const artAt = (x, y) => {
    let node, offset;
    if (document.caretPositionFromPoint) {
      const pos = document.caretPositionFromPoint(x, y);
      if (!pos) return false;
      node = pos.offsetNode; offset = pos.offset;
    } else if (document.caretRangeFromPoint) {
      const range = document.caretRangeFromPoint(x, y);
      if (!range) return false;
      node = range.startContainer; offset = range.startOffset;
    } else {
      return true; // can't tell, treat the whole box as clickable
    }
    if (node.nodeType !== Node.TEXT_NODE || !mascot.contains(node)) return false;

    const probe = document.createRange();
    for (const i of [offset - 1, offset]) {
      if (i < 0 || i >= node.length) continue;
      probe.setStart(node, i);
      probe.setEnd(node, i + 1);
      for (const r of probe.getClientRects()) {
        if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
          const ch = node.data[i];
          return ch !== '\u2800' && ch !== '\n';
        }
      }
    }
    return false;
  };

  let hotFrame = null;
  mascot.addEventListener('mousemove', (e) => {
    if (hotFrame !== null) return;
    hotFrame = requestAnimationFrame(() => {
      hotFrame = null;
      mascot.classList.toggle('is-hot', artAt(e.clientX, e.clientY));
    });
  });
  mascot.addEventListener('mouseleave', () => mascot.classList.remove('is-hot'));

  mascot.addEventListener('click', (e) => {
    if (reduceMotion.matches || mascot.classList.contains('hop')) return;
    if (!artAt(e.clientX, e.clientY)) return;
    mascot.classList.add('hop');
    // animationend normally clears it; the timer is a safety net so a skipped
    // animation can never leave her unclickable
    setTimeout(() => mascot.classList.remove('hop'), 900);
  });
  mascot.addEventListener('animationend', () => mascot.classList.remove('hop'));
}

if (header !== null) {
  listen('#menu-btn', "click", toggleMobileMenu);
  listen('#share-btn', "click", shareMobileMenu);
  listen('#toc-btn', "click", toggleToc);
  listen('#img-btn', "click", showImg);
  listen('.bg-img', "click", hideImg);

  document.querySelectorAll('.post-year').forEach((ele) => {
    ele.addEventListener('click', () => {
      window.location.hash = '#' + ele.id;
    });
  });

  window.addEventListener('scroll', throttle(() => {
    autoHideHeader();

    if (mobileMenuVisible == true) {
      toggleMobileMenu();
    }
    if (shareMenuVisible == true) {
      shareMobileMenu();
    }
  }, 250));
}