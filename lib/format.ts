/**
 * 화면에 시간을 적는 방법을 한 곳에서 정한다.
 * 60분이 넘으면 "230분" 대신 "3시간 50분"으로 적는다.
 */

/** 분을 시·분으로 나눈다. 음수는 0으로 본다. */
export function splitDuration(minutes: number): {
  hours: number;
  minutes: number;
} {
  const safe = Math.max(0, Math.round(minutes));
  return { hours: Math.floor(safe / 60), minutes: safe % 60 };
}

/**
 * 59분 → "59분"
 * 60분 → "1시간"
 * 230분 → "3시간 50분"
 */
export function formatDuration(value: number): string {
  const { hours, minutes } = splitDuration(value);
  if (hours === 0) return `${minutes}분`;
  if (minutes === 0) return `${hours}시간`;
  return `${hours}시간 ${minutes}분`;
}
