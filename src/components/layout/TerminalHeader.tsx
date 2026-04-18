interface TerminalHeaderProps {
  path: string;
  status?: string;
}

export function TerminalHeader({ path, status = "활성" }: TerminalHeaderProps) {
  return (
    <div className="w-full flex justify-between items-center py-2 mt-8 bg-[#0e0e0f]/50 backdrop-blur-sm">
      <span className="font-[family-name:var(--font-label)] text-xs text-primary tracking-widest uppercase">
        상태: {status} // 경로: {path}
      </span>
    </div>
  );
}
