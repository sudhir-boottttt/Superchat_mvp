import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import StreamCard from "../components/StreamCard";

function HomePage() {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStreams() {
      try {
        const response = await apiFetch("/api/streams/live");
        setStreams(response.streams);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    }

    loadStreams();
  }, []);

  return (
    <section className="stack">
      <div className="hero panel">
        <div className="hero-grid">
          <div>
            <p className="eyebrow">Ship the money moment</p>
            <h1>Turn live attention into highlighted support.</h1>
            <p className="hero-copy">
              Keep streaming simple. Let fans pay to be seen, let creators feel the momentum, and
              keep the product focused on the money moment that matters.
            </p>
            <div className="hero-actions">
              <Link className="button-link" to="/register">
                Start as creator
              </Link>
              <Link className="ghost-button" to="/login">
                Viewer login
              </Link>
            </div>
          </div>

          <div className="hero-metrics">
            <div className="metric-card">
              <span>Live rooms</span>
              <strong>{streams.length}</strong>
            </div>
            <div className="metric-card">
              <span>Core loop</span>
              <strong>Pay → pop → earn</strong>
            </div>
            <div className="metric-card">
              <span>MVP focus</span>
              <strong>Chat + payments</strong>
            </div>
          </div>
        </div>
      </div>

      {loading && <div className="panel">Loading live streams...</div>}
      {error && <div className="panel error-panel">Could not load live streams. {error}</div>}

      <div className="stream-grid">
        {streams.length > 0 ? (
          streams.map((stream) => <StreamCard key={stream._id} stream={stream} />)
        ) : (
          !loading && (
            <div className="panel empty-state">
              No live streams yet. Sign in as a creator and start one from the dashboard.
            </div>
          )
        )}
      </div>
    </section>
  );
}

export default HomePage;
