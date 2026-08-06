import Link from "next/link";
import { notFound } from "next/navigation";

import { CheckInFlow } from "./CheckInFlow";
import { courses, getCoursePlaces } from "@/lib/demo-data";

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** 화면 5 — QR 인증·혜택 (docs/requirements.md 3장) */
export default async function CheckInPage({
  params,
  searchParams,
}: PageProps<"/courses/[id]/check-in">) {
  const { id } = await params;
  const query = await searchParams;

  const course = courses.find((item) => item.id === id);
  if (!course) notFound();

  const places = getCoursePlaces(course);

  const backQuery = new URLSearchParams(
    Object.entries(query).flatMap(([key, value]) => {
      const single = first(value);
      return single === undefined ? [] : [[key, single] as [string, string]];
    }),
  ).toString();
  const backHref = backQuery
    ? `/courses/${course.id}?${backQuery}`
    : `/courses/${course.id}`;

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-7 pb-14 pt-8">
      <Link
        href={backHref}
        className="eyebrow text-muted transition hover:text-foreground"
      >
        ← 동선으로
      </Link>

      <h1 className="mt-7 font-serif text-[1.75rem] font-semibold leading-snug tracking-tight">
        상점에서 QR 찍기
      </h1>
      <p className="mt-3 text-[0.8125rem] leading-relaxed text-muted">
        가게에 붙은 QR을 찍으면 방문이 기록되고 혜택이 열립니다. 아래 버튼은
        실제 카메라 대신 인식 과정을 흉내 냅니다.
      </p>

      <CheckInFlow
        places={places}
        courseTitle={course.title}
        backHref={backHref}
      />
    </main>
  );
}
