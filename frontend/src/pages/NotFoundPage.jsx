import { Link } from "react-router-dom";
import "./NotFoundPage.css";

export default function NotFoundPage() {
  return (
    <main className="not-found-page">
      <section className="not-found-page__card">
        <p>404</p>
        <h1>Page not found</h1>
        <span>The route you opened does not exist.</span>
        <Link to="/dashboard">Back to dashboard</Link>
      </section>
    </main>
  );
}
