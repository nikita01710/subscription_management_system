import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

function SubscriptionList() {
  const [subscriptions, setSubscriptions] = useState([]);

  const [formData, setFormData] = useState({
    user_email: '',
    plan_name: '',
    start_date: '',
    end_date: '',
    monthly_cost: '',
    status: 'Active'
  });

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = () => {
    axios
      .get('http://localhost:5000/api/subscriptions')
      .then((res) => setSubscriptions(res.data))
      .catch(() => toast.error('Error fetching subscriptions'));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({
      user_email: '',
      plan_name: '',
      start_date: '',
      end_date: '',
      monthly_cost: '',
      status: 'Active'
    });
    setShowModal(true);
  };

  const openEditModal = (sub) => {
    setIsEditing(true);
    setEditId(sub.subscription_id);
    setFormData({
      user_email: sub.user_email,
      plan_name: sub.plan_name,
      start_date: sub.start_date.slice(0, 10),
      end_date: sub.end_date.slice(0, 10),
      monthly_cost: sub.monthly_cost,
      status: sub.status
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);

    if (end < start) {
      toast.error('End date cannot be before start date');
      return;
    }

    const url = isEditing
      ? `http://localhost:5000/api/subscriptions/${editId}`
      : 'http://localhost:5000/api/subscriptions';

    const method = isEditing ? axios.put : axios.post;

    method(url, formData)
      .then((res) => {
        toast.success(res.data.message || 'Success');
        setShowModal(false);
        fetchSubscriptions();
      })
      .catch(() => toast.error('Operation failed'));
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure?')) {
      axios
        .delete(`http://localhost:5000/api/subscriptions/${id}`)
        .then(() => {
          toast.success('Deleted');
          fetchSubscriptions();
        })
        .catch(() => toast.error('Delete failed'));
    }
  };

  const sortedSubscriptions = [...subscriptions].sort(
    (a, b) => a.subscription_id - b.subscription_id
  );

  return (
    <div className="app-wrapper">

      <div className="main-container">

    
        <h1 className="page-title">
          Subscription Management System
        </h1>

        <div className="subscription-header">
          <h2>All Subscriptions</h2>

          <button className="add-btn" onClick={openAddModal}>
            + Add Subscription
          </button>
        </div>

        <ToastContainer position="top-right" autoClose={3000} />

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-box">

              <h2>{isEditing ? 'Edit Subscription' : 'Add Subscription'}</h2>

              <form className="subscription-form" onSubmit={handleSubmit}>
                <input name="user_email" value={formData.user_email} onChange={handleChange} placeholder="Email" />
                <input name="plan_name" value={formData.plan_name} onChange={handleChange} placeholder="Plan Name" />
                <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} />
                <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} />
                <input type="number" name="monthly_cost" value={formData.monthly_cost} onChange={handleChange} placeholder="Cost" />

                <select name="status" value={formData.status} onChange={handleChange}>
                  <option>Active</option>
                  <option>Expired</option>
                  <option>Cancelled</option>
                </select>

                <div className="form-buttons">
                  <button type="submit">{isEditing ? 'Update' : 'Add'}</button>
                  <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
                </div>
              </form>

            </div>
          </div>
        )}

        <div className="table-container">
          <table className="subscription-table">

            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Plan</th>
                <th>Start</th>
                <th>End</th>
                <th>Cost</th>
                <th>Status</th>
                <th>Days Left</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {sortedSubscriptions.map((sub) => {
                const days = Math.ceil(
                  (new Date(sub.end_date) - new Date()) / (1000 * 60 * 60 * 24)
                );

                return (
                  <tr key={sub.subscription_id}>
                    <td>{sub.subscription_id}</td>
                    <td>{sub.user_email}</td>
                    <td>{sub.plan_name}</td>
                    <td>{new Date(sub.start_date).toLocaleDateString()}</td>
                    <td>{new Date(sub.end_date).toLocaleDateString()}</td>
                    <td>₹{sub.monthly_cost}</td>
                    <td>{sub.status}</td>
                    <td>{days >= 0 ? days : 'Expired'}</td>

                    <td>
                      <button className="edit-btn" onClick={() => openEditModal(sub)}>Edit</button>
                      <button className="delete-btn" onClick={() => handleDelete(sub.subscription_id)}>Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>

          </table>
        </div>

      </div>
    </div>
  );
}

export default SubscriptionList;
