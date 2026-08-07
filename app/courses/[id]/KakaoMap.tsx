"use client";

import Script from "next/script";
import { useRef, useState } from "react";

import { DEMO_DATA_LABEL, FESTIVAL_VENUE, VENUE_COORD } from "@/lib/types";
import type { Place } from "@/lib/types";

/* 카카오맵 SDK — 타입 정의가 없어 필요한 부분만 적는다 */
type LatLng = { lat: () => number; lng: () => number };
type Bounds = { extend: (point: LatLng) => void };
type MapInstance = { setBounds: (bounds: Bounds, ...padding: number[]) => void };

type KakaoMaps = {
  load: (callback: () => void) => void;
  LatLng: new (lat: number, lng: number) => LatLng;
  LatLngBounds: new () => Bounds;
  Map: new (
    container: HTMLElement,
    options: { center: LatLng; level: number },
  ) => MapInstance;
  Polyline: new (options: {
    path: LatLng[];
    strokeWeight: number;
    strokeColor: string;
    strokeOpacity: number;
    strokeStyle: string;
  }) => { setMap: (map: MapInstance) => void };
  CustomOverlay: new (options: {
    position: LatLng;
    content: string;
    yAnchor?: number;
    zIndex?: number;
  }) => { setMap: (map: MapInstance) => void };
};

const KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

function markerHtml(order: number, name: string): string {
  return `
    <div style="display:flex;flex-direction:column;align-items:center;transform:translateY(-4px)">
      <div style="width:24px;height:24px;border-radius:999px;background:#9a4f24;color:#fff;
                  font-size:11px;font-weight:600;display:flex;align-items:center;justify-content:center;
                  box-shadow:0 1px 4px rgba(0,0,0,.35)">${order}</div>
      <div style="margin-top:4px;padding:2px 6px;border-radius:3px;background:rgba(255,255,255,.92);
                  font-size:11px;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,.2)">${name}</div>
    </div>`;
}

function venueHtml(): string {
  return `
    <div style="display:flex;flex-direction:column;align-items:center;transform:translateY(-4px)">
      <div style="width:14px;height:14px;transform:rotate(45deg);background:#fff;border:3px solid #221f1a;
                  box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>
      <div style="margin-top:6px;padding:2px 6px;border-radius:3px;background:#221f1a;color:#fff;
                  font-size:11px;font-weight:500;white-space:nowrap">${FESTIVAL_VENUE}</div>
    </div>`;
}

/**
 * 실제 지도 위에 방문 순서를 그린다.
 * 키가 없거나 SDK를 못 불러오면 아무것도 그리지 않고, 부모가 그림 지도를 대신 보여준다.
 */
export function KakaoMap({
  places,
  onFail,
}: {
  places: Place[];
  onFail: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  function draw() {
    const kakao = (window as unknown as { kakao?: { maps: KakaoMaps } }).kakao;
    const container = containerRef.current;
    if (!kakao || !container) {
      onFail();
      return;
    }

    kakao.maps.load(() => {
      const maps = kakao.maps;
      const venue = new maps.LatLng(VENUE_COORD.lat, VENUE_COORD.lng);
      const map = new maps.Map(container, { center: venue, level: 5 });

      // 축제장 → 각 지점 → 축제장 순서로 잇는다
      const path = [
        venue,
        ...places.map((place) => new maps.LatLng(place.coord.lat, place.coord.lng)),
        venue,
      ];

      new maps.Polyline({
        path,
        strokeWeight: 3,
        strokeColor: "#9a4f24",
        strokeOpacity: 0.9,
        strokeStyle: "shortdash",
      }).setMap(map);

      new maps.CustomOverlay({
        position: venue,
        content: venueHtml(),
        yAnchor: 1,
        zIndex: 2,
      }).setMap(map);

      places.forEach((place, index) => {
        new maps.CustomOverlay({
          position: new maps.LatLng(place.coord.lat, place.coord.lng),
          content: markerHtml(index + 1, place.name),
          yAnchor: 1,
          zIndex: 3,
        }).setMap(map);
      });

      // 모든 지점이 한 화면에 들어오게 맞춘다
      const bounds = new maps.LatLngBounds();
      path.forEach((point) => bounds.extend(point));
      map.setBounds(bounds, 40, 24, 24, 24);

      setReady(true);
    });
  }

  if (!KEY) return null;

  return (
    <figure className="mt-7">
      <Script
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KEY}&autoload=false`}
        strategy="afterInteractive"
        onReady={draw}
        onError={onFail}
      />

      <div className="relative aspect-[4/5] overflow-hidden rounded-sm border border-line bg-line">
        <div ref={containerRef} className="absolute inset-0" />

        {ready ? (
          <span className="eyebrow pointer-events-none absolute left-3 top-3 rounded-sm bg-surface/90 px-2 py-1 text-muted">
            {DEMO_DATA_LABEL}
          </span>
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-[0.75rem] text-muted">
            지도를 불러오는 중…
          </span>
        )}
      </div>

      <figcaption className="mt-2.5 text-[0.6875rem] leading-relaxed text-muted">
        지도는 실제 진주 지도입니다. 다만 표시된 상점은 시연용 가상 장소이며,
        위치도 실제 가게 자리가 아닙니다.
      </figcaption>
    </figure>
  );
}
