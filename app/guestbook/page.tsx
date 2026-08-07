import Link from "next/link";

import { GuestbookDraft } from "./GuestbookDraft";

/** 익명 방명록 · 메모 — 초안 (docs/requirements.md 3장) */
export default function GuestbookPage() {
  return (
    <main className="mx-auto w-full max-w-md flex-1 px-7 pb-14 pt-8">
      <Link
        href="/"
        className="eyebrow text-muted transition hover:text-foreground"
      >
        ← 틈새진주
      </Link>

      <p className="eyebrow mt-7 text-accent">초안</p>
      <h1 className="mt-2 font-serif text-[1.75rem] font-semibold leading-snug tracking-tight">
        익명 방명록
      </h1>
      <p className="mt-3 text-[0.8125rem] leading-relaxed text-muted">
        다녀온 소감을 남기거나, 오늘 일정을 메모해두세요. 이름은 묻지 않습니다.
      </p>

      <p className="mt-5 border-l-2 border-line pl-4 text-[0.75rem] leading-relaxed text-muted">
        <strong className="font-medium text-foreground">
          아직 초안 단계입니다.
        </strong>{" "}
        지금은 적은 내용이 <strong className="font-medium">이 기기에만</strong>{" "}
        저장되고, 다른 사람에게는 보이지 않습니다. 여러 사람이 함께 보는 방명록은
        저장소를 붙인 뒤에 열립니다.
      </p>

      <GuestbookDraft />
    </main>
  );
}
