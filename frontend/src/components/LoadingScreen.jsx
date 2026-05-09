import "./LoadingScreen.css";

export default function LoadingScreen({ label }) {
  return (
    <div className="loading-screen">
      <div className="loading-screen__card">
        <div className="loading-screen__spinner" />
        <p>{label}</p>
      </div>
    </div>
  );
}
