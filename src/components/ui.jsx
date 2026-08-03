const COLOR_CLASSES = {
  emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400',
  amber: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400',
  rose: 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-400',
  indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-400',
  slate: 'bg-slate-200 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300',
  sky: 'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-400',
}

export function Badge({ color = 'slate', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${COLOR_CLASSES[color]} ${className}`}
    >
      {children}
    </span>
  )
}

export function ReviewStatusBadge({ status }) {
  if (status === 'completed') return <Badge color="emerald">Completed</Badge>
  if (status === 'in_progress') return <Badge color="sky">In Progress</Badge>
  return <Badge color="slate">Pending</Badge>
}

export function RatingBadge({ rating }) {
  if (rating === 'good') return <Badge color="emerald">Good</Badge>
  if (rating === 'average') return <Badge color="amber">Average</Badge>
  if (rating === 'bad') return <Badge color="rose">Bad</Badge>
  return <Badge color="slate">Unrated</Badge>
}
