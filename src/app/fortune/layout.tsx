import "./fortune.css";

export default function FortuneLayout({ children }: { children: React.ReactNode }) {
  return <main className="fx flex-grow pb-20">{children}</main>;
}
