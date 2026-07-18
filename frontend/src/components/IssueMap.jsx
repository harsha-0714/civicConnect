import "leaflet/dist/leaflet.css";

import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import {
  formatDate,
  getIssueCoordinates,
  mapStatusColors,
} from "../utils/issues";

function getMapCenter(points) {
  if (!points.length) {
    return [20.5937, 78.9629];
  }

  const totals = points.reduce(
    (acc, point) => ({
      lat: acc.lat + point.position.lat,
      lng: acc.lng + point.position.lng,
    }),
    { lat: 0, lng: 0 },
  );

  return [totals.lat / points.length, totals.lng / points.length];
}

function IssueMap({ issues, className = "h-80" }) {
  const points = issues
    .map((issue) => ({
      issue,
      position: getIssueCoordinates(issue),
    }))
    .filter((point) => point.position);

  if (!points.length) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm font-medium text-slate-500 ${className}`}
      >
        Location data will appear here when reports include coordinates.
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-lg border border-slate-200 ${className}`}>
      <MapContainer
        center={getMapCenter(points)}
        zoom={points.length === 1 ? 13 : 11}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {points.map(({ issue, position }) => (
          <CircleMarker
            key={issue._id}
            center={[position.lat, position.lng]}
            radius={9}
            pathOptions={{
              color: mapStatusColors[issue.status] || mapStatusColors.Pending,
              fillColor:
                mapStatusColors[issue.status] || mapStatusColors.Pending,
              fillOpacity: 0.72,
              weight: 2,
            }}
          >
            <Popup>
              <div className="space-y-1">
                <p className="font-semibold text-slate-950">{issue.title}</p>
                <p>{issue.category}</p>
                <p>{issue.ward}</p>
                <p>{formatDate(issue.createdAt)}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}

export default IssueMap;
