import { describe, expect, it } from "vitest";
import { dayPillarIndex, ganjiName, jdn, kstOffsetMinutes, lunarToSolar, monthPillarIndex, sajuOf, sunLongitude, termUtc, yearPillarIndex } from "./core";

describe("일주", () => {
  it.each([
    [2000, 1, 1, "戊午"], [1900, 1, 1, "甲戌"], [2026, 11, 22, "庚子"], [2026, 11, 23, "辛丑"],
  ])("%i-%i-%i = %s", (y, m, d, want) => expect(ganjiName(dayPillarIndex(jdn(y, m, d)))).toBe(want));
});

describe("연주·월주", () => {
  it("입춘 전후로 해가 바뀐다", () => {
    expect(ganjiName(sajuOf({ y: 2024, m: 2, d: 3, time: null }).year)).toBe("癸卯");
    expect(ganjiName(sajuOf({ y: 2024, m: 2, d: 5, time: null }).year)).toBe("甲辰");
  });
  it("월두법: 甲년 寅월 = 丙寅", () => expect(ganjiName(monthPillarIndex(yearPillarIndex(2024), 0))).toBe("丙寅"));
  it("1월생은 전년 子·丑월로 계산한다", () => {
    const s = sajuOf({ y: 2000, m: 1, d: 1, time: "12:00" });
    expect([s.year, s.month, s.day].map(ganjiName)).toEqual(["己卯", "丙子", "戊午"]);
  });
});

describe("절기", () => {
  it("입춘 시각이 공표값(2024-02-04 17:27 KST)과 15분 안에서 맞는다", () => {
    expect(Math.abs(termUtc(2024, 315) - Date.UTC(2024, 1, 4, 8, 27)) / 60000).toBeLessThan(15);
  });
  it("2025 동지(2025-12-22 00:03 KST)", () => {
    expect(Math.abs(termUtc(2025, 270) - Date.UTC(2025, 11, 21, 15, 3)) / 60000).toBeLessThan(15);
  });
  it("춘분에 태양황경은 0도 근처", () => {
    const l = sunLongitude(Date.UTC(2024, 2, 20, 3, 6));
    expect(Math.min(l, 360 - l)).toBeLessThan(0.02);
  });
});

describe("시각 보정", () => {
  it("서머타임·표준시 변경을 반영한다", () => {
    expect(kstOffsetMinutes(1988, 5, 21, 15, 20)).toBe(600);
    expect(kstOffsetMinutes(1958, 1, 1, 12, 0)).toBe(510);
    expect(kstOffsetMinutes(2000, 1, 1, 0, 0)).toBe(540);
  });
  it("1988-05-21 15:20 서울 = 戊辰년 丁巳월 丙子일 乙未시, 태양시 13:47", () => {
    const s = sajuOf({ y: 1988, m: 5, d: 21, time: "15:20" });
    expect([s.hour!, s.day, s.month, s.year].map(ganjiName)).toEqual(["乙未", "丙子", "丁巳", "戊辰"]);
    expect(s.solarTime).toBe("13:48"); // 13:47:55 반올림
  });
  it("시두법: 甲일 子시 = 甲子, 乙일 子시 = 丙子", () => {
    expect(ganjiName(sajuOf({ y: 2024, m: 1, d: 1, time: "00:45" }).hour!)).toBe("甲子");
    expect(ganjiName(sajuOf({ y: 2024, m: 1, d: 2, time: "00:45" }).hour!)).toBe("丙子");
  });
  it("태양시 23시부터 다음 날 일주로 본다", () => {
    const late = sajuOf({ y: 2024, m: 1, d: 1, time: "23:50" });
    expect(ganjiName(late.day)).toBe("乙丑");
    expect(late.hour! % 12).toBe(0);
    const early = sajuOf({ y: 2024, m: 1, d: 2, time: "00:10" });
    expect(ganjiName(early.day)).toBe("乙丑");
    // 23:32 KST는 태양시 22:59:55라 아직 亥시
    const edge = sajuOf({ y: 2024, m: 1, d: 1, time: "23:32" });
    expect(ganjiName(edge.day)).toBe("甲子");
    expect(edge.hour! % 12).toBe(11);
    const hae = sajuOf({ y: 2024, m: 1, d: 1, time: "23:20" });
    expect(ganjiName(hae.day)).toBe("甲子");
    expect(hae.hour! % 12).toBe(11);
  });
  it("시각 모름이면 시주가 없다", () => expect(sajuOf({ y: 1990, m: 7, d: 15, time: null }).hour).toBeNull());
  it("절입 시각에 가까우면 경계 표시를 한다", () => {
    expect(sajuOf({ y: 2024, m: 2, d: 4, time: "17:30" }).nearTerm).toBe(true);
    expect(sajuOf({ y: 2024, m: 2, d: 20, time: "17:30" }).nearTerm).toBe(false);
    expect(sajuOf({ y: 2024, m: 2, d: 4, time: null }).nearTerm).toBe(true);
  });
});

describe("음력", () => {
  it("설날과 윤달을 양력으로 바꾼다", () => {
    expect(lunarToSolar(2024, 1, 1, false)).toEqual({ y: 2024, m: 2, d: 10 });
    expect(lunarToSolar(2023, 2, 1, true)).toEqual({ y: 2023, m: 3, d: 22 });
  });
  it("없는 날짜는 null", () => {
    expect(lunarToSolar(2024, 13, 1, false)).toBeNull();
    expect(lunarToSolar(2024, 1, 31, false)).toBeNull();
    expect(lunarToSolar(2024, 1, 30, false)).toBeNull();
    expect(lunarToSolar(2024, 2, 1, true)).toBeNull();
  });
});
