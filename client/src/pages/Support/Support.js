import React, { useState, useEffect } from "react";
import { AiOutlineMessage } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import "./Support.css";

const Support = () => {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    mensagem: "",
  });

  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null); 

  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (userString) {
      const userData = JSON.parse(userString);
      setUser(userData);
      setFormData((prevData) => ({
        ...prevData,
        nome: userData.nome || "",
        email: userData.email || "",
      }));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getRedirectPath = () => {
    if (!user) {
      return "/login";
    }
    if (user.tipo_usuario === 'proprietario') {
      return "/laundry-profile";
    }
    return "/map";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/suporte`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Erro ao enviar solicitação de suporte");
      }

      alert("Sua mensagem foi enviada com sucesso! Em breve entraremos em contato.");
      
      setFormData((prevData) => ({ ...prevData, mensagem: "" }));

      navigate(getRedirectPath());

    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="support-page">
      <div className="support-content-box">
        <button
          onClick={() => navigate(getRedirectPath())}
          className="support-back-button"
        >
          ← Voltar
        </button>

        <div className="support-header">
          <AiOutlineMessage className="support-icon" />
          <h2 className="support-title">Falar com o Suporte</h2>
        </div>

        <form onSubmit={handleSubmit} className="support-form">
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            className="support-input"
            placeholder="Seu nome"
            required
            disabled={!!user}
          />

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="support-input"
            placeholder="Seu email"
            required
            disabled={!!user}
          />

          <textarea
            name="mensagem"
            value={formData.mensagem}
            onChange={handleChange}
            className="support-textarea"
            placeholder="Descreva seu problema..."
            required
          />

          <button
            type="submit"
            className="support-button"
            disabled={loading || !formData.mensagem.trim()}
          >
            {loading ? "Enviando..." : "Enviar"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Support;