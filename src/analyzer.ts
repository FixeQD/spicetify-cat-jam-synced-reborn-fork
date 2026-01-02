export interface AnalysisPoint {
	loudness: number
	tempo: number
}

export function getLoudnessAt(segments: any[], timeSec: number): number {
	if (!segments || segments.length === 0) return -60

	let low = 0
	let high = segments.length - 1
	let mid = 0

	while (low <= high) {
		mid = (low + high) >> 1
		const s = segments[mid]
		if (s.start <= timeSec && s.start + s.duration > timeSec) {
			break
		} else if (s.start > timeSec) {
			high = mid - 1
		} else {
			low = mid + 1
		}
	}

	const segment = segments[mid]
	if (!segment) return -60

	const timeInSegment = timeSec - segment.start
	const maxTime = segment.loudness_max_time

	if (timeInSegment < maxTime) {
		const t = timeInSegment / maxTime
		return segment.loudness_start + t * (segment.loudness_max - segment.loudness_start)
	} else {
		const remainingTime = segment.duration - maxTime
		const t = (timeInSegment - maxTime) / remainingTime
		const nextStart = segments[mid + 1]?.loudness_start ?? segment.loudness_max
		return segment.loudness_max + t * (nextStart - segment.loudness_max)
	}
}

export function getLocalBPM(beats: any[], timeSec: number, windowSeconds: number = 6): number {
	if (!beats || beats.length < 2) return 0

	const start = timeSec - windowSeconds / 2
	const end = timeSec + windowSeconds / 2

	const localBeats = beats.filter((b) => b.start >= start && b.start <= end)

	if (localBeats.length < 2) return 0

	const totalInterval = localBeats[localBeats.length - 1].start - localBeats[0].start
	const avgInterval = totalInterval / (localBeats.length - 1)

	return 60 / avgInterval
}

export function normalizeLoudness(db: number): number {
	const min = -60
	const max = 0
	return Math.max(0, Math.min(1, (db - min) / (max - min)))
}
