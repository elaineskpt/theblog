/**
 * Loads a JS module.
 * @param {string} src The path to the JS module
 */
function loadJSModule(src) {
  const module = document.createElement('script');
  module.setAttribute('type', 'module');
  module.setAttribute('src', src);
  document.head.appendChild(module);
};

/**
 * Loads a CSS file.
 * @param {string} href The path to the CSS file
 */
function loadCSS(href) {
  const link = document.createElement('link');
  link.setAttribute('type', 'text/css');
  link.setAttribute('rel', 'stylesheet');
  link.setAttribute('href', href);
  document.head.appendChild(link);
};

// Prep images for lazy loading and use adequate sizes
const imgWidth = window.innerWidth === 375 ? 750 : // double size for retina
              window.innerWidth < 900 ? 900 : 2048;
let imgCount = 0;

const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      // only handle images with src=/hlx_*
      if (node.tagName === 'IMG' && /\/hlx_/.test(node.src)) {
        const img = node;
        if (!/\?width\=\d/.test(img.src)) {
          // add reasonable width if missing
          img.setAttribute('src', `${img.src}?width=${imgWidth}&auto=webp`);
        }
        if (imgCount > 0) {
          // skip lazyloading for hero image
          img.setAttribute('data-src', img.src);
          img.removeAttribute('src');
          img.classList.add('lazyload');
        }
        imgCount++;
      }
    });
  });
});
observer.observe(document, { childList: true, subtree: true });

// Blog config
window.blog = function() {
  const TYPE = {
    HOME: 'home',
    POST: 'post',
    AUTHOR: 'author',
    TOPIC: 'topic',
    PRODUCT: 'product',
  };
  const LANG = {
    EN: 'en',
    DE: 'de',
    FR: 'fr',
  };
  const context = '/';
  let language = LANG.EN;
  let pageType = TYPE.HOME;
  const segs = window.location.pathname
    .split('/')
    .filter(seg => seg !== '');
  if (segs.length > 0) {
    if (segs.length >= 1) {
      // language
      for (let [key, value] of Object.entries(LANG)) {
        if (value === segs[0]) {
          language = value;
          break;
        }
      }
    }
    if (segs.length >= 2) {
      // post pages
      if (segs[1] === 'drafts' || segs[1] === 'publish' || /\d{4}\/\d{2}\/\d{2}/.test(segs)) {
        pageType = TYPE.POST;
      } else {
        for (let [key, value] of Object.entries(TYPE)) {
          if (segs[1].startsWith(value)) {
            pageType = value;
            break;
          }
        }
      }
    }
  }
  return { context, language, pageType, TYPE, LANG };
}();

// Adobe config
window.fedsConfig = {
    locale: window.blog.language,
    disableSticky: false,
    profile: {
      localMenu: {
        title: 'Settings',
        links: [
          {
            title: 'My Subscriptions',
            action: 'https://theblog.adobe.com/subscriptions.html',
            description: 'Manage your subscriptions',
            analyticsID: 'profile-my-subscriptions'
          },
        ],
      }
    },
    footer: {
      breadcrumbs: {
        showLogo: true,
        links: [{
          title: 'Adobe Blog',
          url: '/',
          target: '_self',
        }]
      },
    },
  };

window.adobeid = {
  client_id: 'theblog-helix',
  scope: 'AdobeID,openid',
  locale: window.blog.language,
};

// Load page specific module
loadJSModule(`/scripts/${window.blog.pageType}.js`);

// Load language specific CSS overlays
if (window.blog.language !== window.blog.LANG.EN) { // skip for en
  loadCSS(`/dict.${window.blog.language}.css`);
}
