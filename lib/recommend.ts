/**
 * 코스 추천 로직
 * 근거: docs/requirements.md 1장(복귀 보장) · 5장(AI 처리 구조 ①②)
 *
 * ① 규칙 기반 필터링 — 조건을 넘는 코스는 아예 제외한다
 * ② 추천 순위 정렬 — 취향·복귀 안정성·이동 효율·상권 분산·혜택을 종합
 *
 * ③ 생성형 설명은 1단계에서 사전 작성 문구(Course.reason)로 대신한다.
 */

import { courses, getCoursePlaces } from "./demo-data";
import { SAFETY_MARGIN_MINUTES } from "./types";
import type { Course, Place, PlaceCategory } from "./types";

export type RecommendInput = {
  /** 다음 행사까지 남은 시간 (분) */
  remainMinutes: number;
  /** 현재 시각 (자정 기준 분) */
  nowMinutes: number;
  /** 1인 예산 (원) */
  budget: number;
  /** 감당 가능한 편도 도보 시간 (분) */
  walkLimit: number;
  /** 관심 분야 */
  interests: PlaceCategory[];
};

export type Recommendation = {
  course: Course;
  places: Place[];
  /** 이 코스를 쓰려면 필요한 최소 남은 시간 = 총 소요 + 안전여유 */
  requiredMinutes: number;
  /** 행사 시작까지 남는 여유 (분) */
  slackMinutes: number;
  /** 복귀 예정시각 "HH:MM" */
  returnAt: string;
  /** 정렬 점수 (0~100) */
  score: number;
  /** 관심 분야와 겹치는 분류 */
  matchedInterests: PlaceCategory[];
};

/** 코스가 걸러진 이유 — 화면에서 "왜 안 나왔는지" 설명할 때 쓴다. */
export type RejectReason = "시간" | "예산" | "도보" | "영업시간";

export type RecommendResult = {
  recommendations: Recommendation[];
  /** 걸러진 코스와 그 이유 */
  rejected: { course: Course; reasons: RejectReason[] }[];
};

/** "HH:MM" → 자정 기준 분. 형식이 어긋나면 null. */
export function parseTime(time: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return hour * 60 + minute;
}

/** 자정 기준 분 → "HH:MM" (24시를 넘으면 다음 날로 넘겨 표기) */
export function formatTime(minutes: number): string {
  const wrapped = ((minutes % 1440) + 1440) % 1440;
  const hour = String(Math.floor(wrapped / 60)).padStart(2, "0");
  const minute = String(wrapped % 60).padStart(2, "0");
  return `${hour}:${minute}`;
}

/** 코스를 도는 동안 모든 장소가 영업 중인지 본다. */
function isOpenThroughout(
  place: Place,
  nowMinutes: number,
  totalMinutes: number,
): boolean {
  const [openText, closeText] = place.openHours.split("-");
  const open = parseTime(openText ?? "");
  const close = parseTime(closeText ?? "");
  if (open === null || close === null) return true;
  return nowMinutes >= open && nowMinutes + totalMinutes <= close;
}

/**
 * 복귀 보장 규칙 (docs/requirements.md 1장)
 * 왕복 이동 + 체류 + 안전여유 ≤ 남은 시간
 */
export function requiredMinutesFor(course: Course): number {
  return course.totalMinutes + SAFETY_MARGIN_MINUTES;
}

function scoreOf(
  course: Course,
  places: Place[],
  input: RecommendInput,
  slackMinutes: number,
): { score: number; matchedInterests: PlaceCategory[] } {
  const matchedInterests = Array.from(
    new Set(
      places
        .map((place) => place.category)
        .filter((category) => input.interests.includes(category)),
    ),
  );

  // 취향 적합도 (35점) — 관심 분야와 겹치는 장소의 비율
  const matchedPlaces = places.filter((place) =>
    input.interests.includes(place.category),
  ).length;
  const fit =
    input.interests.length === 0
      ? 0.5
      : places.length === 0
        ? 0
        : matchedPlaces / places.length;

  // 복귀 안정성 (25점) — 여유가 30분을 넘으면 만점
  const safety = Math.min(slackMinutes / 30, 1);

  // 이동 효율 (15점) — 총 시간 중 실제로 머무는 비율
  const efficiency =
    course.totalMinutes === 0 ? 0 : course.stayMinutes / course.totalMinutes;

  // 상권 분산 (15점) — 덜 붐비는 곳을 우대
  const avgCrowd =
    places.length === 0
      ? 2
      : places.reduce((sum, place) => sum + place.crowdLevel, 0) / places.length;
  const spread = (3 - avgCrowd) / 2;

  // 혜택 (10점) — 혜택을 받을 수 있는 장소 수
  const benefit = Math.min(
    places.filter((place) => place.benefit.length > 0).length / 2,
    1,
  );

  const score =
    fit * 35 + safety * 25 + efficiency * 15 + spread * 15 + benefit * 10;

  return { score: Math.round(score), matchedInterests };
}

export type ItineraryStep =
  | { kind: "출발"; at: string }
  | { kind: "이동"; minutes: number }
  | { kind: "체류"; place: Place; at: string; until: string }
  | { kind: "복귀"; at: string };

/**
 * 코스를 시간 순서대로 펼친다.
 *
 * 구간별 이동시간은 따로 저장하지 않고 총 이동시간에서 나눈다.
 * 첫 구간과 마지막 구간은 각 장소의 축제장 기준 도보 시간을 쓰고,
 * 남는 시간을 장소 사이 구간에 고르게 나눠준다.
 */
export function buildItinerary(
  course: Course,
  places: Place[],
  startMinutes: number,
): ItineraryStep[] {
  if (places.length === 0) return [];

  const firstLeg = places[0].walkMinutes;
  const lastLeg = places[places.length - 1].walkMinutes;
  const middleCount = places.length - 1;
  const middleTotal = Math.max(course.travelMinutes - firstLeg - lastLeg, 0);

  const middleLegs: number[] = [];
  for (let i = 0; i < middleCount; i += 1) {
    const base = Math.floor(middleTotal / middleCount);
    const remainder = middleTotal % middleCount;
    middleLegs.push(base + (i < remainder ? 1 : 0));
  }

  const steps: ItineraryStep[] = [{ kind: "출발", at: formatTime(startMinutes) }];
  let cursor = startMinutes;

  places.forEach((place, index) => {
    const leg = index === 0 ? firstLeg : middleLegs[index - 1];
    steps.push({ kind: "이동", minutes: leg });
    cursor += leg;

    steps.push({
      kind: "체류",
      place,
      at: formatTime(cursor),
      until: formatTime(cursor + place.stayMinutes),
    });
    cursor += place.stayMinutes;
  });

  steps.push({ kind: "이동", minutes: lastLeg });
  cursor += lastLeg;
  steps.push({ kind: "복귀", at: formatTime(cursor) });

  return steps;
}

/** 조건에 맞는 코스만 골라 점수 순으로 돌려준다. */
export function recommendCourses(input: RecommendInput): RecommendResult {
  const recommendations: Recommendation[] = [];
  const rejected: { course: Course; reasons: RejectReason[] }[] = [];

  for (const course of courses) {
    const places = getCoursePlaces(course);
    const required = requiredMinutesFor(course);
    const reasons: RejectReason[] = [];

    // ① 규칙 기반 필터링
    if (required > input.remainMinutes) reasons.push("시간");
    if (course.spend > input.budget) reasons.push("예산");
    if (places.some((place) => place.walkMinutes > input.walkLimit)) {
      reasons.push("도보");
    }
    if (
      places.some(
        (place) =>
          !isOpenThroughout(place, input.nowMinutes, course.totalMinutes),
      )
    ) {
      reasons.push("영업시간");
    }

    if (reasons.length > 0) {
      rejected.push({ course, reasons });
      continue;
    }

    const slackMinutes = input.remainMinutes - course.totalMinutes;
    const { score, matchedInterests } = scoreOf(
      course,
      places,
      input,
      slackMinutes,
    );

    recommendations.push({
      course,
      places,
      requiredMinutes: required,
      slackMinutes,
      returnAt: formatTime(input.nowMinutes + course.totalMinutes),
      score,
      matchedInterests,
    });
  }

  // ② 추천 순위 정렬 — 점수가 같으면 짧은 코스를 앞에 둔다
  recommendations.sort(
    (a, b) => b.score - a.score || a.course.totalMinutes - b.course.totalMinutes,
  );

  return { recommendations, rejected };
}
