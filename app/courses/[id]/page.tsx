import Link from "next/link";
import { notFound } from "next/navigation";

import { CourseMap } from "./CourseMap";
import { SpeakButton } from "../../SpeakButton";
import { courses, getCoursePlaces } from "@/lib/demo-data";
import { buildItinerary, formatTime, parseTime } from "@/lib/recommend";
import { itinerarySpeech } from "@/lib/speech-text";
import type { ItineraryStep } from "@/lib/recommend";
import { FESTIVAL_VENUE, SAFETY_MARGIN_MINUTES } from "@/lib/types";

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** 화면 4 — 상세 동선 (docs/requirements.md 3장) */
export default async function CourseDetailPage({
  params,
  searchParams,
}: PageProps<"/courses/[id]">) {
  const { id } = await params;
  const query = await searchParams;

  const course = courses.find((item) => item.id === id);
  if (!course) notFound();

  const places = getCoursePlaces(course);

  const now = first(query.now) ?? "18:10";
  const eventAt = first(query.eventAt) ?? "19:30";
  const eventName = first(query.event) ?? "다음 행사";
  const startMinutes = parseTime(now) ?? 0;
  const eventMinutes = parseTime(eventAt);

  const steps = buildItinerary(course, places, startMinutes);
  const returnMinutes = startMinutes + course.totalMinutes;
  const gapMinutes =
    eventMinutes === null ? null : eventMinutes - returnMinutes;

  const backQuery = new URLSearchParams(
    Object.entries(query).flatMap(([key, value]) => {
      const single = first(value);
      return single === undefined ? [] : [[key, single] as [string, string]];
    }),
  ).toString();
  const backHref = backQuery ? `/courses?${backQuery}` : "/courses";
  const checkInHref = backQuery
    ? `/courses/${course.id}/check-in?${backQuery}`
    : `/courses/${course.id}/check-in`;

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-7 pb-14 pt-8">
      <Link
        href={backHref}
        className="eyebrow text-muted transition hover:text-foreground"
      >
        ← 다른 코스 보기
      </Link>

      <p className="eyebrow mt-7 text-accent">{course.slot}분 코스</p>
      <h1 className="mt-2 font-serif text-[1.75rem] font-semibold leading-snug tracking-tight">
        {course.title}
      </h1>
      <p className="mt-3 text-[0.8125rem] leading-relaxed text-muted">
        {course.reason}
      </p>

      <CourseMap places={places} />

      <ReturnBadge
        eventName={eventName}
        eventAt={eventAt}
        returnAt={formatTime(returnMinutes)}
        gapMinutes={gapMinutes}
      />

      <div className="mt-6">
        <SpeakButton
          label="동선 전체 듣기"
          className="w-full justify-center"
          text={itinerarySpeech({ course, steps, eventName, gapMinutes })}
        />
      </div>

      <section className="mt-9">
        <h2 className="eyebrow text-muted">이동 순서</h2>
        <ol className="mt-3 border-t border-line">
          {steps.map((step, index) => (
            <li key={index}>
              <Step step={step} />
            </li>
          ))}
        </ol>
      </section>

      <dl className="mt-8 divide-y divide-line border-y border-line">
        <Row label="총 걸리는 시간">
          <span className="tnum">
            이동 {course.travelMinutes}분 + 머무는 {course.stayMinutes}분 ={" "}
            <strong className="font-medium">{course.totalMinutes}분</strong>
          </span>
        </Row>
        <Row label="예상 지출">
          <span className="tnum">{course.spend.toLocaleString()}원</span>
        </Row>
        <Row label="비가 오면">{course.rainAlternative}</Row>
      </dl>

      <Link
        href={checkInHref}
        className="mt-9 flex h-14 w-full items-center justify-center rounded-sm bg-ink text-[0.9375rem] font-medium tracking-tight text-white transition hover:opacity-90"
      >
        상점에서 QR 찍기
      </Link>
    </main>
  );
}

function ReturnBadge({
  eventName,
  eventAt,
  returnAt,
  gapMinutes,
}: {
  eventName: string;
  eventAt: string;
  returnAt: string;
  gapMinutes: number | null;
}) {
  const safe = gapMinutes !== null && gapMinutes >= SAFETY_MARGIN_MINUTES;

  return (
    <div
      className={`mt-8 border-l-2 pl-4 ${safe ? "border-accent" : "border-line"}`}
    >
      <p className="eyebrow text-muted">복귀 예정</p>
      <p className="tnum mt-1.5 font-serif text-4xl font-semibold leading-none">
        {returnAt}
      </p>
      <p className="mt-2.5 text-[0.8125rem] leading-relaxed text-muted">
        {gapMinutes === null ? (
          <>행사 시작시각을 확인할 수 없습니다.</>
        ) : (
          <>
            <span className="tnum">{eventAt}</span> {eventName} 시작{" "}
            <strong className="tnum font-medium text-foreground">
              {gapMinutes}분 전
            </strong>
            에 돌아옵니다. 안전여유 {SAFETY_MARGIN_MINUTES}분{" "}
            {safe ? "이상을 남겼습니다." : "에 못 미칩니다."}
          </>
        )}
      </p>
    </div>
  );
}

function Step({ step }: { step: ItineraryStep }) {
  if (step.kind === "이동") {
    return (
      <div className="flex items-center gap-4 py-2 pl-[4.5rem] text-[0.75rem] text-muted">
        <span className="h-4 w-px bg-line" />
        <span className="tnum">걸어서 {step.minutes}분</span>
      </div>
    );
  }

  if (step.kind === "체류") {
    return (
      <div className="flex gap-4 border-b border-line py-3.5">
        <span className="tnum w-[4.5rem] shrink-0 text-[0.8125rem] font-medium">
          {step.at}
        </span>
        <span className="flex-1">
          <span className="block text-[0.875rem] font-medium">
            {step.place.name}
          </span>
          <span className="mt-1 block text-[0.75rem] leading-relaxed text-muted">
            {step.place.area} · {step.place.note}
          </span>
          <span className="tnum mt-1.5 block text-[0.75rem] text-accent">
            {step.at}–{step.until} · {step.place.stayMinutes}분 머무름 ·{" "}
            {step.place.benefit}
          </span>
        </span>
      </div>
    );
  }

  const venueLabel = step.kind === "출발" ? "출발" : "복귀";

  return (
    <div className="flex gap-4 border-b border-line py-3.5">
      <span className="tnum w-[4.5rem] shrink-0 text-[0.8125rem] font-medium">
        {step.at}
      </span>
      <span className="flex-1 text-[0.875rem]">
        {FESTIVAL_VENUE} {venueLabel}
      </span>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 py-3 text-[0.8125rem]">
      <dt className="w-24 shrink-0 text-muted">{label}</dt>
      <dd className="flex-1 leading-relaxed text-foreground/90">{children}</dd>
    </div>
  );
}
