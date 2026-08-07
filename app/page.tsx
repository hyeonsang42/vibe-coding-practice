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

          {/* 사진 위라 글자가 묻힌다. 흐린 판을 깔아 읽히게 한다 */}
          <dl className="mt-9 divide-y divide-white/20 rounded-sm border border-white/25 bg-white/10 px-5 backdrop-blur-[3px]">
            {[
              ["남은 시간", "다음 행사까지 몇 분 남았는지만 알려주세요"],
              ["코스 추천", "행사에 늦지 않는 동선만 골라 보여드립니다"],
              ["상점 혜택", "가게에서 QR을 찍으면 혜택을 받습니다"],
            ].map(([term, desc]) => (
              <div key={term} className="flex gap-5 py-3.5">
                <dt className="w-16 shrink-0 text-[0.8125rem] font-medium text-white">
                  {term}
                </dt>
                <dd className="text-[0.8125rem] leading-relaxed text-white/80">
                  {desc}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-10">
          <Link
            href="/plan"
            className="flex h-14 w-full items-center justify-center rounded-sm bg-white text-[0.9375rem] font-medium tracking-tight text-ink transition hover:bg-white/90"
          >
            남은 시간 알려주기
          </Link>

          {/* 부차적이지만 버튼으로 읽혀야 한다 */}
          <Link
            href="/trends"
            className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-sm border border-white/40 bg-white/10 text-[0.875rem] font-medium text-white backdrop-blur-[2px] transition hover:bg-white/20"
          >
            다른 사람들은 어디 갔을까
            <ArrowIcon />
          </Link>

          <p className="mt-5 text-center text-[0.6875rem] leading-relaxed text-white/45">
            GNU AI Pioneer 캠프 프로토타입
            <br />
            장소·수치·사진은 모두 시연용 예시입니다
          </p>

          <div className="mt-6 flex items-center justify-between">
            {/* 팀원이 만든 다른 사이트. 새 탭으로 열어 시연 흐름을 끊지 않는다 */}
            <a
              href="https://vhepier7993-bot.github.io/ararararara/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[0.6875rem] text-white/40 underline-offset-4 transition hover:text-white/70 hover:underline"
            >
              심심풀이
              <ExternalIcon />
              <span className="sr-only">(새 창에서 열림)</span>
            </a>

            <Link
              href="/guestbook"
              className="text-[0.6875rem] text-white/40 underline-offset-4 transition hover:text-white/70 hover:underline"
            >
              익명 방명록
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function ExternalIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-2.5 w-2.5"
      aria-hidden
    >
      <path d="M7 17 17 7" />
      <path d="M9 7h8v8" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden
    >
      <path d="M5 12h13" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
