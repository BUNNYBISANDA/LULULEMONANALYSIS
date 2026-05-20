import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { ALL_FILTER_VALUE } from '../data/constants'
import { loadProducts } from '../data/loaders'

const STORAGE_KEY = 'lululemon:selected-product-id'

const ProductFilterContext = createContext(null)

function readStoredValue() {
  if (typeof window === 'undefined') {
    return 'all'
  }

  return window.localStorage.getItem(STORAGE_KEY) || 'all'
}

export function ProductFilterProvider({ children }) {
  const [selectedProductId, setSelectedProductId] = useState(readStoredValue)
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [productsError, setProductsError] = useState(null)

  useEffect(() => {
    let active = true

    setLoadingProducts(true)
    setProductsError(null)

    loadProducts()
      .then((rows) => {
        if (!active) {
          return
        }

        setProducts(Array.isArray(rows) ? rows : [])
        setLoadingProducts(false)
      })
      .catch((error) => {
        if (!active) {
          return
        }

        setProducts([])
        setProductsError(error)
        setLoadingProducts(false)
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(STORAGE_KEY, selectedProductId)
  }, [selectedProductId])

  useEffect(() => {
    if (selectedProductId === 'all' || loadingProducts || products.length === 0) {
      return
    }

    const exists = products.some((product) => product.product_id === selectedProductId)
    if (!exists) {
      setSelectedProductId('all')
    }
  }, [loadingProducts, products, selectedProductId])

  const selectedProduct =
    selectedProductId === 'all'
      ? null
      : products.find((product) => product.product_id === selectedProductId) || null

  const selectedProductName = selectedProduct?.product_name || 'All Products'
  const dashboardTitle =
    selectedProductId === 'all'
      ? 'All Products Review Intelligence'
      : `${selectedProductName} Review Intelligence`

  const productOptions = useMemo(
    () => [
      { value: 'all', label: 'All Products' },
      ...products.map((product) => ({
        value: product.product_id,
        label: product.product_name,
      })),
    ],
    [products],
  )

  const value = useMemo(
    () => ({
      selectedProductId,
      setSelectedProductId,
      selectedProduct,
      selectedProductName,
      dashboardTitle,
      products,
      productOptions,
      loadingProducts,
      productsError,
      allProductsLabel: ALL_FILTER_VALUE,
    }),
    [
      dashboardTitle,
      loadingProducts,
      productOptions,
      products,
      productsError,
      selectedProduct,
      selectedProductId,
      selectedProductName,
    ],
  )

  return (
    <ProductFilterContext.Provider value={value}>{children}</ProductFilterContext.Provider>
  )
}

export function useProductFilter() {
  const context = useContext(ProductFilterContext)

  if (!context) {
    throw new Error('useProductFilter must be used within ProductFilterProvider')
  }

  return context
}
