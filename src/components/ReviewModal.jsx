import { useEffect, useMemo, useRef, useState } from 'react'
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ThumbsUp,
  ThumbsDown,
  Minus,
} from 'lucide-react'
import { REASON_OPTIONS } from '../lib/constants'

function useZoomPan(resetKey) {
  const [state, setState] = useState({ scale: 1, x: 0, y: 0 })
  const dragRef = useRef(null)

  useEffect(() => {
    setState({ scale: 1, x: 0, y: 0 })
  }, [resetKey])

  function onWheel(e) {
    e.preventDefault()
    const delta = -e.deltaY * 0.0015
    setState((s) => {
      const scale = Math.min(5, Math.max(1, s.scale + delta * s.scale))
      return { ...s, scale }
    })
  }

  function onMouseDown(e) {
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: state.x, origY: state.y }
  }

  function onMouseMove(e) {
    if (!dragRef.current) return
    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY
    setState((s) => ({ ...s, x: dragRef.current.origX + dx, y: dragRef.current.origY + dy }))
  }

  function onMouseUp() {
    dragRef.current = null
  }

  function zoomIn() {
    setState((s) => ({ ...s, scale: Math.min(5, s.scale + 0.5) }))
  }
  function zoomOut() {
    setState((s) => ({ ...s, scale: Math.max(1, s.scale - 0.5) }))
  }
  function reset() {
    setState({ scale: 1, x: 0, y: 0 })
  }

  return { state, onWheel, onMouseDown, onMouseMove, onMouseUp, zoomIn, zoomOut, reset }
}

export function ReviewModal({ group, feedback, setImageFeedback, onClose }) {
  const [index, setIndex] = useState(0)
  const [autoAdvance, setAutoAdvance] = useState(true)
  const rows = group.rows
  const row = rows[index]
  const fb = feedback[row.image_uuid] || { rating: null, reasons: [], customReason: '', notes: '' }
  const zoom = useZoomPan(row.image_uuid)

  const needsReason = fb.rating === 'average' || fb.rating === 'bad'
  const hasReason = fb.reasons?.length > 0 || Boolean(fb.customReason?.trim())
  const reasonMissing = needsReason && !hasReason

  const goTo = (i) => {
    if (i < 0 || i >= rows.length) return
    setIndex(i)
  }

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'ArrowLeft') goTo(index - 1)
      else if (e.key === 'ArrowRight') goTo(index + 1)
      else if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [index])

  function rate(rating) {
    setImageFeedback(row.image_uuid, { rating })
    if (rating === 'good' && autoAdvance) {
      setTimeout(() => goTo(index + 1), 150)
    }
  }

  function toggleReason(reason) {
    const current = fb.reasons || []
    const next = current.includes(reason) ? current.filter((r) => r !== reason) : [...current, reason]
    setImageFeedback(row.image_uuid, { reasons: next })
  }

  const reviewedCount = useMemo(
    () => rows.filter((r) => (feedback[r.image_uuid] || {}).rating).length,
    [rows, feedback],
  )

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/95">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 text-slate-200">
        <div>
          <div className="text-sm font-medium text-white">
            {group.store_name} · {group.category_name}
          </div>
          <div className="text-xs text-slate-400">
            {group.audit_date} · {group.user_name} · {group.shelf_name}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-400">
            {index + 1} / {rows.length} · {reviewedCount} reviewed
          </span>
          <label className="flex items-center gap-1.5 text-xs text-slate-300">
            <input
              type="checkbox"
              checked={autoAdvance}
              onChange={(e) => setAutoAdvance(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-slate-500"
            />
            Auto-advance
          </label>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-black">
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
            className="absolute left-3 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 disabled:opacity-30"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <div
            className="h-full w-full cursor-grab overflow-hidden select-none active:cursor-grabbing"
            onWheel={zoom.onWheel}
            onMouseDown={zoom.onMouseDown}
            onMouseMove={zoom.onMouseMove}
            onMouseUp={zoom.onMouseUp}
            onMouseLeave={zoom.onMouseUp}
          >
            <img
              src={row.image_link}
              alt={row.category_name}
              draggable={false}
              className="h-full w-full object-contain"
              style={{
                transform: `translate(${zoom.state.x}px, ${zoom.state.y}px) scale(${zoom.state.scale})`,
                transition: zoom.state.scale === 1 ? 'transform 0.1s ease-out' : 'none',
              }}
            />
          </div>

          <button
            type="button"
            onClick={() => goTo(index + 1)}
            disabled={index === rows.length - 1}
            className="absolute right-3 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 disabled:opacity-30"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-lg bg-black/50 p-1">
            <button type="button" onClick={zoom.zoomOut} className="rounded p-1.5 text-white hover:bg-white/10">
              <ZoomOut className="h-4 w-4" />
            </button>
            <button type="button" onClick={zoom.zoomIn} className="rounded p-1.5 text-white hover:bg-white/10">
              <ZoomIn className="h-4 w-4" />
            </button>
            <button type="button" onClick={zoom.reset} className="rounded p-1.5 text-white hover:bg-white/10">
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>

          <div className="absolute left-3 top-3 flex items-center gap-2">
            <span className="rounded bg-black/50 px-2 py-1 text-xs text-white uppercase">{row.image_type}</span>
            <span
              className={`rounded px-2 py-1 text-xs font-medium ${
                row.validity_status === 'Valid' ? 'bg-emerald-500/80 text-white' : 'bg-rose-500/80 text-white'
              }`}
            >
              {row.validity_status}
            </span>
          </div>
        </div>

        <div className="flex w-80 shrink-0 flex-col gap-4 overflow-y-auto border-l border-slate-800 bg-slate-900 p-4">
          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Rating</div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => rate('good')}
                className={`flex flex-col items-center gap-1 rounded-lg border py-2 text-xs font-medium ${
                  fb.rating === 'good'
                    ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
                    : 'border-slate-700 text-slate-300 hover:border-emerald-400/50'
                }`}
              >
                <ThumbsUp className="h-4 w-4" /> Good
              </button>
              <button
                type="button"
                onClick={() => rate('average')}
                className={`flex flex-col items-center gap-1 rounded-lg border py-2 text-xs font-medium ${
                  fb.rating === 'average'
                    ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                    : 'border-slate-700 text-slate-300 hover:border-amber-400/50'
                }`}
              >
                <Minus className="h-4 w-4" /> Average
              </button>
              <button
                type="button"
                onClick={() => rate('bad')}
                className={`flex flex-col items-center gap-1 rounded-lg border py-2 text-xs font-medium ${
                  fb.rating === 'bad'
                    ? 'border-rose-400 bg-rose-500/20 text-rose-300'
                    : 'border-slate-700 text-slate-300 hover:border-rose-400/50'
                }`}
              >
                <ThumbsDown className="h-4 w-4" /> Bad
              </button>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between text-xs font-medium uppercase tracking-wide text-slate-400">
              <span>Reasons</span>
              {needsReason && <span className="text-rose-400">required</span>}
            </div>
            <div className="flex flex-col gap-1.5">
              {REASON_OPTIONS.map((reason) => (
                <label key={reason} className="flex items-center gap-2 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={fb.reasons?.includes(reason) || false}
                    onChange={() => toggleReason(reason)}
                    className="h-3.5 w-3.5 rounded border-slate-500"
                  />
                  {reason}
                </label>
              ))}
            </div>
            <input
              type="text"
              placeholder="Other reason..."
              value={fb.customReason || ''}
              onChange={(e) => setImageFeedback(row.image_uuid, { customReason: e.target.value })}
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-sm text-slate-200 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
            />
            {reasonMissing && (
              <div className="mt-1 text-xs text-rose-400">Select or enter at least one reason.</div>
            )}
          </div>

          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Reviewer Notes</div>
            <textarea
              rows={4}
              value={fb.notes || ''}
              onChange={(e) => setImageFeedback(row.image_uuid, { notes: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-sm text-slate-200 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
              placeholder="Optional notes..."
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto border-t border-slate-800 bg-slate-900 p-2">
        {rows.map((r, i) => {
          const rFb = feedback[r.image_uuid]
          return (
            <button
              key={r.image_uuid}
              type="button"
              onClick={() => goTo(i)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 ${
                i === index ? 'border-indigo-400' : 'border-transparent'
              }`}
            >
              <img src={r.thumbnail_link} alt="" className="h-full w-full object-cover" />
              {rFb?.rating && (
                <span
                  className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border border-slate-900 ${
                    rFb.rating === 'good'
                      ? 'bg-emerald-400'
                      : rFb.rating === 'average'
                        ? 'bg-amber-400'
                        : 'bg-rose-400'
                  }`}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
