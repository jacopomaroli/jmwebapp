function ready () {
  // Create PrismJS Element
  /* var prismScript = document.createElement('script')
  prismScript.type = 'text/javascript'
  prismScript.src = '/js/prism.dev.js'
  prismScript.setAttribute('data-manual', true)
  prismScript.setAttribute('asd', true)

  // Set Components Folder because of asynch script loading
  prismScript.onload = function () {
    Prism.plugins.autoloader.languages_path = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.15.0/components/'
  }

  document.head.appendChild(prismScript) */
}

document.addEventListener('DOMContentLoaded', ready)

Prism.plugins.autoloader.languages_path = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.15.0/components/'
