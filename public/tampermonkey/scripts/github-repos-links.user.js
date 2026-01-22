// ==UserScript==
// @name         GitHub: Add "Repos" and "BBP Repos" Breadcrumbs
// @version      2.1
// @description  Inserts "repos" and "bbp repos" links into GitHub breadcrumbs
// @match        https://github.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(() => {
  function cloneItem(href, label) {
    const nav = document.querySelector(
      'nav[aria-label="Breadcrumbs"]'
    )
    if (!nav) return null

    const firstItem = nav.querySelector("li")
    if (!firstItem) return null

    const li = firstItem.cloneNode(true)
    const a = li.querySelector("a")
    const span = li.querySelector("span")

    a.href = href
    span.textContent = label

    // Remove trailing icons like locks if present
    li.querySelectorAll("svg").forEach(svg => svg.remove())

    return li
  }

  function inject() {
    const nav = document.querySelector(
      'nav[aria-label="Breadcrumbs"]'
    )
    if (!nav) return

    const ol = nav.querySelector("ol")
    if (!ol) return

    if ([...ol.querySelectorAll("a")].some(
      a => a.textContent.trim() === "repos"
    )) {
      return
    }

    const repos = cloneItem(
      "/hapwi?tab=repositories",
      "repos"
    )
    const bbp = cloneItem(
      "/builtbypete?tab=repositories",
      "bbp repos"
    )

    if (!repos || !bbp) return

    ol.appendChild(repos)
    ol.appendChild(bbp)
  }

  const interval = setInterval(inject, 250)
  setTimeout(() => clearInterval(interval), 10000)
})()
