/**
 * 틈새진주 시연용 데이터
 *
 * ⚠️ 상호명·혼잡도·소요시간·지출은 모두 가상 수치다.
 *    현장 조사 전이므로 실제 상호를 쓰지 않는다. (docs/plan.md 2장)
 *    조사 후 실제 데이터로 교체하는 것을 전제로 한다.
 */

import type { Course, Place } from "./types";

export const places: Place[] = [
  {
    id: "p1",
    name: "밤빛떡집",
    category: "간식",
    area: "진주성 서문 방면",
    walkMinutes: 5,
    stayMinutes: 10,
    spend: 4000,
    openHours: "10:00-21:00",
    benefit: "인절미 1개 추가",
    crowdLevel: 3,
    indoor: false,
    note: "포장이 빨라 시간이 촉박할 때 들르기 좋다.",
  },
  {
    id: "p2",
    name: "실크한올공방",
    category: "기념품",
    area: "진주성 북문 방면",
    walkMinutes: 7,
    stayMinutes: 20,
    spend: 12000,
    openHours: "10:00-19:00",
    benefit: "손수건 이름 각인 무료",
    crowdLevel: 1,
    indoor: true,
    note: "실크 소품을 직접 고르고 각인해 갈 수 있다.",
  },
  {
    id: "p3",
    name: "골목붕어빵",
    category: "간식",
    area: "남강 산책로 초입",
    walkMinutes: 4,
    stayMinutes: 8,
    spend: 3000,
    openHours: "12:00-22:00",
    benefit: "붕어빵 1개 추가",
    crowdLevel: 2,
    indoor: false,
    note: "가장 가까운 간식 지점. 줄이 짧다.",
  },
  {
    id: "p4",
    name: "중앙골목시장",
    category: "시장",
    area: "중앙시장 방면",
    walkMinutes: 9,
    stayMinutes: 30,
    spend: 10000,
    openHours: "08:00-20:00",
    benefit: "시장 상품권 500원",
    crowdLevel: 2,
    indoor: false,
    note: "여러 점포를 한 번에 둘러볼 수 있는 골목 구간.",
  },
  {
    id: "p5",
    name: "다솔당 찻집",
    category: "카페",
    area: "대안동 골목",
    walkMinutes: 8,
    stayMinutes: 25,
    spend: 7000,
    openHours: "11:00-22:00",
    benefit: "음료 사이즈 업",
    crowdLevel: 1,
    indoor: true,
    note: "앉아서 쉬어갈 수 있는 실내 공간.",
  },
  {
    id: "p6",
    name: "남강책방",
    category: "문화공간",
    area: "남강 둔치 인근",
    walkMinutes: 10,
    stayMinutes: 25,
    spend: 5000,
    openHours: "11:00-21:00",
    benefit: "엽서 1장 증정",
    crowdLevel: 1,
    indoor: true,
    note: "지역 책과 소품을 파는 작은 서점.",
  },
  {
    id: "p7",
    name: "유등기념품점",
    category: "기념품",
    area: "행사장 정문 앞",
    walkMinutes: 3,
    stayMinutes: 12,
    spend: 8000,
    openHours: "10:00-22:00",
    benefit: "기념 배지 증정",
    crowdLevel: 3,
    indoor: false,
    note: "행사장에서 가장 가깝다. 사람이 몰리는 편.",
  },
  {
    id: "p8",
    name: "진양김밥",
    category: "간식",
    area: "행사장 동편 골목",
    walkMinutes: 6,
    stayMinutes: 15,
    spend: 6000,
    openHours: "09:00-20:00",
    benefit: "음료 서비스",
    crowdLevel: 2,
    indoor: true,
    note: "앉아서 간단히 끼니를 해결할 수 있다.",
  },
];

export const courses: Course[] = [
  {
    id: "c30",
    slot: 30,
    title: "간식 한 손, 기념품 하나",
    placeIds: ["p3", "p7"],
    travelMinutes: 10,
    stayMinutes: 20,
    totalMinutes: 30,
    spend: 11000,
    reason:
      "행사장에서 가장 가까운 두 곳만 묶었습니다. 이동이 짧아 시간이 빠듯할 때도 무리가 없습니다.",
    rainAlternative: "비가 오면 붕어빵 대신 실내인 진양김밥으로 바꿀 수 있습니다.",
  },
  {
    id: "c60",
    slot: 60,
    title: "앉아서 쉬고, 떡 사서 돌아오기",
    placeIds: ["p5", "p1"],
    travelMinutes: 19,
    stayMinutes: 35,
    totalMinutes: 54,
    spend: 11000,
    reason:
      "실내 찻집에서 앉아 쉰 뒤 돌아오는 길에 떡집을 들르는 동선입니다. 다리를 쉬어가기 좋습니다.",
    rainAlternative: "두 곳 중 찻집이 실내라 비가 와도 대부분 일정을 지킬 수 있습니다.",
  },
  {
    id: "c90",
    slot: 90,
    title: "시장 한 바퀴, 책방에서 마무리",
    placeIds: ["p4", "p6"],
    travelMinutes: 27,
    stayMinutes: 55,
    totalMinutes: 82,
    spend: 15000,
    reason:
      "골목시장을 둘러본 뒤 조용한 책방에서 마무리하는 코스입니다. 상권 안쪽까지 들어가 봅니다.",
    rainAlternative: "비가 오면 시장 구간을 줄이고 책방 체류를 늘리는 편이 좋습니다.",
  },
];

/** id로 장소를 찾는다. 없으면 undefined. */
export function findPlace(id: string): Place | undefined {
  return places.find((place) => place.id === id);
}

/** 코스의 방문 순서대로 장소 목록을 돌려준다. */
export function getCoursePlaces(course: Course): Place[] {
  return course.placeIds
    .map(findPlace)
    .filter((place): place is Place => place !== undefined);
}
