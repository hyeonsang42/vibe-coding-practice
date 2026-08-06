"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { FESTIVAL_VENUE, SAFETY_MARGIN_MINUTES } from "@/lib/types";
import type { PlaceCategory } from "@/lib/types";

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
    <main className="mx-auto w-full max-w-md flex-1 px-7 pb-14 pt-8">
      <Link
        href="/"
        className="eyebrow text-muted transition hover:text-foreground"
      >
        ← 틈새진주
      </Link>

      <h1 className="mt-7 font-serif text-[1.75rem] font-semibold leading-snug tracking-tight">
        지금 상황을
        <br />
        알려주세요
      </h1>
      <p className="mt-3 text-[0.8125rem] leading-relaxed text-muted">
        다음 행사에 늦지 않도록 {SAFETY_MARGIN_MINUTES}분 여유를 두고
        계산합니다.
      </p>

      <form onSubmit={handleSubmit} className="mt-10">
        <Section title="어디에서, 무엇을 기다리나요">
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

        <Section title="어떻게 움직일까요">
          <Row label="예산" value={`${budget.toLocaleString()}원`}>
            <input
              type="range"
              min={5000}
              max={50000}
              step={1000}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
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
              className="w-full accent-accent"
            />
          </Row>
        </Section>

        <Section title="무엇이 끌리나요">
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
                  {item}
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
  "w-full bg-transparent text-right text-[0.9375rem] outline-none placeholder:text-muted";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-9">
      <h2 className="eyebrow mb-1 text-muted">{title}</h2>
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
      <p className="mb-9 border-l-2 border-line pl-4 text-[0.8125rem] leading-relaxed text-muted">
        {invalid
          ? "행사 시작시각이 현재 시각보다 빠릅니다. 시간을 다시 확인해주세요."
          : `남은 시간 ${remainMinutes}분. 안전여유 ${SAFETY_MARGIN_MINUTES}분을 빼면 움직일 시간이 없습니다.`}
      </p>
    );
  }

  return (
    <div className="mb-9 border-l-2 border-accent pl-4">
      <p className="eyebrow text-muted">남은 시간</p>
      <p className="tnum mt-1.5 font-serif text-4xl font-semibold leading-none text-accent">
        {remainMinutes}
        <span className="ml-1 text-lg font-medium">분</span>
      </p>
      <p className="mt-2.5 text-[0.8125rem] leading-relaxed text-muted">
        안전여유 {SAFETY_MARGIN_MINUTES}분을 빼고,{" "}
        <strong className="tnum font-medium text-foreground">
          {usableMinutes}분
        </strong>{" "}
        안에 다녀올 수 있는 코스를 찾습니다.
      </p>
    </div>
  );
}
