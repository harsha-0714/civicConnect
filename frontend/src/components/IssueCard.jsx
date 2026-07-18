import { formatConfidence, formatDate, statusStyles } from "../utils/issues";

function IssueCard({ issue }) {
  const confidence = formatConfidence(issue.confidence);

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      {issue.imageUrl ? (
        <img
          src={issue.imageUrl}
          alt={issue.title}
          className="h-48 w-full object-cover"
        />
      ) : (
        <div className="flex h-48 w-full items-center justify-center bg-slate-100 text-sm font-semibold uppercase tracking-normal text-slate-500">
          {issue.category || "Civic Issue"}
        </div>
      )}

      <div className="space-y-4 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
              statusStyles[issue.status] || statusStyles.Pending
            }`}
          >
            {issue.status || "Pending"}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {issue.category}
          </span>
          {confidence && (
            <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">
              AI {confidence}
            </span>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold leading-tight text-slate-950">
            {issue.title}
          </h2>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
            {issue.description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-sm">
          <div>
            <p className="font-medium text-slate-500">Ward</p>
            <p className="mt-1 font-semibold text-slate-900">
              {issue.ward || "Unassigned"}
            </p>
          </div>
          <div>
            <p className="font-medium text-slate-500">Reported</p>
            <p className="mt-1 font-semibold text-slate-900">
              {formatDate(issue.createdAt)}
            </p>
          </div>
        </div>

        {issue.createdBy?.name && (
          <p className="text-sm text-slate-500">
            Reported by{" "}
            <span className="font-semibold text-slate-800">
              {issue.createdBy.name}
            </span>
          </p>
        )}
      </div>
    </article>
  );
}

export default IssueCard;
