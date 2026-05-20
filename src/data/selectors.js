import {
  ALL_FILTER_VALUE,
  LOW_STAR_RATINGS,
  businessGroupBlueprints,
  pageMetadata,
  severityPalette,
  themeDetailCopy,
  themeKeywordMap,
  themePalette,
  trendPalette,
} from './constants'

export function safeNumber(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export function hasValue(value) {
  return value !== null && value !== undefined && String(value).trim() !== ''
}

export function normalizeTruth(value) {
  if (!hasValue(value)) {
    return false
  }

  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'number') {
    return value === 1
  }

  return ['true', 'yes', 'y', '1', 'verified'].includes(
    String(value).trim().toLowerCase(),
  )
}

export function normalizeOptionalTruth(value) {
  if (!hasValue(value)) {
    return null
  }

  return normalizeTruth(value)
}

export function normalizeId(value) {
  return hasValue(value) ? String(value).trim() : ''
}

export function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function formatShortDate(value) {
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

export function formatMonthLabel(value) {
  if (!hasValue(value)) {
    return 'Unknown'
  }

  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) {
    return String(value).slice(0, 7)
  }

  return parsedDate.toLocaleDateString('en-US', {
    month: 'short',
    year: '2-digit',
  })
}

export function truncateText(value, maxLength = 140) {
  if (!hasValue(value)) {
    return 'No review text available.'
  }

  const text = String(value).trim()
  if (text.length <= maxLength) {
    return text
  }

  return `${text.slice(0, maxLength).trim()}...`
}

export function shortThemeLabel(value) {
  const labelMap = {
    'Fabric & Material Quality': 'Fabric & Material',
    'Color & Product Description': 'Color & Description',
    'Shipping & Delivery': 'Shipping',
    'Stitching & Construction': 'Stitching',
    'Product Cleanliness': 'Cleanliness',
  }

  return labelMap[value] || value
}

export function ratingBadgeClassName() {
  return 'text-white'
}

export function parseUrlList(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean).map(String)
  }

  if (!hasValue(value)) {
    return []
  }

  const text = String(value).trim()
  if (text === '[]') {
    return []
  }

  if (text.startsWith('[') && text.endsWith(']')) {
    try {
      const normalized = text.replace(/'/g, '"')
      const parsed = JSON.parse(normalized)
      return Array.isArray(parsed) ? parsed.filter(Boolean).map(String) : []
    } catch {
      return text
        .slice(1, -1)
        .split(',')
        .map((item) => item.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean)
    }
  }

  return text
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export function mergeUniqueValues(...collections) {
  return [...new Set(collections.flat().filter(Boolean))]
}

export function pickFirstValue(...values) {
  for (const value of values) {
    if (hasValue(value)) {
      return value
    }
  }

  return ''
}

function scoreThemeMatch(text, keywords) {
  const haystack = text.toLowerCase()
  return keywords.reduce((score, keyword) => {
    if (haystack.includes(keyword)) {
      return score + keyword.split(' ').length + 1
    }

    return score
  }, 0)
}

export function inferComplaintTheme({ title, reviewText }) {
  const combined = `${title || ''} ${reviewText || ''}`.trim()
  if (!combined) {
    return 'Other'
  }

  const scores = Object.entries(themeKeywordMap).map(([theme, keywords]) => ({
    theme,
    score: scoreThemeMatch(combined, keywords),
  }))

  scores.sort((left, right) => right.score - left.score)
  return scores[0]?.score ? scores[0].theme : 'Other'
}

function normalizeProducts(products = []) {
  return products.map((item) => ({
    productName: pickFirstValue(item.product_name, item.productName),
    productId: pickFirstValue(item.product_id, item.productId),
    productNameId: pickFirstValue(item.productNameId, item.product_name_id),
    productUrl: pickFirstValue(item.product_url, item.productUrl),
    category: pickFirstValue(item.category, item.product_category),
  }))
}

function normalizeReviews(reviews = []) {
  return reviews
    .map((review, index) => {
      const title = pickFirstValue(review.review_title, review.title)
      const reviewText = pickFirstValue(review.review_text, review.text)
      const complaintTheme =
        pickFirstValue(review.complaint_theme, review.complaintTheme) ||
        inferComplaintTheme({ title, reviewText })

      return {
        key: `${pickFirstValue(review.product_id, review.productId)}-${normalizeId(review.review_id || review.reviewId || index)}`,
        productName: pickFirstValue(review.product_name, review.productName),
        productId: pickFirstValue(review.product_id, review.productId),
        productNameId: pickFirstValue(review.productNameId, review.product_name_id),
        productUrl: pickFirstValue(review.product_url, review.productUrl),
        category: pickFirstValue(review.category, review.product_category),
        reviewId: normalizeId(review.review_id || review.reviewId || index),
        rating: safeNumber(review.rating),
        title: title || 'Untitled review',
        reviewText: reviewText || 'No review text available.',
        reviewDate: pickFirstValue(review.review_date, review.submission_time, review.created_at),
        dateLabel: formatShortDate(
          pickFirstValue(review.review_date, review.submission_time, review.created_at),
        ),
        monthKey: hasValue(
          pickFirstValue(review.review_date, review.submission_time, review.created_at),
        )
          ? String(
              pickFirstValue(review.review_date, review.submission_time, review.created_at),
            ).slice(0, 7)
          : '',
        reviewerNameOrId: pickFirstValue(
          review.reviewer_name_or_id,
          review.author,
          review.reviewerNameOrId,
        ),
        complaintTheme,
        businessInsight:
          pickFirstValue(review.business_insight, review.businessInsight) ||
          themeDetailCopy[complaintTheme]?.action ||
          '',
        helpfulVotes: safeNumber(pickFirstValue(review.helpful_votes, review.likes)),
        verifiedBuyer:
          normalizeOptionalTruth(
            pickFirstValue(review.verified_buyer, review.is_verified_buyer),
          ) ?? false,
        reviewerLocation: pickFirstValue(
          review.reviewer_location,
          review.reviewerLocation,
          review.location,
        ),
        fitFeedback: pickFirstValue(review.fit_feedback, review.fitFeedback),
        sizePurchased: pickFirstValue(review.size_purchased, review.sizePurchased),
        usualSize: pickFirstValue(review.usual_size, review.usualSize),
        color: pickFirstValue(review.color, review.product_color),
        height: safeNumber(review.height) || null,
        weight: safeNumber(review.weight) || null,
        badge: pickFirstValue(review.badge, review.incentivized_review_label),
        photoCount: Math.max(
          safeNumber(review.photo_count),
          parseUrlList(review.photo_urls).length,
        ),
        imageUrls: mergeUniqueValues(
          parseUrlList(review.photo_urls),
          parseUrlList(review.photo_thumbnails),
        ),
        photoThumbnails: parseUrlList(review.photo_thumbnails),
        totalComments: safeNumber(review.total_comments),
        luluResponseAuthor: pickFirstValue(
          review.lulu_response_author,
          review.luluResponseAuthor,
        ),
        luluResponseText: pickFirstValue(review.lulu_response_text, review.luluResponseText),
        luluResponseTime: pickFirstValue(review.lulu_response_time, review.luluResponseDate),
        scrapedAt: pickFirstValue(review.scraped_at, review.scrapedAt),
      }
    })
    .filter((review) => LOW_STAR_RATINGS.includes(review.rating))
}

function normalizeImages(images = []) {
  return images.map((item, index) => ({
    key: `${pickFirstValue(item.product_id, item.productId)}-${normalizeId(item.review_id || item.reviewId || 'image')}-${pickFirstValue(item.photo_id, item.photoId, item.photo_number, index)}`,
    productName: pickFirstValue(item.product_name, item.productName),
    productId: pickFirstValue(item.product_id, item.productId),
    productNameId: pickFirstValue(item.productNameId, item.product_name_id),
    productUrl: pickFirstValue(item.product_url, item.productUrl),
    category: pickFirstValue(item.category, item.product_category),
    reviewId: normalizeId(item.review_id || item.reviewId),
    rating: safeNumber(item.rating),
    reviewDate: pickFirstValue(item.review_date, item.reviewDate),
    dateLabel: formatShortDate(pickFirstValue(item.review_date, item.reviewDate)),
    reviewTitle: pickFirstValue(item.review_title, item.reviewTitle) || 'Untitled review',
    reviewText: pickFirstValue(item.review_text, item.reviewText) || 'No review text available.',
    complaintTheme: pickFirstValue(item.complaint_theme, item.complaintTheme) || 'Other',
    businessInsight:
      pickFirstValue(item.business_insight, item.businessInsight) ||
      themeDetailCopy[pickFirstValue(item.complaint_theme, item.complaintTheme)]?.action ||
      '',
    photoId: normalizeId(item.photo_id || item.photoId || item.photo_number || index + 1),
    photoNumber: safeNumber(item.photo_number || index + 1),
    imageUrl: pickFirstValue(item.image_url, item.imageUrl),
    thumbnailUrl: pickFirstValue(item.thumbnail_url, item.thumbnailUrl, item.image_url, item.imageUrl),
    localImagePath: pickFirstValue(item.local_image_path, item.localImagePath),
    verifiedBuyer:
      normalizeOptionalTruth(
        pickFirstValue(item.verified_buyer, item.verifiedBuyer),
      ) ?? false,
    helpfulVotes: safeNumber(pickFirstValue(item.helpful_votes, item.helpfulVotes)),
    sizePurchased: pickFirstValue(item.size_purchased, item.sizePurchased),
    fitFeedback: pickFirstValue(item.fit_feedback, item.fitFeedback),
    imageExists:
      normalizeOptionalTruth(pickFirstValue(item.image_exists, item.imageExists)) ?? true,
  }))
}

function normalizeCategorySummary(categorySummary = []) {
  return categorySummary.map((item) => ({
    productName: pickFirstValue(item.product_name, item.productName),
    productId: pickFirstValue(item.product_id, item.productId),
    productNameId: pickFirstValue(item.productNameId, item.product_name_id),
    category: pickFirstValue(item.category, item.product_category),
    complaintTheme: pickFirstValue(item.complaint_theme, item.complaintTheme) || 'Other',
    totalReviews: safeNumber(pickFirstValue(item.total_reviews, item.totalReviews)),
    oneStar: safeNumber(pickFirstValue(item.one_star, item.oneStar)),
    twoStar: safeNumber(pickFirstValue(item.two_star, item.twoStar)),
    threeStar: safeNumber(pickFirstValue(item.three_star, item.threeStar)),
    sharePercentage: safeNumber(
      pickFirstValue(item.share_percentage, item.sharePercentage),
    ),
  }))
}

function normalizeProductSummaries(productSummary = []) {
  return productSummary.map((item) => ({
    productName: pickFirstValue(item.product_name, item.productName),
    productId: pickFirstValue(item.product_id, item.productId),
    productNameId: pickFirstValue(item.productNameId, item.product_name_id),
    productUrl: pickFirstValue(item.product_url, item.productUrl),
    category: pickFirstValue(item.category, item.product_category),
    totalReviews: safeNumber(pickFirstValue(item.total_reviews, item.totalReviews)),
    lowStarReviews: safeNumber(pickFirstValue(item.low_star_reviews, item.lowStarReviews)),
    oneStarReviews: safeNumber(pickFirstValue(item.one_star_reviews, item.oneStarReviews)),
    twoStarReviews: safeNumber(pickFirstValue(item.two_star_reviews, item.twoStarReviews)),
    threeStarReviews: safeNumber(
      pickFirstValue(item.three_star_reviews, item.threeStarReviews),
    ),
    reviewsWithImages: safeNumber(
      pickFirstValue(item.reviews_with_images, item.reviewsWithImages),
    ),
    totalImages: safeNumber(pickFirstValue(item.total_images, item.totalImages)),
    averageRating: safeNumber(pickFirstValue(item.average_rating, item.averageRating)),
    topComplaintTheme: pickFirstValue(item.top_complaint_theme, item.topComplaintTheme),
    topComplaintShare: safeNumber(
      pickFirstValue(item.top_complaint_share, item.topComplaintShare),
    ),
  }))
}

function filterByProductId(records = [], selectedProductId = 'all') {
  if (selectedProductId === 'all') {
    return records
  }

  return records.filter((record) => record.productId === selectedProductId)
}

function buildThemeRows(categoryRows = [], reviews = [], images = []) {
  const themeSet = new Set([
    ...categoryRows.map((row) => row.complaintTheme),
    ...reviews.map((row) => row.complaintTheme),
    ...images.map((row) => row.complaintTheme),
  ])

  const totalLowStarReviews = reviews.length
  const imageReviewSets = new Map()
  images.forEach((item) => {
    if (!imageReviewSets.has(item.complaintTheme)) {
      imageReviewSets.set(item.complaintTheme, new Set())
    }
    imageReviewSets.get(item.complaintTheme).add(item.reviewId)
  })

  const totalImageBackedReviews = new Set(images.map((item) => item.reviewId)).size

  const rows = [...themeSet]
    .filter(Boolean)
    .map((theme) => {
      const categoryRow = categoryRows.find((row) => row.complaintTheme === theme)
      const themedReviews = reviews.filter((review) => review.complaintTheme === theme)
      const themedImages = images.filter((image) => image.complaintTheme === theme)
      const imageBackedReviewCount = imageReviewSets.get(theme)?.size || 0

      return {
        theme,
        slug: slugify(theme),
        shortTheme: shortThemeLabel(theme),
        totalReviews: categoryRow?.totalReviews || themedReviews.length,
        totalReviewsWithImages: imageBackedReviewCount,
        totalImages: themedImages.length,
        oneStarImages: themedImages.filter((image) => image.rating === 1).length,
        twoStarImages: themedImages.filter((image) => image.rating === 2).length,
        threeStarImages: themedImages.filter((image) => image.rating === 3).length,
        businessInterpretation:
          themeDetailCopy[theme]?.action || 'No interpretation available yet.',
        share:
          totalLowStarReviews > 0
            ? (themedReviews.length / totalLowStarReviews) * 100
            : categoryRow?.sharePercentage || 0,
        overallShare:
          totalLowStarReviews > 0 ? (themedReviews.length / totalLowStarReviews) * 100 : 0,
        imageBackedShare:
          totalImageBackedReviews > 0
            ? (imageBackedReviewCount / totalImageBackedReviews) * 100
            : 0,
      }
    })
    .sort((left, right) => right.totalReviews - left.totalReviews)
    .map((row, index) => ({
      ...row,
      fill: themePalette[index % themePalette.length],
    }))

  return rows
}

export function getThemePercentage(records = [], theme) {
  if (!records.length || !hasValue(theme)) {
    return 0
  }

  const count = records.filter((record) => record.complaintTheme === theme).length
  return (count / records.length) * 100
}

export function getTopComplaintTheme(records = []) {
  if (!records.length) {
    return null
  }

  const counts = new Map()
  records.forEach((record) => {
    counts.set(record.complaintTheme, (counts.get(record.complaintTheme) || 0) + 1)
  })

  const [theme, count] =
    [...counts.entries()].sort((left, right) => right[1] - left[1])[0] || []

  if (!theme) {
    return null
  }

  return {
    theme,
    count,
    share: getThemePercentage(records, theme),
  }
}

export function getTopImageBackedTheme(images = []) {
  if (!images.length) {
    return null
  }

  const grouped = new Map()
  images.forEach((image) => {
    if (!grouped.has(image.complaintTheme)) {
      grouped.set(image.complaintTheme, new Set())
    }

    grouped.get(image.complaintTheme).add(image.reviewId)
  })

  const totalImageBackedReviews = new Set(images.map((image) => image.reviewId)).size
  const [theme, reviewSet] =
    [...grouped.entries()].sort((left, right) => right[1].size - left[1].size)[0] || []

  if (!theme) {
    return null
  }

  return {
    theme,
    count: reviewSet.size,
    share: totalImageBackedReviews ? (reviewSet.size / totalImageBackedReviews) * 100 : 0,
  }
}

export function buildBusinessGroups(themeRows = []) {
  const totalReviews = themeRows.reduce((sum, item) => sum + item.totalReviews, 0)

  return businessGroupBlueprints.map((blueprint) => {
    const memberThemes = themeRows.filter((item) => blueprint.categories.includes(item.theme))
    const total = memberThemes.reduce((sum, item) => sum + item.totalReviews, 0)
    const totalImages = memberThemes.reduce((sum, item) => sum + item.totalImages, 0)

    return {
      ...blueprint,
      total,
      totalImages,
      share: totalReviews ? (total / totalReviews) * 100 : 0,
      themes: memberThemes,
    }
  })
}

export function buildRatingsDistribution(reviews = []) {
  return LOW_STAR_RATINGS.map((rating) => ({
    label: `${rating}-Star`,
    count: reviews.filter((review) => review.rating === rating).length,
    fill: severityPalette[rating],
  }))
}

export function buildMonthlyTrendSeries(reviews = []) {
  const rows = new Map()

  reviews.forEach((review) => {
    const monthKey = review.monthKey || 'Unknown'
    if (!rows.has(monthKey)) {
      rows.set(monthKey, {
        monthKey,
        label: formatMonthLabel(`${monthKey}-01`),
        oneStar: 0,
        twoStar: 0,
        threeStar: 0,
        total: 0,
        ratingSum: 0,
      })
    }

    const row = rows.get(monthKey)
    row.total += 1
    row.ratingSum += review.rating
    if (review.rating === 1) row.oneStar += 1
    if (review.rating === 2) row.twoStar += 1
    if (review.rating === 3) row.threeStar += 1
  })

  return [...rows.values()]
    .sort((left, right) => left.monthKey.localeCompare(right.monthKey))
    .map((row) => ({
      ...row,
      averageRating: row.total ? Number((row.ratingSum / row.total).toFixed(2)) : 0,
    }))
}

export function buildRollingAverageSeries(monthlyTrend = []) {
  return monthlyTrend.map((row, index) => {
    const slice = monthlyTrend.slice(Math.max(0, index - 2), index + 1)
    const total = slice.reduce((sum, item) => sum + item.total, 0)
    const weightedRating = slice.reduce(
      (sum, item) => sum + item.averageRating * item.total,
      0,
    )

    return {
      ...row,
      rollingAverage: total ? Number((weightedRating / total).toFixed(2)) : row.averageRating,
    }
  })
}

export function buildThemeShareByMonth(reviews = [], topThemes = []) {
  const selectedThemes =
    topThemes.length > 0
      ? topThemes
      : [...new Set(reviews.map((review) => review.complaintTheme))].slice(0, 5)

  const rows = new Map()

  reviews.forEach((review) => {
    const monthKey = review.monthKey || 'Unknown'
    if (!rows.has(monthKey)) {
      rows.set(monthKey, {
        monthKey,
        label: formatMonthLabel(`${monthKey}-01`),
      })
    }

    const row = rows.get(monthKey)
    selectedThemes.forEach((theme) => {
      if (!Object.prototype.hasOwnProperty.call(row, theme)) {
        row[theme] = 0
      }
    })

    row[review.complaintTheme] = (row[review.complaintTheme] || 0) + 1
  })

  return [...rows.values()].sort((left, right) => left.monthKey.localeCompare(right.monthKey))
}

export function buildResponseMetrics(reviews = []) {
  const responded = reviews.filter((review) => hasValue(review.luluResponseText))
  const responseRate = reviews.length ? (responded.length / reviews.length) * 100 : 0

  const latencyHours = responded
    .map((review) => {
      const submitted = new Date(review.reviewDate).getTime()
      const respondedAt = new Date(review.luluResponseTime).getTime()
      if (Number.isNaN(submitted) || Number.isNaN(respondedAt)) {
        return null
      }

      return (respondedAt - submitted) / (1000 * 60 * 60)
    })
    .filter((value) => value !== null && value >= 0)
    .sort((left, right) => left - right)

  const medianLatency =
    latencyHours.length === 0
      ? 0
      : latencyHours.length % 2 === 1
        ? latencyHours[Math.floor(latencyHours.length / 2)]
        : (latencyHours[latencyHours.length / 2 - 1] + latencyHours[latencyHours.length / 2]) / 2

  const latencyBuckets = [
    { label: '<24h', min: 0, max: 24 },
    { label: '24-72h', min: 24, max: 72 },
    { label: '3-7d', min: 72, max: 168 },
    { label: '7d+', min: 168, max: Number.POSITIVE_INFINITY },
  ].map((bucket) => ({
    ...bucket,
    count: latencyHours.filter((value) => value >= bucket.min && value < bucket.max).length,
  }))

  const authors = new Map()
  const byTheme = new Map()

  responded.forEach((review) => {
    const author = review.luluResponseAuthor || 'Unknown responder'
    authors.set(author, (authors.get(author) || 0) + 1)
    byTheme.set(review.complaintTheme, (byTheme.get(review.complaintTheme) || 0) + 1)
  })

  return {
    responseRate,
    respondedCount: responded.length,
    medianLatency,
    latencyBuckets,
    topAuthors: [...authors.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 8),
    responseByTheme: [...byTheme.entries()]
      .map(([theme, count]) => ({ theme, count }))
      .sort((left, right) => right.count - left.count),
    sampleExchanges: responded.slice(0, 4),
  }
}

export function buildPhotoBackedStats(reviews = [], images = []) {
  const imageBackedReviewCount = new Set(images.map((image) => image.reviewId)).size
  return {
    count: imageBackedReviewCount,
    share: reviews.length ? (imageBackedReviewCount / reviews.length) * 100 : 0,
  }
}

export function buildFitFeedbackDistribution(reviews = []) {
  const counts = new Map()

  reviews.forEach((review) => {
    const label = hasValue(review.fitFeedback) ? review.fitFeedback : 'Not specified'
    counts.set(label, (counts.get(label) || 0) + 1)
  })

  return [...counts.entries()]
    .map(([label, count], index) => ({
      label,
      count,
      fill: themePalette[index % themePalette.length],
    }))
    .sort((left, right) => right.count - left.count)
}

export function buildSizeDistribution(reviews = []) {
  const counts = new Map()

  reviews.forEach((review) => {
    if (!hasValue(review.sizePurchased)) {
      return
    }

    const label = String(review.sizePurchased)
    counts.set(label, (counts.get(label) || 0) + 1)
  })

  return [...counts.entries()]
    .map(([size, count]) => ({ size, count }))
    .sort((left, right) => safeNumber(left.size) - safeNumber(right.size))
}

export function buildSizeDeltaPoints(reviews = []) {
  return reviews
    .filter((review) => hasValue(review.sizePurchased) && hasValue(review.usualSize))
    .map((review, index) => ({
      id: `${review.reviewId}-${index}`,
      purchased: safeNumber(review.sizePurchased),
      usual: safeNumber(review.usualSize),
      rating: review.rating,
      complaintTheme: review.complaintTheme,
      title: review.title,
    }))
    .filter((point) => point.purchased || point.usual)
}

export function buildHeightWeightPoints(reviews = []) {
  return reviews
    .filter((review) => review.height && review.weight)
    .map((review, index) => ({
      id: `${review.reviewId}-${index}`,
      height: review.height,
      weight: review.weight,
      fitFeedback: review.fitFeedback || 'Not specified',
      rating: review.rating,
      title: review.title,
    }))
}

export function buildFitByTheme(reviews = []) {
  const rows = new Map()

  reviews.forEach((review) => {
    if (!rows.has(review.complaintTheme)) {
      rows.set(review.complaintTheme, {
        theme: review.complaintTheme,
        total: 0,
        trueToSize: 0,
        runsSmall: 0,
        runsLarge: 0,
        tooTight: 0,
      })
    }

    const row = rows.get(review.complaintTheme)
    row.total += 1
    const feedback = (review.fitFeedback || '').toLowerCase()
    if (feedback.includes('true')) row.trueToSize += 1
    else if (feedback.includes('small')) row.runsSmall += 1
    else if (feedback.includes('large')) row.runsLarge += 1
    else if (feedback.includes('tight')) row.tooTight += 1
  })

  return [...rows.values()].sort((left, right) => right.total - left.total).slice(0, 6)
}

export function buildLocationRows(reviews = []) {
  const counts = new Map()

  reviews.forEach((review) => {
    if (!hasValue(review.reviewerLocation)) {
      return
    }

    counts.set(review.reviewerLocation, (counts.get(review.reviewerLocation) || 0) + 1)
  })

  return [...counts.entries()]
    .map(([location, count]) => ({ location, count }))
    .sort((left, right) => right.count - left.count)
}

export function buildThemeByRegion(reviews = []) {
  const rows = new Map()

  reviews.forEach((review) => {
    if (!hasValue(review.reviewerLocation)) {
      return
    }

    if (!rows.has(review.reviewerLocation)) {
      rows.set(review.reviewerLocation, { location: review.reviewerLocation })
    }

    const row = rows.get(review.reviewerLocation)
    row[review.complaintTheme] = (row[review.complaintTheme] || 0) + 1
  })

  return [...rows.values()]
}

export function extractKeywords(reviews = []) {
  const stopwords = new Set([
    'the',
    'and',
    'that',
    'this',
    'with',
    'have',
    'from',
    'were',
    'after',
    'they',
    'their',
    'there',
    'about',
    'because',
    'would',
    'could',
    'very',
    'really',
    'just',
    'into',
    'them',
    'then',
    'when',
    'what',
    'been',
    'only',
    'more',
    'than',
    'your',
    'wear',
    'wore',
    'jacket',
    'define',
    'lululemon',
  ])

  const counts = new Map()

  reviews.forEach((review) => {
    const tokens = `${review.title} ${review.reviewText}`
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((token) => token.length > 2 && !stopwords.has(token))

    tokens.forEach((token) => {
      counts.set(token, (counts.get(token) || 0) + 1)
    })
  })

  const maxCount = Math.max(...counts.values(), 1)
  return [...counts.entries()]
    .map(([word, count]) => ({
      word,
      count,
      size: 0.95 + (count / maxCount) * 1.45,
    }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 20)
}

export function buildSearchIndex({ reviews = [] }) {
  const routeEntries = Object.values(pageMetadata).map((page) => ({
    group: 'Pages',
    label: page.title,
    description: page.title,
    path: page.path,
  }))

  const reviewEntries = reviews.slice(0, 120).map((review) => ({
    group: 'Reviews',
    label: review.title || `Review ${review.reviewId}`,
    description: `${review.productName} • ${review.complaintTheme} • ${truncateText(review.reviewText, 90)}`,
    path: `/reviews?id=${review.reviewId}`,
  }))

  return [...routeEntries, ...reviewEntries]
}

export function filterSearchIndex(index = [], query = '') {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) {
    return index.slice(0, 16)
  }

  return index
    .filter((item) =>
      `${item.label} ${item.description}`.toLowerCase().includes(normalizedQuery),
    )
    .slice(0, 18)
}

export function filterReviews(reviews = [], filters = {}) {
  const {
    rating = ALL_FILTER_VALUE,
    themes = [],
    verified = ALL_FILTER_VALUE,
    from = '',
    to = '',
    query = '',
  } = filters

  const normalizedQuery = query.trim().toLowerCase()
  const fromTime = hasValue(from) ? new Date(from).getTime() : null
  const toTime = hasValue(to) ? new Date(to).getTime() : null

  return reviews.filter((review) => {
    const reviewTime = new Date(review.reviewDate).getTime()
    const matchesRating = rating === ALL_FILTER_VALUE || String(review.rating) === String(rating)
    const matchesTheme = themes.length === 0 || themes.includes(review.complaintTheme)
    const matchesVerified =
      verified === ALL_FILTER_VALUE ||
      (verified === 'true' && review.verifiedBuyer === true) ||
      (verified === 'false' && review.verifiedBuyer === false)
    const matchesFrom = fromTime === null || (!Number.isNaN(reviewTime) && reviewTime >= fromTime)
    const matchesTo = toTime === null || (!Number.isNaN(reviewTime) && reviewTime <= toTime)
    const matchesQuery =
      !normalizedQuery ||
      `${review.title} ${review.reviewText} ${review.reviewId} ${review.complaintTheme} ${review.productName}`
        .toLowerCase()
        .includes(normalizedQuery)

    return (
      matchesRating &&
      matchesTheme &&
      matchesVerified &&
      matchesFrom &&
      matchesTo &&
      matchesQuery
    )
  })
}

export function sortReviews(reviews = [], sortBy = 'newest') {
  const items = [...reviews]

  items.sort((left, right) => {
    const leftDate = new Date(left.reviewDate).getTime()
    const rightDate = new Date(right.reviewDate).getTime()

    if (sortBy === 'oldest') {
      return leftDate - rightDate
    }

    if (sortBy === 'helpful') {
      return right.helpfulVotes - left.helpfulVotes
    }

    if (sortBy === 'lowest-rating') {
      return left.rating - right.rating || rightDate - leftDate
    }

    return rightDate - leftDate
  })

  return items
}

export function filterGalleryItems(items = [], filters = {}) {
  const {
    rating = ALL_FILTER_VALUE,
    theme = ALL_FILTER_VALUE,
    verified = ALL_FILTER_VALUE,
    size = ALL_FILTER_VALUE,
    from = '',
    to = '',
    sortBy = 'newest',
  } = filters

  const fromTime = hasValue(from) ? new Date(from).getTime() : null
  const toTime = hasValue(to) ? new Date(to).getTime() : null

  const filtered = items.filter((item) => {
    const imageTime = new Date(item.reviewDate).getTime()
    const matchesRating = rating === ALL_FILTER_VALUE || String(item.rating) === String(rating)
    const matchesTheme = theme === ALL_FILTER_VALUE || item.complaintTheme === theme
    const matchesVerified =
      verified === ALL_FILTER_VALUE ||
      (verified === 'true' && item.verifiedBuyer === true) ||
      (verified === 'false' && item.verifiedBuyer === false)
    const matchesSize = size === ALL_FILTER_VALUE || item.sizePurchased === size
    const matchesFrom = fromTime === null || (!Number.isNaN(imageTime) && imageTime >= fromTime)
    const matchesTo = toTime === null || (!Number.isNaN(imageTime) && imageTime <= toTime)

    return (
      matchesRating &&
      matchesTheme &&
      matchesVerified &&
      matchesSize &&
      matchesFrom &&
      matchesTo
    )
  })

  filtered.sort((left, right) => {
    if (sortBy === 'helpful') {
      return right.helpfulVotes - left.helpfulVotes
    }

    return new Date(right.reviewDate).getTime() - new Date(left.reviewDate).getTime()
  })

  return filtered
}

export function buildInsightRows(groupRows = [], themeRows = []) {
  return businessGroupBlueprints.map((group, index) => {
    const groupMetrics = groupRows.find((row) => row.slug === group.slug)
    return {
      ...group,
      total: groupMetrics?.total || 0,
      share: groupMetrics?.share || 0,
      supportingThemes: themeRows.filter((theme) => group.categories.includes(theme.theme)),
      severityScore: Number((((groupMetrics?.share || 0) / 100) * 5).toFixed(1)),
      impact: index < 2 ? 'High' : 'Medium',
      effort: index === 0 ? 'Medium' : index === 1 ? 'Low' : 'Medium',
    }
  })
}

export function buildRecommendationMatrix(recommendations = []) {
  const impactScale = { Low: 1, Medium: 2, High: 3 }
  const effortScale = { Low: 1, Medium: 2, High: 3 }

  return recommendations.map((recommendation) => ({
    ...recommendation,
    x: effortScale[recommendation.effort] || 2,
    y: impactScale[recommendation.impact] || 2,
  }))
}

export function highlightMatch(text, query) {
  if (!query.trim()) {
    return [{ match: false, text }]
  }

  const normalizedText = String(text)
  const normalizedQuery = query.trim()
  const regex = new RegExp(`(${normalizedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig')

  return normalizedText.split(regex).filter(Boolean).map((segment) => ({
    match: segment.toLowerCase() === normalizedQuery.toLowerCase(),
    text: segment,
  }))
}

export function getThemeOptions(reviews = []) {
  return [...new Set(reviews.map((review) => review.complaintTheme).filter(Boolean))].sort()
}

export function getGallerySizeOptions(items = []) {
  return [...new Set(items.map((item) => item.sizePurchased).filter(Boolean))].sort(
    (left, right) => safeNumber(left) - safeNumber(right),
  )
}

function buildProductComparisonRows(productSummaryRows = []) {
  return [...productSummaryRows].sort((left, right) => right.lowStarReviews - left.lowStarReviews)
}

export function buildDashboardData(
  {
    products = [],
    reviews = [],
    images = [],
    category = [],
    productSummary = [],
  },
  selectedProductId = 'all',
) {
  const normalizedProducts = normalizeProducts(products)
  const normalizedReviews = normalizeReviews(reviews)
  const normalizedImages = normalizeImages(images)
  const normalizedCategory = normalizeCategorySummary(category)
  const normalizedProductSummary = normalizeProductSummaries(productSummary)

  const filteredReviews = filterByProductId(normalizedReviews, selectedProductId)
  const filteredImages = filterByProductId(normalizedImages, selectedProductId)
  const filteredCategory = filterByProductId(normalizedCategory, selectedProductId)
  const filteredProductSummary = filterByProductId(normalizedProductSummary, selectedProductId)

  const selectedProduct =
    selectedProductId === 'all'
      ? null
      : normalizedProducts.find((product) => product.productId === selectedProductId) || null
  const selectedProductName = selectedProduct?.productName || 'All Products'
  const dashboardTitle =
    selectedProductId === 'all'
      ? 'All Products Review Intelligence'
      : `${selectedProductName} Review Intelligence`

  const themeRows = buildThemeRows(filteredCategory, filteredReviews, filteredImages)
  const groupRows = buildBusinessGroups(themeRows)
  const monthlyTrend = buildMonthlyTrendSeries(filteredReviews)
  const rollingAverageSeries = buildRollingAverageSeries(monthlyTrend)
  const themeShareByMonth = buildThemeShareByMonth(
    filteredReviews,
    themeRows.slice(0, 5).map((theme) => theme.theme),
  )
  const responseMetrics = buildResponseMetrics(filteredReviews)
  const ratingsDistribution = buildRatingsDistribution(filteredReviews)
  const photoBackedStats = buildPhotoBackedStats(filteredReviews, filteredImages)
  const fitFeedbackDistribution = buildFitFeedbackDistribution(filteredReviews)
  const sizeDistribution = buildSizeDistribution(filteredReviews)
  const sizeDeltaPoints = buildSizeDeltaPoints(filteredReviews)
  const heightWeightPoints = buildHeightWeightPoints(filteredReviews)
  const fitByTheme = buildFitByTheme(filteredReviews)
  const locationRows = buildLocationRows(filteredReviews)
  const themeByRegion = buildThemeByRegion(filteredReviews)
  const insightRows = buildInsightRows(groupRows, themeRows)
  const recommendationMatrix = buildRecommendationMatrix(insightRows)
  const searchIndex = buildSearchIndex({ reviews: normalizedReviews })
  const topComplaintTheme = themeRows[0]
    ? {
        ...themeRows[0],
        theme: themeRows[0].theme,
        count: themeRows[0].totalReviews,
        share: themeRows[0].overallShare,
      }
    : null

  const topImageThemeRow =
    [...themeRows].sort((left, right) => {
      if (right.totalReviewsWithImages === left.totalReviewsWithImages) {
        return right.totalImages - left.totalImages
      }

      return right.totalReviewsWithImages - left.totalReviewsWithImages
    })[0] || null

  const topImageBackedTheme = topImageThemeRow
    ? {
        ...topImageThemeRow,
        theme: topImageThemeRow.theme,
        count: topImageThemeRow.totalReviewsWithImages,
        share: topImageThemeRow.imageBackedShare,
      }
    : null

  const comparisonRows = buildProductComparisonRows(normalizedProductSummary)
  const comparisonBarData = comparisonRows.map((row) => ({
    productName: row.productName,
    lowStarReviews: row.lowStarReviews,
    totalReviews: row.totalReviews,
    topComplaintTheme: row.topComplaintTheme,
    topComplaintShare: row.topComplaintShare,
  }))

  return {
    products: normalizedProducts,
    selectedProductId,
    selectedProduct,
    selectedProductName,
    dashboardTitle,
    isAllProducts: selectedProductId === 'all',
    themeRows,
    groupRows,
    imageItems: filteredImages,
    imageReviews: [],
    curatedReviews: filteredReviews,
    masterReviews: filteredReviews,
    categorySummary: filteredCategory,
    productSummaryRows: filteredProductSummary,
    allProductSummaryRows: normalizedProductSummary,
    comparisonRows,
    comparisonBarData,
    ratingsDistribution,
    monthlyTrend,
    rollingAverageSeries,
    themeShareByMonth,
    responseMetrics,
    photoBackedStats,
    fitFeedbackDistribution,
    sizeDistribution,
    sizeDeltaPoints,
    heightWeightPoints,
    fitByTheme,
    locationRows,
    themeByRegion,
    insightRows,
    recommendationMatrix,
    searchIndex,
    themeOptions: getThemeOptions(filteredReviews),
    sizeOptions: getGallerySizeOptions(filteredImages),
    topComplaintTheme,
    topImageBackedTheme,
    topTheme: topImageBackedTheme,
    lowStarReviewCount: filteredReviews.length,
  }
}

export function getSeverityColor(rating) {
  return severityPalette[rating] || trendPalette.neutral
}
