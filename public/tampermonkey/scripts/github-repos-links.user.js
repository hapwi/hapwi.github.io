// ==UserScript==
// @name         GitHub: Add "repos" and "bbp repos" Links
// @version      1.2
// @description  Inserts "repos" and "bbp repos" links into the GitHub header.
// @match        https://github.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==
;(() => {
  function createSeparator() {
    const separator = document.createElement('span')
    separator.className = 'AppHeader-context-item-separator'
    separator.textContent = '/'
    separator.style.margin = '10px 1px'
    return separator
  }

  function createRepoLink(href, label) {
    const listItem = document.createElement('li')
    const anchor = document.createElement('a')

    anchor.href = href
    anchor.setAttribute(
      'data-analytics-event',
      '{"category":"SiteHeaderComponent",' +
        '"action":"context_region_crumb","label":"' +
        label +
        '","screen_size":"full"}',
    )
    anchor.setAttribute('data-view-component', 'true')
    anchor.className = 'AppHeader-context-item'
    anchor.style.cssText = 'font-size:14px;color:inherit;text-decoration:none'

    const spanLabel = document.createElement('span')
    spanLabel.className = 'AppHeader-context-item-label'
    spanLabel.textContent = label
    spanLabel.style.cssText = 'vertical-align:middle;font-weight:normal'

    anchor.appendChild(spanLabel)
    listItem.appendChild(anchor)

    return listItem
  }

  function addRepoLinks() {
    if (
      document.querySelector(
        '.AppHeader-context-full [href="https://github.com/hapwi?tab=repositories"]',
      )
    ) {
      return
    }

    const list = document.querySelector('.AppHeader-context-full [role="list"]')
    if (!list) return

    list.appendChild(createSeparator())
    list.appendChild(
      createRepoLink('https://github.com/hapwi?tab=repositories', 'repos'),
    )

    list.appendChild(createSeparator())
    list.appendChild(
      createRepoLink(
        'https://github.com/builtbypete?tab=repositories',
        'bbp repos',
      ),
    )
  }

  const observer = new MutationObserver(addRepoLinks)
  observer.observe(document, {
    childList: true,
    subtree: true,
  })

  document.addEventListener('DOMContentLoaded', addRepoLinks)
})()

