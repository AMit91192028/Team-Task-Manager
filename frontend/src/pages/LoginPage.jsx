import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { getApiErrorMessage } from "../utils/apiError";
import "./LoginPage.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectPath = location.state?.from?.pathname || "/dashboard";

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(formData);
      navigate(redirectPath, { replace: true });
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-page__hero">
        <div className="auth-page__copy">
          <h1>Team task manager</h1>
        </div>

        <div className="auth-page__card">
          <h2>Welcome back</h2>
          <p>Login to open your team dashboard.</p>

          <form onSubmit={handleSubmit}>
            <label>
              Email
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </label>

            {error ? <div className="auth-page__error">{error}</div> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="auth-page__submit-button"
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </form>

          <span>
            Need an account? <Link to="/signup">Create one here</Link>
          </span>
        </div>
      </section>
    </main>
  );
}
