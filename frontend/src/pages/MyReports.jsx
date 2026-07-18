import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import IssueCard from "../components/IssueCard";
import StatCard from "../components/StatCard";
import api from "../services/api";
import { countBy, statusDotStyles } from "../utils/issues";

function MyReports() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadMyReports = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await api.get("/issues/my");

        if (active) {
          setIssues(res.data.data || []);
        }
      } catch (err) {
        if (active) {
          const message =
            err.response?.data?.message || "Unable to load your reports.";
          setError(message);
          toast.error(message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadMyReports();

    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const byStatus = countBy(issues, (issue) => issue.status);

    return {
      total: issues.length,
      pending: byStatus.Pending || 0,
      progress: byStatus["In Progress"] || 0,
      resolved: byStatus.Resolved || 0,
    };
  }, [issues]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-normal text-teal-700">
            Personal tracker
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">
            My Reports
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Follow every issue you submitted and see what still needs municipal
            attention.
          </p>
        </div>

        <Link
          to="/report"
          className="inline-flex rounded-md bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
        >
          New Report
        </Link>
      </div>

      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Submitted" value={stats.total} />
        <StatCard label="Pending" value={stats.pending} tone="amber" />
        <StatCard label="In progress" value={stats.progress} tone="teal" />
        <StatCard label="Resolved" value={stats.resolved} tone="emerald" />
      </section>

      {loading && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-80 animate-pulse rounded-lg border border-slate-200 bg-white"
            />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-rose-800">
          {error}
        </div>
      )}

      {!loading && !error && issues.length === 0 && (
        <section className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
          <h2 className="text-2xl font-semibold text-slate-950">
            You have not submitted any reports yet
          </h2>
          <p className="mt-2 text-slate-500">
            Add a photo, location, and category to create your first civic
            report.
          </p>
          <Link
            to="/report"
            className="mt-5 inline-flex rounded-md bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
          >
            Report Issue
          </Link>
        </section>
      )}

      {!loading && !error && issues.length > 0 && (
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <section className="grid gap-6 md:grid-cols-2">
            {issues.map((issue) => (
              <IssueCard key={issue._id} issue={issue} />
            ))}
          </section>

          <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">
              Status Timeline
            </h2>
            <div className="mt-5 space-y-4">
              {issues.slice(0, 8).map((issue) => (
                <div key={issue._id} className="flex gap-3">
                  <span
                    className={`mt-1 h-3 w-3 rounded-full ${
                      statusDotStyles[issue.status] || statusDotStyles.Pending
                    }`}
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      {issue.title}
                    </p>
                    <p className="text-sm text-slate-500">
                      {issue.status || "Pending"} in {issue.ward}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}

export default MyReports;
