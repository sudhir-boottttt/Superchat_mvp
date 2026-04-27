import { Link, useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";

function LoginPage() {
  const navigate = useNavigate();
  const { saveAuth } = useAuth();

  async function handleLogin(form) {
    const response = await apiFetch("/api/auth/login", {
      method: "POST",
      body: {
        email: form.email,
        password: form.password
      }
    });

    saveAuth(response.token, response.user);
    navigate(response.user.role === "creator" ? "/dashboard" : "/");
  }

  return (
    <AuthForm
      title="Login"
      submitLabel="Enter App"
      onSubmit={handleLogin}
      footer={
        <p className="subtle-text">
          Need an account? <Link to="/register">Create one</Link>
        </p>
      }
    />
  );
}

export default LoginPage;
