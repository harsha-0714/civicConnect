import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import IssueMap from "../components/IssueMap";
import StatCard from "../components/StatCard";
import api from "../services/api";
import { countBy, formatDate, mapStatusColors, statusStyles } from "../utils/issues";

const chartColors = ["#0f766e", "#d97706", "#0284c7", "#059669", "#e11d48"];

function toChartData(counts) {
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

function AdminDashboard() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          const message =
            err.response?.data?.message || "Unable to load dashboard data.";
          setError(message);
          toast.error(message);
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

  const analytics = useMemo(() => {
    const byStatus = countBy(issues, (issue) => issue.status);
    const byCategory = countBy(issues, (issue) => issue.category);
    const byWard = countBy(issues, (issue) => issue.ward);
    const open = (byStatus.Pending || 0) + (byStatus["In Progress"] || 0);

    return {
      total: issues.length,
      open,
      resolved: byStatus.Resolved || 0,
      rejected: byStatus.Rejected || 0,
      categoryData: toChartData(byCategory),
      statusData: toChartData(byStatus),
      wardData: toChartData(byWard)
        .sort((a, b) => b.value - a.value)
        .slice(0, 6),
    };
  }, [issues]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-normal text-teal-700">
          Authority dashboard
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">
          Admin Dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Review citywide demand, identify high-pressure wards, and monitor
          resolution progress from live issue reports.
        </p>
      </div>

      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total reports" value={analytics.total} />
        <StatCard label="Open workload" value={analytics.open} tone="amber" />
        <StatCard label="Resolved" value={analytics.resolved} tone="emerald" />
        <StatCard label="Rejected" value={analytics.rejected} tone="rose" />
      </section>

      {loading && (
        <div className="grid gap-6 lg:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
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

      {!loading && !error && (
        <>
          <section className="mb-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">
                Reports by Status
              </h2>
              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.statusData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={58}
                      outerRadius={94}
                      paddingAngle={2}
                    >
                      {analytics.statusData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={
                            mapStatusColors[entry.name] ||
                            chartColors[index % chartColors.length]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">
                Top Wards
              </h2>
              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.wardData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tickLine={false} />
                    <YAxis allowDecimals={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0f766e" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          <section className="mb-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">
                Reports by Category
              </h2>
              <div className="mt-5 space-y-4">
                {analytics.categoryData.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    Category data will appear after reports are submitted.
                  </p>
                ) : (
                  analytics.categoryData.map((item, index) => {
                    const percent = analytics.total
                      ? Math.round((item.value / analytics.total) * 100)
                      : 0;

                    return (
                      <div key={item.name}>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="font-semibold text-slate-800">
                            {item.name}
                          </span>
                          <span className="text-slate-500">
                            {item.value} reports
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${percent}%`,
                              backgroundColor:
                                chartColors[index % chartColors.length],
                            }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <IssueMap issues={issues} className="h-96" />
          </section>

          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5">
              <h2 className="text-lg font-semibold text-slate-950">
                Latest Reports
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-normal text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Issue</th>
                    <th className="px-5 py-3 font-semibold">Category</th>
                    <th className="px-5 py-3 font-semibold">Ward</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Reported</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {issues.slice(0, 8).map((issue) => (
                    <tr key={issue._id}>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-950">
                          {issue.title}
                        </p>
                        <p className="mt-1 max-w-sm truncate text-slate-500">
                          {issue.description}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-slate-700">
                        {issue.category}
                      </td>
                      <td className="px-5 py-4 text-slate-700">{issue.ward}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                            statusStyles[issue.status] || statusStyles.Pending
                          }`}
                        >
                          {issue.status || "Pending"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-700">
                        {formatDate(issue.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </main>
  );
}

export default AdminDashboard;
