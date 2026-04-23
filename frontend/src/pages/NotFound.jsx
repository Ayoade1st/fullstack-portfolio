import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="not-found">
      <h1>404</h1>
      <p>Oops! The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn btn-primary" style={{ display: 'inline-block' }}>Go Home</Link>
    </div>
  );
}

export default NotFound;
