export function parseAuditDate(value) {
  if (!value) return null
  const parts = value.split('/')
  if (parts.length !== 3) return new Date(value)
  const [m, d, y] = parts.map(Number)
  const fullYear = y < 100 ? 2000 + y : y
  return new Date(fullYear, m - 1, d)
}

export function isImageReviewed(feedback) {
  return Boolean(feedback && feedback.rating)
}

export function groupVisits(rows, feedbackByImage) {
  const groups = new Map()

  for (const row of rows) {
    const key = `${row.visit_uuid}::${row.category_name}`
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        visit_uuid: row.visit_uuid,
        store_name: row.store_name,
        store_code: row.store_code,
        client_store_id: row.client_store_id,
        user_name: row.user_name,
        audit_date: row.audit_date,
        category_name: row.category_name,
        shelf_name: row.shelf_name,
        rows: [],
      })
    }
    groups.get(key).rows.push(row)
  }

  return Array.from(groups.values()).map((group) => {
    const total = group.rows.length
    const validCount = group.rows.filter((r) => r.validity_status === 'Valid').length
    const invalidCount = total - validCount
    const reviewedCount = group.rows.filter((r) => isImageReviewed(feedbackByImage[r.image_uuid])).length

    let reviewStatus = 'pending'
    if (reviewedCount === total) reviewStatus = 'completed'
    else if (reviewedCount > 0) reviewStatus = 'in_progress'

    const ratingCounts = { good: 0, average: 0, bad: 0 }
    for (const r of group.rows) {
      const fb = feedbackByImage[r.image_uuid]
      if (fb?.rating) ratingCounts[fb.rating] += 1
    }

    return {
      ...group,
      totalImages: total,
      validCount,
      invalidCount,
      reviewedCount,
      reviewStatus,
      ratingCounts,
    }
  })
}

export function computeKpis(rows, feedbackByImage) {
  const visitCount = new Set(rows.map((r) => r.visit_uuid)).size
  const totalImages = rows.length
  const validImages = rows.filter((r) => r.validity_status === 'Valid').length
  const invalidImages = totalImages - validImages

  const ratingCounts = { good: 0, average: 0, bad: 0 }
  let reviewedImages = 0
  for (const r of rows) {
    const fb = feedbackByImage[r.image_uuid]
    if (fb?.rating) {
      reviewedImages += 1
      ratingCounts[fb.rating] += 1
    }
  }

  return {
    visitCount,
    totalImages,
    validImages,
    invalidImages,
    reviewedImages,
    completionPct: totalImages ? Math.round((reviewedImages / totalImages) * 100) : 0,
    ratingCounts,
  }
}
