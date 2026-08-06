"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { parseVoiceInput } from "@/lib/voice-parse";
import type { ParsedVoice } from "@/lib/voice-parse";

/* 브라우저 음성 인식 API — 타입 정의에 없어서 필요한 만큼만 적는다 */
type RecognitionAlternative = { transcript: string };
type RecognitionResult = { 0: RecognitionAlternative; isFinal: boolean };
type RecognitionEvent = { results: ArrayLike<RecognitionResult> };
type RecognitionErrorEvent = { error: string };

type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: RecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
};

type RecognitionConstructor = new () => Recognition;

function getRecognitionConstructor(): RecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const scope = window as unknown as {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  };
  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition ?? null;
}

/** 지원 여부는 도중에 바뀌지 않으므로 구독할 것이 없다 */
function subscribeNothing() {
  return () => {};
}

const ERROR_MESSAGE: Record<string, string> = {
  "not-allowed": "마이크 사용이 막혀 있습니다. 브라우저 주소창의 자물쇠에서 허용해주세요.",
  "service-not-allowed": "마이크 사용이 막혀 있습니다. 브라우저 설정을 확인해주세요.",
  "no-speech": "소리가 들리지 않았습니다. 다시 한 번 말씀해주세요.",
  network: "네트워크가 끊겨 음성 인식을 하지 못했습니다. 아래 입력칸을 써주세요.",
  aborted: "",
};

export function VoiceInput({
  onApply,
}: {
  onApply: (parsed: ParsedVoice) => void;
}) {
  const [listening, setListening] = useState(false);
  const [parsed, setParsed] = useState<ParsedVoice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<Recognition | null>(null);

  // 지원 여부는 브라우저에서만 알 수 있다 (서버에서는 지원 안 함으로 그린다)
  const supported = useSyncExternalStore(
    subscribeNothing,
    () => getRecognitionConstructor() !== null,
    () => false,
  );

  // 화면을 떠날 때 인식이 켜져 있으면 끈다
  useEffect(() => () => recognitionRef.current?.abort(), []);

  function start() {
    const Constructor = getRecognitionConstructor();
    if (!Constructor) return;

    setParsed(null);
    setError(null);

    const recognition = new Constructor();
    recognition.lang = "ko-KR";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      if (transcript.trim().length > 0) setParsed(parseVoiceInput(transcript));
    };

    recognition.onerror = (event) => {
      const message = ERROR_MESSAGE[event.error];
      setError(message ?? "음성 인식에 실패했습니다. 아래 입력칸을 써주세요.");
    };

    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }

  function stop() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  // 지원하지 않는 브라우저에서는 아예 내보내지 않는다 (폼은 그대로 쓴다)
  if (!supported) return null;

  const found = parsed ? summarize(parsed) : [];

  return (
    <section className="mb-9 rounded-sm border border-line bg-surface px-5 py-5">
      <h2 className="eyebrow text-muted">말로 알려주기</h2>

      {parsed === null ? (
        <>
          <p className="mt-2.5 text-[0.8125rem] leading-relaxed text-muted">
            버튼을 누르고 편하게 말씀하세요. 예를 들면 — “지금 여섯시 십분이고
            일곱시 반에 공연 있어. 만오천원 정도, 카페 가고 싶어”
          </p>

          <button
            type="button"
            onClick={listening ? stop : start}
            aria-pressed={listening}
            className={`mt-4 inline-flex h-11 items-center gap-2.5 rounded-sm px-4 text-[0.8125rem] font-medium transition ${
              listening
                ? "bg-accent text-white"
                : "bg-ink text-white hover:opacity-90"
            }`}
          >
            <MicIcon listening={listening} />
            {listening ? "듣는 중… 누르면 멈춤" : "말로 알려주기"}
          </button>
        </>
      ) : (
        <>
          <p className="mt-2.5 text-[0.8125rem] leading-relaxed">
            <span className="text-muted">들은 말 — </span>“{parsed.transcript}”
          </p>

          {found.length > 0 ? (
            <dl className="mt-4 divide-y divide-line border-y border-line">
              {found.map(([label, value]) => (
                <div key={label} className="flex gap-4 py-2.5 text-[0.8125rem]">
                  <dt className="w-20 shrink-0 text-muted">{label}</dt>
                  <dd className="tnum flex-1 font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-4 rounded-sm bg-background px-4 py-3 text-[0.8125rem] leading-relaxed text-muted">
              여기서 알아들을 수 있는 값을 찾지 못했습니다. 시각·예산·관심
              분야를 넣어 다시 말씀하시거나, 아래 입력칸을 써주세요.
            </p>
          )}

          <div className="mt-4 flex gap-2.5">
            {found.length > 0 ? (
              <button
                type="button"
                onClick={() => {
                  onApply(parsed);
                  setParsed(null);
                }}
                className="h-11 flex-1 rounded-sm bg-ink text-[0.8125rem] font-medium text-white transition hover:opacity-90"
              >
                이대로 채우기
              </button>
            ) : null}
            <button
              type="button"
              onClick={start}
              className="h-11 flex-1 rounded-sm border border-line text-[0.8125rem] font-medium transition hover:border-muted"
            >
              다시 말하기
            </button>
          </div>
        </>
      )}

      <p role="status" aria-live="polite" className="sr-only">
        {listening
          ? "듣는 중입니다."
          : parsed
            ? `들은 말, ${parsed.transcript}. 알아낸 값 ${found.length}개.`
            : ""}
      </p>

      {error ? (
        <p
          role="alert"
          className="mt-3 text-[0.75rem] leading-relaxed text-accent"
        >
          {error}
        </p>
      ) : null}

      <p className="mt-3 text-[0.6875rem] leading-relaxed text-muted">
        말로 넣은 값도 아래에서 고칠 수 있습니다. 잘못 들었을 수 있으니 한 번
        확인해주세요.
      </p>
    </section>
  );
}

/** 뽑아낸 값을 사람이 읽을 수 있는 줄로 바꾼다. */
function summarize(parsed: ParsedVoice): [string, string][] {
  const rows: [string, string][] = [];
  if (parsed.now) rows.push(["현재 시각", parsed.now]);
  if (parsed.eventAt) rows.push(["행사 시작", parsed.eventAt]);
  if (parsed.budget) rows.push(["예산", `${parsed.budget.toLocaleString()}원`]);
  if (parsed.walkLimit) rows.push(["도보", `편도 ${parsed.walkLimit}분`]);
  if (parsed.interests?.length) {
    rows.push(["관심 분야", parsed.interests.join(" · ")]);
  }
  return rows;
}

function MicIcon({ listening }: { listening: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      className={`h-4 w-4 ${listening ? "animate-pulse" : ""}`}
      aria-hidden
    >
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
    </svg>
  );
}
