import { CheckCircle2, Images, MapPin, ClipboardCheck } from 'lucide-react'

function KpiCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${accent}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="min-w-0">
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</div>
        <div className="text-xl font-semibold text-slate-900 dark:text-white">{value}</div>
        {sub && <div className="text-xs text-slate-500 dark:text-slate-400">{sub}</div>}
      </div>
    </div>
  )
}

export function KpiHeader({ kpis }) {
  const { visitCount, totalImages, validImages, invalidImages, reviewedImages, completionPct, ratingCounts } = kpis

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard icon={MapPin} label="Total Visits" value={visitCount} accent="bg-indigo-500" />
      <KpiCard
        icon={Images}
        label="Total Images"
        value={totalImages}
        sub={`${validImages} valid · ${invalidImages} invalid`}
        accent="bg-slate-500"
      />
      <KpiCard
        icon={ClipboardCheck}
        label="Reviewed"
        value={`${reviewedImages} / ${totalImages}`}
        sub={`${completionPct}% complete`}
        accent="bg-sky-500"
      />
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500">
          <CheckCircle2 className="h-5 w-5 text-white" />
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Quality Breakdown</div>
          <div className="flex gap-2 text-xs font-medium">
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400">
              Good {ratingCounts.good}
            </span>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400">
              Avg {ratingCounts.average}
            </span>
            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-rose-800 dark:bg-rose-500/15 dark:text-rose-400">
              Bad {ratingCounts.bad}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
