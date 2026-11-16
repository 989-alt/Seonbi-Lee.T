"use client";

import { useEffect } from "react";
import { sessionStore, writeStudentMode } from "@/lib/launcher/studentMode";

/** 학생 화면을 연 탭임을 기억해 둔다(게임 화면의 돌아가기·개인정보 링크가 학생용으로 유지되도록) */
export function StudentModeMark() {
  useEffect(() => {
    writeStudentMode(sessionStore());
  }, []);
  return null;
}
