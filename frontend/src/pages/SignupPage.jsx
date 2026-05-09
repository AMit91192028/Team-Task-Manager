import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { getApiErrorMessage } from "../utils/apiError";
import "./SignupPage.css";

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: ""
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");

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
      await signup(formData);
      navigate("/dashboard", { replace: true });
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-page__hero auth-page__hero--signup">
        <div className="auth-page__copy">
          <h1>Team task manager</h1>
        </div>

        <div className="auth-page__card">
          {!selectedRole ? (
            <>
              <h2>Create account</h2>
              <p>Select how you want to enter the workspace.</p>

              <div className="auth-page__role-stack" role="group" aria-label="Signup role">
                <button
                  type="button"
                  className="auth-page__role-card"
                  onClick={() => {
                    setSelectedRole("member");
                    setFormData((current) => ({ ...current, role: "member" }));
                  }}
                >
                  <small>Member Access</small>
                  <strong>Signup as Member</strong>
                  <span>Join projects, update assigned tasks, and track your own work.</span>
                </button>
                <button
                  type="button"
                  className="auth-page__role-card"
                  onClick={() => {
                    setSelectedRole("admin");
                    setFormData((current) => ({ ...current, role: "admin" }));
                  }}
                >
                  <small>Admin Access</small>
                  <strong>Signup as Admin</strong>
                  <span>Create projects, add members, assign tasks, and monitor delivery.</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="auth-page__form-header">
                <div>
                  <h2>Create {selectedRole} account</h2>
                  <p>Finish the signup form for your selected role.</p>
                </div>
                <button
                  type="button"
                  className="auth-page__back-button"
                  onClick={() => {
                    setSelectedRole("");
                    setFormData((current) => ({ ...current, role: "" }));
                  }}
                >
                  Change role
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <label>
                  Full name
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Amit Yadav"
                    required
                  />
                </label>

                <label>
                  Email
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="amit@example.com"
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
                    placeholder="Minimum 6 characters"
                    required
                  />
                </label>

                {error ? <div className="auth-page__error">{error}</div> : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="auth-page__submit-button"
                >
                  {isSubmitting ? "Creating..." : "Create account"}
                </button>
              </form>
            </>
          )}

          <span>
            Already registered? <Link to="/login">Login here</Link>
          </span>
        </div>
      </section>
    </main>
  );
}
