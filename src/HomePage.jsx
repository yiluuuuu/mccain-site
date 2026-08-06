import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = '/api/applicants';

function HomePage() {
  const [applicants, setApplicants] = useState([]);

  const loadApplicants = () => {
    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => setApplicants(data))
      .catch(() => setApplicants([]));
  };

  useEffect(() => {
    loadApplicants();

    const handleRefresh = () => loadApplicants();
    window.addEventListener('applicants-changed', handleRefresh);

    const interval = window.setInterval(loadApplicants, 3000);

    return () => {
      window.removeEventListener('applicants-changed', handleRefresh);
      window.clearInterval(interval);
    };
  }, []);

  const acceptedApplicants = useMemo(() => applicants.filter((applicant) => applicant.status === 'accepted'), [applicants]);
  const rejectedApplicants = useMemo(() => applicants.filter((applicant) => applicant.status === 'rejected'), [applicants]);

  return (
    <div className="reference-shell">
      <div className="reference-topbar">
        <span className="reference-badge">Public site</span>
        <Link className="primary-btn" to="/admin">
          Open admin dashboard
        </Link>
      </div>

      <div className="reference-content">
        <section className="reference-panel">
          <h2>Accepted applicants</h2>
          {acceptedApplicants.length === 0 ? (
            <p className="empty-state">No accepted applicants yet.</p>
          ) : (
            <div className="applicant-list">
              {acceptedApplicants.map((applicant) => (
                <div className="applicant-item" key={applicant.id}>
                  <img className="photo-thumb" src={applicant.profilePhoto || 'https://via.placeholder.com/60'} alt={applicant.passport} />
                  <div>
                    <strong>{applicant.passport}</strong>
                    <p>{applicant.location}</p>
                    <small>Age {applicant.age} • {applicant.phone}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="reference-panel">
          <h2>Rejected applicants</h2>
          {rejectedApplicants.length === 0 ? (
            <p className="empty-state">No rejected applicants yet.</p>
          ) : (
            <div className="applicant-list">
              {rejectedApplicants.map((applicant) => (
                <div className="applicant-item" key={applicant.id}>
                  <img className="photo-thumb" src={applicant.profilePhoto || 'https://via.placeholder.com/60'} alt={applicant.passport} />
                  <div>
                    <strong>{applicant.passport}</strong>
                    <p>{applicant.location}</p>
                    <small>Age {applicant.age} • {applicant.phone}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <iframe
        className="reference-frame"
        src="https://mccain-foods4-nu.vercel.app/"
        title="Reference website"
        loading="lazy"
      />
    </div>
  );
}

export default HomePage;
