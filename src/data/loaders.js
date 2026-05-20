import { DASHBOARD_DATA_PATH } from './constants'

const cache = new Map()

function stripBom(text) {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text
}

function fetchJson(url) {
  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}`)
      }

      return response.text()
    })
    .then((text) => JSON.parse(stripBom(text)))
}

function cached(key, loader) {
  if (!cache.has(key)) {
    cache.set(key, loader())
  }

  return cache.get(key)
}

export function loadProducts() {
  return cached('dashboardProducts', () => fetchJson(`${DASHBOARD_DATA_PATH}products.json`))
}

export function loadDashboardBundle() {
  return cached('dashboardBundle', async () => {
    const [products, reviews, images, category, productSummary] = await Promise.all([
      loadProducts(),
      fetchJson(`${DASHBOARD_DATA_PATH}reviews.json`),
      fetchJson(`${DASHBOARD_DATA_PATH}images.json`),
      fetchJson(`${DASHBOARD_DATA_PATH}category.json`),
      fetchJson(`${DASHBOARD_DATA_PATH}productSummary.json`),
    ])

    return {
      products,
      reviews,
      images,
      category,
      productSummary,
    }
  })
}

export function clearLoaderCache() {
  cache.clear()
}
