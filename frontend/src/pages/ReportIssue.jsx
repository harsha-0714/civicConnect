import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../api/axios';
import 'leaflet/dist/leaflet.css';

const ISSUE_TYPES = [
  { value: 'pothole', label: 'Pothole', emoji: '🕳️', color: 'amber' },
  { value: 'garbage_dump', label: 'Garbage Dump', emoji: '🗑️', color: 'red' },
  { value: 'broken_streetlight', label: 'Broken Streetlight', emoji: '💡', color: 'yellow' },
  { value: 'water_leakage', label: 'Water Leakage', emoji: '💧', color: 'blue' },
  { value: 'open_manhole', label: 'Open Manhole', emoji: '⚠️', color: 'orange' },
];

function LocationPicker({ onSelect }) {
  useMapEvents({
    click: (e) => onSelect(e.latlng)
  });
  return null;
}

export default function ReportIssue() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [position, setPosition] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', issue_type: '', address: '' });
  const [aiResult, setAiResult] = useState(null);
  const [detecting, setDetecting] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    setFiles(acceptedFiles);
    const urls = acceptedFiles.map(f => URL.createObjectURL(f));
    setPreviews(urls);

    // Auto-detect on first image
    if (acceptedFiles[0]) {
      setDetecting(true);
      try {
        const formData = new FormData();
        formData.append('images', acceptedFiles[0]);
        formData.append('lat', position?.lat || 12.9716);
        formData.append('lng', position?.lng || 77.5946);
        formData.append('title', 'Detection preview');
        const { data } = await api.post('/issues', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        // In real app, call AI service preview endpoint
        setAiResult(data.issue?.ai_analysis);
        if (data.issue?.ai_analysis?.detected_type) {
          setForm(f => ({ ...f, issue_type: data.issue.ai_analysis.detected_type }));
        }
      } catch {
        // Silent fail for preview
      } finally {
        setDetecting(false);
      }
    }
  }, [position]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] }, maxFiles: 3, maxSize: 5 * 1024 * 1024
  });

  const { mutate: submitIssue, isPending } = useMutation({
    mutationFn: async () => {
      if (!position) throw new Error('Please select a location on the map');
      if (!files.length) throw new Error('Please upload at least one image');
      if (!form.issue_type) throw new Error('Please select issue type');

      const formData = new FormData();
      files.forEach(f => formData.append('images', f));
      formData.append('title', form.title || `${form.issue_type.replace('_', ' ')} near ${form.address || 'my location'}`);
      formData.append('description', form.description);
      formData.append('issue_type', form.issue_type);
      formData.append('lat', position.lat);
      formData.append('lng', position.lng);
      formData.append('address', form.address);

      const { data } = await api.post('/issues', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Issue reported! You earned ${data.issue?.is_verified ? '30' : '10'} points 🎉`);
      navigate(`/issues/${data.issue._id}`);
    },
    onError: (err) => toast.error(err.response?.data?.message || err.message)
  });

  const useMyLocation = () => {
    navigator.geolocation.getCurrentPosition(
      pos => setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => toast.error('Could not get your location')
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-2">Report a Civic Issue</h1>
      <p className="text-gray-400 mb-8">Upload a photo and mark the location. Our AI will detect and classify the issue automatically.</p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left: Image Upload + AI Result */}
        <div className="space-y-6">
          <div {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              isDragActive ? 'border-emerald-400 bg-emerald-900/20' : 'border-gray-700 hover:border-gray-600 bg-gray-900'
            }`}>
            <input {...getInputProps()} />
            {previews.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {previews.map((url, i) => (
                  <img key={i} src={url} className="w-full h-24 object-cover rounded-lg" alt="" />
                ))}
              </div>
            ) : (
              <>
                <div className="text-4xl mb-3">📸</div>
                <p className="text-gray-300 font-medium">Drop images here or click to upload</p>
                <p className="text-gray-500 text-sm mt-1">Up to 3 images, max 5MB each</p>
              </>
            )}
          </div>

          {detecting && (
            <div className="flex items-center gap-3 bg-blue-900/20 border border-blue-800 rounded-lg p-4">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"/>
              <span className="text-blue-300 text-sm">AI analyzing image...</span>
            </div>
          )}

          {aiResult && (
            <div className="bg-emerald-900/20 border border-emerald-800 rounded-xl p-4 space-y-3">
              <h3 className="text-emerald-400 font-semibold flex items-center gap-2">
                🤖 AI Detection Result
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-900 rounded-lg p-3">
                  <p className="text-gray-500 text-xs">Detected Type</p>
                  <p className="text-white font-medium capitalize">{aiResult.detected_type?.replace('_', ' ')}</p>
                </div>
                <div className="bg-gray-900 rounded-lg p-3">
                  <p className="text-gray-500 text-xs">Confidence</p>
                  <p className="text-white font-medium">{Math.round(aiResult.confidence * 100)}%</p>
                </div>
                <div className="bg-gray-900 rounded-lg p-3 col-span-2">
                  <p className="text-gray-500 text-xs mb-1">Severity Score</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                        style={{ width: `${(aiResult.severity_score / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-white font-bold">{aiResult.severity_score?.toFixed(1)}/10</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Issue Type Selection */}
          <div>
            <label className="text-gray-300 text-sm font-medium mb-3 block">Issue Type</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {ISSUE_TYPES.map(type => (
                <button key={type.value} onClick={() => setForm(f => ({ ...f, issue_type: type.value }))}
                  className={`p-3 rounded-lg border text-sm text-left transition-all ${
                    form.issue_type === type.value
                      ? 'border-emerald-500 bg-emerald-900/30 text-white'
                      : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600'
                  }`}>
                  <span className="text-xl block mb-1">{type.emoji}</span>
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Form + Map */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-gray-300 text-sm font-medium mb-1 block">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Describe the issue in detail..."
                rows={3}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="text-gray-300 text-sm font-medium mb-1 block">Address (optional)</label>
              <input
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                placeholder="e.g. Near City Mall, Whitefield"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none text-sm"
              />
            </div>
          </div>

          {/* Map */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-gray-300 text-sm font-medium">Location</label>
              <button onClick={useMyLocation} className="text-emerald-400 text-sm hover:underline">📍 Use my location</button>
            </div>
            <div className="rounded-xl overflow-hidden h-56 border border-gray-700">
              <MapContainer
                center={position || [12.9716, 77.5946]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />
                <LocationPicker onSelect={setPosition} />
                {position && <Marker position={position} />}
              </MapContainer>
            </div>
            {position ? (
              <p className="text-emerald-400 text-xs mt-1">📍 {position.lat.toFixed(4)}, {position.lng.toFixed(4)}</p>
            ) : (
              <p className="text-gray-500 text-xs mt-1">Click on the map to mark the issue location</p>
            )}
          </div>

          <button onClick={() => submitIssue()} disabled={isPending}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 disabled:text-gray-500 text-white py-4 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-2">
            {isPending ? (
              <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"/>Submitting...</>
            ) : (
              '🚀 Submit Report'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
