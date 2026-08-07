"use client";

import { useState } from "react";

import { KakaoMap } from "./KakaoMap";
import { OsmMap } from "./OsmMap";
import type { Place } from "@/lib/types";

/**
 * 지도를 세 단계로 내려간다.
 *
 *   카카오맵  →  OpenStreetMap
 *
 * 카카오맵은 앱에서 지도 서비스를 켜야 쓸 수 있는데, 계정에 따라 심사가
 * 필요하다. 그래서 막히면 키 없이 바로 뜨는 OpenStreetMap 으로 내려간다.
 * 나중에 카카오맵이 켜지면 코드를 고치지 않아도 다시 그쪽이 쓰인다.
 *
 * 발표 중 지도가 안 떠서 화면이 비는 상황을 만들지 않는 것이 목적이다.
 */
export function MapSection({ places }: { places: Place[] }) {
  const [kakaoFailed, setKakaoFailed] = useState(false);
  const hasKakaoKey = Boolean(process.env.NEXT_PUBLIC_KAKAO_MAP_KEY);

  if (hasKakaoKey && !kakaoFailed) {
    return <KakaoMap places={places} onFail={() => setKakaoFailed(true)} />;
  }

  return <OsmMap places={places} />;
}
