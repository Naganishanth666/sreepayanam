import { Link } from 'react-router-dom';

const AccessCard = ({ eyebrow, title, message }) => (
  <main className="page-container">
    <div className="container">
      <div className="glass-card access-card">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{message}</p>
        <Link className="btn btn-primary" to="/">Return home</Link>
      </div>
    </div>
  </main>
);

export const ForbiddenPage = () => (
  <AccessCard
    eyebrow="Access boundary"
    title="This area is for a different role."
    message="Your account is signed in, but it does not have permission to open this page."
  />
);

export const NotFoundPage = () => (
  <AccessCard
    eyebrow="Wrong turn"
    title="That page is not on this route."
    message="The link may have moved. The routebook is still open."
  />
);
