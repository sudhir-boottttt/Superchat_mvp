import { Link } from "react-router-dom";

function StreamCard({ stream }) {
  return (
    <article className="stream-card panel">
      <div className="stream-thumbnail">
        <span className="live-pill">LIVE</span>
        <div className="thumbnail-fade" />
      </div>
      <div className="stream-meta">
        <p className="eyebrow">Creator</p>
        <h3>{stream.title}</h3>
        <p>{stream.creator_id?.name || "Unknown creator"}</p>
      </div>
      <div className="card-actions">
        <span className="soft-chip">Live support enabled</span>
        <Link className="primary-button" to={`/streams/${stream._id}`}>
          Join Stream
        </Link>
      </div>
    </article>
  );
}

export default StreamCard;
