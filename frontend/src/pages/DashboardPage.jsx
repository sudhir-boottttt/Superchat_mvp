import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { formatCurrency } from "../lib/currency";
import { useAuth } from "../context/AuthContext";

function DashboardPage() {
  const { token } = useAuth();
  const [title, setTitle] = useState("");
  const [playbackUrl, setPlaybackUrl] = useState("");
  const [earnings, setEarnings] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [streamNotice, setStreamNotice] = useState("");
  const [error, setError] = useState("");
  const liveTransactions = transactions.filter((item) => item.status === "paid");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [earningsResponse, transactionsResponse] = await Promise.all([
          apiFetch("/api/creator/earnings", { token }),
          apiFetch("/api/creator/transactions", { token })
        ]);

        setEarnings(earningsResponse.earnings);
        setTransactions(transactionsResponse.transactions);
      } catch (loadError) {
        setError(loadError.message);
      }
    }

    loadDashboard();
  }, [token]);

  async function handleCreateStream(event) {
    event.preventDefault();
    setError("");
    setStreamNotice("");

    try {
      const createResponse = await apiFetch("/api/streams", {
        method: "POST",
        token,
        body: {
          title,
          playbackUrl
        }
      });

      await apiFetch(`/api/streams/${createResponse.stream._id}/status`, {
        method: "PATCH",
        token,
        body: {
          status: "live"
        }
      });

      setTitle("");
      setPlaybackUrl("");
      setStreamNotice("Stream created and marked live. It will now show on the home page.");
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  return (
    <section className="dashboard-grid">
      <div className="dashboard-hero panel">
        <div>
          <p className="eyebrow">Creator control room</p>
          <h1>Launch a room and start collecting standout support.</h1>
          <p className="hero-copy">
            Keep the stream source simple for now. Paste a YouTube embed or leave the video blank,
            then focus on chat activity and paid message momentum.
          </p>
        </div>

        <div className="dashboard-callout">
          <span>Paid messages</span>
          <strong>{liveTransactions.length}</strong>
        </div>
      </div>

      <div className="stats-grid">
        <div className="panel stat-card">
          <p>Total Revenue</p>
          <strong>{formatCurrency(earnings?.totalRevenue || 0)}</strong>
        </div>
        <div className="panel stat-card">
          <p>Your Share</p>
          <strong>{formatCurrency(earnings?.totalCreatorShare || 0)}</strong>
        </div>
        <div className="panel stat-card">
          <p>Transactions</p>
          <strong>{earnings?.totalTransactions || 0}</strong>
        </div>
        <div className="panel stat-card">
          <p>Platform Fee Paid</p>
          <strong>{formatCurrency(earnings?.totalPlatformFee || 0)}</strong>
        </div>
      </div>

      <div className="dashboard-split">
        <div className="panel form-panel">
          <p className="eyebrow">Start a new live room</p>
          <h2>Go live fast</h2>
          <form className="form-grid" onSubmit={handleCreateStream}>
            <label>
              Stream Title
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Late night coding stream"
                required
              />
            </label>

            <label>
              Playback URL
              <input
                value={playbackUrl}
                onChange={(event) => setPlaybackUrl(event.target.value)}
                placeholder="https://www.youtube.com/embed/..."
              />
            </label>

            <p className="field-hint">
              Tip: leave playback URL empty if you only want to test chat and paid messages first.
            </p>

            {error && <p className="error-text">{error}</p>}
            {streamNotice && <p className="success-text">{streamNotice}</p>}

            <button className="primary-button" type="submit">
              Start Stream
            </button>
          </form>
        </div>

        <div className="panel checklist-card">
          <p className="eyebrow">Best next test</p>
          <h2>Run the MVP loop</h2>
          <ul className="checklist">
            <li>Create a stream</li>
            <li>Open it from a viewer account</li>
            <li>Send normal chat first</li>
            <li>Then test a paid SuperChat</li>
          </ul>
        </div>
      </div>

      <div className="panel transaction-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Recent support</p>
            <h2>Transactions</h2>
          </div>
        </div>

        {transactions.length > 0 ? (
          <div className="transaction-list">
            {transactions.map((transaction) => (
              <div className="transaction-row" key={transaction._id}>
                <div>
                  <strong>{transaction.user_id?.name || "Viewer"}</strong>
                  <p>{transaction.message_text}</p>
                </div>
                <div className="transaction-amounts">
                  <strong>{formatCurrency(transaction.amount)}</strong>
                  <span>{transaction.status}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="subtle-text">No superchat transactions yet.</p>
        )}
      </div>
    </section>
  );
}

export default DashboardPage;
