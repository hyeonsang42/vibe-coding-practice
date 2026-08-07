/**
 * 익명 방명록 · 메모 — 초안
 *
 * ⚠️ 서버에 보내지 않는다. 지금은 **쓴 사람의 브라우저에만** 남는다.
 *    그래서 다른 사람에게는 보이지 않는다. 화면에도 그렇게 적어둔다.
 *    실제로 여러 사람이 함께 보려면 저장소(Supabase 등)가 필요하고,
 *    그때는 docs/requirements.md 를 먼저 고친다.
 */

const KEY = "teumsae-guestbook-draft";

export type EntryKind = "방명록" | "메모";

export type Entry = {
  id: string;
  kind: EntryKind;
  text: string;
  /** 남긴 시각 "MM.DD HH:MM" */
  at: string;
};

const EMPTY: Entry[] = [];
const listeners = new Set<() => void>();

let cachedRaw: string | null = null;
let cachedValue: Entry[] = EMPTY;

/**
 * 브라우저에 저장된 목록을 읽는다.
 *
 * useSyncExternalStore 는 값이 바뀌지 않았으면 **같은 객체**를 돌려받아야
 * 무한 반복에 빠지지 않는다. 그래서 원본 문자열이 그대로면 캐시를 준다.
 */
export function readEntries(): Entry[] {
  if (typeof window === "undefined") return EMPTY;

  const raw = window.localStorage.getItem(KEY);
  if (raw === cachedRaw) return cachedValue;

  cachedRaw = raw;
  if (!raw) {
    cachedValue = EMPTY;
    return cachedValue;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    cachedValue = Array.isArray(parsed) ? (parsed as Entry[]) : EMPTY;
  } catch {
    cachedValue = EMPTY;
  }
  return cachedValue;
}

/** 서버에서 그릴 때는 늘 빈 목록 */
export function readEntriesOnServer(): Entry[] {
  return EMPTY;
}

export function subscribeEntries(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function save(entries: Entry[]) {
  window.localStorage.setItem(KEY, JSON.stringify(entries));
  listeners.forEach((listener) => listener());
}

function stamp(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function addEntry(kind: EntryKind, text: string) {
  const trimmed = text.trim();
  if (trimmed.length === 0) return;

  const entry: Entry = {
    id: `${Date.now()}-${Math.round(Math.random() * 1000)}`,
    kind,
    text: trimmed,
    at: stamp(new Date()),
  };

  save([entry, ...readEntries()]);
}

export function removeEntry(id: string) {
  save(readEntries().filter((entry) => entry.id !== id));
}
