"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readStudentMode, sessionStore, studentHref, writeStudentMode } from "@/lib/launcher/studentMode";

/** 학생 화면에서 들어온 탭이면(주소에 ?from=students 가 없어도) 학생용 주소로 보낸다 */
export function StudentAwareLink({
  kind,
  slug,
  fromStudents,
  className,
  children,
}: {
  kind: "back" | "privacy";
  slug: string;
  fromStudents: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const [student, setStudent] = useState(fromStudents);
  useEffect(() => {
    const store = sessionStore();
    if (fromStudents) writeStudentMode(store);
    else if (readStudentMode(store)) setStudent(true);
  }, [fromStudents]);
  return (
    <Link href={studentHref(kind, slug, student)} className={className} data-student-link={student ? "1" : "0"}>
      {children}
    </Link>
  );
}
