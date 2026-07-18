const toneStyles = {
  slate: "border-slate-200 bg-white text-slate-900",
  teal: "border-teal-200 bg-teal-50 text-teal-950",
  amber: "border-amber-200 bg-amber-50 text-amber-950",
  rose: "border-rose-200 bg-rose-50 text-rose-950",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-950",
};

function StatCard({ label, value, caption, tone = "slate" }) {
  return (
    <div className={`rounded-lg border p-4 ${toneStyles[tone]}`}>
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-normal">{value}</p>
      {caption && <p className="mt-1 text-sm text-slate-500">{caption}</p>}
    </div>
  );
}

export default StatCard;
