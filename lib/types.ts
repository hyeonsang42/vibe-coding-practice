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
  /** 추상 지도 위 좌표 (0~100). 실제 위경도가 아니라 그림용 배치값이다. */
  map: { x: number; y: number };
  /**
   * 실제 지도용 위경도.
   * ⚠️ 지금 값은 진주 원도심 안에 그럴듯하게 찍어둔 시연용 좌표다.
   *    실제 상점이 정해지면 카카오맵에서 좌표를 복사해 교체한다.
   */
  coord: { lat: number; lng: number };
};

/** 추상 지도에서 축제장(출발지)이 놓이는 자리 */
export const VENUE_MAP_POSITION = { x: 50, y: 76 };

/**
 * 축제장 위경도 (시연용 — 진주성 일대. 실제 행사장 좌표로 교체 필요)
 * 강 위에 찍히지 않도록 남강 북쪽 육지 기준으로 잡았다.
 */
export const VENUE_COORD = { lat: 35.1907, lng: 128.0808 };

/** 시간대별 방문 인증 수 (운영자 화면용, 시연용 가상 수치) */
export type HourlyCheckIn = {
  /** 0~23시 */
  hour: number;
  count: number;
  /** 축제 행사와 행사 사이의 공백시간대인지 */
  gap: boolean;
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
