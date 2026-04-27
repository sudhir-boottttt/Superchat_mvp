import { Link, useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";

function RegisterPage() {
  const navigate = useNavigate();
  const { saveAuth } = useAuth();

  async function handleRegister(form) {
    const response = await apiFetch("/api/auth/register", {
      method: "POST",
      body: form
    });

    saveAuth(response.token, response.user);
    navigate(response.user.role === "creator" ? "/dashboard" : "/");
  }

  return (
    <AuthForm
      title="Register"
      submitLabel="Create Account"
      onSubmit={handleRegister}
      footer={
        <p className="subtle-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      }
    />
  );
}

export default RegisterPage;
