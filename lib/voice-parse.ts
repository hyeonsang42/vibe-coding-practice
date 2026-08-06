/**
 * 말한 문장에서 시각·예산·도보 시간·관심 분야를 뽑아낸다.
 * 근거: docs/requirements.md 6-2장
 *
 * 생성형 AI를 쓰지 않는다. 받아낼 값이 네 가지뿐이라 규칙으로 충분하고,
 * 발표 중 네트워크에 기대지 않아도 된다.
 */

import type { PlaceCategory } from "./types";

export type ParsedVoice = {
  /** 인식된 문장 그대로 */
  transcript: string;
  now?: string;
  eventAt?: string;
  budget?: number;
  walkLimit?: number;
  interests?: PlaceCategory[];
};

/** 한자어 수사 — 예산·분에 쓴다 */
const SINO_DIGIT: Record<string, number> = {
  영: 0, 공: 0, 일: 1, 이: 2, 삼: 3, 사: 4, 오: 5,
  육: 6, 륙: 6, 칠: 7, 팔: 8, 구: 9,
};

const SINO_UNIT: Record<string, number> = { 십: 10, 백: 100, 천: 1000 };

/** 순우리말 수사 — "여섯시"처럼 시(時)에 쓴다. 긴 것부터 봐야 한다. */
const NATIVE_HOUR: [string, number][] = [
  ["열두", 12], ["열한", 11], ["스물", 20], ["열", 10],
  ["하나", 1], ["한", 1], ["둘", 2], ["두", 2], ["셋", 3], ["세", 3],
  ["넷", 4], ["네", 4], ["다섯", 5], ["여섯", 6], ["일곱", 7],
  ["여덟", 8], ["아홉", 9],
];

/**
 * "만오천", "1만5천", "15000" 을 모두 숫자로 바꾼다.
 * 못 읽으면 null.
 */
export function parseKoreanNumber(text: string): number | null {
  const cleaned = text.replace(/[,\s]/g, "");
  if (cleaned.length === 0) return null;
  if (/^\d+$/.test(cleaned)) return Number(cleaned);

  let total = 0;
  let section = 0;
  let current = 0;
  let digits = "";
  let touched = false;

  const flushDigits = () => {
    if (digits.length > 0) {
      current = Number(digits);
      digits = "";
    }
  };

  for (const char of cleaned) {
    if (/\d/.test(char)) {
      digits += char;
      touched = true;
      continue;
    }

    flushDigits();

    if (char in SINO_DIGIT) {
      current = SINO_DIGIT[char];
      touched = true;
    } else if (char in SINO_UNIT) {
      section += (current || 1) * SINO_UNIT[char];
      current = 0;
      touched = true;
    } else if (char === "만") {
      total += (section + current || 1) * 10000;
      section = 0;
      current = 0;
      touched = true;
    } else {
      return null;
    }
  }

  flushDigits();
  if (!touched) return null;
  return total + section + current;
}

/** 순우리말 또는 숫자로 된 "시" 값 */
function parseHour(text: string): number | null {
  const cleaned = text.replace(/\s/g, "");
  if (/^\d+$/.test(cleaned)) return Number(cleaned);
  for (const [word, value] of NATIVE_HOUR) {
    if (cleaned === word) return value;
  }
  return null;
}

/**
 * 축제 시간대(10시~22시)에 맞춰 오전·오후를 정한다.
 * "여섯시"는 새벽 6시가 아니라 저녁 6시로 본다.
 */
function toDayHour(hour: number, marker: string | undefined): number {
  if (hour >= 13) return hour;

  if (marker && /오전|아침|새벽/.test(marker)) return hour === 12 ? 0 : hour;
  if (marker && /오후|저녁|밤|낮/.test(marker)) {
    return hour === 12 ? 12 : hour + 12;
  }

  // 표시가 없으면 축제 시간대 안쪽으로 당긴다
  return hour < 10 ? hour + 12 : hour;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

const TIME_PATTERN =
  /(오전|오후|아침|저녁|밤|낮|새벽)?\s*([0-9]{1,2}|열두|열한|스물|열|하나|한|둘|두|셋|세|넷|네|다섯|여섯|일곱|여덟|아홉)\s*시\s*(?:(반)|([0-9]{1,2}|[일이삼사오육칠팔구십]{1,4})\s*분)?/g;

/** 관심 분야로 볼 수 있는 말들 */
const INTEREST_WORDS: [RegExp, PlaceCategory][] = [
  [/간식|군것질|주전부리|분식|떡|붕어빵|먹을|배고프|출출/, "간식"],
  [/기념품|선물|굿즈|공방|기념/, "기념품"],
  [/카페|커피|음료|차 |찻집|앉아|쉬고|쉬어|휴식/, "카페"],
  [/시장|장터|골목상권/, "시장"],
  [/책|서점|책방|문화|전시|공연장/, "문화공간"],
];

/** 문장에서 값을 뽑아낸다. 못 찾은 항목은 비워둔다. */
export function parseVoiceInput(transcript: string): ParsedVoice {
  const result: ParsedVoice = { transcript };
  let rest = transcript;

  // 1) 시각 — 먼저 뽑고 문장에서 지운다 ("분"이 도보 시간과 겹치기 때문)
  const times: { value: string; context: string }[] = [];

  for (const match of transcript.matchAll(TIME_PATTERN)) {
    const hour = parseHour(match[2]);
    if (hour === null) continue;

    const minute = match[3] ? 30 : match[4] ? (parseKoreanNumber(match[4]) ?? 0) : 0;
    if (minute > 59) continue;

    // 단서는 시각 앞뒤 어느 쪽에도 올 수 있다 ("지금 여섯시", "여섯시에 공연")
    const index = match.index ?? 0;
    const end = index + match[0].length;
    times.push({
      value: `${pad(toDayHour(hour, match[1]))}:${pad(minute)}`,
      context:
        transcript.slice(Math.max(0, index - 8), index) +
        transcript.slice(end, end + 8),
    });

    rest = rest.replace(match[0], " ");
  }

  if (times.length > 0) {
    const nowHint = times.find((time) => /지금|현재|이제/.test(time.context));
    const eventHint = times.find(
      (time) => time !== nowHint && /공연|행사|시작|무대|축제/.test(time.context),
    );

    if (nowHint) result.now = nowHint.value;
    if (eventHint) result.eventAt = eventHint.value;

    // 단서가 없으면 나온 순서대로 현재 시각 → 행사 시작
    const leftovers = times.filter(
      (time) => time !== nowHint && time !== eventHint,
    );
    if (!result.now && leftovers.length > 0) {
      result.now = leftovers.shift()?.value;
    }
    if (!result.eventAt && leftovers.length > 0) {
      result.eventAt = leftovers.shift()?.value;
    }
  }

  // 2) 예산
  const budgetMatch = rest.match(/([0-9만천백십일이삼사오육칠팔구,\s]+)\s*원/);
  if (budgetMatch) {
    const budget = parseKoreanNumber(budgetMatch[1]);
    if (budget !== null && budget >= 1000 && budget <= 200000) {
      result.budget = budget;
      rest = rest.replace(budgetMatch[0], " ");
    }
  }

  // 3) 도보 가능시간
  const walkMatch = rest.match(
    /(?:걸어서|도보로?|편도)\s*([0-9]{1,2}|[일이삼사오육칠팔구십]{1,3})\s*분/,
  );
  if (walkMatch) {
    const walk = parseKoreanNumber(walkMatch[1]);
    if (walk !== null && walk >= 1 && walk <= 60) result.walkLimit = walk;
  }

  // 4) 관심 분야
  const interests = INTEREST_WORDS.filter(([pattern]) =>
    pattern.test(transcript),
  ).map(([, category]) => category);

  if (interests.length > 0) result.interests = Array.from(new Set(interests));

  return result;
}
