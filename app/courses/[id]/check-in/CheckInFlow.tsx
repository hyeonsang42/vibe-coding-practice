"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { QrArt } from "./QrArt";
import { DEMO_DATA_LABEL } from "@/lib/types";
import type { Place } from "@/lib/types";

/** 인식 중 화면을 보여주는 시간 (밀리초) */
const SCAN_MS = 1100;

export function CheckInFlow({
  places,
  courseTitle,
  backHref,
}: {
  places: Place[];
  courseTitle: string;
  backHref: string;
}) {
  const [done, setDone] = useState<string[]>([]);
  const [scanning, setScanning] = useState<Place | null>(null);

  useEffect(() => {
    if (!scanning) return;

    const timer = setTimeout(() => {
      setDone((prev) =>
        prev.includes(scanning.id) ? prev : [...prev, scanning.id],
      );
      setScanning(null);
    }, SCAN_MS);

    return () => clearTimeout(timer);
  }, [scanning]);

  const allDone = places.length > 0 && done.length === places.length;

  return (
    <>
      <div className="mt-7 flex items-baseline justify-between border-b border-line pb-3">
        <p className="eyebrow text-muted">{courseTitle}</p>
        <p role="status" aria-live="polite" className="tnum text-[0.8125rem] font-medium">
          {done.length}
          <span className="text-muted"> / {places.length} 곳 인증</span>
        </p>
      </div>

      <ol className="mt-6 space-y-4">
        {places.map((place, index) => {
          const checked = done.includes(place.id);

          return (
            <li
              key={place.id}
              className={`rounded-sm border px-5 py-4 transition ${
                checked ? "border-accent bg-accent-soft" : "border-line bg-surface"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <span
                  className={`tnum mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[0.6875rem] font-medium ${
                    checked ? "bg-accent text-white" : "bg-line text-muted"
                  }`}
                >
                  {index + 1}
                </span>

                <div className="flex-1">
                  <p className="text-[0.9375rem] font-medium">
                    {place.name}
                    {/* 색만으로 인증 여부를 알리지 않는다 */}
                    {checked ? (
                      <span className="ml-2 align-middle text-[0.6875rem] font-medium text-accent">
                        ✓ 인증 완료
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-[0.75rem] text-muted">{place.area}</p>

                  {checked ? (
                    <div className="mt-3 border-t border-accent/25 pt-3">
                      <p className="eyebrow text-accent">받은 혜택</p>
                      <p className="mt-1.5 text-[0.8125rem] font-medium">
                        {place.benefit}
                      </p>
                      <p className="mt-1.5 text-[0.75rem] leading-relaxed text-muted">
                        방문 인증이 기록되었습니다. 다음 제휴상점에서 혜택이
                        하나 더 열립니다.
                      </p>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setScanning(place)}
                      className="mt-3 inline-flex h-10 items-center justify-center rounded-sm bg-ink px-4 text-[0.8125rem] font-medium text-white transition hover:opacity-90"
                    >
                      여기서 QR 찍기
                      <span className="sr-only"> — {place.name}</span>
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {allDone ? <Badge /> : null}

      <div className="mt-9 flex gap-3">
        <Link
          href={backHref}
          className="flex h-12 flex-1 items-center justify-center rounded-sm border border-line bg-surface text-[0.8125rem] font-medium transition hover:border-muted"
        >
          동선 다시 보기
        </Link>
        <Link
          href="/"
          className="flex h-12 flex-1 items-center justify-center rounded-sm border border-line bg-surface text-[0.8125rem] font-medium transition hover:border-muted"
        >
          처음으로
        </Link>
      </div>

      {scanning ? <ScanOverlay place={scanning} /> : null}
    </>
  );
}

function Badge() {
  return (
    <section className="mt-8 rounded-sm border border-ink bg-ink px-6 py-7 text-center text-white">
      <p className="eyebrow text-white/50">코스 완주</p>

      <div className="mx-auto mt-4 flex h-20 w-20 items-center justify-center rounded-full border border-white/25">
        <span className="font-serif text-2xl font-semibold">유등</span>
      </div>

      <p className="mt-4 font-serif text-lg font-semibold">
        유등 배지를 받았습니다
      </p>
      <p className="mt-2 text-[0.75rem] leading-relaxed text-white/60">
        기념품 응모권 1장이 함께 적립되었습니다.
        <br />
        {DEMO_DATA_LABEL} · 실제 적립·정산은 이번 프로토타입 범위 밖입니다.
      </p>
    </section>
  );
}

function ScanOverlay({ place }: { place: Place }) {
  return (
    <div
      role="status"
      aria-live="assertive"
      className="fixed inset-0 z-10 flex items-center justify-center bg-ink/85 px-8"
    >
      <div className="w-full max-w-[17rem] text-center">
        <div
          aria-hidden
          className="relative mx-auto aspect-square w-44 rounded-sm bg-white p-5 text-ink"
        >
          <QrArt seed={place.id} />
          <span className="absolute inset-x-5 top-1/2 h-px animate-pulse bg-accent" />
        </div>

        <p className="mt-6 text-[0.9375rem] font-medium text-white">
          {place.name}
        </p>
        <p className="mt-1.5 text-[0.8125rem] text-white/60">
          코드를 인식하는 중입니다…
        </p>
        <p className="mt-5 text-[0.6875rem] leading-relaxed text-white/40">
          카메라를 쓰지 않는 시연입니다.
          <br />
          실제 서비스에서는 상점에 붙은 QR을 찍습니다.
        </p>
      </div>
    </div>
  );
}
