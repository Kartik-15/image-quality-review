import { ImageIcon } from 'lucide-react'
import { ReviewStatusBadge } from './ui'

export function VisitsTable({ groups, onReview }) {
  if (groups.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
        No visits match the current filters.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="max-h-[65vh] overflow-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Store</th>
              <th className="px-4 py-3 font-medium">Audit Date / User</th>
              <th className="px-4 py-3 font-medium">Category / Shelf</th>
              <th className="px-4 py-3 font-medium">Images</th>
              <th className="px-4 py-3 font-medium">Validity</th>
              <th className="px-4 py-3 font-medium">Review Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {groups.map((g) => (
              <tr
                key={g.key}
                onClick={() => onReview(g)}
                className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50"
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900 dark:text-white">{g.store_name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{g.store_code || g.client_store_id}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-slate-700 dark:text-slate-200">{g.audit_date}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{g.user_name}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-slate-700 dark:text-slate-200">{g.category_name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{g.shelf_name}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                    <ImageIcon className="h-3.5 w-3.5 text-slate-400" />
                    {g.totalImages}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {g.reviewedCount} reviewed
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">
                  {g.validCount} Valid{g.invalidCount > 0 ? `, ${g.invalidCount} Invalid` : ''}
                </td>
                <td className="px-4 py-3">
                  <ReviewStatusBadge status={g.reviewStatus} />
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onReview(g)
                    }}
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500"
                  >
                    Review Images
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
