import { useState } from "react";

function AuthForm({ title, submitLabel, defaultRole = "viewer", onSubmit, footer }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: defaultRole
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setPending(true);
    setError("");

    try {
      await onSubmit(form);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="auth-card panel">
      <div>
        <p className="eyebrow">MVP Access</p>
        <h1>{title}</h1>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        {"name" in form && title.toLowerCase().includes("register") && (
          <label>
            Name
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Sudhir"
              required
            />
          </label>
        )}

        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="you@example.com"
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            placeholder="At least 6 characters"
            required
          />
        </label>

        {title.toLowerCase().includes("register") && (
          <label>
            Role
            <select
              value={form.role}
              onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
            >
              <option value="viewer">Viewer</option>
              <option value="creator">Creator</option>
            </select>
          </label>
        )}

        {error && <p className="error-text">{error}</p>}

        <button className="primary-button" type="submit" disabled={pending}>
          {pending ? "Please wait..." : submitLabel}
        </button>
      </form>

      {footer}
    </div>
  );
}

export default AuthForm;
