"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";

import { DEMO_DATA_LABEL, FESTIVAL_VENUE, VENUE_COORD } from "@/lib/types";
import type { Place } from "@/lib/types";

/**
 * OpenStreetMap 지도.
 *
 * 카카오맵은 앱 심사·활성화가 필요해 바로 못 쓰는 경우가 있다.
 * 이쪽은 키도 승인도 없이 바로 뜨므로, 카카오맵이 막히면 여기로 내려온다.
 * 지도 출처 표기는 OpenStreetMap 이용 조건이라 반드시 남긴다.
 */

function markerHtml(order: number, name: string): string {
  return `
    <div style="display:flex;flex-direction:column;align-items:center">
      <div style="width:24px;height:24px;border-radius:999px;background:#9a4f24;color:#fff;
                  font-size:11px;font-weight:600;display:flex;align-items:center;justify-content:center;
                  box-shadow:0 1px 4px rgba(0,0,0,.35)">${order}</div>
      <div style="margin-top:4px;padding:2px 6px;border-radius:3px;background:rgba(255,255,255,.92);
                  font-size:11px;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,.2);
                  color:#1b1a17">${name}</div>
    </div>`;
}

function venueHtml(): string {
  return `
    <div style="display:flex;flex-direction:column;align-items:center">
      <div style="width:14px;height:14px;transform:rotate(45deg);background:#fff;border:3px solid #221f1a;
                  box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>
      <div style="margin-top:6px;padding:2px 6px;border-radius:3px;background:#221f1a;color:#fff;
                  font-size:11px;font-weight:500;white-space:nowrap">${FESTIVAL_VENUE}</div>
    </div>`;
}

export function OsmMap({ places }: { places: Place[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;

    void (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current) return;

      const venue: [number, number] = [VENUE_COORD.lat, VENUE_COORD.lng];
      const map = L.map(container, { zoomControl: true, attributionControl: true });

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap 기여자",
      }).addTo(map);

      // 축제장 → 각 지점 → 축제장
      const path: [number, number][] = [
        venue,
        ...places.map(
          (place) => [place.coord.lat, place.coord.lng] as [number, number],
        ),
        venue,
      ];

      L.polyline(path, {
        color: "#9a4f24",
        weight: 3,
        opacity: 0.9,
        dashArray: "6 5",
      }).addTo(map);

      L.marker(venue, {
        icon: L.divIcon({
          html: venueHtml(),
          className: "",
          iconSize: [0, 0],
          iconAnchor: [7, 7],
        }),
        keyboard: false,
      }).addTo(map);

      places.forEach((place, index) => {
        L.marker([place.coord.lat, place.coord.lng], {
          icon: L.divIcon({
            html: markerHtml(index + 1, place.name),
            className: "",
            iconSize: [0, 0],
            iconAnchor: [12, 12],
          }),
          keyboard: false,
        }).addTo(map);
      });

      map.fitBounds(L.latLngBounds(path), { padding: [36, 28] });

      cleanup = () => map.remove();
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [places]);

  return (
    <figure className="mt-7">
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm border border-line bg-line">
        <div ref={containerRef} className="absolute inset-0" />
        <span className="eyebrow pointer-events-none absolute left-3 top-3 z-[500] rounded-sm bg-surface/90 px-2 py-1 text-muted">
          {DEMO_DATA_LABEL}
        </span>
      </div>

      <figcaption className="mt-2.5 text-[0.6875rem] leading-relaxed text-muted">
        지도는 실제 진주 지도입니다. 다만 표시된 상점은 시연용 가상 장소이며,
        위치도 실제 가게 자리가 아닙니다.
      </figcaption>
    </figure>
  );
}
