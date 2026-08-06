/**
 * 소리로 읽을 문장을 만든다.
 * 근거: docs/requirements.md 6-3장
 *
 * 화면에 보이는 글자를 그대로 읽으면 "19:04"가 "십구 콜론 영사"처럼 들린다.
 * 들었을 때 자연스러운 문장을 따로 만든다.
 */

import { parseTime } from "./recommend";
import type { ItineraryStep } from "./recommend";
import { FESTIVAL_VENUE } from "./types";
import type { Course, Place } from "./types";

/** "19:04" → "저녁 7시 4분" */
export function timeToKorean(time: string): string {
  const minutes = parseTime(time);
  if (minutes === null) return time;

  const hour24 = Math.floor(minutes / 60);
  const minute = minutes % 60;

  const period =
    hour24 < 6
      ? "새벽"
      : hour24 < 12
        ? "아침"
        : hour24 === 12
          ? "낮"
          : hour24 < 18
            ? "오후"
            : hour24 < 22
              ? "저녁"
              : "밤";

  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const minutePart = minute === 0 ? "" : ` ${minute}분`;

  return `${period} ${hour12}시${minutePart}`;
}

/** 목록을 "가, 나, 그리고 다" 처럼 읽히게 잇는다 */
function joinKorean(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")}, 그리고 ${items[items.length - 1]}`;
}

/** 추천 결과 화면 — 코스 하나를 요약해 읽는다 */
export function courseSpeech({
  course,
  places,
  returnAt,
  slackMinutes,
}: {
  course: Course;
  places: Place[];
  returnAt: string;
  slackMinutes: number;
}): string {
  return [
    `${course.title}. ${course.slot}분 코스입니다.`,
    `${joinKorean(places.map((place) => place.name))} ${places.length}곳을 들릅니다.`,
    `걷는 시간 ${course.travelMinutes}분, 머무는 시간 ${course.stayMinutes}분, 모두 ${course.totalMinutes}분 걸립니다.`,
    `${timeToKorean(returnAt)}에 돌아오고, 행사 시작까지 ${slackMinutes}분 남습니다.`,
    `예상 지출은 ${course.spend}원입니다.`,
    course.reason,
  ].join(" ");
}

/** 상세 동선 화면 — 일정표를 순서대로 읽는다 */
export function itinerarySpeech({
  course,
  steps,
  eventName,
  gapMinutes,
}: {
  course: Course;
  steps: ItineraryStep[];
  eventName: string;
  gapMinutes: number | null;
}): string {
  const lines: string[] = [`${course.title}. 이동 순서를 알려드립니다.`];

  for (const step of steps) {
    if (step.kind === "출발") {
      lines.push(`${timeToKorean(step.at)}, ${FESTIVAL_VENUE}에서 출발합니다.`);
    } else if (step.kind === "이동") {
      lines.push(`걸어서 ${step.minutes}분.`);
    } else if (step.kind === "체류") {
      lines.push(
        `${timeToKorean(step.at)}, ${step.place.name} 도착. ${step.place.stayMinutes}분 머뭅니다. 혜택은 ${step.place.benefit}입니다.`,
      );
    } else {
      lines.push(`${timeToKorean(step.at)}, ${FESTIVAL_VENUE}으로 돌아옵니다.`);
    }
  }

  if (gapMinutes !== null) {
    lines.push(`${eventName} 시작 ${gapMinutes}분 전입니다.`);
  }

  lines.push(course.rainAlternative);

  return lines.join(" ");
}
