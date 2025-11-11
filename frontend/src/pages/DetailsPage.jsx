import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/details.css"; // <- adjust path if needed

export default function DetailsPage() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `http://localhost:5000/api/details/${type}/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!cancelled) setDetails(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [type, id, token]);

  const title = useMemo(() => {
    if (!details) return "";
    return details.name || details.title || `${type} #${id}`;
  }, [details, type, id]);

  const prettyKey = (k) =>
    (k || "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const renderValue = (v) => {
    if (v === null || v === undefined || v === "") return <span>—</span>;
    if (Array.isArray(v)) return v.length ? v.join(", ") : "—";
    if (typeof v === "object") {
      try {
        return (
          <pre className="det-code">
            {JSON.stringify(v, null, 2)}
          </pre>
        );
      } catch {
        return String(v);
      }
    }
    return String(v);
  };

  return (
    <div className="det-page">
      {/* Decorative animated orbs */}
      <div className="det-orb det-orb-a" />
      <div className="det-orb det-orb-b" />
      <div className="det-orb det-orb-c" />

      <header className="det-header det-animate-pop">
        <button className="det-back" onClick={() => navigate(-1)} aria-label="Go back">
          <span className="det-back-chev">←</span> Back
        </button>

        <div className="det-head-main">
          <h1 className="det-title">{title}</h1>
          <div className="det-sub">
            <span className={`det-badge det-badge-type`}>{(type || "").toUpperCase()}</span>
            <span className="det-dot" />
            <span className="det-id">ID: {id}</span>
          </div>
        </div>
      </header>

      {loading ? (
        <section className="det-skel-wrap">
          <div className="det-card det-skeleton det-animate-rise" />
          <div className="det-grid">
            <div className="det-card det-skeleton det-animate-rise" />
            <div className="det-card det-skeleton det-animate-rise" />
          </div>
        </section>
      ) : (
        <section className="det-content">
          {/* Overview block (if common fields exist) */}
          <div className="det-card det-animate-rise">
            <div className="det-meta">
              <div className="det-meta-item">
                <span className="det-meta-label">Category</span>
                <span className="det-meta-value">{details?.category || "—"}</span>
              </div>
              <div className="det-meta-item">
                <span className="det-meta-label">Location</span>
                <span className="det-meta-value">{details?.location || "—"}</span>
              </div>
              <div className="det-meta-item">
                <span className="det-meta-label">Status</span>
                <span className={`det-badge ${details?.status === "In Use" ? "det-badge-good" : details?.status === "Deprecated" ? "det-badge-warn" : "det-badge-soft"}`}>
                  {details?.status || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Key/Value grid */}
          <div className="det-grid">
            <div className="det-card det-animate-rise">
              <h3 className="det-sec-title">Details</h3>
              <div className="det-kv">
                {Object.entries(details).map(([k, v]) => (
                  <div className="det-kv-row" key={k}>
                    <div className="det-kv-key">{prettyKey(k)}</div>
                    <div className="det-kv-val">{renderValue(v)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Optional “Notes/Highlights” if present */}
            {(details?.salient_features || details?.achievements || details?.trl_description) && (
              <div className="det-card det-animate-rise">
                <h3 className="det-sec-title">Highlights</h3>
                {details?.salient_features && (
                  <div className="det-note">
                    <div className="det-note-label">Salient Features</div>
                    <div className="det-note-text">{details.salient_features}</div>
                  </div>
                )}
                {details?.achievements && (
                  <div className="det-note">
                    <div className="det-note-label">Achievements</div>
                    <div className="det-note-text">{details.achievements}</div>
                  </div>
                )}
                {details?.trl_description && (
                  <div className="det-note">
                    <div className="det-note-label">TRL Description</div>
                    <div className="det-note-text">{details.trl_description}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
