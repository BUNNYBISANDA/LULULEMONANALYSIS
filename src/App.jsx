import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './index.css'
import DashboardLayout from './layouts/DashboardLayout.jsx'
import AnalyticsPage from './pages/AnalyticsPage.jsx'
import ReviewsPage from './pages/ReviewsPage.jsx'
import GalleryPage from './pages/GalleryPage.jsx'
import { ProductFilterProvider } from './context/ProductFilterContext.jsx'

const routerBase =
  import.meta.env.BASE_URL === '/' ? undefined : import.meta.env.BASE_URL.replace(/\/$/, '')

function withLayout(routeKey, page) {
  return <DashboardLayout key={routeKey}>{page}</DashboardLayout>
}

export default function App() {
  return (
    <BrowserRouter basename={routerBase}>
      <ProductFilterProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/analytics" replace />} />
          <Route
            path="/analytics"
            element={withLayout('analytics', <AnalyticsPage key="analytics-page" />)}
          />
          <Route
            path="/reviews"
            element={withLayout('reviews', <ReviewsPage key="reviews-page" />)}
          />
          <Route
            path="/gallery"
            element={withLayout('gallery', <GalleryPage key="gallery-page" />)}
          />
          <Route path="*" element={<Navigate to="/analytics" replace />} />
        </Routes>
      </ProductFilterProvider>
    </BrowserRouter>
  )
}
