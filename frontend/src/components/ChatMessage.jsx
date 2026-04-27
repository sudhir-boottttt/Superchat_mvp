import { formatCurrency } from "../lib/currency";

function ChatMessage({ message }) {
  const isSuperchat = message.type === "superchat";

  return (
    <div className={`message-card ${isSuperchat ? "message-superchat" : ""}`}>
      <div className="message-head">
        <div className="message-author">
          <strong>{message.user_id?.name || "Anonymous"}</strong>
          <span>{isSuperchat ? "SuperChat" : "Live chat"}</span>
        </div>
        <span>{isSuperchat ? formatCurrency(message.amount) : "Free"}</span>
      </div>
      <p>{message.text}</p>
    </div>
  );
}

export default ChatMessage;
