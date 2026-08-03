import { Search, RotateCcw } from 'lucide-react'
import { MultiSelect } from './MultiSelect'

const REVIEW_STATUS_OPTIONS = [
  { value: 'completed', label: 'Completed' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'pending', label: 'Pending' },
]

const IMAGE_TYPE_OPTIONS = [
  { value: 'raw', label: 'Raw' },
  { value: 'stitched', label: 'Stitched' },
]

export function FiltersBar({ facets, filters, setFilters, onReset }) {
  function update(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search store or visit..."
          value={filters.search}
          onChange={(e) => update('search', e.target.value)}
          className="w-56 rounded-lg border border-slate-300 bg-white py-1.5 pl-8 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
        />
      </div>

      <MultiSelect
        label="Store"
        options={facets.stores}
        selected={filters.stores}
        onChange={(v) => update('stores', v)}
      />
      <MultiSelect
        label="Auditor"
        options={facets.users}
        selected={filters.users}
        onChange={(v) => update('users', v)}
      />
      <MultiSelect
        label="Category"
        options={facets.categories}
        selected={filters.categories}
        onChange={(v) => update('categories', v)}
      />
      <MultiSelect
        label="Validity"
        options={facets.validity}
        selected={filters.validity}
        onChange={(v) => update('validity', v)}
      />
      <MultiSelect
        label="Image Type"
        options={IMAGE_TYPE_OPTIONS.map((o) => o.label)}
        selected={filters.imageTypes}
        onChange={(v) => update('imageTypes', v)}
      />
      <MultiSelect
        label="Review Status"
        options={REVIEW_STATUS_OPTIONS.map((o) => o.label)}
        selected={filters.reviewStatus}
        onChange={(v) => update('reviewStatus', v)}
      />

      <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => update('dateFrom', e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
        />
        <span className="text-slate-400">to</span>
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => update('dateTo', e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
        />
      </div>

      <button
        type="button"
        onClick={onReset}
        className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
      >
        <RotateCcw className="h-3.5 w-3.5" /> Reset filters
      </button>
    </div>
  )
}

export { REVIEW_STATUS_OPTIONS, IMAGE_TYPE_OPTIONS }
