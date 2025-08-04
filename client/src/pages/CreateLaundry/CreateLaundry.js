import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './CreateLaundry.css';

const CreateLaundry = () => {
  const [formData, setFormData] = useState({
    ownerName: '',
    ownerEmail: '',
    ownerPassword: '',
    laundryName: '',
    laundryAddress: '',
    laundryPhone: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      dadosUsuario: {
        nome: formData.ownerName,
        email: formData.ownerEmail,
        senha: formData.ownerPassword
      },
      dadosLavanderia: {
        nome: formData.laundryName,
        endereco: formData.laundryAddress,
        telefone: formData.laundryPhone
      }
    };

    try {
      const response = await fetch('/api/lavanderias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register laundry.');
      }
      
      alert('Laundry and owner registered successfully! You will be redirected to login.');
      navigate('/login');

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="create-laundry-container">
      <div className="create-laundry-box">
        <h1 className="create-laundry-title">Register your laundry now</h1>
        <p className="create-laundry-subtitle">Create your owner account and register your laundry.</p>
        
        <form onSubmit={handleSubmit}>
          <fieldset>
            <legend>Owner Details</legend>
            <div className="input-group">
              <input type="text" name="ownerName" placeholder="Full Name" value={formData.ownerName} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <input type="email" name="ownerEmail" placeholder="Email" value={formData.ownerEmail} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <input type="password" name="ownerPassword" placeholder="Password" value={formData.ownerPassword} onChange={handleChange} required />
            </div>
          </fieldset>
          
          <fieldset>
            <legend>Laundry Details</legend>
            <div className="input-group">
              <input type="text" name="laundryName" placeholder="Laundry Name" value={formData.laundryName} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <input type="text" name="laundryAddress" placeholder="Address" value={formData.laundryAddress} onChange={handleChange} />
            </div>
            <div className="input-group">
              <input type="tel" name="laundryPhone" placeholder="Phone" value={formData.laundryPhone} onChange={handleChange} />
            </div>
          </fieldset>
          
          {error && <p className="error-message">{error}</p>}
          
          <button type="submit" className="create-laundry-button">
            Register Laundry
          </button>
        </form>

        <div className="back-link">
          <Link to="/login">Back to Log In</Link>
        </div>
      </div>
    </div>
  );
};

export default CreateLaundry;
