"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { VoiceInput } from "./VoiceInput";
import { formatDuration, splitDuration } from "@/lib/format";
import { FESTIVAL_VENUE, SAFETY_MARGIN_MINUTES } from "@/lib/types";
import type { PlaceCategory } from "@/lib/types";
import type { ParsedVoice } from "@/lib/voice-parse";

const INTERESTS: PlaceCategory[] = [
  "간식",
  "기념품",
  "카페",
  "시장",
  "문화공간",
];

/** "HH:MM" 을 자정 기준 분으로 바꾼다. */
function toMinutes(time: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

/** 화면 2 — 상황 입력 (docs/requirements.md 3장) */
export default function PlanPage() {
  const router = useRouter();

  const [from, setFrom] = useState(FESTIVAL_VENUE);
  const [eventName, setEventName] = useState("남강 유등 공연");
  const [now, setNow] = useState("18:10");
  const [eventAt, setEventAt] = useState("19:30");
  const [budget, setBudget] = useState(15000);
  const [walkLimit, setWalkLimit] = useState(10);
  const [interests, setInterests] = useState<PlaceCategory[]>(["간식", "카페"]);

  /** 남은 시간은 현재 시각과 행사 시작시각에서 자동으로 계산한다. */
  const remainMinutes = useMemo(() => {
    const start = toMinutes(now);
    const end = toMinutes(eventAt);
    if (start === null || end === null) return null;
    return end - start;
  }, [now, eventAt]);

  const usableMinutes =
    remainMinutes === null ? null : remainMinutes - SAFETY_MARGIN_MINUTES;

  const canSubmit = usableMinutes !== null && usableMinutes > 0;

  /** 말로 알아낸 값만 폼에 채운다. 못 알아낸 항목은 그대로 둔다. */
  function applyVoice(parsed: ParsedVoice) {
    if (parsed.now) setNow(parsed.now);
    if (parsed.eventAt) setEventAt(parsed.eventAt);
    if (parsed.budget) setBudget(parsed.budget);
    if (parsed.walkLimit) setWalkLimit(parsed.walkLimit);
    if (parsed.interests?.length) setInterests(parsed.interests);
  }

  function toggleInterest(value: PlaceCategory) {
    setInterests((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value],
    );
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit || remainMinutes === null) return;

    const params = new URLSearchParams({
      from,
      event: eventName,
      now,
      eventAt,
      remain: String(remainMinutes),
      budget: String(budget),
      walk: String(walkLimit),
      interests: interests.join(","),
    });

    router.push(`/courses?${params.toString()}`);
  }

  return (
    <main className="mx-auto w-full max-w-md flex-1">
      <div className="relative h-60 bg-ink">
        <Image
          src="/images/hero-market.jpg"
          alt=""
          fill
          priority
          sizes="(max-width: 448px) 100vw, 448px"
          className="object-cover object-[50%_35%] opacity-70 saturate-[0.8]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/30 to-black/75" />

        <div className="relative flex h-full flex-col justify-between px-7 pb-6 pt-7 text-white">
          <Link
            href="/"
            className="eyebrow text-white/60 transition hover:text-white"
          >
            ← 틈새진주
          </Link>

          <div>
            <div className="h-px w-10 bg-white/40" />
            <h1 className="mt-4 font-serif text-[1.75rem] font-semibold leading-snug tracking-tight">
              지금 상황을 알려주세요
            </h1>
            <p className="mt-2.5 text-[0.8125rem] leading-relaxed text-white/70">
              다음 행사에 늦지 않도록 {SAFETY_MARGIN_MINUTES}분 여유를 두고
              계산합니다.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-7 pb-14 pt-9">
        <VoiceInput onApply={applyVoice} />

        <Section step="01" title="어디에서, 무엇을 기다리나요">
          <Row label="현재 위치">
            <input
              type="text"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className={textInput}
            />
          </Row>
          <Row label="다음 행사">
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className={textInput}
            />
          </Row>
          <Row label="현재 시각">
            <input
              type="time"
              value={now}
              onChange={(e) => setNow(e.target.value)}
              className={`${textInput} tnum`}
            />
          </Row>
          <Row label="행사 시작">
            <input
              type="time"
              value={eventAt}
              onChange={(e) => setEventAt(e.target.value)}
              className={`${textInput} tnum`}
            />
          </Row>
        </Section>

        <RemainBlock
          remainMinutes={remainMinutes}
          usableMinutes={usableMinutes}
        />

        <Section step="02" title="어떻게 움직일까요">
          <Row label="예산" value={`${budget.toLocaleString()}원`}>
            <input
              type="range"
              min={5000}
              max={50000}
              step={1000}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              aria-label="예산"
              aria-valuetext={`${budget.toLocaleString()}원`}
              className="w-full accent-accent"
            />
          </Row>
          <Row label="도보" value={`편도 ${walkLimit}분`}>
            <input
              type="range"
              min={3}
              max={20}
              step={1}
              value={walkLimit}
              onChange={(e) => setWalkLimit(Number(e.target.value))}
              aria-label="감당 가능한 도보 시간"
              aria-valuetext={`편도 ${walkLimit}분`}
              className="w-full accent-accent"
            />
          </Row>
        </Section>

        <Section step="03" title="무엇이 끌리나요">
          <div className="flex flex-wrap gap-2 py-4">
            {INTERESTS.map((item) => {
              const selected = interests.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleInterest(item)}
                  aria-pressed={selected}
                  className={`rounded-sm border px-3.5 py-2 text-[0.8125rem] transition ${
                    selected
                      ? "border-ink bg-ink text-white"
                      : "border-line bg-surface text-muted hover:border-muted"
                  }`}
                >
                  {/* 색만으로 선택 상태를 알리지 않는다 */}
                  {selected ? <span aria-hidden>✓ </span> : null}
                  {item}
                  <span className="sr-only">
                    {selected ? " 선택됨" : " 선택 안 됨"}
                  </span>
                </button>
              );
            })}
          </div>
        </Section>

        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-10 flex h-14 w-full items-center justify-center rounded-sm bg-ink text-[0.9375rem] font-medium tracking-tight text-white transition hover:opacity-90 disabled:bg-line disabled:text-muted"
        >
          코스 추천받기
        </button>
      </form>
    </main>
  );
}

const textInput =
  "w-full bg-transparent text-right text-[0.9375rem] outline-none placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

function Section({
  step,
  title,
  children,
}: {
  step: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-9">
      <h2 className="mb-1 flex items-center gap-2.5">
        <span className="tnum eyebrow text-accent">{step}</span>
        <span className="h-px w-4 bg-line" />
        <span className="eyebrow text-muted">{title}</span>
      </h2>
      <div className="divide-y divide-line border-b border-line">{children}</div>
    </section>
  );
}

function Row({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children: React.ReactNode;
}) {
  const stacked = value !== undefined;

  return (
    <label className={stacked ? "block py-4" : "flex items-center gap-4 py-3.5"}>
      <span
        className={
          stacked
            ? "flex items-baseline justify-between"
            : "w-20 shrink-0 text-[0.8125rem] text-muted"
        }
      >
        <span className={stacked ? "text-[0.8125rem] text-muted" : undefined}>
          {label}
        </span>
        {stacked ? (
          <span className="tnum text-[0.9375rem] font-medium">{value}</span>
        ) : null}
      </span>
      <span className={stacked ? "mt-3 block" : "flex-1"}>{children}</span>
    </label>
  );
}

/** 큰 숫자는 크게, 단위는 작게 — 60분이 넘으면 "1시간 20분"으로 적는다 */
function Duration({
  value,
  unitClassName,
}: {
  value: number;
  unitClassName: string;
}) {
  const { hours, minutes } = splitDuration(value);
  const unit = `ml-1 font-medium ${unitClassName}`;

  return (
    <>
      {hours > 0 ? (
        <>
          {hours}
          <span className={unit}>시간</span>
        </>
      ) : null}
      {minutes > 0 || hours === 0 ? (
        <>
          {hours > 0 ? " " : ""}
          {minutes}
          <span className={unit}>분</span>
        </>
      ) : null}
    </>
  );
}

function RemainBlock({
  remainMinutes,
  usableMinutes,
}: {
  remainMinutes: number | null;
  usableMinutes: number | null;
}) {
  if (remainMinutes === null) return null;

  const invalid = remainMinutes <= 0;
  const tooTight = !invalid && (usableMinutes === null || usableMinutes <= 0);

  if (invalid || tooTight) {
    return (
      <p
        role="status"
        aria-live="polite"
        className="mb-9 rounded-sm border border-line bg-surface px-5 py-4 text-[0.8125rem] leading-relaxed text-muted"
      >
        {invalid
          ? "행사 시작시각이 현재 시각보다 빠릅니다. 시간을 다시 확인해주세요."
          : `남은 시간 ${formatDuration(remainMinutes)}. 안전여유 ${SAFETY_MARGIN_MINUTES}분을 빼면 움직일 시간이 없습니다.`}
      </p>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="mb-9 rounded-sm border border-line bg-surface px-5 py-5"
    >
      <p className="sr-only">
        남은 시간 {formatDuration(remainMinutes)}, 안전여유{" "}
        {SAFETY_MARGIN_MINUTES}분을 빼면 움직일 수 있는 시간은{" "}
        {formatDuration(usableMinutes ?? 0)}입니다.
      </p>

      <div aria-hidden className="flex items-end justify-between">
        <div>
          <p className="eyebrow text-muted">남은 시간</p>
          <p className="tnum mt-2 font-serif text-[2.75rem] font-semibold leading-none">
            <Duration value={remainMinutes} unitClassName="text-lg text-muted" />
          </p>
        </div>
        <div className="text-right">
          <p className="eyebrow text-accent">움직일 수 있는 시간</p>
          <p className="tnum mt-2 font-serif text-2xl font-semibold leading-none text-accent">
            <Duration value={usableMinutes ?? 0} unitClassName="text-sm" />
          </p>
        </div>
      </div>

      <p
        aria-hidden
        className="mt-4 border-t border-line pt-3 text-[0.75rem] leading-relaxed text-muted"
      >
        행사에 늦지 않도록 안전여유 {SAFETY_MARGIN_MINUTES}분을 빼고 계산합니다.
      </p>
    </div>
  );
}
