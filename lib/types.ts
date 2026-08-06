/**
 * 틈새진주 데이터 타입
 * 정의 근거: docs/requirements.md 4장 「데이터 구조」
 */

/** 행사에 늦지 않기 위해 반드시 남겨두는 안전여유 (분) */
export const SAFETY_MARGIN_MINUTES = 15;

/** 가상 수치임을 화면에 표시할 때 쓰는 문구 (requirements.md 6장 표기 의무) */
export const DEMO_DATA_LABEL = "시연용 데이터";

/** 모든 이동 시간의 기준점이 되는 출발지 */
export const FESTIVAL_VENUE = "축제 행사장";

export type PlaceCategory =
  | "간식"
  | "기념품"
  | "카페"
  | "시장"
  | "문화공간";

/** 혼잡도 — 1 한산 / 2 보통 / 3 혼잡. 시연용 가상 수치다. */
export type CrowdLevel = 1 | 2 | 3;

export type Place = {
  id: string;
  /** 상호명 (현장 조사 전이므로 가상 이름) */
  name: string;
  category: PlaceCategory;
  /** 위치 설명 */
  area: string;
  /** 축제장 기준 편도 도보 소요분 */
  walkMinutes: number;
  /** 평균 체류분 */
  stayMinutes: number;
  /** 1인 예상 지출 (원) */
  spend: number;
  /** 영업시간 */
  openHours: string;
  /** QR 인증 시 받는 혜택 */
  benefit: string;
  /** 혼잡도 (시연용 가상 수치) */
  crowdLevel: CrowdLevel;
  /** 실내 여부 — 우천 시 대체 경로 판단에 쓴다 */
  indoor: boolean;
  /** 한 줄 소개 */
  note: string;
};

/** 코스 소요 구간 — 30·60·90분 */
export type CourseSlot = 30 | 60 | 90;

export type Course = {
  id: string;
  slot: CourseSlot;
  title: string;
  /** 방문 순서대로의 Place id 목록 */
  placeIds: string[];
  /** 왕복 이동 합계 (분) — 축제장 출발부터 복귀까지 */
  travelMinutes: number;
  /** 체류 합계 (분) */
  stayMinutes: number;
  /** 총 소요분 = travelMinutes + stayMinutes */
  totalMinutes: number;
  /** 1인 예상 지출 합계 (원) */
  spend: number;
  /** 추천 이유 — 1단계에서는 사전 작성 문구 (requirements.md 5장 ③) */
  reason: string;
  /** 우천 시 대체 안내 */
  rainAlternative: string;
  /** 카드에 쓰는 예시 이미지 경로 (진주에서 찍은 사진이 아니다) */
  image: string;
};
