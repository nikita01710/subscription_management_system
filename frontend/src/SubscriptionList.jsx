import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
      .catch((err) => {
        console.error('Error fetching data:', err);
        toast.error('Error fetching subscriptions');
      });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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

  // Frontend date validation
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
    .catch((err) => {
      console.error('Error:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || 'Operation failed';
      toast.error(msg);
    });
};


  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      axios
        .delete(`http://localhost:5000/api/subscriptions/${id}`)
        .then((res) => {
          toast.success(res.data.message || 'Deleted');
          fetchSubscriptions();
        })
        .catch((err) => {
          console.error('Delete failed:', err);
          toast.error('Failed to delete subscription');
        });
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Add Button */}
      <button
        onClick={openAddModal}
        style={{
          marginBottom: '10px',
          padding: '8px 16px',
          backgroundColor: '#4CAF50',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        + Add Subscription
      </button>

      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0,
            width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1000
          }}
        >
          <div
            style={{
              background: '#fff',
              padding: '20px',
              borderRadius: '8px',
              width: '400px'
            }}
          >
            <h2>{isEditing ? 'Edit Subscription' : 'Add New Subscription'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px'}}>
              <input type="email" name="user_email" placeholder="Email" value={formData.user_email} onChange={handleChange} required />
              <input type="text" name="plan_name" placeholder="Plan Name" value={formData.plan_name} onChange={handleChange} required />
              <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} required />
              <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} required />
              <input type="number" name="monthly_cost" placeholder="Monthly Cost" value={formData.monthly_cost} onChange={handleChange} required />
              <select name="status" value={formData.status} onChange={handleChange} required>
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button type="submit">{isEditing ? 'Update' : 'Add'}</button>
                <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <h2 style={{ marginTop: '30px' }}>All Subscriptions</h2>
      <table border="1" cellPadding="8" style={{ marginTop: '10px', borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Plan</th>
            <th>Start</th>
            <th>End</th>
            <th>Cost</th>
            <th>Status</th>
            <th>Remaining Days</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {subscriptions.map((sub) => {
            const remainingDays = Math.ceil(
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
                <td>{remainingDays >= 0 ? remainingDays : 'Expired'}</td>
                <td>
                  <button
                    onClick={() => openEditModal(sub)}
                    style={{
                      backgroundColor: '#2196F3',
                      color: '#fff',
                      border: 'none',
                      marginRight: '5px',
                      padding: '5px 10px',
                      borderRadius: '4px'
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(sub.subscription_id)}
                    style={{
                      backgroundColor: 'red',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '4px'
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default SubscriptionList;
