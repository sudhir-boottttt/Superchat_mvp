import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ChatMessage from "../components/ChatMessage";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";
import { formatCurrency } from "../lib/currency";
import { createSocket } from "../lib/socket";

const QUICK_AMOUNTS = [1000, 5000, 10000, 25000];

function StreamPage() {
  const { streamId } = useParams();
  const { token, user, isAuthenticated } = useAuth();
  const [stream, setStream] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatText, setChatText] = useState("");
  const [superchatText, setSuperchatText] = useState("");
  const [amount, setAmount] = useState("1000");
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    let active = true;

    async function loadStream() {
      try {
        const response = await apiFetch(`/api/streams/${streamId}`);
        if (!active) {
          return;
        }

        setStream(response.stream);
        setMessages(response.messages);
      } catch (loadError) {
        if (active) {
          setError(loadError.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadStream();

    return () => {
      active = false;
    };
  }, [streamId]);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    const socket = createSocket(token);
    socketRef.current = socket;

    socket.emit("join_stream", { streamId });
    socket.on("message_received", (message) => {
      setMessages((current) => [...current, message]);
    });
    socket.on("superchat_received", (message) => {
      setMessages((current) => [...current, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, [streamId, token]);

  async function handleSendMessage(event) {
    event.preventDefault();

    if (!socketRef.current || !chatText.trim()) {
      return;
    }

    socketRef.current.emit("send_message", {
      streamId,
      text: chatText.trim()
    });

    setChatText("");
  }

  async function handleSuperchat(event) {
    event.preventDefault();

    if (!isAuthenticated) {
      setError("Login first to send a superchat.");
      return;
    }

    setError("");
    setStatusMessage("");
    setPaying(true);

    try {
      const orderResponse = await apiFetch("/api/payments/create-order", {
        method: "POST",
        token,
        body: {
          streamId,
          amount: Number(amount),
          message: superchatText
        }
      });

      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_yourkeyid";

      const razorpay = new window.Razorpay({
        key: razorpayKey,
        amount: orderResponse.order.amount,
        currency: orderResponse.order.currency,
        order_id: orderResponse.order.id,
        name: "SuperChat MVP",
        description: `Support ${stream?.creator_id?.name || "creator"}`,
        handler: async (paymentResponse) => {
          await apiFetch("/api/payments/verify", {
            method: "POST",
            token,
            body: paymentResponse
          });

          setSuperchatText("");
          setAmount("1000");
          setStatusMessage("SuperChat sent. The highlighted message should appear in chat.");
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || ""
        },
        theme: {
          color: "#ff6b35"
        }
      });

      razorpay.open();
    } catch (paymentError) {
      setError(paymentError.message);
    } finally {
      setPaying(false);
    }
  }

  if (loading) {
    return <div className="panel">Loading stream...</div>;
  }

  if (!stream) {
    return <div className="panel error-panel">{error || "Stream not found"}</div>;
  }

  return (
    <section className="stream-layout">
      <div className="video-panel">
        <div className="panel stream-hero-card">
          <div className="stream-hero-copy">
            <div className="stream-pill-row">
              <span className="live-badge">Live now</span>
              <span className="creator-label">Creator: {stream.creator_id?.name}</span>
            </div>
            <h1>{stream.title}</h1>
            <p className="hero-copy">
              This room is tuned for the MVP moment: fans chat, pay to stand out, and creators
              see support instantly.
            </p>
          </div>

          <div className="stream-summary-grid">
            <div className="summary-card">
              <span>Chat mode</span>
              <strong>Real-time</strong>
            </div>
            <div className="summary-card">
              <span>SuperChat minimum</span>
              <strong>{formatCurrency(1000)}</strong>
            </div>
            <div className="summary-card">
              <span>Highlighted zone</span>
              <strong>Right panel</strong>
            </div>
          </div>
        </div>

        <div className="panel video-shell">
          <div className="video-frame">
          {stream.playback_url ? (
            <iframe
              src={stream.playback_url}
              title={stream.title}
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          ) : (
            <div className="video-placeholder">
              <p className="eyebrow">Video Slot</p>
              <h2>{stream.title}</h2>
              <p>Use a YouTube Live embed or demo video here for the MVP.</p>
            </div>
          )}
        </div>
        </div>
      </div>

      <aside className="chat-panel panel">
        <div className="chat-header">
          <div>
            <p className="eyebrow">Live Chat</p>
            <h2>Fan messages and paid highlights</h2>
          </div>
          {!isAuthenticated && (
            <Link className="button-link small-link" to="/login">
              Login to chat
            </Link>
          )}
        </div>

        <div className="message-list">
          {messages.length > 0 ? (
            messages.map((message) => <ChatMessage key={message._id} message={message} />)
          ) : (
            <p className="subtle-text">No messages yet. Send the first one.</p>
          )}
        </div>

        <form className="form-grid compact-form" onSubmit={handleSendMessage}>
          <label>
            Normal Chat
            <input
              value={chatText}
              onChange={(event) => setChatText(event.target.value)}
              placeholder="Say something..."
              disabled={!isAuthenticated}
            />
          </label>
          <button className="ghost-button" type="submit" disabled={!isAuthenticated}>
            Send
          </button>
        </form>

        <form className="form-grid superchat-form" onSubmit={handleSuperchat}>
          <div className="superchat-banner">
            <span>Highlighted Support</span>
            <strong>SuperChat</strong>
          </div>

          <div className="preset-row">
            {QUICK_AMOUNTS.map((value) => (
              <button
                key={value}
                className={`preset-chip ${Number(amount) === value ? "preset-chip-active" : ""}`}
                type="button"
                onClick={() => setAmount(String(value))}
              >
                {formatCurrency(value)}
              </button>
            ))}
          </div>

          <label>
            Amount
            <input
              type="number"
              min="1000"
              step="100"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
            <span className="field-hint">You are sending {formatCurrency(Number(amount) || 0)}</span>
          </label>

          <label>
            Message
            <textarea
              value={superchatText}
              onChange={(event) => setSuperchatText(event.target.value)}
              placeholder="Love your content bro!"
              rows="3"
              required
            />
          </label>

          {error && <p className="error-text">{error}</p>}
          {statusMessage && <p className="success-text">{statusMessage}</p>}

          <button className="primary-button" type="submit" disabled={paying}>
            {paying ? "Opening checkout..." : "Send SuperChat"}
          </button>
        </form>
      </aside>
    </section>
  );
}

export default StreamPage;
