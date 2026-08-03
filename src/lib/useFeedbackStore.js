import { useCallback, useEffect, useState } from 'react'
import { FEEDBACK_STORAGE_PREFIX } from './constants'

function loadFromStorage(key) {
  try {
    const raw = localStorage.getItem(FEEDBACK_STORAGE_PREFIX + key)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function useFeedbackStore(datasetKey) {
  const [feedback, setFeedback] = useState(() => loadFromStorage(datasetKey))

  useEffect(() => {
    setFeedback(loadFromStorage(datasetKey))
  }, [datasetKey])

  useEffect(() => {
    try {
      localStorage.setItem(FEEDBACK_STORAGE_PREFIX + datasetKey, JSON.stringify(feedback))
    } catch {
      // storage full or unavailable, feedback stays in-memory for this session
    }
  }, [datasetKey, feedback])

  const setImageFeedback = useCallback((imageUuid, patch) => {
    setFeedback((prev) => ({
      ...prev,
      [imageUuid]: {
        rating: null,
        reasons: [],
        customReason: '',
        notes: '',
        ...prev[imageUuid],
        ...patch,
        reviewedAt: Date.now(),
      },
    }))
  }, [])

  const clearAll = useCallback(() => {
    setFeedback({})
  }, [])

  return { feedback, setImageFeedback, clearAll }
}
