import Link from "next/link";

import { checkInRanking, demoHourly } from "@/lib/demo-data";
import { DEMO_DATA_LABEL } from "@/lib/types";
import type { HourlyCheckIn, Place } from "@/lib/types";

/** 화면 6 — 지역상권 효과 대시보드 (docs/requirements.md 3장) */
export default function DashboardPage() {
  const ranking = checkInRanking();
  const totalCheckIns = ranking.reduce((sum, item) => sum + item.count, 0);
  const estimatedSpend = ranking.reduce(
    (sum, item) => sum + item.count * item.place.spend,
    0,
  );
  const quiet = ranking.slice(-3).reverse();

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-7 pb-14 pt-8">
      <Link
        href="/"
        className="eyebrow text-muted transition hover:text-foreground"
      >
        ← 틈새진주
      </Link>

      <p className="eyebrow mt-7 text-accent">운영자 화면</p>
      <h1 className="mt-2 font-serif text-[1.75rem] font-semibold leading-snug tracking-tight">
        지역상권 효과
      </h1>
      <p className="mt-3 text-[0.8125rem] leading-relaxed text-muted">
        축제 방문객이 어느 시간대에, 어느 상점으로 흩어졌는지 봅니다. 아래
        수치는 모두 <strong className="font-medium">{DEMO_DATA_LABEL}</strong>
        입니다.
      </p>

      <dl className="mt-7 grid grid-cols-3 gap-px overflow-hidden rounded-sm border border-line bg-line">
        <Kpi label="방문 인증" value={totalCheckIns.toLocaleString()} unit="건" />
        <Kpi label="참여 상점" value={String(ranking.length)} unit="곳" />
        <Kpi
          label="예상 소비"
          value={(estimatedSpend / 10000).toFixed(0)}
          unit="만원"
        />
      </dl>

      <Section
        title="시간대별 방문 인증"
        note="주황색은 축제 행사와 행사 사이의 공백시간대입니다. 이 시간에 방문이 몰리면 서비스가 제 역할을 한 것으로 봅니다."
      >
        <HourlyChart data={demoHourly} />
      </Section>

      <Section
        title="상점별 유입"
        note="행사장에서 가까운 상점에 인증이 몰립니다. 안쪽 상권으로 얼마나 밀어냈는지가 관건입니다."
      >
        <RankingChart ranking={ranking} />
      </Section>

      <Section
        title="상대적 저방문 상권"
        note="다음 코스 추천에서 우선순위를 올릴 후보입니다. 추천 점수의 상권 분산 항목이 이 값을 씁니다."
      >
        <ul className="divide-y divide-line border-y border-line">
          {quiet.map(({ place, count }) => (
            <li key={place.id} className="flex items-baseline gap-4 py-3">
              <span className="flex-1">
                <span className="text-[0.875rem] font-medium">
                  {place.name}
                </span>
                <span className="mt-0.5 block text-[0.75rem] text-muted">
                  {place.area} · 도보 {place.walkMinutes}분
                </span>
              </span>
              <span className="tnum text-[0.8125rem] text-muted">
                {count}건
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="예상 소비 연결"
        note="인증 수 × 1인 예상 지출로 계산한 값입니다. 실제 결제액이 아니며, 경제효과로 발표하지 않습니다."
      >
        <dl className="divide-y divide-line border-y border-line">
          {ranking.slice(0, 3).map(({ place, count }) => (
            <div key={place.id} className="flex items-baseline gap-4 py-3">
              <dt className="flex-1 text-[0.875rem]">{place.name}</dt>
              <dd className="tnum text-[0.8125rem]">
                <span className="text-muted">
                  {count}건 × {place.spend.toLocaleString()}원 ={" "}
                </span>
                <span className="font-medium">
                  {(count * place.spend).toLocaleString()}원
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      <p className="mt-10 border-t border-line pt-5 text-[0.6875rem] leading-relaxed text-muted">
        실제 도입 시에는 QR 인증 로그와 상점 운영자가 입력한 값으로 이 화면을
        채웁니다. 지금 보이는 숫자는 화면 구성을 보여주기 위한 가상 데이터이며,
        진주의 실제 방문·소비 규모와는 관계가 없습니다.
      </p>
    </main>
  );
}

function Kpi({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="bg-surface px-3 py-4 text-center">
      <dt className="eyebrow text-muted">{label}</dt>
      <dd className="tnum mt-2 font-serif text-2xl font-semibold leading-none">
        {value}
        <span className="ml-0.5 text-[0.6875rem] font-medium text-muted">
          {unit}
        </span>
      </dd>
    </div>
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

function HourlyChart({ data }: { data: HourlyCheckIn[] }) {
  const max = Math.max(...data.map((item) => item.count));

  return (
    <div>
      {/* 그림은 눈으로 보는 용도. 같은 내용을 아래 글로도 제공한다. */}
      <div aria-hidden>
        <div className="flex h-40 items-end gap-1.5 border-b border-line">
          {data.map((item) => (
            <div
              key={item.hour}
              className="flex flex-1 flex-col items-center justify-end gap-1.5"
            >
              <span className="tnum text-[0.625rem] text-muted">
                {item.count}
              </span>
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
              {/* 색만으로 공백시간대를 알리지 않는다 */}
              {item.gap ? "▲" : ""}
              {item.hour}
            </span>
          ))}
        </div>
      </div>

      <ul className="sr-only">
        {data.map((item) => (
          <li key={item.hour}>
            {item.hour}시 {item.count}건{item.gap ? " (공백시간대)" : ""}
          </li>
        ))}
      </ul>

      <p className="mt-3 text-[0.6875rem] text-muted">
        <span aria-hidden>▲</span> 표시가 축제 행사 사이의 공백시간대입니다.
      </p>
    </div>
  );
}

function RankingChart({
  ranking,
}: {
  ranking: { place: Place; count: number }[];
}) {
  const max = Math.max(...ranking.map((item) => item.count));

  return (
    <ul className="space-y-2.5">
      {ranking.map(({ place, count }, index) => (
        <li key={place.id} className="flex items-center gap-3">
          <span className="w-24 shrink-0 truncate text-[0.75rem]">
            {place.name}
          </span>
          <span aria-hidden className="flex h-5 flex-1 items-center">
            <span
              className={`h-full rounded-[2px] ${
                index < 3 ? "bg-accent/80" : "bg-water/45"
              }`}
              style={{ width: `${(count / max) * 100}%` }}
            />
          </span>
          <span className="tnum w-10 shrink-0 text-right text-[0.75rem] text-muted">
            {count}
            <span className="sr-only">건</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
