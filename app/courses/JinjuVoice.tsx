"use client";

import Image from "next/image";
import { useState } from "react";

import { SpeakButton } from "../SpeakButton";
import { jinjuStories, storySpeech } from "@/lib/jinju-voice";

/**
 * 진주의 목소리 — 추천 결과 맨 아래에 두는 독립 기능.
 *
 * 위쪽 추천 결과와 상태를 공유하지 않는다. 여기서 문제가 생겨도
 * 코스 추천에는 영향이 없도록 따로 떼어 두었다.
 */
export function JinjuVoice() {
  const [open, setOpen] = useState(false);

  return (
    <section className="mt-12 border-t border-line pt-8">
      <h2 className="eyebrow text-accent">진주의 목소리</h2>
      <p className="mt-2 font-serif text-lg font-semibold tracking-tight">
        기다리는 동안, 이 동네 이야기
      </p>
      <p className="mt-2 text-[0.8125rem] leading-relaxed text-muted">
        코스를 도는 길에 지나치는 곳들의 짧은 내력입니다. 소리로 들으면서
        걸어도 됩니다.
      </p>

      {open ? (
        <ul className="mt-6 space-y-7">
          {jinjuStories.map((story) => (
            <li key={story.id} className="rise-in">
              <div className="relative aspect-[16/10] overflow-hidden rounded-sm bg-line">
                <Image
                  src={story.image}
                  alt=""
                  fill
                  sizes="(max-width: 448px) 100vw, 448px"
                  className="object-cover"
                />
              </div>
              <p className="mt-2 text-[0.625rem] leading-relaxed text-muted">
                {story.credit}
              </p>

              <p className="eyebrow mt-3.5 text-muted">{story.area}</p>
              <h3 className="mt-1.5 font-serif text-base font-semibold">
                {story.title}
              </h3>
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-foreground/85">
                {story.body}
              </p>
              <div className="mt-3">
                <SpeakButton label="이 이야기 듣기" text={storySpeech(story)} />
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-sm border border-line bg-surface text-[0.875rem] font-medium transition hover:border-muted"
      >
        {open ? "이야기 접기" : "진주 이야기 펼치기"}
        <Chevron open={open} />
      </button>
    </section>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
