import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../services/api";
import { CATEGORY_OPTIONS, formatConfidence } from "../utils/issues";

const initialForm = {
  title: "",
  description: "",
  category: "",
  ward: "",
  latitude: "",
  longitude: "",
};

function ReportIssue() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [predicting, setPredicting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState("Detecting location");

  useEffect(() => {
    if (!image) {
      setPreview("");
      return undefined;
    }

    const url = URL.createObjectURL(image);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [image]);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Location unavailable");
      return;
    }

    setLocationStatus("Detecting location");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        }));
        setLocationStatus("Location captured");
      },
      () => {
        setLocationStatus("Enter location manually");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  };

  useEffect(() => {
    detectLocation();
  }, []);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const predictImage = async (file) => {
    const data = new FormData();
    data.append("image", file);

    try {
      setPredicting(true);
      setPrediction(null);

      const res = await api.post("/issues/predict", data);
      const result = res.data;

      if (!result?.category) {
        toast("AI category is unavailable. Choose a category manually.");
        return;
      }

      setPrediction(result);
      setForm((prev) => ({
        ...prev,
        category: result.category,
      }));
      toast.success("AI category detected");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "AI prediction could not be completed.",
      );
    } finally {
      setPredicting(false);
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setImage(null);
      setPrediction(null);
      return;
    }

    setImage(file);
    predictImage(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      data.append(key, value);
    });

    if (image) {
      data.append("image", image);
    }

    try {
      setLoading(true);
      await api.post("/issues", data);
      toast.success("Issue reported successfully");
      setForm(initialForm);
      setImage(null);
      setPrediction(null);
      navigate("/my-reports");
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[0.82fr_0.18fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6 flex flex-col gap-2 border-b border-slate-100 pb-5">
            <p className="text-sm font-semibold uppercase tracking-normal text-teal-700">
              New civic report
            </p>
            <h1 className="text-3xl font-semibold text-slate-950">
              Report Civic Issue
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Title
                <input
                  className="rounded-md border border-slate-300 bg-white px-3 py-3 font-normal text-slate-950 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  placeholder="Broken streetlight near market"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Ward
                <input
                  className="rounded-md border border-slate-300 bg-white px-3 py-3 font-normal text-slate-950 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  placeholder="Ward 12"
                  name="ward"
                  value={form.ward}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Description
              <textarea
                className="min-h-32 rounded-md border border-slate-300 bg-white px-3 py-3 font-normal text-slate-950 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                placeholder="Describe the issue and nearby landmark"
                name="description"
                value={form.description}
                onChange={handleChange}
                required
              />
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Category
                <select
                  className="rounded-md border border-slate-300 bg-white px-3 py-3 font-normal text-slate-950 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select category</option>
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Photo
                <input
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-700"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </div>

            {preview && (
              <div className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-[240px_1fr]">
                <img
                  src={preview}
                  alt="Selected issue"
                  className="h-48 w-full rounded-md object-cover"
                />
                <div className="flex flex-col justify-center gap-3">
                  <p className="text-sm font-semibold text-slate-900">
                    {predicting ? "Analyzing image" : "Image ready"}
                  </p>
                  {prediction?.category && (
                    <div className="rounded-md border border-teal-200 bg-teal-50 p-4 text-sm text-teal-900">
                      <p className="font-semibold">
                        Suggested category: {prediction.category}
                      </p>
                      {formatConfidence(prediction.confidence) && (
                        <p className="mt-1">
                          Confidence {formatConfidence(prediction.confidence)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Location
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {locationStatus}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={detectLocation}
                  className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Use Current Location
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  Latitude
                  <input
                    className="rounded-md border border-slate-300 bg-white px-3 py-3 font-normal text-slate-950 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                    name="latitude"
                    value={form.latitude}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  Longitude
                  <input
                    className="rounded-md border border-slate-300 bg-white px-3 py-3 font-normal text-slate-950 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                    name="longitude"
                    value={form.longitude}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:opacity-70"
            >
              {loading ? "Submitting" : "Submit Report"}
            </button>
          </form>
        </section>

        <aside className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-normal text-slate-500">
              Status
            </p>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>
                Title, ward, category, coordinates, and description are required.
              </p>
              <p>
                Photos improve AI classification and make field verification
                easier.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">
              Current category
            </p>
            <p className="mt-2 text-2xl font-semibold text-teal-800">
              {form.category || "Not selected"}
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default ReportIssue;
