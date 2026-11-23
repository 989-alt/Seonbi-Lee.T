import { ORDERED_IDS } from "./deck";

export type Phase = "READY_STACK" | "SHUFFLING" | "SPREADING" | "READY_FAN" | "SELECTING" | "REVEALING" | "RESULTS";

export type TarotState = {
  phase: Phase;
  deckOrder: string[];
  reversedById: Record<string, boolean>;
  /** 뽑은 순서 = 자리 순서 */
  selected: string[];
  /** 몇 장을 공개했는지 */
  revealed: number;
  shuffled: boolean;
  need: number;
};

export type TarotAction =
  | { type: "shuffle"; deckOrder: string[]; reversedById: Record<string, boolean> }
  | { type: "shuffled" }
  | { type: "spread" }
  | { type: "fanReady" }
  | { type: "select"; id: string }
  | { type: "landed" }
  | { type: "reveal" }
  | { type: "flip" }
  | { type: "reset"; need: number };

export const initialTarot = (need: number): TarotState => ({
  phase: "READY_STACK", deckOrder: [...ORDERED_IDS], reversedById: {}, selected: [], revealed: 0, shuffled: false, need,
});

/** 단계에 맞지 않는 동작은 무시한다 */
export function tarotReducer(s: TarotState, a: TarotAction): TarotState {
  switch (a.type) {
    case "shuffle":
      return s.phase === "READY_STACK" ? { ...s, phase: "SHUFFLING", deckOrder: a.deckOrder, reversedById: a.reversedById } : s;
    case "shuffled":
      return s.phase === "SHUFFLING" ? { ...s, phase: "READY_STACK", shuffled: true } : s;
    case "spread":
      return s.phase === "READY_STACK" && s.shuffled ? { ...s, phase: "SPREADING" } : s;
    case "fanReady":
      return s.phase === "SPREADING" ? { ...s, phase: "READY_FAN" } : s;
    case "select":
      if (s.phase !== "READY_FAN" || s.selected.includes(a.id) || s.selected.length >= s.need || !s.deckOrder.includes(a.id)) return s;
      return { ...s, phase: "SELECTING", selected: [...s.selected, a.id] };
    case "landed":
      return s.phase === "SELECTING" ? { ...s, phase: "READY_FAN" } : s;
    case "reveal":
      return s.phase === "READY_FAN" && s.selected.length === s.need ? { ...s, phase: "REVEALING" } : s;
    case "flip": {
      if (s.phase !== "REVEALING") return s;
      const revealed = s.revealed + 1;
      return { ...s, revealed, phase: revealed >= s.need ? "RESULTS" : "REVEALING" };
    }
    case "reset":
      return initialTarot(a.need);
  }
}
