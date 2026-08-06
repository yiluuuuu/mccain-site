import React, { useEffect, useMemo, useState } from 'react';

const API_URL = '/api/applicants';

const notifyApplicantsChanged = () => {
  window.dispatchEvent(new CustomEvent('applicants-changed'));
};

function App() {
  const [applicants, setApplicants] = useState([]);

  const [form, setForm] = useState({
    age: '',
    phone: '',
    passport: '',
    location: '',
    profilePhoto: '',
    status: 'accepted',
  });
  const [photoPreview, setPhotoPreview] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => setApplicants(data))
      .catch(() => setApplicants([]));
  }, []);

  const filteredApplicants = useMemo(() => {
    if (filter === 'all') {
      return applicants;
    }

    return applicants.filter((applicant) => applicant.status === filter);
  }, [applicants, filter]);

  const resetForm = () => {
    setForm({ age: '', phone: '', passport: '', location: '', profilePhoto: '', status: 'accepted' });
    setPhotoPreview('');
    setEditingId(null);
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const preview = reader.result;
      setPhotoPreview(preview);
      setForm((previous) => ({ ...previous, profilePhoto: preview }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.age.trim() || !form.phone.trim() || !form.passport.trim() || !form.location.trim() || !form.profilePhoto.trim()) {
      return;
    }

    const applicantData = {
      age: form.age.trim(),
      phone: form.phone.trim(),
      passport: form.passport.trim(),
      location: form.location.trim(),
      profilePhoto: form.profilePhoto.trim(),
      status: form.status,
    };

    if (editingId) {
      const response = await fetch(`${API_URL}/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applicantData),
      });

      if (response.ok) {
        const updatedApplicant = await response.json();
        setApplicants((previous) => previous.map((applicant) => (applicant.id === editingId ? updatedApplicant : applicant)));
        notifyApplicantsChanged();
      }
    } else {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applicantData),
      });

      if (response.ok) {
        const createdApplicant = await response.json();
        setApplicants((previous) => [createdApplicant, ...previous]);
        notifyApplicantsChanged();
      }
    }

    resetForm();
  };

  const handleEdit = (applicant) => {
    setEditingId(applicant.id);
    setForm({
      age: applicant.age,
      phone: applicant.phone,
      passport: applicant.passport,
      location: applicant.location,
      profilePhoto: applicant.profilePhoto,
      status: applicant.status,
    });
    setPhotoPreview(applicant.profilePhoto || '');
  };

  const handleDelete = async (id) => {
    const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });

    if (response.ok) {
      setApplicants((previous) => previous.filter((applicant) => applicant.id !== id));
      notifyApplicantsChanged();
    }

    if (editingId === id) {
      resetForm();
    }
  };

  return (
    <div className="dashboard-shell">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Admin dashboard</p>
          <h1>Applicant records</h1>
          <p>Manage accepted and rejected applicants using age, phone, passport, location, and profile photo.</p>
        </div>
        <button className="secondary-btn" type="button" onClick={() => setFilter('all')}>
          Reset view
        </button>
      </header>

      <section className="content-grid">
        <form className="panel form-panel" onSubmit={handleSubmit}>
          <h2>{editingId ? 'Edit applicant' : 'Add applicant'}</h2>

          <label>
            Age
            <input
              type="text"
              value={form.age}
              onChange={(event) => setForm((previous) => ({ ...previous, age: event.target.value }))}
              placeholder="Enter age"
              required
            />
          </label>

          <label>
            Phone
            <input
              type="text"
              value={form.phone}
              onChange={(event) => setForm((previous) => ({ ...previous, phone: event.target.value }))}
              placeholder="Enter phone number"
              required
            />
          </label>

          <label>
            Passport
            <input
              type="text"
              value={form.passport}
              onChange={(event) => setForm((previous) => ({ ...previous, passport: event.target.value }))}
              placeholder="Enter passport number"
              required
            />
          </label>

          <label>
            Location
            <input
              type="text"
              value={form.location}
              onChange={(event) => setForm((previous) => ({ ...previous, location: event.target.value }))}
              placeholder="Enter location"
              required
            />
          </label>

          <label>
            Profile photo
            <input type="file" accept="image/*" onChange={handlePhotoChange} />
            {photoPreview ? <img className="photo-preview" src={photoPreview} alt="Selected preview" /> : null}
          </label>

          <label>
            Status
            <select
              value={form.status}
              onChange={(event) => setForm((previous) => ({ ...previous, status: event.target.value }))}
            >
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>

          <div className="actions">
            <button className="primary-btn" type="submit">
              {editingId ? 'Save changes' : 'Add applicant'}
            </button>
            {editingId ? (
              <button className="ghost-btn" type="button" onClick={resetForm}>
                Cancel
              </button>
            ) : null}
          </div>
        </form>

        <div className="panel table-panel">
          <div className="table-toolbar">
            <h2>Applicants</h2>
            <div className="filters">
              <button className={filter === 'all' ? 'filter-btn active' : 'filter-btn'} type="button" onClick={() => setFilter('all')}>
                All
              </button>
              <button className={filter === 'accepted' ? 'filter-btn active' : 'filter-btn'} type="button" onClick={() => setFilter('accepted')}>
                Accepted
              </button>
              <button className={filter === 'rejected' ? 'filter-btn active' : 'filter-btn'} type="button" onClick={() => setFilter('rejected')}>
                Rejected
              </button>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Age</th>
                  <th>Phone</th>
                  <th>Passport</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplicants.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-state">
                      No applicants in this view yet.
                    </td>
                  </tr>
                ) : (
                  filteredApplicants.map((applicant) => (
                    <tr key={applicant.id}>
                      <td>
                        <img className="photo-thumb" src={applicant.profilePhoto || 'https://via.placeholder.com/60'} alt={applicant.passport} />
                      </td>
                      <td>{applicant.age}</td>
                      <td>{applicant.phone}</td>
                      <td>{applicant.passport}</td>
                      <td>{applicant.location}</td>
                      <td>
                        <span className={`status-badge ${applicant.status}`}>{applicant.status}</span>
                      </td>
                      <td>
                        <div className="row-actions">
                          <button className="ghost-btn small" type="button" onClick={() => handleEdit(applicant)}>
                            Edit
                          </button>
                          <button className="danger-btn small" type="button" onClick={() => handleDelete(applicant.id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
