import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="not-found-page">
      <div className="card sf-glass">
        <h1>Resource Not Found</h1>
        <p>The requested resource does not exist or you do not have permission to view it.</p>
        <Link to="/dashboard" className="primary-button">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
