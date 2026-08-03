import { useEffect, useMemo, useState } from 'react'
import { Upload, Download, ImageOff, Sun, Moon } from 'lucide-react'
import { parseCsvFile, exportCsv } from './lib/csv'
import { useFeedbackStore } from './lib/useFeedbackStore'
import { useTheme } from './lib/useTheme'
import { groupVisits, computeKpis, parseAuditDate } from './lib/aggregate'
import { DEFAULT_DATASET_URL, DEFAULT_DATASET_NAME } from './lib/constants'
import { KpiHeader } from './components/KpiHeader'
import { FiltersBar } from './components/FiltersBar'
import { VisitsTable } from './components/VisitsTable'
import { ReviewModal } from './components/ReviewModal'
import logo from './assets/paralleldots-logo.png'

const EMPTY_FILTERS = {
  search: '',
  stores: [],
  users: [],
  categories: [],
  validity: [],
  imageTypes: [],
  reviewStatus: [],
  dateFrom: '',
  dateTo: '',
}

export default function App() {
  const [rows, setRows] = useState([])
  const [datasetName, setDatasetName] = useState(DEFAULT_DATASET_NAME)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [activeGroup, setActiveGroup] = useState(null)

  const { feedback, setImageFeedback } = useFeedbackStore(datasetName)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    loadDataset(DEFAULT_DATASET_URL)
  }, [])

  async function loadDataset(source, name) {
    setLoading(true)
    setError(null)
    try {
      const result = await parseCsvFile(source)
      const cleanRows = result.data.filter((r) => r.image_uuid)
      setRows(cleanRows)
      if (name) setDatasetName(name)
    } catch {
      setError('Could not load the CSV file.')
    } finally {
      setLoading(false)
    }
  }

  function handleUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    loadDataset(file, file.name)
    setFilters(EMPTY_FILTERS)
    e.target.value = ''
  }

  const facets = useMemo(() => {
    const uniq = (key) => Array.from(new Set(rows.map((r) => r[key]).filter(Boolean))).sort()
    return {
      stores: uniq('store_name'),
      users: uniq('user_name'),
      categories: uniq('category_name'),
      validity: uniq('validity_status'),
    }
  }, [rows])

  const filteredRows = useMemo(() => {
    const search = filters.search.trim().toLowerCase()
    const from = filters.dateFrom ? new Date(filters.dateFrom) : null
    const to = filters.dateTo ? new Date(filters.dateTo) : null

    return rows.filter((r) => {
      if (filters.stores.length && !filters.stores.includes(r.store_name)) return false
      if (filters.users.length && !filters.users.includes(r.user_name)) return false
      if (filters.categories.length && !filters.categories.includes(r.category_name)) return false
      if (filters.validity.length && !filters.validity.includes(r.validity_status)) return false
      if (filters.imageTypes.length) {
        const label = r.image_type === 'raw' ? 'Raw' : r.image_type === 'stitched' ? 'Stitched' : r.image_type
        if (!filters.imageTypes.includes(label)) return false
      }
      if (search) {
        const haystack = `${r.store_name} ${r.visit_uuid} ${r.client_store_id}`.toLowerCase()
        if (!haystack.includes(search)) return false
      }
      if (from || to) {
        const d = parseAuditDate(r.audit_date)
        if (!d) return false
        if (from && d < from) return false
        if (to && d > to) return false
      }
      return true
    })
  }, [rows, filters])

  const groups = useMemo(() => {
    const all = groupVisits(filteredRows, feedback)
    if (!filters.reviewStatus.length) return all
    const labelToValue = { Completed: 'completed', 'In Progress': 'in_progress', Pending: 'pending' }
    const wanted = filters.reviewStatus.map((l) => labelToValue[l])
    return all.filter((g) => wanted.includes(g.reviewStatus))
  }, [filteredRows, feedback, filters.reviewStatus])

  const kpis = useMemo(() => computeKpis(filteredRows, feedback), [filteredRows, feedback])

  function handleExport() {
    const exportName = datasetName.replace(/\.csv$/i, '') + '_reviewed.csv'
    exportCsv(rows, feedback, exportName)
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 shrink-0 items-center rounded-md bg-white px-1.5 shadow-sm ring-1 ring-slate-200">
              <img src={logo} alt="ParallelDots" className="h-6 w-auto" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Image Quality Review Portal</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {datasetName} · {rows.length} images
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800">
              <Upload className="h-4 w-4" />
              Load CSV
              <input type="file" accept=".csv" className="hidden" onChange={handleUpload} />
            </label>
            <button
              type="button"
              onClick={handleExport}
              disabled={rows.length === 0}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6">
        {loading && <div className="text-sm text-slate-500 dark:text-slate-400">Loading gallery...</div>}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300">
            <ImageOff className="h-4 w-4" /> {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <KpiHeader kpis={kpis} />
            <FiltersBar
              facets={facets}
              filters={filters}
              setFilters={setFilters}
              onReset={() => setFilters(EMPTY_FILTERS)}
            />
            <VisitsTable groups={groups} onReview={setActiveGroup} />
          </>
        )}
      </main>

      {activeGroup && (
        <ReviewModal
          group={groups.find((g) => g.key === activeGroup.key) || activeGroup}
          feedback={feedback}
          setImageFeedback={setImageFeedback}
          onClose={() => setActiveGroup(null)}
        />
      )}
    </div>
  )
}
