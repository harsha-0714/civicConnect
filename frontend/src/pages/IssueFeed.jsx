import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import IssueCard from "../components/IssueCard";
import IssueMap from "../components/IssueMap";
import StatCard from "../components/StatCard";
import api from "../services/api";
import {
  CATEGORY_OPTIONS,
  STATUS_OPTIONS,
  countBy,
  issueMatchesSearch,
} from "../utils/issues";

function IssueFeed() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    let active = true;

    const loadIssues = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get("/issues");

        if (active) {
          setIssues(res.data.data || []);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load civic issues right now.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadIssues();

    return () => {
      active = false;
    };
  }, []);

  const filteredIssues = useMemo(
    () =>
      issues.filter((issue) => {
        const matchesStatus = status === "All" || issue.status === status;
        const matchesCategory = category === "All" || issue.category === category;

        return (
          matchesStatus &&
          matchesCategory &&
          issueMatchesSearch(issue, search)
        );
      }),
    [category, issues, search, status],
  );

  const stats = useMemo(() => {
    const byStatus = countBy(issues, (issue) => issue.status);

    return {
      total: issues.length,
      open: (byStatus.Pending || 0) + (byStatus["In Progress"] || 0),
      resolved: byStatus.Resolved || 0,
      wards: Object.keys(countBy(issues, (issue) => issue.ward)).length,
    };
  }, [issues]);

  return (
    <main>
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-normal text-teal-700">
              Civic issue command center
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
              Track reports, locations, and response status in one place.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Browse public reports submitted by citizens, inspect affected
              wards, and see which problems are still waiting for action.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/report"
                className="rounded-md bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
              >
                Report Issue
              </Link>
              <a
                href="#issue-list"
                className="rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                View Feed
              </a>
            </div>
          </div>

          <IssueMap issues={filteredIssues} className="h-72 lg:h-80" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total reports" value={stats.total} />
          <StatCard label="Open issues" value={stats.open} tone="amber" />
          <StatCard label="Resolved" value={stats.resolved} tone="emerald" />
          <StatCard label="Active wards" value={stats.wards} tone="teal" />
        </div>
      </section>

      <section
        id="issue-list"
        className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8"
      >
        <div className="mb-6 flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">
              Community Reports
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Showing {filteredIssues.length} of {issues.length} reports
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:w-[680px]">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search reports"
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            >
              <option value="All">All statuses</option>
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            >
              <option value="All">All categories</option>
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
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

        {!loading && !error && filteredIssues.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
            <h2 className="text-2xl font-semibold text-slate-950">
              No matching reports
            </h2>
            <p className="mt-2 text-slate-500">
              Clear the filters or submit the first report for your area.
            </p>
            <Link
              to="/report"
              className="mt-5 inline-flex rounded-md bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
            >
              Report Issue
            </Link>
          </div>
        )}

        {!loading && !error && filteredIssues.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredIssues.map((issue) => (
              <IssueCard key={issue._id} issue={issue} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default IssueFeed;
