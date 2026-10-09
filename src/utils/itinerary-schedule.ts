import type { ItineraryItem, ItineraryItemPayload } from '../types/index.ts'

export interface ScheduleIssue {
  code: 'INVALID_DATE' | 'OUTSIDE_TRIP' | 'INVALID_TIME' | 'INCOMPLETE_TIME' | 'REVERSED_TIME' | 'OVERLAP'
  message: string
  conflictingItemId?: number
}

const validDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

const minutes = (value: string): number | null => {
  const match = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value)
  if (!match) return null
  const hour = Number(match[1]); const minute = Number(match[2]); const second = Number(match[3] ?? 0)
  if (hour > 23 || minute > 59 || second > 59) return null
  return hour * 3600 + minute * 60 + second
}

/** Pure validation: does not mutate the draft or existing items. Adjacent time slots are allowed. */
export function inspectSchedule(
  draft: ItineraryItemPayload,
  trip: { startDate: string; endDate: string },
  existing: readonly ItineraryItem[],
  editingId: number | null = null,
): ScheduleIssue[] {
  const issues: ScheduleIssue[] = []
  if (!validDate(draft.itemDate)) {
    issues.push({ code: 'INVALID_DATE', message: '请选择有效的项目日期' })
  } else if (validDate(trip.startDate) && validDate(trip.endDate) &&
    (draft.itemDate < trip.startDate || draft.itemDate > trip.endDate)) {
    issues.push({ code: 'OUTSIDE_TRIP', message: '项目日期必须在行程起止日期之间' })
  }

  const start = draft.startTime || ''
  const end = draft.endTime || ''
  if (Boolean(start) !== Boolean(end)) {
    issues.push({ code: 'INCOMPLETE_TIME', message: '开始和结束时间需要同时填写' })
    return issues
  }
  if (!start) return issues
  const startValue = minutes(start); const endValue = minutes(end)
  if (startValue === null || endValue === null) {
    issues.push({ code: 'INVALID_TIME', message: '时间格式应为 HH:mm 或 HH:mm:ss' })
    return issues
  }
  if (startValue >= endValue) {
    issues.push({ code: 'REVERSED_TIME', message: '结束时间必须晚于开始时间；跨午夜请拆成两天项目' })
    return issues
  }
  for (const item of existing) {
    if (item.id === editingId || item.itemDate !== draft.itemDate || !item.startTime || !item.endTime) continue
    const otherStart = minutes(item.startTime); const otherEnd = minutes(item.endTime)
    if (otherStart === null || otherEnd === null || otherStart >= otherEnd) continue
    if (startValue < otherEnd && otherStart < endValue) {
      issues.push({ code: 'OVERLAP', message: `与“${item.title}”的时间重叠`, conflictingItemId: item.id })
    }
  }
  return issues
}
