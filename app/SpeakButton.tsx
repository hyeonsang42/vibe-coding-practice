"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/**
 * 눌렀을 때만 읽어주는 버튼.
 * 근거: docs/requirements.md 6-3장 — 자동 재생은 하지 않는다.
 */

function subscribeNothing() {
  return () => {};
}

function isSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/** 한국어 목소리를 고른다. 없으면 브라우저 기본값에 맡긴다. */
function pickKoreanVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((voice) => voice.lang === "ko-KR") ??
    voices.find((voice) => voice.lang.startsWith("ko")) ??
    null
  );
}

export function SpeakButton({
  text,
  label = "소리로 듣기",
  className = "",
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [speaking, setSpeaking] = useState(false);
  const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const supported = useSyncExternalStore(
    subscribeNothing,
    isSupported,
    () => false,
  );

  function clearKeepAlive() {
    if (keepAliveRef.current !== null) {
      clearInterval(keepAliveRef.current);
      keepAliveRef.current = null;
    }
  }

  // 화면을 떠나면 소리도 멈춘다
  useEffect(() => {
    return () => {
      clearKeepAlive();
      if (isSupported()) window.speechSynthesis.cancel();
    };
  }, []);

  function speak() {
    const synth = window.speechSynthesis;
    synth.cancel();
    setSpeaking(true);

    // Chrome은 cancel() 직후 speak()을 부르면 소리를 삼킨다. 한 박자 늦춘다.
    window.setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ko-KR";
      utterance.rate = 0.95;

      const voice = pickKoreanVoice();
      if (voice) utterance.voice = voice;

      const finish = () => {
        clearKeepAlive();
        setSpeaking(false);
      };
      utterance.onend = finish;
      utterance.onerror = finish;

      synth.speak(utterance);

      // Chrome은 15초쯤 지나면 긴 문장을 끊는다. 주기적으로 깨워준다.
      clearKeepAlive();
      keepAliveRef.current = setInterval(() => {
        if (!synth.speaking) {
          clearKeepAlive();
          return;
        }
        synth.pause();
        synth.resume();
      }, 9000);
    }, 60);
  }

  function stop() {
    clearKeepAlive();
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={speaking ? stop : speak}
      aria-pressed={speaking}
      className={`inline-flex h-11 items-center gap-2 rounded-sm border px-4 text-[0.8125rem] font-medium transition ${
        speaking
          ? "border-accent bg-accent text-white"
          : "border-accent/40 bg-accent-soft text-accent hover:border-accent"
      } ${className}`}
    >
      {speaking ? <StopIcon /> : <SoundIcon />}
      {speaking ? "읽는 중… 멈추기" : label}
    </button>
  );
}

function SoundIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="M4 9v6h4l5 4V5L8 9H4z" />
      <path d="M17 8.5a5 5 0 0 1 0 7" />
      <path d="M19.5 6a9 9 0 0 1 0 12" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4 animate-pulse"
      aria-hidden
    >
      <rect x="6" y="6" width="12" height="12" rx="1.5" />
    </svg>
  );
}
