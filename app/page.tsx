import Image from "next/image";
import Link from "next/link";

/** 화면 1 — 시작 화면 (docs/requirements.md 3장) */
export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col bg-ink">
      <Image
        src="/images/hero-market.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-80 saturate-[0.85]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/80" />

      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col justify-between px-7 pb-10 pt-12 text-white">
        <div>
          <p className="eyebrow text-white/60">진주 · 축제 틈새시간</p>
          <div className="mt-5 h-px w-10 bg-white/40" />
        </div>

        <div>
          <h1 className="font-serif text-6xl font-semibold leading-none tracking-tight">
            틈새진주
          </h1>
          <p className="mt-5 text-[0.9375rem] leading-relaxed text-white/85">
            축제와 축제 사이, 상권을 잇다.
            <br />
            다음 행사 전, 진주를 한 번 더 만나보세요.
          </p>

          <dl className="mt-9 divide-y divide-white/15 border-y border-white/15">
            {[
              ["남은 시간", "다음 행사까지 몇 분 남았는지만 알려주세요"],
              ["코스 추천", "행사에 늦지 않는 동선만 골라 보여드립니다"],
              ["상점 혜택", "가게에서 QR을 찍으면 혜택을 받습니다"],
            ].map(([term, desc]) => (
              <div key={term} className="flex gap-5 py-3.5">
                <dt className="w-16 shrink-0 text-[0.8125rem] font-medium text-white/90">
                  {term}
                </dt>
                <dd className="text-[0.8125rem] leading-relaxed text-white/60">
                  {desc}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-10">
          <Link
            href="/plan"
            className="flex h-14 w-full items-center justify-center rounded-sm bg-accent text-[0.9375rem] font-medium tracking-tight text-ink transition hover:opacity-90"
          >
            남은 시간 알려주기
          </Link>

          <p className="mt-4 text-center text-[0.6875rem] leading-relaxed text-white/45">
            GNU AI Pioneer 캠프 프로토타입
            <br />
            장소·수치·사진은 모두 시연용 예시입니다
          </p>

          <div className="mt-5 text-center">
            <Link
              href="/trends"
              className="eyebrow text-white/40 underline-offset-4 transition hover:text-white/70 hover:underline"
            >
              다른 사람들은 어디 갔을까
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
