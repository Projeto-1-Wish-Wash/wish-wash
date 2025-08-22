import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AddressInput from '../../components/AddressInput';
import './CreateLaundry.css';

const CreateLaundry = () => {
  const [formData, setFormData] = useState({
    ownerName: '',
    ownerEmail: '',
    ownerPassword: '',
    ownerAddress: '',
    laundryName: '',
    laundryAddress: '',
    laundryPhone: '',
    laundryHours: '',
    laundryServices: ''
  });
  const [ownerCoordinates, setOwnerCoordinates] = useState(null);
  const [laundryCoordinates, setLaundryCoordinates] = useState(null);
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
        senha: formData.ownerPassword,
        endereco: formData.ownerAddress,
        latitude: ownerCoordinates?.latitude,
        longitude: ownerCoordinates?.longitude
      },
      dadosLavanderia: {
        nome: formData.laundryName,
        endereco: formData.laundryAddress,
        telefone: formData.laundryPhone,
        horario: formData.laundryHours,
        servicos: formData.laundryServices,
        latitude: laundryCoordinates?.latitude,
        longitude: laundryCoordinates?.longitude
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
      
      alert('Lavanderia e proprietário registrados com sucesso! Você será redirecionado para o login.');
      navigate('/login');

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="create-laundry-container">
      <div className="create-laundry-box">
        <h1 className="create-laundry-title">Cadastre sua lavanderia agora</h1>
        <p className="create-laundry-subtitle">Crie sua conta de proprietário e registre sua lavanderia.</p>
        
        <form onSubmit={handleSubmit}>
          <fieldset>
            <legend>Dados do Proprietário</legend>
            <div className="input-group">
              <input type="text" name="ownerName" placeholder="Nome Completo" value={formData.ownerName} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <input type="email" name="ownerEmail" placeholder="Email" value={formData.ownerEmail} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <input type="password" name="ownerPassword" placeholder="Senha" value={formData.ownerPassword} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <AddressInput
                value={formData.ownerAddress}
                onChange={(value) => setFormData(prev => ({ ...prev, ownerAddress: value }))}
                onCoordinatesChange={setOwnerCoordinates}
                placeholder="Digite o endereço do proprietário ou CEP"
                required
              />
            </div>
          </fieldset>
          
          <fieldset>
            <legend>Dados da Lavanderia</legend>
            <div className="input-group">
              <input type="text" name="laundryName" placeholder="Nome da Lavanderia" value={formData.laundryName} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <AddressInput
                value={formData.laundryAddress}
                onChange={(value) => setFormData(prev => ({ ...prev, laundryAddress: value }))}
                onCoordinatesChange={setLaundryCoordinates}
                placeholder="Digite o endereço da lavanderia ou CEP"
                required
              />
            </div>
            <div className="input-group">
              <input type="tel" name="laundryPhone" placeholder="Telefone" value={formData.laundryPhone} onChange={handleChange} />
            </div>
            <div className="input-group">
              <input type="text" name="laundryHours" placeholder="Horário de Funcionamento (ex: 08:00 - 18:00)" value={formData.laundryHours} onChange={handleChange} />
            </div>
            <div className="input-group">
              <input type="text" name="laundryServices" placeholder="Serviços (ex: Lavagem, Secagem, Passagem)" value={formData.laundryServices} onChange={handleChange} />
            </div>
          </fieldset>
          
          {error && <p className="error-message">{error}</p>}
          
          <button type="submit" className="create-laundry-button">
            Cadastrar Lavanderia
          </button>
        </form>

        <div className="back-link">
          <Link to="/login">Voltar ao Login</Link>
        </div>
      </div>
    </div>
  );
};

export default CreateLaundry;
