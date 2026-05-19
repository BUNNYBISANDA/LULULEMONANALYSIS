import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Camera,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Database,
  Headphones,
  Layers3,
  PackageSearch,
  Ruler,
  Search,
  ShieldCheck,
  Star,
  ThumbsUp,
  Workflow,
  X,
  ZoomIn,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import images from './data/images.json'
import reviewsWithImages from './data/reviewsWithImages.json'
import categorySummary from './data/categorySummary.json'

const totalLowStarReviews = 514
const averageRating = 1.93
const allFilterValue = 'All'
const categoryPalette = [
  '#8f3c2e',
  '#b55f46',
  '#d28362',
  '#b89c85',
  '#d8b996',
  '#8a7564',
  '#cbb09a',
  '#dbc7b6',
  '#e6d7ca',
  '#f0e7df',
]

const ratingsDistributionData = [
  { label: '1-Star', count: 221, fill: '#8f3c2e' },
  { label: '2-Star', count: 106, fill: '#c47a59' },
  { label: '3-Star', count: 187, fill: '#5b775f' },
]

const fallbackImageRecords = [
  {
    rating: 1,
    review_id: 'img-101',
    review_date: '2025-02-11',
    review_title: 'Quality is sadly going downhill',
    review_text: 'Poor quality. Fabric pilled after one wear running errands.',
    complaint_theme: 'Fabric & Material Quality',
    business_insight:
      'Visible pilling after minimal use is powerful evidence of durability concerns.',
    photo_number: 1,
    image_url:
      'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80',
    size_purchased: '6',
    fit_feedback: 'True to size',
    verified_buyer: true,
    helpful_votes: 14,
  },
  {
    rating: 1,
    review_id: 'img-102',
    review_date: '2025-02-14',
    review_title: 'Pilling on 2nd wear, not washed yet',
    review_text:
      "The jacket is beautiful but on my 2nd wear, it was already pilling and I hadn't even washed it yet. Super disappointed.",
    complaint_theme: 'Fabric & Material Quality',
    business_insight:
      'Customers are calling out quality decline before laundering, which raises trust risk immediately.',
    photo_number: 1,
    image_url:
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80',
    size_purchased: '4',
    fit_feedback: 'True to size',
    verified_buyer: true,
    helpful_votes: 11,
  },
  {
    rating: 1,
    review_id: 'img-103',
    review_date: '2025-01-21',
    review_title: 'Terrible quality',
    review_text:
      'I bought this sweater less than 2 months ago and worn it under 3 times. The stitching looks cheap and rushed, and the fabric already looks horrific for this price point.',
    complaint_theme: 'Stitching & Construction',
    business_insight:
      'Construction defects undermine the product promise because they are immediately visible and easy to compare against older items.',
    photo_number: 1,
    image_url:
      'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&q=80',
    size_purchased: '8',
    fit_feedback: 'True to size',
    verified_buyer: true,
    helpful_votes: 9,
  },
  {
    rating: 1,
    review_id: 'img-104',
    review_date: '2025-03-03',
    review_title: 'Disappointed',
    review_text:
      "I was very excited when the white and gold Nulu jacket was in stock. I've taken excellent care of this jacket and the pilling is unacceptable for the price.",
    complaint_theme: 'Fabric & Material Quality',
    business_insight:
      'When customers emphasize careful product care, quality complaints become harder for the brand to dismiss.',
    photo_number: 1,
    image_url:
      'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&q=80',
    size_purchased: '6',
    fit_feedback: 'True to size',
    verified_buyer: false,
    helpful_votes: 7,
  },
  {
    rating: 1,
    review_id: 'img-105',
    review_date: '2025-02-26',
    review_title: 'Pills after two wears',
    review_text:
      "I really wanted to give this a 5 star review because these are some of my favorite sweaters. But I am really disappointed. I've only worn it twice.",
    complaint_theme: 'Fabric & Material Quality',
    business_insight:
      'Repeat customers are comparing the current item to prior brand memory, making disappointment more consequential.',
    photo_number: 1,
    image_url:
      'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&q=80',
    size_purchased: '10',
    fit_feedback: 'Runs small',
    verified_buyer: true,
    helpful_votes: 12,
  },
  {
    rating: 1,
    review_id: 'img-106',
    review_date: '2025-02-08',
    review_title: 'After one wash it got pills',
    review_text: 'After one wash it got pills.',
    complaint_theme: 'Fabric & Material Quality',
    business_insight:
      'Visible post-wash degradation suggests testing standards may not match customer expectations for a premium garment.',
    photo_number: 1,
    image_url:
      'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&q=80',
    size_purchased: '8',
    fit_feedback: 'True to size',
    verified_buyer: true,
    helpful_votes: 10,
  },
  {
    rating: 1,
    review_id: 'img-107',
    review_date: '2025-03-06',
    review_title: 'Wrong color received',
    review_text:
      'I ordered porcelain pink, the product i received looks like lilac. Very disappointed.',
    complaint_theme: 'Color & Product Description',
    business_insight:
      'Product imagery mismatch creates dissatisfaction before the garment performance is even considered.',
    photo_number: 1,
    image_url:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
    size_purchased: '4',
    fit_feedback: 'True to size',
    verified_buyer: false,
    helpful_votes: 8,
  },
  {
    rating: 2,
    review_id: 'img-108',
    review_date: '2025-03-01',
    review_title: 'Color completely off',
    review_text:
      'The color is more purple than it is pink and is not as bright as shown in the photo.',
    complaint_theme: 'Color & Product Description',
    business_insight:
      'Mixed dissatisfaction suggests the product can still be acceptable, but expectation alignment is weak.',
    photo_number: 1,
    image_url:
      'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=800&q=80',
    size_purchased: '6',
    fit_feedback: 'True to size',
    verified_buyer: true,
    helpful_votes: 6,
  },
  {
    rating: 1,
    review_id: 'img-109',
    review_date: '2025-01-29',
    review_title: 'Arrived damaged',
    review_text:
      'Arrived damaged, packaging was completely torn open and jacket had a stain on it.',
    complaint_theme: 'Shipping & Delivery',
    business_insight:
      'Fulfillment failures create a highly visible break in the premium purchase experience.',
    photo_number: 1,
    image_url:
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80',
    size_purchased: '8',
    fit_feedback: 'True to size',
    verified_buyer: true,
    helpful_votes: 13,
  },
  {
    rating: 1,
    review_id: 'img-110',
    review_date: '2025-02-19',
    review_title: 'Zipper broke immediately',
    review_text: 'Zipper broke after 3 uses. Very disappointed for this price.',
    complaint_theme: 'Zipper Issues',
    business_insight:
      'Specific hardware failures are especially damaging because they make the defect easy to show and share.',
    photo_number: 1,
    image_url:
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
    size_purchased: '6',
    fit_feedback: 'True to size',
    verified_buyer: true,
    helpful_votes: 9,
  },
]

const fallbackCategorySummary = [
  {
    complaint_theme: 'Fabric & Material Quality',
    total_reviews_with_images: 198,
    total_images: 198,
    '1-star_image_count': 75,
    '2-star_image_count': 54,
    '3-star_image_count': 69,
    business_interpretation:
      'Main dissatisfaction driver; signals possible quality perception decline.',
  },
  {
    complaint_theme: 'Shipping & Delivery',
    total_reviews_with_images: 87,
    total_images: 87,
    '1-star_image_count': 67,
    '2-star_image_count': 8,
    '3-star_image_count': 12,
    business_interpretation:
      'Severe negative experience after purchase; mostly 1-star driven.',
  },
  {
    complaint_theme: 'Customer Service',
    total_reviews_with_images: 78,
    total_images: 78,
    '1-star_image_count': 29,
    '2-star_image_count': 17,
    '3-star_image_count': 32,
    business_interpretation:
      'Support and resolution experience may affect trust and loyalty.',
  },
  {
    complaint_theme: 'Sizing & Fit',
    total_reviews_with_images: 64,
    total_images: 64,
    '1-star_image_count': 15,
    '2-star_image_count': 8,
    '3-star_image_count': 41,
    business_interpretation:
      'Fit expectations are inconsistent; mostly 3-star mixed dissatisfaction.',
  },
  {
    complaint_theme: 'Color & Product Description',
    total_reviews_with_images: 21,
    total_images: 21,
    '1-star_image_count': 4,
    '2-star_image_count': 7,
    '3-star_image_count': 10,
    business_interpretation:
      'Product visuals and descriptions may not fully match customer expectations.',
  },
  {
    complaint_theme: 'Pricing & Value',
    total_reviews_with_images: 20,
    total_images: 20,
    '1-star_image_count': 13,
    '2-star_image_count': 1,
    '3-star_image_count': 6,
    business_interpretation:
      'Premium price increases dissatisfaction when quality expectation is not met.',
  },
  {
    complaint_theme: 'Zipper Issues',
    total_reviews_with_images: 19,
    total_images: 19,
    '1-star_image_count': 3,
    '2-star_image_count': 6,
    '3-star_image_count': 10,
    business_interpretation:
      'Specific hardware reliability issue that can damage product confidence.',
  },
  {
    complaint_theme: 'Stitching & Construction',
    total_reviews_with_images: 12,
    total_images: 12,
    '1-star_image_count': 6,
    '2-star_image_count': 2,
    '3-star_image_count': 4,
    business_interpretation: 'Manufacturing and detail quality concern.',
  },
  {
    complaint_theme: 'Product Cleanliness',
    total_reviews_with_images: 9,
    total_images: 9,
    '1-star_image_count': 6,
    '2-star_image_count': 1,
    '3-star_image_count': 2,
    business_interpretation:
      'Quality-control and fulfillment inspection concern.',
  },
  {
    complaint_theme: 'Design & Features',
    total_reviews_with_images: 6,
    total_images: 6,
    '1-star_image_count': 3,
    '2-star_image_count': 2,
    '3-star_image_count': 1,
    business_interpretation:
      'Some customers dislike changes in product design or missing features.',
  },
]

const fallbackReviewsWithImages = Object.values(
  fallbackImageRecords.reduce((accumulator, item) => {
    const key = item.review_id

    if (!accumulator[key]) {
      accumulator[key] = {
        rating: item.rating,
        review_id: item.review_id,
        review_date: item.review_date,
        review_title: item.review_title,
        review_text: item.review_text,
        complaint_theme: item.complaint_theme,
        image_count: 0,
        photo_urls: [],
      }
    }

    accumulator[key].image_count += 1
    accumulator[key].photo_urls.push(item.image_url)

    return accumulator
  }, {}),
)

const businessGroupBlueprints = [
  {
    group: 'Product Quality Issues',
    categories: [
      'Fabric & Material Quality',
      'Zipper Issues',
      'Stitching & Construction',
      'Product Cleanliness',
    ],
    businessMeaning: 'Product quality and quality-control concerns',
    action:
      'Review fabric durability, zipper reliability, construction quality, and quality-control checks.',
    icon: ShieldCheck,
  },
  {
    group: 'Customer Experience Issues',
    categories: ['Shipping & Delivery', 'Customer Service'],
    businessMeaning:
      'Problems after purchase, delivery, support, return, and refund experience',
    action:
      'Improve delivery tracking, issue resolution speed, refund handling, and customer support follow-up.',
    icon: Headphones,
  },
  {
    group: 'Product Expectation Issues',
    categories: [
      'Sizing & Fit',
      'Color & Product Description',
      'Design & Features',
    ],
    businessMeaning: 'Product did not match customer expectation',
    action:
      'Improve size guidance, product images, fit notes, and product description accuracy.',
    icon: Ruler,
  },
  {
    group: 'Value Perception Issues',
    categories: ['Pricing & Value'],
    businessMeaning:
      'Customers feel price is not justified by quality or experience',
    action:
      'Strengthen the value justification for premium pricing through quality consistency and transparent product benefits.',
    icon: CircleDollarSign,
  },
]

const navItems = [
  { label: 'Summary', href: '#summary' },
  { label: 'Themes', href: '#complaints' },
  { label: 'Groups', href: '#groups' },
  { label: 'Reviews', href: '/reviews' },
  { label: 'Gallery', href: '#gallery' },
]

const RADIAN = Math.PI / 180

function safeNumber(value) {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : 0
}

function normalizeTruth(value) {
  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'number') {
    return value === 1
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    return ['true', 'yes', 'y', 'verified', '1'].includes(normalized)
  }

  return false
}

function hasValue(value) {
  return value !== null && value !== undefined && String(value).trim() !== ''
}

function formatShortDate(value) {
  if (!hasValue(value)) {
    return 'Unknown'
  }

  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) {
    return String(value)
  }

  return parsedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function truncateText(value, maxLength = 120) {
  if (!hasValue(value)) {
    return 'No review text available.'
  }

  const text = String(value).trim()
  if (text.length <= maxLength) {
    return text
  }

  return `${text.slice(0, maxLength).trim()}...`
}

function shortThemeLabel(value) {
  const labelMap = {
    'Fabric & Material Quality': 'Fabric & Material',
    'Color & Product Description': 'Color & Description',
    'Shipping & Delivery': 'Shipping',
    'Stitching & Construction': 'Stitching',
    'Product Cleanliness': 'Cleanliness',
  }

  return labelMap[value] || value
}

function ratingBadgeClassName(rating) {
  if (rating === 1) {
    return 'bg-[#8f3c2e] text-white'
  }

  if (rating === 2) {
    return 'bg-[#c47a59] text-white'
  }

  if (rating === 3) {
    return 'bg-[#5b775f] text-white'
  }

  return 'bg-[#655b53] text-white'
}

function renderPieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.12) {
    return null
  }

  const radius = innerRadius + (outerRadius - innerRadius) * 0.6
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text
      x={x}
      y={y}
      fill="#f8f4ef"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={11}
      fontWeight={700}
    >
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  )
}

function Panel({ children, className = '' }) {
  return (
    <div
      className={`soft-card rounded-[28px] border border-black/6 bg-white/88 ${className}`}
    >
      {children}
    </div>
  )
}

function SectionHeader({ eyebrow, title, description, align = 'left' }) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-3xl text-center' : ''}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8f5d4d]">
        {eyebrow}
      </p>
      <h2 className="font-display mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#181512] sm:text-3xl">
        {title}
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-[#655b53] sm:text-[15px]">
        {description}
      </p>
    </div>
  )
}

function RatingBadge({ rating, compact = false }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${ratingBadgeClassName(
        rating,
      )} ${compact ? 'px-2.5 py-1 text-[11px]' : ''}`}
    >
      <Star size={compact ? 11 : 12} className="fill-current" />
      {rating}-Star
    </span>
  )
}

function ImagePlaceholder({ iconSize = 28, label = 'Image unavailable' }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#e8ddd2] text-[#8b7b70]">
      <Camera size={iconSize} />
      <span className="text-xs font-medium">{label}</span>
    </div>
  )
}

function CategoryTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) {
    return null
  }

  const item = payload[0].payload

  return (
    <div className="rounded-2xl border border-black/6 bg-white/96 p-4 shadow-[0_22px_42px_-28px_rgba(34,27,21,0.5)]">
      <p className="text-sm font-semibold text-[#181512]">{item.theme}</p>
      <p className="mt-2 text-sm text-[#5f5750]">
        {item.totalReviews.toLocaleString('en-US')} photo-backed reviews
      </p>
      <p className="mt-1 text-sm text-[#5f5750]">
        {item.totalImages.toLocaleString('en-US')} total images
      </p>
      <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8f5d4d]">
        {item.share.toFixed(1)}% of categorized evidence
      </p>
    </div>
  )
}

function RatingsTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) {
    return null
  }

  const item = payload[0].payload

  return (
    <div className="rounded-2xl border border-black/6 bg-white/96 p-4 shadow-[0_22px_42px_-28px_rgba(34,27,21,0.5)]">
      <p className="text-sm font-semibold text-[#181512]">{item.label}</p>
      <p className="mt-2 text-sm text-[#5f5750]">
        {item.count.toLocaleString('en-US')} reviews
      </p>
    </div>
  )
}

function App() {
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === 'undefined' ? 1280 : window.innerWidth,
  )
  const [galleryThemeFilter, setGalleryThemeFilter] = useState(allFilterValue)
  const [galleryRatingFilter, setGalleryRatingFilter] = useState(allFilterValue)
  const [activeLightboxIndex, setActiveLightboxIndex] = useState(null)
  const [zoomedImage, setZoomedImage] = useState(null)
  const [imageStateMap, setImageStateMap] = useState({})

  const sourceImages = useMemo(
    () => (Array.isArray(images) && images.length ? images : fallbackImageRecords),
    [],
  )
  const sourceReviewsWithImages = useMemo(
    () =>
      Array.isArray(reviewsWithImages) && reviewsWithImages.length
        ? reviewsWithImages
        : fallbackReviewsWithImages,
    [],
  )
  const sourceCategorySummary = useMemo(
    () =>
      Array.isArray(categorySummary) && categorySummary.length
        ? categorySummary
        : fallbackCategorySummary,
    [],
  )

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const resetAllFilters = useCallback(() => {
    setGalleryThemeFilter(allFilterValue)
    setGalleryRatingFilter(allFilterValue)
    setActiveLightboxIndex(null)
    setZoomedImage(null)
  }, [])

  const handleSectionSwitch = useCallback(() => {
    resetAllFilters()
  }, [resetAllFilters])

  const markImageLoaded = useCallback((key) => {
    setImageStateMap((previous) => {
      if (previous[key] === 'loaded') {
        return previous
      }

      return { ...previous, [key]: 'loaded' }
    })
  }, [])

  const markImageError = useCallback((key) => {
    setImageStateMap((previous) => {
      if (previous[key] === 'error') {
        return previous
      }

      return { ...previous, [key]: 'error' }
    })
  }, [])

  const imageItems = useMemo(
    () =>
      sourceImages.map((item, index) => ({
        key: `${item.review_id || 'image'}-${item.photo_number || index}-${index}`,
        rating: safeNumber(item.rating),
        reviewId: item.review_id || `review-${index + 1}`,
        reviewDate: item.review_date,
        dateLabel: formatShortDate(item.review_date),
        reviewTitle: item.review_title || 'Untitled review',
        reviewText: item.review_text || 'No review text available.',
        complaintTheme: item.complaint_theme || 'Unassigned',
        businessInsight:
          item.business_insight || 'No business insight was attached to this image.',
        photoNumber: safeNumber(item.photo_number) || 1,
        imageUrl: item.image_url,
        sizePurchased: item.size_purchased,
        fitFeedback: item.fit_feedback,
        verifiedBuyer: normalizeTruth(item.verified_buyer),
        helpfulVotes: safeNumber(item.helpful_votes),
      })),
    [sourceImages],
  )

  const categoryRows = useMemo(() => {
    const totalCategorizedReviews = sourceCategorySummary.reduce(
      (sum, item) => sum + safeNumber(item.total_reviews_with_images),
      0,
    )

    return sourceCategorySummary
      .map((item, index) => ({
        theme: item.complaint_theme || 'Unassigned',
        shortTheme: shortThemeLabel(item.complaint_theme || 'Unassigned'),
        totalReviews: safeNumber(item.total_reviews_with_images),
        totalImages: safeNumber(item.total_images),
        oneStarImages: safeNumber(item['1-star_image_count']),
        twoStarImages: safeNumber(item['2-star_image_count']),
        threeStarImages: safeNumber(item['3-star_image_count']),
        businessInterpretation:
          item.business_interpretation || 'No interpretation provided.',
        share: totalCategorizedReviews
          ? (safeNumber(item.total_reviews_with_images) / totalCategorizedReviews) * 100
          : 0,
        fill: categoryPalette[index % categoryPalette.length],
      }))
      .sort((left, right) => right.totalReviews - left.totalReviews)
  }, [sourceCategorySummary])

  const businessGroups = useMemo(() => {
    const totalGroupedReviews = categoryRows.reduce(
      (sum, item) => sum + item.totalReviews,
      0,
    )

    return businessGroupBlueprints.map((blueprint) => {
      const total = categoryRows.reduce((sum, item) => {
        if (blueprint.categories.includes(item.theme)) {
          return sum + item.totalReviews
        }

        return sum
      }, 0)

      return {
        ...blueprint,
        total,
        share: totalGroupedReviews ? (total / totalGroupedReviews) * 100 : 0,
      }
    })
  }, [categoryRows])

  const topCategory = categoryRows[0] || {
    theme: 'Fabric & Material Quality',
    share: 38.5,
    totalReviews: 198,
  }

  const photoBackedReviewCount = useMemo(() => {
    if (sourceReviewsWithImages.length) {
      return sourceReviewsWithImages.length
    }

    return new Set(imageItems.map((item) => item.reviewId)).size
  }, [imageItems, sourceReviewsWithImages])

  const imageStats = useMemo(() => {
    const oneStarCount = imageItems.filter((item) => item.rating === 1).length
    const twoStarCount = imageItems.filter((item) => item.rating === 2).length
    const threeStarCount = imageItems.filter((item) => item.rating === 3).length

    return {
      total: imageItems.length,
      oneStarCount,
      twoStarCount,
      threeStarCount,
    }
  }, [imageItems])

  const galleryThemeOptions = useMemo(
    () => [
      allFilterValue,
      ...new Set(imageItems.map((item) => item.complaintTheme).filter(Boolean)),
    ],
    [imageItems],
  )

  const filteredImageItems = useMemo(
    () =>
      imageItems.filter((item) => {
        const matchesTheme =
          galleryThemeFilter === allFilterValue ||
          item.complaintTheme === galleryThemeFilter
        const matchesRating =
          galleryRatingFilter === allFilterValue ||
          String(item.rating) === galleryRatingFilter

        return matchesTheme && matchesRating
      }),
    [galleryRatingFilter, galleryThemeFilter, imageItems],
  )

  const lightboxItem =
    activeLightboxIndex !== null ? filteredImageItems[activeLightboxIndex] || null : null

  const openLightbox = useCallback((index) => {
    setActiveLightboxIndex(index)
  }, [])

  const closeLightbox = useCallback(() => {
    setActiveLightboxIndex(null)
    setZoomedImage(null)
  }, [])

  const goToPreviousImage = useCallback(() => {
    setActiveLightboxIndex((previous) => {
      if (previous === null || previous <= 0) {
        return previous
      }

      return previous - 1
    })
  }, [])

  const goToNextImage = useCallback(() => {
    setActiveLightboxIndex((previous) => {
      if (
        previous === null ||
        previous >= filteredImageItems.length - 1
      ) {
        return previous
      }

      return previous + 1
    })
  }, [filteredImageItems.length])

  useEffect(() => {
    if (activeLightboxIndex !== null && activeLightboxIndex >= filteredImageItems.length) {
      setActiveLightboxIndex(null)
    }
  }, [activeLightboxIndex, filteredImageItems.length])

  useEffect(() => {
    if (!lightboxItem) {
      return undefined
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (zoomedImage) {
          setZoomedImage(null)
        } else {
          closeLightbox()
        }
      }

      if (event.key === 'ArrowLeft' && !zoomedImage) {
        goToPreviousImage()
      }

      if (event.key === 'ArrowRight' && !zoomedImage) {
        goToNextImage()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [closeLightbox, goToNextImage, goToPreviousImage, lightboxItem, zoomedImage])

  const donutIsCompact = viewportWidth < 640
  const donutInnerRadius = donutIsCompact ? 66 : 86
  const donutOuterRadius = donutIsCompact ? 104 : 128
  const donutShowLabels = viewportWidth >= 768

  const kpiCards = useMemo(
    () => [
      {
        label: 'Total Low-Star Reviews',
        value: totalLowStarReviews.toLocaleString('en-US'),
        note: 'Filtered 1-star to 3-star review set',
        icon: Database,
      },
      {
        label: 'Average Rating',
        value: averageRating.toFixed(2),
        note: 'Average rating across the low and mixed review segment',
        icon: Star,
      },
      {
        label: 'Top Complaint Theme',
        value: topCategory.theme,
        note: 'Largest recurring complaint theme in the current analysis',
        icon: AlertTriangle,
      },
      {
        label: 'Photo-Backed Reviews',
        value: photoBackedReviewCount.toLocaleString('en-US'),
        note: 'Reviews that include customer-submitted image evidence',
        icon: PackageSearch,
      },
      {
        label: 'Evidence Images',
        value: imageStats.total.toLocaleString('en-US'),
        note: 'Individual image records available for exploration',
        icon: Camera,
      },
    ],
    [imageStats.total, photoBackedReviewCount, topCategory.theme],
  )

  const photoCoverageShare = ((photoBackedReviewCount / totalLowStarReviews) * 100).toFixed(1)
  const imagesPerReview = photoBackedReviewCount
    ? (imageStats.total / photoBackedReviewCount).toFixed(1)
    : '0.0'
  const leadingThemeShare = topCategory.share.toFixed(1)

  return (
    <div className="min-h-screen bg-transparent text-[#181512]">
      <header className="sticky top-0 z-40 border-b border-black/8 bg-white/95 backdrop-blur-xl">
        <div
          className="mx-auto flex max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8"
          style={{ height: '64px' }}
        >
          <a
            href="#summary"
            onClick={handleSectionSwitch}
            className="flex shrink-0 items-center gap-3 no-underline"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1f1a16] text-white">
              <BarChart3 size={16} strokeWidth={2.2} />
            </div>
            <div className="hidden md:block">
              <p className="text-[14px] font-semibold leading-tight tracking-[-0.01em] text-[#181512]">
                lululemon
              </p>
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#8b5b4b] leading-tight">
                Define Jacket · Reviews
              </p>
            </div>
          </a>

          <div className="h-5 w-px shrink-0 bg-black/10" />

          <nav
            className="flex flex-1 items-center gap-1.5 overflow-x-auto"
            style={{ scrollbarWidth: 'none' }}
          >
            {navItems.map((item) =>
              item.href.startsWith('/') ? (
                <Link
                  key={item.href}
                  to={item.href}
                  className="shrink-0 whitespace-nowrap rounded-lg px-3.5 py-2 text-[14px] font-medium text-[#6b5f57] transition-colors duration-150 hover:bg-[#f0e8e0] hover:text-[#1f1a16]"
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={handleSectionSwitch}
                  className="shrink-0 whitespace-nowrap rounded-lg px-3.5 py-2 text-[14px] font-medium text-[#6b5f57] transition-colors duration-150 hover:bg-[#f0e8e0] hover:text-[#1f1a16]"
                >
                  {item.label}
                </a>
              ),
            )}
          </nav>

          <div className="hidden shrink-0 items-center gap-2 lg:flex">
            <span className="flex items-center gap-2 rounded-full border border-black/8 bg-[#faf7f3] px-3.5 py-1.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8b5b4b]">
                Reviews
              </span>
              <span className="text-[13px] font-bold text-[#181512]">514</span>
            </span>
            <span className="flex items-center gap-2 rounded-full border border-black/8 bg-[#faf7f3] px-3.5 py-1.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8b5b4b]">
                Images
              </span>
              <span className="text-[13px] font-bold text-[#181512]">151</span>
            </span>
            <span className="flex items-center gap-2 rounded-full border border-[#e5d5c8] bg-[#f5ede5] px-3.5 py-1.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8b5b4b]">
                Top Issue
              </span>
              <span className="text-[13px] font-bold text-[#8f3c2e]">
                Fabric Quality
              </span>
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <section
          id="summary"
          className="scroll-mt-24 grid gap-6 xl:grid-cols-[1.25fr_0.85fr]"
        >
          <Panel className="story-grid animate-rise relative overflow-hidden p-7 sm:p-9">
            <div className="absolute inset-y-0 right-0 hidden w-56 bg-gradient-to-l from-[#f4ede6] to-transparent lg:block" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#eaded2] bg-white/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8f5d4d]">
                <Workflow size={14} />
                Executive Summary
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-full border border-black/6 bg-white/70 px-4 py-2 text-xs font-medium text-[#5f5750]">
                  Product: Define Jacket Nulu
                </span>
                <span className="rounded-full border border-black/6 bg-white/70 px-4 py-2 text-xs font-medium text-[#5f5750]">
                  Method: Clustered complaint theme analysis
                </span>
                <span className="rounded-full border border-black/6 bg-white/70 px-4 py-2 text-xs font-medium text-[#5f5750]">
                  Evidence: {imageStats.total} customer images across {photoBackedReviewCount}{' '}
                  reviews
                </span>
              </div>

              <h1 className="font-display mt-8 max-w-4xl text-4xl font-semibold tracking-[-0.05em] text-[#181512] sm:text-5xl xl:text-[3.45rem]">
                lululemon Define Jacket Nulu - Customer Review Intelligence Dashboard
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-[#5f5750]">
                Low-star and mixed-review analysis bringing together complaint theme
                clustering, customer-submitted image evidence, and raw review excerpts
                for executive storytelling.
              </p>

              <div className="mt-8 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="rounded-[26px] border border-[#eaded2] bg-[#f8f3ed] p-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8f5d4d]">
                    Executive insight
                  </p>
                  <p className="mt-4 text-lg font-semibold leading-8 tracking-[-0.02em] text-[#1b1713]">
                    Fabric & Material Quality remains the clearest dissatisfaction
                    signal, while customer-submitted imagery materially increases the
                    credibility of quality, shipping, and product-accuracy complaints.
                    Together, these themes define the highest-priority trust risks for
                    the Define Jacket Nulu.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                  <div className="rounded-[24px] border border-black/6 bg-white/78 p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8f5d4d]">
                      Photo-backed coverage
                    </p>
                    <p className="font-display mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#181512]">
                      {photoCoverageShare}%
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#655b53]">
                      Of low-star and mixed reviews currently include image evidence.
                    </p>
                  </div>
                  <div className="rounded-[24px] border border-black/6 bg-white/78 p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8f5d4d]">
                      Images per review
                    </p>
                    <p className="font-display mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#181512]">
                      {imagesPerReview}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#655b53]">
                      Average image density across photo-backed reviews.
                    </p>
                  </div>
                  <div className="rounded-[24px] border border-black/6 bg-white/78 p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8f5d4d]">
                      Leading theme share
                    </p>
                    <p className="font-display mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#181512]">
                      {leadingThemeShare}%
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#655b53]">
                      Of categorized evidence themes center on {shortThemeLabel(topCategory.theme)}.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          <Panel className="animate-rise-delayed p-7 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8f5d4d]">
                  Storyline
                </p>
                <h2 className="font-display mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#181512]">
                  The evidence stack converges on a few concentrated business issues.
                </h2>
              </div>
              <div className="rounded-2xl bg-[#f5ede5] p-3 text-[#8f5d4d]">
                <Layers3 size={20} />
              </div>
            </div>

            <div className="mt-6 space-y-5">
              {businessGroups.map((group) => {
                const Icon = group.icon

                return (
                  <div key={group.group}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f5ede5] text-[#8f5d4d]">
                          <Icon size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#181512]">
                            {group.group}
                          </p>
                          <p className="text-xs text-[#6b625a]">
                            {group.total.toLocaleString('en-US')} categorized records
                          </p>
                        </div>
                      </div>
                      <p className="font-display text-lg font-semibold tracking-[-0.03em] text-[#181512]">
                        {group.share.toFixed(1)}%
                      </p>
                    </div>
                    <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#efe7df]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#8f3c2e] to-[#d18b66]"
                        style={{ width: `${group.share}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-7 rounded-[24px] bg-[#1f1a16] p-6 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
                Client takeaway
              </p>
              <p className="mt-4 text-sm leading-7 text-white/85">
                Customer-submitted photos make the underlying complaint themes more
                persuasive in a business setting because they turn abstract product
                frustration into visible, review-linked evidence.
              </p>
            </div>
          </Panel>
        </section>

        <section className="animate-rise-late grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {kpiCards.map((card) => {
            const Icon = card.icon

            return (
              <Panel
                key={card.label}
                className="group p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_-42px_rgba(34,27,21,0.55)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="rounded-2xl bg-[#f5ede5] p-3 text-[#8f5d4d] transition duration-300 group-hover:bg-[#1f1a16] group-hover:text-white">
                    <Icon size={20} />
                  </div>
                  <ArrowUpRight size={18} className="text-[#b08a77]" />
                </div>
                <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8f5d4d]">
                  {card.label}
                </p>
                <p className="font-display mt-3 text-[1.8rem] font-semibold leading-tight tracking-[-0.05em] text-[#181512]">
                  {card.value}
                </p>
                <p className="mt-3 text-sm leading-6 text-[#655b53]">{card.note}</p>
              </Panel>
            )
          })}
        </section>

        <section
          id="complaints"
          className="scroll-mt-24 grid gap-6 xl:grid-cols-[1.16fr_0.84fr]"
        >
          <Panel className="p-7 sm:p-8">
            <SectionHeader
              eyebrow="Complaint Category Ranking"
              title="Image-backed complaint themes remain highly concentrated."
              description="Complaint themes ranked by review volume using the category summary export. The emphasis remains on the most visible sources of dissatisfaction."
            />

            <div className="mt-6 h-[420px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryRows}
                  layout="vertical"
                  margin={{ top: 8, right: 28, left: 4, bottom: 8 }}
                >
                  <CartesianGrid
                    horizontal={false}
                    stroke="#eee5dc"
                    strokeDasharray="3 3"
                  />
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#796e66', fontSize: 12 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="shortTheme"
                    axisLine={false}
                    tickLine={false}
                    width={132}
                    tick={{ fill: '#4d453f', fontSize: 12 }}
                  />
                  <Tooltip cursor={{ fill: 'rgba(143, 92, 77, 0.08)' }} content={<CategoryTooltip />} />
                  <Bar dataKey="totalReviews" radius={[0, 12, 12, 0]}>
                    {categoryRows.map((item, index) => (
                      <Cell
                        key={item.theme}
                        fill={index === 0 ? '#8f3c2e' : item.fill}
                      />
                    ))}
                    <LabelList
                      dataKey="totalReviews"
                      position="right"
                      fill="#1b1713"
                      fontSize={12}
                      fontWeight={700}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <div className="grid gap-6">
            <Panel className="p-7 sm:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8f5d4d]">
                Signal strength
              </p>
              <div className="mt-5 rounded-[26px] bg-[#f8f2ec] p-6">
                <p className="font-display text-5xl font-semibold tracking-[-0.06em] text-[#181512]">
                  {topCategory.share.toFixed(1)}%
                </p>
                <p className="mt-3 text-base font-semibold leading-7 text-[#181512]">
                  {topCategory.totalReviews.toLocaleString('en-US')} categorized reviews with
                  images sit in {topCategory.theme}.
                </p>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-black/6 bg-white/72 p-4">
                  <p className="text-sm font-semibold text-[#181512]">
                    What this means
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#655b53]">
                    The largest visible complaint theme is still product quality, not
                    a marginal issue isolated to edge cases.
                  </p>
                </div>
                <div className="rounded-2xl border border-black/6 bg-white/72 p-4">
                  <p className="text-sm font-semibold text-[#181512]">
                    Why the images matter
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#655b53]">
                    Photo evidence makes these complaints presentation-ready because
                    decision-makers can connect the theme directly to what customers
                    saw and uploaded.
                  </p>
                </div>
              </div>
            </Panel>

            <Panel className="p-7 sm:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8f5d4d]">
                Priority readout
              </p>
              <div className="mt-5 space-y-4">
                {categoryRows.slice(0, 4).map((item, index) => (
                  <div key={item.theme}>
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <p className="font-medium text-[#181512]">
                        {index + 1}. {item.theme}
                      </p>
                      <p className="font-semibold text-[#8f5d4d]">
                        {item.share.toFixed(1)}%
                      </p>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#efe7df]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${item.share}%`,
                          backgroundColor: item.fill,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
          <Panel className="p-7 sm:p-8">
            <SectionHeader
              eyebrow="Ratings Distribution"
              title="Low-star feedback is heavily skewed toward 1-star and 3-star dissatisfaction."
              description="Dataset-level rating distribution for the filtered low-star review set. This keeps the severity mix visible alongside the more detailed complaint-theme analysis."
            />

            <div className="relative mt-6 h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ratingsDistributionData}
                    dataKey="count"
                    nameKey="label"
                    innerRadius={donutInnerRadius}
                    outerRadius={donutOuterRadius}
                    paddingAngle={3}
                    labelLine={false}
                    label={donutShowLabels ? renderPieLabel : false}
                  >
                    {ratingsDistributionData.map((item) => (
                      <Cell key={item.label} fill={item.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<RatingsTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {!donutIsCompact ? (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="rounded-full bg-white/94 px-8 py-6 text-center shadow-[0_20px_40px_-30px_rgba(34,27,21,0.45)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8f5d4d]">
                      Avg rating
                    </p>
                    <p className="font-display mt-2 text-3xl font-semibold tracking-[-0.05em] text-[#181512]">
                      {averageRating.toFixed(2)}
                    </p>
                    <p className="mt-1 text-xs text-[#655b53]">Across low-star reviews</p>
                  </div>
                </div>
              ) : null}
            </div>

            {donutIsCompact ? (
              <div className="mt-4 flex justify-center">
                <div className="w-full max-w-[220px] rounded-[24px] border border-black/6 bg-white/94 px-6 py-5 text-center shadow-[0_20px_40px_-30px_rgba(34,27,21,0.45)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8f5d4d]">
                    Avg rating
                  </p>
                  <p className="font-display mt-2 text-3xl font-semibold tracking-[-0.05em] text-[#181512]">
                    {averageRating.toFixed(2)}
                  </p>
                  <p className="mt-1 text-xs text-[#655b53]">Across low-star reviews</p>
                </div>
              </div>
            ) : null}
          </Panel>

          <Panel className="p-7 sm:p-8">
            <SectionHeader
              eyebrow="Severity Readout"
              title="The review set contains both acute failure and mixed frustration."
              description="This framing helps explain why some themes show immediate trust breakdown while others reflect unmet expectation rather than outright rejection."
            />

            <div className="mt-6 grid gap-3">
              {ratingsDistributionData.map((item) => {
                const share = ((item.count / totalLowStarReviews) * 100).toFixed(1)

                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-4 rounded-[22px] border border-black/6 bg-white/72 p-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: item.fill }}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#181512]">
                          {item.label}
                        </p>
                        <p className="text-xs text-[#655b53]">
                          {item.count.toLocaleString('en-US')} reviews
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-[#f5ede5] px-3 py-1 text-xs font-semibold text-[#8f5d4d]">
                      {share}%
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 rounded-[24px] bg-[#1f1a16] p-6 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
                Framing note
              </p>
              <p className="mt-4 text-sm leading-7 text-white/85">
                1-star feedback signals acute brand breakdown, while 3-star reviews
                often reflect “not good enough for the price” rather than total product
                rejection. Both matter in a premium apparel context.
              </p>
            </div>
          </Panel>
        </section>

        <section id="groups" className="scroll-mt-24">
          <Panel className="p-7 sm:p-8">
            <SectionHeader
              eyebrow="Business Group Summary"
              title="Complaint themes translate into a concise operating agenda."
              description="Grouped business lenses make it easier to move from category-level findings into cross-functional actions for product, operations, and customer experience."
            />

            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              {businessGroups.map((group) => {
                const Icon = group.icon

                return (
                  <div
                    key={group.group}
                    className="soft-card rounded-[28px] border border-black/6 bg-[#fcfaf7] p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_-42px_rgba(34,27,21,0.48)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1f1a16] text-white">
                          <Icon size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8f5d4d]">
                            {group.share.toFixed(1)}% of grouped themes
                          </p>
                          <h3 className="font-display mt-1 text-xl font-semibold tracking-[-0.03em] text-[#181512]">
                            {group.group}
                          </h3>
                        </div>
                      </div>
                      <p className="font-display text-3xl font-semibold tracking-[-0.05em] text-[#181512]">
                        {group.total}
                      </p>
                    </div>

                    <div className="mt-5 rounded-[22px] border border-[#ede2d6] bg-white/80 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8f5d4d]">
                        Included categories
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[#655b53]">
                        {group.categories.join(', ')}
                      </p>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div className="rounded-[22px] border border-black/6 bg-white/76 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8f5d4d]">
                          Business meaning
                        </p>
                        <p className="mt-2 text-sm leading-6 text-[#655b53]">
                          {group.businessMeaning}
                        </p>
                      </div>
                      <div className="rounded-[22px] border border-black/6 bg-white/76 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8f5d4d]">
                          Suggested action
                        </p>
                        <p className="mt-2 text-sm leading-6 text-[#655b53]">
                          {group.action}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Panel>
        </section>

        <section id="details" className="scroll-mt-24">
          <Panel className="overflow-hidden p-0">
            <div className="border-b border-black/6 px-7 py-6 sm:px-8">
              <SectionHeader
                eyebrow="Category Detail Table"
                title="A structured complaint-theme summary for discussion and QA."
                description="This view connects each complaint theme to image-backed volume, severity mix, and the business interpretation used in the dashboard narrative."
              />
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0">
                <thead>
                  <tr className="bg-[#faf7f3] text-left">
                    {[
                      'Complaint Theme',
                      'Reviews With Images',
                      'Total Images',
                      '1-Star Images',
                      '2-Star Images',
                      '3-Star Images',
                      'Business Interpretation',
                    ].map((label) => (
                      <th
                        key={label}
                        className="border-b border-black/6 px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8f5d4d]"
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {categoryRows.map((item, index) => (
                    <tr
                      key={item.theme}
                      className={`transition hover:bg-[#fcfaf8] ${
                        index % 2 === 0 ? 'bg-white' : 'bg-[#faf7f3]'
                      }`}
                    >
                      <td className="border-b border-black/6 px-6 py-5">
                        <div className="flex items-center gap-3">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: item.fill }}
                          />
                          <div>
                            <p className="text-sm font-semibold text-[#181512]">
                              {item.theme}
                            </p>
                            <p className="text-xs text-[#655b53]">{item.share.toFixed(1)}% share</p>
                          </div>
                        </div>
                      </td>
                      <td className="border-b border-black/6 px-6 py-5 text-sm font-semibold text-[#181512]">
                        {item.totalReviews}
                      </td>
                      <td className="border-b border-black/6 px-6 py-5 text-sm text-[#655b53]">
                        {item.totalImages}
                      </td>
                      <td className="border-b border-black/6 px-6 py-5 text-sm text-[#655b53]">
                        {item.oneStarImages}
                      </td>
                      <td className="border-b border-black/6 px-6 py-5 text-sm text-[#655b53]">
                        {item.twoStarImages}
                      </td>
                      <td className="border-b border-black/6 px-6 py-5 text-sm text-[#655b53]">
                        {item.threeStarImages}
                      </td>
                      <td className="border-b border-black/6 px-6 py-5 text-sm leading-6 text-[#655b53]">
                        {item.businessInterpretation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </section>

        <section id="reviews" className="scroll-mt-24">
          <Panel className="p-7 sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <SectionHeader
                eyebrow="Review Explorer"
                title="The full low-star review table now lives on its own page."
                description="The review explorer has been moved out of the dashboard so the complete CSV-backed dataset can be browsed, filtered, searched, and paginated in a dedicated full-page experience."
              />

              <div className="rounded-[28px] border border-[#eaded2] bg-[#f8f3ed] p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8f5d4d]">
                  Full dataset view
                </p>
                <p className="mt-4 text-sm leading-7 text-[#655b53]">
                  Open the standalone reviews page to work with the real CSV dataset,
                  including filters for rating, complaint theme, verified buyer,
                  search, pagination, and row-level expansion.
                </p>
                <p className="mt-3 text-sm leading-7 text-[#655b53]">
                  CSV location:{' '}
                  <span className="font-semibold text-[#181512]">
                    public/data/lululemon_define_jacket_all_reviews.csv
                  </span>
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    to="/reviews"
                    className="inline-flex items-center gap-2 rounded-full bg-[#1f1a16] px-5 py-3 text-sm font-semibold text-white no-underline transition hover:bg-[#302720]"
                  >
                    Open Full Review Table
                    <ArrowUpRight size={16} />
                  </Link>
                  <span className="rounded-full border border-black/8 bg-white px-4 py-3 text-sm font-medium text-[#655b53]">
                    Source: <span className="font-semibold text-[#181512]">CSV in public/data</span>
                  </span>
                </div>
              </div>
            </div>
          </Panel>
        </section>

        <section id="gallery" className="scroll-mt-24">
          <Panel className="p-7 sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <SectionHeader
                eyebrow="Review Images by Category"
                title="Customer-submitted photo evidence"
                description="Browse image-level evidence directly from the review export to connect complaint themes with what customers chose to document visually."
              />

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:justify-end">
                <select
                  value={galleryThemeFilter}
                  onChange={(event) => setGalleryThemeFilter(event.target.value)}
                  className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm text-[#181512] outline-none transition focus:border-[#8f5d4d]/40 focus:ring-2 focus:ring-[#f5ede5]"
                >
                  {galleryThemeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option === allFilterValue ? 'All Complaint Themes' : option}
                    </option>
                  ))}
                </select>

                <select
                  value={galleryRatingFilter}
                  onChange={(event) => setGalleryRatingFilter(event.target.value)}
                  className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm text-[#181512] outline-none transition focus:border-[#8f5d4d]/40 focus:ring-2 focus:ring-[#f5ede5]"
                >
                  {[allFilterValue, '1', '2', '3'].map((option) => (
                    <option key={option} value={option}>
                      {option === allFilterValue ? 'All Ratings' : `${option}-Star`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 rounded-[22px] border border-black/6 bg-[#faf7f3] px-5 py-4 text-sm text-[#655b53] lg:flex-row lg:items-center lg:justify-between">
              <p className="font-medium text-[#181512]">
                {imageStats.total.toLocaleString('en-US')} total images
              </p>
              <p>
                {imageStats.oneStarCount} x 1-star | {imageStats.twoStarCount} x 2-star |{' '}
                {imageStats.threeStarCount} x 3-star
              </p>
              <p>
                Showing{' '}
                <span className="font-semibold text-[#181512]">
                  {filteredImageItems.length}
                </span>{' '}
                images
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
              {filteredImageItems.length ? (
                filteredImageItems.map((item, index) => {
                  const state = imageStateMap[item.key]

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => openLightbox(index)}
                      className="group rounded-[26px] border border-black/6 bg-white/88 p-3 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_24px_50px_-32px_rgba(34,27,21,0.45)]"
                    >
                      <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#eeded2]">
                        {state !== 'loaded' && state !== 'error' ? (
                          <div className="absolute inset-0 animate-pulse bg-[#eeded2]" />
                        ) : null}

                        {state === 'error' ? (
                          <ImagePlaceholder label="Image unavailable" />
                        ) : (
                          <img
                            src={item.imageUrl}
                            alt={item.reviewTitle}
                            loading="lazy"
                            onLoad={() => markImageLoaded(item.key)}
                            onError={() => markImageError(item.key)}
                            className={`h-full w-full object-cover transition duration-300 group-hover:scale-[1.03] ${
                              state === 'loaded' ? 'opacity-100' : 'opacity-0'
                            }`}
                          />
                        )}

                        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 text-white opacity-0 transition duration-200 group-hover:opacity-100">
                          <div className="flex items-center justify-between gap-3">
                            <p className="line-clamp-2 text-sm font-semibold leading-5">
                              {item.reviewTitle}
                            </p>
                            <div className="rounded-full bg-white/16 p-2 backdrop-blur-sm">
                              <Search size={15} />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <RatingBadge rating={item.rating} compact />
                        <span className="rounded-full bg-[#f5ede5] px-3 py-1 text-[11px] font-semibold text-[#8f5d4d]">
                          {item.complaintTheme}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#faf7f3] px-3 py-1 text-[11px] font-medium text-[#655b53]">
                          <ThumbsUp size={12} />
                          {item.helpfulVotes}
                        </span>
                      </div>
                    </button>
                  )
                })
              ) : (
                <div className="col-span-full rounded-[26px] border border-black/6 bg-white/90 px-6 py-10 text-center text-sm text-[#655b53]">
                  No images match the selected filters.
                </div>
              )}
            </div>
          </Panel>
        </section>

        <footer className="px-1 pb-4 pt-2 text-xs uppercase tracking-[0.18em] text-[#8b7b70]">
          lululemon Review Intelligence Dashboard
        </footer>
      </main>

      {lightboxItem ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 sm:p-6"
          onClick={closeLightbox}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={lightboxItem.reviewTitle}
            className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-[30px] border border-black/10 bg-[#faf7f3] shadow-[0_35px_90px_-30px_rgba(0,0,0,0.45)]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute right-4 top-4 z-10 rounded-full border border-black/10 bg-white/90 p-2 text-[#655b53] transition hover:bg-[#f5ede5] hover:text-[#181512]"
              aria-label="Close lightbox"
            >
              <X size={18} />
            </button>

            <button
              type="button"
              onClick={goToPreviousImage}
              disabled={activeLightboxIndex === 0}
              className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/55 p-2 text-white transition hover:bg-black/75 disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              type="button"
              onClick={goToNextImage}
              disabled={activeLightboxIndex === filteredImageItems.length - 1}
              className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/55 p-2 text-white transition hover:bg-black/75 disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Next image"
            >
              <ChevronRight size={20} />
            </button>

            <div className="grid max-h-[90vh] overflow-y-auto lg:grid-cols-[1fr_1fr]">
              <div className="relative flex min-h-[300px] items-center justify-center bg-black p-4">
                {imageStateMap[lightboxItem.key] === 'error' ? (
                  <div className="relative h-full min-h-[260px] w-full">
                    <ImagePlaceholder iconSize={34} label="Image unavailable" />
                  </div>
                ) : (
                  <>
                    {imageStateMap[lightboxItem.key] !== 'loaded' ? (
                      <div className="absolute inset-4 animate-pulse rounded-2xl bg-[#eeded2]" />
                    ) : null}
                    <div className="relative">
                      <img
                        src={lightboxItem.imageUrl}
                        alt={lightboxItem.reviewTitle}
                        title="Click to enlarge"
                        onLoad={() => markImageLoaded(lightboxItem.key)}
                        onError={() => markImageError(lightboxItem.key)}
                        onClick={(event) => {
                          event.stopPropagation()
                          setZoomedImage(lightboxItem.imageUrl)
                        }}
                        className={`max-h-[70vh] w-full cursor-zoom-in object-contain transition ${
                          imageStateMap[lightboxItem.key] === 'loaded'
                            ? 'opacity-100'
                            : 'opacity-0'
                        }`}
                      />
                      <div className="pointer-events-none absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-white">
                        <ZoomIn size={11} />
                        <span className="text-[10px] font-medium">Enlarge</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="max-h-[70vh] overflow-y-auto p-6 sm:p-7">
                <div className="flex flex-wrap items-center gap-2 pr-10">
                  <RatingBadge rating={lightboxItem.rating} />
                  <span className="rounded-full bg-[#f5ede5] px-3 py-1 text-xs font-semibold text-[#8f5d4d]">
                    {lightboxItem.complaintTheme}
                  </span>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#655b53]">
                    {lightboxItem.dateLabel}
                  </span>
                </div>

                <h3 className="font-display mt-5 text-2xl font-semibold tracking-[-0.04em] text-[#181512]">
                  {lightboxItem.reviewTitle}
                </h3>

                <div className="mt-5 flex flex-wrap gap-2 text-xs text-[#655b53]">
                  <span className="rounded-full border border-black/10 bg-white px-3 py-1">
                    Verified buyer: {lightboxItem.verifiedBuyer ? 'Yes' : 'No'}
                  </span>
                  <span className="rounded-full border border-black/10 bg-white px-3 py-1">
                    Helpful votes: {lightboxItem.helpfulVotes}
                  </span>
                  {hasValue(lightboxItem.sizePurchased) ? (
                    <span className="rounded-full border border-black/10 bg-white px-3 py-1">
                      Size: {lightboxItem.sizePurchased}
                    </span>
                  ) : null}
                  {hasValue(lightboxItem.fitFeedback) ? (
                    <span className="rounded-full border border-black/10 bg-white px-3 py-1">
                      Fit: {lightboxItem.fitFeedback}
                    </span>
                  ) : null}
                </div>

                <div className="mt-6 rounded-[22px] border border-black/6 bg-white p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8f5d4d]">
                    Full review text
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[#655b53]">
                    {lightboxItem.reviewText}
                  </p>
                </div>

                <div className="mt-4 rounded-[22px] border border-[#eaded2] bg-[#f5ede5] p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8f5d4d]">
                    Business insight
                  </p>
                  <p className="mt-3 text-sm italic leading-7 text-[#5f5750]">
                    {lightboxItem.businessInsight}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {zoomedImage ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95"
          onClick={() => setZoomedImage(null)}
        >
          <img
            src={zoomedImage}
            alt="Enlarged review photo"
            className="max-h-screen max-w-full object-contain p-4"
            onClick={(event) => event.stopPropagation()}
          />
          <button
            type="button"
            onClick={() => setZoomedImage(null)}
            className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/30"
          >
            <X size={18} />
          </button>
          <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-[11px] text-white/40 tracking-widest uppercase">
            Click anywhere to close
          </p>
        </div>
      ) : null}
    </div>
  )
}

export default App
