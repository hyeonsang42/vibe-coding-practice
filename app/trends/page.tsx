import Link from "next/link";

import {
  checkInRanking,
  demoHourly,
  weeklyByCategory,
  weeklyRanking,
} from "@/lib/demo-data";
import { DEMO_DATA_LABEL } from "@/lib/types";
import type { HourlyCheckIn, PlaceCategory } from "@/lib/types";

/** 이용자용 방문 통계 — 다른 사람들은 어디에 다녀왔는지 본다 */
export default function TrendsPage() {
  const today = checkInRanking();
  const weekly = weeklyRanking();
  const byCategory = weeklyByCategory();

  const todayTotal = today.reduce((sum, item) => sum + item.count, 0);
  const quiet = [...today].reverse().slice(0, 3);

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-7 pb-14 pt-8">
      <Link
        href="/"
        className="eyebrow text-muted transition hover:text-foreground"
      >
        ← 틈새진주
      </Link>

      <p className="eyebrow mt-7 text-accent">다른 사람들은</p>
      <h1 className="mt-2 font-serif text-[1.75rem] font-semibold leading-snug tracking-tight">
        어디에 다녀왔을까
      </h1>
      <p className="mt-3 text-[0.8125rem] leading-relaxed text-muted">
        틈새진주로 다녀온 사람들의 방문 기록입니다. 어디가 붐비고 어디가
        여유로운지 보고 고르세요. 아래 수치는 모두{" "}
        <strong className="font-medium">{DEMO_DATA_LABEL}</strong>입니다.
      </p>

      <Section
        title="오늘의 방문지"
        note={`오늘 하루 ${todayTotal.toLocaleString()}번의 방문 인증이 있었습니다.`}
      >
        <ol className="divide-y divide-line border-y border-line">
          {today.slice(0, 3).map(({ place, count }, index) => (
            <li key={place.id} className="flex items-center gap-4 py-3.5">
              <span className="tnum flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-[0.75rem] font-medium text-ink">
                {index + 1}
              </span>
              <span className="flex-1">
                <span className="text-[0.9375rem] font-medium">
                  {place.name}
                </span>
                <span className="mt-0.5 block text-[0.75rem] text-muted">
                  {place.category} · 도보 {place.walkMinutes}분 · {place.area}
                </span>
              </span>
              <span className="tnum text-[0.8125rem] text-muted">
                {count}명
              </span>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        title="이번주 방문 순위"
        note="화살표는 지난주보다 순위가 오르내린 정도입니다."
      >
        <ol className="divide-y divide-line border-y border-line">
          {weekly.map(({ place, count, rank, change }) => (
            <li key={place.id} className="flex items-center gap-4 py-3">
              <span className="tnum w-5 shrink-0 text-[0.8125rem] font-medium">
                {rank}
              </span>
              <RankChange change={change} />
              <span className="flex-1">
                <span className="text-[0.875rem]">{place.name}</span>
                <span className="mt-0.5 block text-[0.75rem] text-muted">
                  {place.category}
                </span>
              </span>
              <span className="tnum text-[0.8125rem] text-muted">
                {count.toLocaleString()}명
              </span>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        title="분야별 인기"
        note="이번주에 어떤 종류의 가게로 많이 갔는지 보여줍니다."
      >
        <CategoryChart data={byCategory} />
      </Section>

      <Section
        title="아직 한산한 곳"
        note="사람이 적어 기다리지 않고 둘러볼 수 있는 곳입니다. 틈새 시간이 짧을 때 특히 낫습니다."
      >
        <ul className="divide-y divide-line border-y border-line">
          {quiet.map(({ place, count }) => (
            <li key={place.id} className="flex items-baseline gap-4 py-3">
              <span className="flex-1">
                <span className="text-[0.875rem] font-medium">
                  {place.name}
                </span>
                <span className="mt-0.5 block text-[0.75rem] text-muted">
                  {place.category} · 도보 {place.walkMinutes}분 ·{" "}
                  {place.indoor ? "실내" : "실외"}
                </span>
              </span>
              <span className="tnum text-[0.8125rem] text-muted">
                오늘 {count}명
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="붐비는 시간"
        note="▲ 표시는 축제 행사 사이의 틈새 시간입니다. 이때 사람이 가장 많이 나섭니다."
      >
        <HourlyChart data={demoHourly} />
      </Section>

      <Link
        href="/plan"
        className="mt-10 flex h-14 w-full items-center justify-center rounded-sm bg-accent text-[0.9375rem] font-medium tracking-tight text-ink transition hover:opacity-90"
      >
        나도 코스 추천받기
      </Link>

      <p className="mt-6 border-t border-line pt-5 text-[0.6875rem] leading-relaxed text-muted">
        방문 수는 상점에서 QR을 찍은 횟수로 셉니다. 지금 보이는 숫자는 화면
        구성을 보여주기 위한 가상 데이터이며, 진주의 실제 방문 규모와는 관계가
        없습니다.
      </p>

      <div className="mt-5">
        <Link
          href="/dashboard"
          className="eyebrow text-muted underline-offset-4 transition hover:text-foreground hover:underline"
        >
          상권 운영자 화면 보기 →
        </Link>
      </div>
    </main>
  );
}

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="eyebrow text-muted">{title}</h2>
      <div className="mt-4">{children}</div>
      <p className="mt-3 text-[0.6875rem] leading-relaxed text-muted">{note}</p>
    </section>
  );
}

/** 지난주 대비 순위 변동 — 색만으로 알리지 않는다 */
function RankChange({ change }: { change: number }) {
  if (change === 0) {
    return (
      <span className="w-9 shrink-0 text-[0.6875rem] text-muted">
        <span aria-hidden>–</span>
        <span className="sr-only">순위 변동 없음</span>
      </span>
    );
  }

  const up = change > 0;

  return (
    <span
      className={`tnum w-9 shrink-0 text-[0.6875rem] font-medium ${
        up ? "text-accent" : "text-muted"
      }`}
    >
      <span aria-hidden>
        {up ? "▲" : "▼"}
        {Math.abs(change)}
      </span>
      <span className="sr-only">
        지난주보다 {Math.abs(change)}계단 {up ? "올랐습니다" : "내렸습니다"}
      </span>
    </span>
  );
}

function CategoryChart({
  data,
}: {
  data: { category: PlaceCategory; count: number }[];
}) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <ul className="space-y-3">
      {data.map(({ category, count }, index) => {
        const share = total === 0 ? 0 : Math.round((count / total) * 100);

        return (
          <li key={category}>
            <div className="flex items-baseline justify-between">
              <span className="text-[0.8125rem] font-medium">{category}</span>
              <span className="tnum text-[0.75rem] text-muted">
                {share}% · {count.toLocaleString()}명
              </span>
            </div>
            <span aria-hidden className="mt-1.5 flex h-2 rounded-[2px] bg-line">
              <span
                className={`h-full rounded-[2px] ${
                  index === 0 ? "bg-accent" : "bg-water/45"
                }`}
                style={{ width: `${share}%` }}
              />
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function HourlyChart({ data }: { data: HourlyCheckIn[] }) {
  const max = Math.max(...data.map((item) => item.count));

  return (
    <div>
      <div aria-hidden>
        <div className="flex h-32 items-end gap-1.5 border-b border-line">
          {data.map((item) => (
            <div
              key={item.hour}
              className="flex flex-1 flex-col items-center justify-end gap-1.5"
            >
              <div
                className={`w-full rounded-t-[2px] ${
                  item.gap ? "bg-accent" : "bg-foreground/15"
                }`}
                style={{ height: `${(item.count / max) * 100}%` }}
              />
            </div>
          ))}
        </div>

        <div className="mt-2 flex gap-1.5">
          {data.map((item) => (
            <span
              key={item.hour}
              className={`tnum flex-1 text-center text-[0.625rem] ${
                item.gap ? "font-medium text-accent" : "text-muted"
              }`}
            >
              {item.gap ? "▲" : ""}
              {item.hour}
            </span>
          ))}
        </div>
      </div>

      <ul className="sr-only">
        {data.map((item) => (
          <li key={item.hour}>
            {item.hour}시 {item.count}명{item.gap ? " (틈새 시간)" : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}
