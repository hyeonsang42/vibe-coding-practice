"use client";

import { useState, useSyncExternalStore } from "react";

import {
  addEntry,
  readEntries,
  readEntriesOnServer,
  removeEntry,
  subscribeEntries,
} from "@/lib/guestbook";
import type { EntryKind } from "@/lib/guestbook";

const KINDS: EntryKind[] = ["방명록", "메모"];

export function GuestbookDraft() {
  const [kind, setKind] = useState<EntryKind>("방명록");
  const [text, setText] = useState("");

  const entries = useSyncExternalStore(
    subscribeEntries,
    readEntries,
    readEntriesOnServer,
  );

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    addEntry(kind, text);
    setText("");
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="mt-7">
        <div className="flex gap-2">
          {KINDS.map((item) => {
            const selected = kind === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setKind(item)}
                aria-pressed={selected}
                className={`rounded-sm border px-3.5 py-2 text-[0.8125rem] transition ${
                  selected
                    ? "border-ink bg-ink text-white"
                    : "border-line bg-surface text-muted hover:border-muted"
                }`}
              >
                {selected ? <span aria-hidden>✓ </span> : null}
                {item}
                <span className="sr-only">
                  {selected ? " 선택됨" : " 선택 안 됨"}
                </span>
              </button>
            );
          })}
        </div>

        <label className="mt-4 block">
          <span className="sr-only">
            {kind === "방명록" ? "방명록 내용" : "메모 내용"}
          </span>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={3}
            maxLength={200}
            placeholder={
              kind === "방명록"
                ? "예: 붕어빵 줄이 짧아서 금방 다녀왔어요"
                : "예: 19:30 공연 전에 떡집 들르기"
            }
            className="w-full resize-none rounded-sm border border-line bg-surface px-4 py-3 text-[0.875rem] leading-relaxed outline-none placeholder:text-muted focus-visible:border-accent"
          />
        </label>

        <div className="mt-3 flex items-center justify-between">
          <span className="tnum text-[0.6875rem] text-muted">
            {text.length} / 200
          </span>
          <button
            type="submit"
            disabled={text.trim().length === 0}
            className="h-11 rounded-sm bg-ink px-5 text-[0.8125rem] font-medium text-white transition hover:opacity-90 disabled:bg-line disabled:text-muted"
          >
            남기기
          </button>
        </div>
      </form>

      <section className="mt-10">
        <h2 className="eyebrow text-muted">남긴 것</h2>

        {entries.length === 0 ? (
          <p className="mt-4 rounded-sm border border-line bg-surface px-5 py-6 text-center text-[0.8125rem] leading-relaxed text-muted">
            아직 남긴 글이 없습니다.
            <br />
            위에 한 줄 적어보세요.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {entries.map((entry) => (
              <li key={entry.id} className="rise-in flex gap-4 py-3.5">
                <span className="w-14 shrink-0">
                  <span
                    className={`inline-block rounded-sm px-1.5 py-0.5 text-[0.625rem] font-medium ${
                      entry.kind === "방명록"
                        ? "bg-accent-soft text-accent"
                        : "bg-line text-muted"
                    }`}
                  >
                    {entry.kind}
                  </span>
                </span>

                <span className="flex-1">
                  <span className="block text-[0.8125rem] leading-relaxed">
                    {entry.text}
                  </span>
                  <span className="tnum mt-1 block text-[0.6875rem] text-muted">
                    {entry.at}
                  </span>
                </span>

                <button
                  type="button"
                  onClick={() => removeEntry(entry.id)}
                  className="h-7 shrink-0 self-start rounded-sm px-2 text-[0.6875rem] text-muted transition hover:text-foreground"
                >
                  지우기
                  <span className="sr-only"> — {entry.text}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
