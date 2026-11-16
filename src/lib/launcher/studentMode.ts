/** 학생 화면(/students)에서 들어온 탭인지 기억한다. 탭을 닫으면 사라진다(sessionStorage). */
export const STUDENT_KEY = "bg_student_mode_v1";

export function readStudentMode(storage: Storage | null): boolean {
  try {
    return storage?.getItem(STUDENT_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeStudentMode(storage: Storage | null): void {
  try {
    storage?.setItem(STUDENT_KEY, "1");
  } catch {
    /* 저장소 차단 — 주소의 ?from=students 로만 판단 */
  }
}

export function clearStudentMode(storage: Storage | null): void {
  try {
    storage?.removeItem(STUDENT_KEY);
  } catch {
    /* 저장소 차단 */
  }
}

/** 게임 화면 상단 링크: 학생이면 학생 목록·학생용 개인정보처리방침으로 */
export function studentHref(kind: "back" | "privacy", slug: string, student: boolean): string {
  if (kind === "back") return student ? "/students" : `/?app=${slug}`;
  return student ? "/students/privacy" : "/privacy";
}

export function sessionStore(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    return null;
  }
}
