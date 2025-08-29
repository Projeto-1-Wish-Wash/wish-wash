import React, { useState, useEffect } from "react";
import { AiOutlineMessage } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import "./Support.css";

const Support = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    mensagem: "",
  });

  const [loading, setLoading] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false); 

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      setFormData((prevData) => ({
        ...prevData,
        nome: userData.nome || "",
        email: userData.email || "",
      }));
      setIsUserLoggedIn(true);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/suporte", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Erro ao enviar solicitação de suporte");
      }

      alert("Sua mensagem foi enviada com sucesso! Em breve entraremos em contato.");
      setFormData({ nome: "", email: "", mensagem: "" });

      if(isUserLoggedIn){
        navigate("/map");
      } else{
        navigate("/login");        
      }
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
          onClick={() => navigate("/login")}
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
            disabled={isUserLoggedIn}
          />

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="support-input"
            placeholder="Seu email"
            required
            disabled={isUserLoggedIn}
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