import { DEMO_DATA_LABEL, FESTIVAL_VENUE, VENUE_MAP_POSITION } from "@/lib/types";
import type { Place } from "@/lib/types";

/**
 * 추상 지도 — 실제 지도가 아니다.
 * 저작권 있는 지도 이미지를 쓰지 않기 위해, 축제장과 방문 지점의
 * 상대적인 위치만 도형으로 그린다. (docs/requirements.md 3장)
 */
export function CourseMap({ places }: { places: Place[] }) {
  const venue = VENUE_MAP_POSITION;
  const route = [venue, ...places.map((place) => place.map), venue];
  const line = route.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <figure className="mt-7">
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm border border-line bg-[#efece5]">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          aria-hidden
        >
          {/* 남강 — 화면 아래를 가로지르는 물길 */}
          <path
            d="M -5 88 C 20 82, 38 96, 60 90 C 78 85, 90 94, 105 89 L 105 110 L -5 110 Z"
            fill="#e3e6e1"
          />

          {/* 큰길 */}
          <g stroke="#e0dbd2" strokeWidth="1" vectorEffect="non-scaling-stroke">
            <line x1="0" y1="52" x2="100" y2="52" />
            <line x1="52" y1="0" x2="52" y2="84" />
            <line x1="18" y1="0" x2="24" y2="84" />
            <line x1="84" y1="0" x2="78" y2="84" />
          </g>

          {/* 방문 순서 동선 */}
          <polyline
            points={line}
            fill="none"
            stroke="#9a4f24"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* 축제장 */}
        <Marker x={venue.x} y={venue.y} label={FESTIVAL_VENUE} venue />

        {/* 방문 지점 */}
        {places.map((place, index) => (
          <Marker
            key={place.id}
            x={place.map.x}
            y={place.map.y}
            label={place.name}
            order={index + 1}
          />
        ))}

        <span className="eyebrow absolute left-3 top-3 text-muted">
          {DEMO_DATA_LABEL}
        </span>
      </div>

      <figcaption className="mt-2.5 text-[0.6875rem] leading-relaxed text-muted">
        실제 지도가 아니라 위치 관계만 그린 그림입니다. 거리와 방향은 실제와
        다릅니다.
      </figcaption>
    </figure>
  );
}

function Marker({
  x,
  y,
  label,
  order,
  venue = false,
}: {
  x: number;
  y: number;
  label: string;
  order?: number;
  venue?: boolean;
}) {
  return (
    <div
      className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      {venue ? (
        <span className="flex h-3.5 w-3.5 rotate-45 items-center justify-center border-2 border-ink bg-[#efece5]" />
      ) : (
        <span className="tnum flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[0.6875rem] font-medium text-white">
          {order}
        </span>
      )}
      <span
        className={`mt-1.5 whitespace-nowrap text-[0.625rem] leading-none ${
          venue ? "font-medium text-ink" : "text-foreground/70"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
