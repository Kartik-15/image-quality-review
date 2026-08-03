import Papa from 'papaparse'

export function parseCsvFile(source) {
  return new Promise((resolve, reject) => {
    Papa.parse(source, {
      header: true,
      download: typeof source === 'string',
      skipEmptyLines: true,
      complete: (results) => resolve(results),
      error: (err) => reject(err),
    })
  })
}

export function buildExportRows(rows, feedbackByImage) {
  return rows.map((row) => {
    const fb = feedbackByImage[row.image_uuid] || {}
    return {
      ...row,
      feedback_rating: fb.rating || '',
      feedback_reasons: [...(fb.reasons || []), fb.customReason].filter(Boolean).join('; '),
      reviewer_notes: fb.notes || '',
    }
  })
}

export function exportCsv(rows, feedbackByImage, filename) {
  const exportRows = buildExportRows(rows, feedbackByImage)
  const csv = Papa.unparse(exportRows)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
