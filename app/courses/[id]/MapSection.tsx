"use client";

import { useState } from "react";

import { CourseMap } from "./CourseMap";
import { KakaoMap } from "./KakaoMap";
import type { Place } from "@/lib/types";

/**
 * 실제 지도를 먼저 쓰고, 못 쓰면 그림 지도로 내려간다.
 *
 * 키가 없는 환경(배포에 환경변수를 아직 안 넣은 경우)이나 지도 서버가
 * 응답하지 않는 경우에도 화면이 비지 않게 한다. 발표 중에 지도가 안 뜨는
 * 상황을 피하는 것이 목적이다.
 */
export function MapSection({ places }: { places: Place[] }) {
  const [failed, setFailed] = useState(false);
  const hasKey = Boolean(process.env.NEXT_PUBLIC_KAKAO_MAP_KEY);

  if (!hasKey || failed) return <CourseMap places={places} />;

  return <KakaoMap places={places} onFail={() => setFailed(true)} />;
}
