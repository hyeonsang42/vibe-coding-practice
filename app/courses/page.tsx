import Image from "next/image";
import Link from "next/link";

import { SpeakButton } from "../SpeakButton";
import { formatDuration } from "@/lib/format";
import { parseTime, recommendCourses } from "@/lib/recommend";
import { courseSpeech } from "@/lib/speech-text";
import type { Recommendation, RejectReason } from "@/lib/recommend";
import { DEMO_DATA_LABEL, SAFETY_MARGIN_MINUTES } from "@/lib/types";
import type { PlaceCategory } from "@/lib/types";

const CATEGORIES: PlaceCategory[] = [
  "간식",
  "기념품",
  "카페",
  "시장",
  "문화공간",
];

function toNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** 화면 3 — AI 추천 결과 (docs/requirements.md 3장) */
export default async function CoursesPage({
  searchParams,
}: PageProps<"/courses">) {
  const params = await searchParams;

  const eventName = first(params.event) ?? "다음 행사";
  const now = first(params.now) ?? "18:10";
  const eventAt = first(params.eventAt) ?? "19:30";
  const nowMinutes = parseTime(now) ?? 0;
  const remainMinutes = toNumber(first(params.remain), 80);
  const budget = toNumber(first(params.budget), 15000);
  const walkLimit = toNumber(first(params.walk), 10);
  const interests = (first(params.interests) ?? "")
    .split(",")
    .filter((item): item is PlaceCategory =>
      CATEGORIES.includes(item as PlaceCategory),
    );

  const { recommendations, rejected } = recommendCourses({
    remainMinutes,
    nowMinutes,
    budget,
    walkLimit,
    interests,
  });

  // 상세 화면에서도 같은 조건을 쓰도록 조건을 그대로 넘긴다
  const query = new URLSearchParams(
    Object.entries(params).flatMap(([key, value]) => {
      const single = first(value);
      return single === undefined ? [] : [[key, single] as [string, string]];
    }),
  ).toString();

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-7 pb-14 pt-8">
      <Link
        href="/plan"
        className="eyebrow text-muted transition hover:text-foreground"
      >
        ← 조건 바꾸기
      </Link>

      <header className="mt-7">
        <h1 className="font-serif text-[1.75rem] font-semibold leading-snug tracking-tight">
          {formatDuration(remainMinutes)}이면
          <br />
          다녀올 수 있어요
        </h1>
        <p className="mt-3 text-[0.8125rem] leading-relaxed text-muted">
          <span className="tnum">{eventAt}</span> {eventName}에 늦지 않도록
          안전여유 {SAFETY_MARGIN_MINUTES}분을 남겨 계산했습니다.
        </p>

        <dl className="mt-6 flex gap-6 border-y border-line py-3.5">
          <Meta label="현재" value={now} />
          <Meta label="예산" value={`${budget.toLocaleString()}원`} />
          <Meta label="도보" value={`편도 ${walkLimit}분`} />
        </dl>
      </header>

      {recommendations.length === 0 ? (
        <EmptyState remainMinutes={remainMinutes} />
      ) : (
        <ol className="mt-8 space-y-8">
          {recommendations.map((item, index) => (
            <li key={item.course.id}>
              <CourseCard item={item} rank={index + 1} query={query} />
            </li>
          ))}
        </ol>
      )}

      {rejected.length > 0 ? <RejectedNote rejected={rejected} /> : null}
    </main>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="eyebrow text-muted">{label}</dt>
      <dd className="tnum mt-1 text-[0.8125rem] font-medium">{value}</dd>
    </div>
  );
}

function CourseCard({
  item,
  rank,
  query,
}: {
  item: Recommendation;
  rank: number;
  query: string;
}) {
  const { course, places, slackMinutes, returnAt, matchedInterests } = item;
  const href = query
    ? `/courses/${course.id}?${query}`
    : `/courses/${course.id}`;

  return (
    <>
    <Link href={href} className="group block">
      <div className="relative aspect-[16/10] overflow-hidden rounded-sm bg-line">
        <Image
          src={course.image}
          alt=""
          fill
          sizes="(max-width: 448px) 100vw, 448px"
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute left-3 top-3 rounded-sm bg-black/55 px-2 py-1 text-[0.625rem] tracking-wide text-white/90">
          {DEMO_DATA_LABEL} · 예시 이미지
        </span>
        <span className="tnum absolute bottom-3 left-3 font-serif text-3xl font-semibold text-white drop-shadow">
          {course.slot}
          <span className="ml-0.5 text-base font-medium">분</span>
        </span>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="eyebrow text-accent">추천 {rank}</span>
        <h2 className="font-serif text-lg font-semibold tracking-tight">
          {course.title}
        </h2>
      </div>

      <p className="mt-2 text-[0.8125rem] leading-relaxed text-muted">
        {course.reason}
      </p>

      <dl className="mt-4 divide-y divide-line border-y border-line">
        <Line label="들르는 곳">
          {places.map((place) => place.name).join(" → ")}
        </Line>
        <Line label="걸리는 시간">
          <span className="tnum">
            이동 {formatDuration(course.travelMinutes)} + 머무는{" "}
            {formatDuration(course.stayMinutes)} ={" "}
            <strong className="font-medium">
              {formatDuration(course.totalMinutes)}
            </strong>
          </span>
        </Line>
        <Line label="복귀 예정">
          <span className="tnum font-medium text-foreground">{returnAt}</span>
          <span className="tnum text-muted">
            {" "}
            · 여유 {formatDuration(slackMinutes)}
          </span>
        </Line>
        <Line label="예상 지출">
          <span className="tnum">{course.spend.toLocaleString()}원</span>
        </Line>
      </dl>

      {matchedInterests.length > 0 ? (
        <p className="mt-3 text-[0.75rem] text-muted">
          관심 분야와 겹치는 곳: {matchedInterests.join(" · ")}
        </p>
      ) : null}
    </Link>

    {/* 링크 안에 버튼을 넣을 수 없어 밖으로 뺀다 */}
    <div className="mt-3.5">
      <SpeakButton
        label="이 코스 듣기"
        text={courseSpeech({ course, places, returnAt, slackMinutes })}
      />
    </div>
    </>
  );
}

function Line({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 py-2.5 text-[0.8125rem]">
      <dt className="w-20 shrink-0 text-muted">{label}</dt>
      <dd className="flex-1 text-foreground/90">{children}</dd>
    </div>
  );
}

function EmptyState({ remainMinutes }: { remainMinutes: number }) {
  return (
    <div className="mt-10 border-l-2 border-accent pl-4">
      <p className="font-serif text-lg font-semibold">
        지금 조건으로는 안전한 코스가 없습니다
      </p>
      <p className="mt-2 text-[0.8125rem] leading-relaxed text-muted">
        남은 {formatDuration(remainMinutes)} 안에 다녀오고 안전여유{" "}
        {SAFETY_MARGIN_MINUTES}분까지 남기려면 시간이 모자랍니다. 행사에 늦을 수
        있는 코스는 보여드리지 않습니다.
      </p>
      <Link
        href="/plan"
        className="mt-5 inline-flex h-11 items-center justify-center rounded-sm bg-ink px-5 text-[0.8125rem] font-medium text-white"
      >
        조건 바꾸기
      </Link>
    </div>
  );
}

function RejectedNote({
  rejected,
}: {
  rejected: { course: { id: string; title: string }; reasons: RejectReason[] }[];
}) {
  return (
    <section className="mt-12 border-t border-line pt-5">
      <h2 className="eyebrow text-muted">보여드리지 않은 코스</h2>
      <ul className="mt-3 space-y-1.5">
        {rejected.map(({ course, reasons }) => (
          <li key={course.id} className="text-[0.75rem] text-muted">
            {course.title} — {reasons.join(" · ")} 조건에 걸렸습니다
          </li>
        ))}
      </ul>
    </section>
  );
}
