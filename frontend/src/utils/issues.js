export const CATEGORY_OPTIONS = [
  "Pothole",
  "Garbage",
  "Streetlight",
  "Water Leakage",
  "Drainage",
  "Road Damage",
  "Other",
];

export const STATUS_OPTIONS = [
  "Pending",
  "In Progress",
  "Resolved",
  "Rejected",
];

export const statusStyles = {
  Pending: "bg-amber-50 text-amber-800 ring-amber-200",
  "In Progress": "bg-sky-50 text-sky-800 ring-sky-200",
  Resolved: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  Rejected: "bg-rose-50 text-rose-800 ring-rose-200",
};

export const statusDotStyles = {
  Pending: "bg-amber-500",
  "In Progress": "bg-sky-500",
  Resolved: "bg-emerald-500",
  Rejected: "bg-rose-500",
};

export const mapStatusColors = {
  Pending: "#d97706",
  "In Progress": "#0284c7",
  Resolved: "#059669",
  Rejected: "#e11d48",
};

export function formatDate(value) {
  if (!value) {
    return "Recently";
  }

  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatConfidence(value) {
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    return null;
  }

  const confidence = Number(value);
  const normalized = confidence <= 1 ? confidence * 100 : confidence;

  return `${Math.round(normalized)}%`;
}

export function getIssueCoordinates(issue) {
  const coordinates = issue?.gps?.coordinates;

  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    return null;
  }

  const lng = Number(coordinates[0]);
  const lat = Number(coordinates[1]);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return { lat, lng };
}

export function issueMatchesSearch(issue, search) {
  const query = search.trim().toLowerCase();

  if (!query) {
    return true;
  }

  return [
    issue.title,
    issue.description,
    issue.category,
    issue.status,
    issue.ward,
    issue.createdBy?.name,
  ]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(query));
}

export function countBy(items, keyGetter) {
  return items.reduce((acc, item) => {
    const key = keyGetter(item) || "Unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}
