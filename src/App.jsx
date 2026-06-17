import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import './index.css'
import DashboardLayout from './layouts/DashboardLayout.jsx'
import VisionPage from './pages/VisionPage.jsx'
import AnalyticsPage from './pages/AnalyticsPage.jsx'
import ReviewsPage from './pages/ReviewsPage.jsx'
import GalleryPage from './pages/GalleryPage.jsx'
import VPVisionPage from './pages/VPVisionPage.jsx'
import VPAnalyticsPage from './pages/VPAnalyticsPage.jsx'
import { ProductFilterProvider } from './context/ProductFilterContext.jsx'

function withLayout(routeKey, page) {
  return <DashboardLayout key={routeKey}>{page}</DashboardLayout>
}

export default function App() {
  return (
    <HashRouter>
      <ProductFilterProvider>
        <Routes>
          <Route path="/" element={withLayout('vision', <VisionPage key="vision-page" />)} />
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
          <Route
            path="/vp-vision"
            element={withLayout('vp-vision', <VPVisionPage key="vp-vision-page" />)}
          />
          <Route
            path="/vp-vision/analytics"
            element={withLayout('vp-vision-analytics', <VPAnalyticsPage key="vp-vision-analytics-page" />)}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ProductFilterProvider>
    </HashRouter>
  )
}
