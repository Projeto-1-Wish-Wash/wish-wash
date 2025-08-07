import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Navigation,
  Home,
  Clock,
  BarChart3,
  User,
  MapPin,
  Route,
  Star,
  Phone
} from 'lucide-react';
import './Map.css';

const Map = () => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [lavanderias, setLavanderias] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLavanderia, setSelectedLavanderia] = useState(null);
  const [routeMode, setRouteMode] = useState(false);
  const [activeTab, setActiveTab] = useState('inicio');

  useEffect(() => {
    fetch('http://localhost:5000/api/lavanderias')
      .then(res => {
        if (!res.ok) throw new Error('Erro ao buscar lavanderias');
        return res.json();
      })
      .then(data => setLavanderias(data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (!mapRef.current || map) return;

    const leafletScript = document.createElement('script');
    leafletScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
    leafletScript.onload = () => {
      const leafletCSS = document.createElement('link');
      leafletCSS.rel = 'stylesheet';
      leafletCSS.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
      document.head.appendChild(leafletCSS);

      const newMap = window.L.map(mapRef.current).setView([-7.2186, -35.8811], 13);

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(newMap);

      setMap(newMap);
    };
    document.head.appendChild(leafletScript);
  }, [map]);

  useEffect(() => {
    if (!map || lavanderias.length === 0) return;

    lavanderias.forEach((lavanderia) => {
      const marker = window.L.marker([lavanderia.lat, lavanderia.lng])
        .addTo(map)
        .bindPopup(`
          <div style="font-family: Arial, sans-serif;">
            <h3 style="margin: 0 0 10px 0; color: #2563eb;">${lavanderia.nome}</h3>
            <p style="margin: 5px 0;"><strong>Endereço:</strong> ${lavanderia.endereco}</p>
            <p style="margin: 5px 0;"><strong>Avaliação:</strong> ${'★'.repeat(Math.floor(lavanderia.avaliacao))} ${lavanderia.avaliacao}</p>
            <p style="margin: 5px 0;"><strong>Telefone:</strong> ${lavanderia.telefone}</p>
            <p style="margin: 5px 0;"><strong>Horário:</strong> ${lavanderia.horario}</p>
          </div>
        `);

      marker.on('click', () => {
        setSelectedLavanderia(lavanderia);
      });
    });
  }, [map, lavanderias]);

  const handleSearch = () => {
    if (!searchTerm.trim()) return;

    const found = lavanderias.find((l) =>
      l.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.endereco.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (found && map) {
      map.setView([found.lat, found.lng], 16);
      setSelectedLavanderia(found);
    }
  };

  const toggleRouteMode = () => {
    setRouteMode(!routeMode);
    if (!routeMode) {
      alert('Modo rota ativado! Clique em uma lavanderia para traçar a rota.');
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        color={i < Math.floor(rating) ? '#facc15' : '#d1d5db'}
        fill={i < Math.floor(rating) ? '#facc15' : 'none'}
      />
    ));
  };

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <div className="header-inner">
          <div className="input-wrapper">
            <Search size={20} />
            <input
              type="text"
              placeholder="Buscar lavanderias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button onClick={handleSearch} className="search-btn">
            Buscar
          </button>
          <button
            onClick={toggleRouteMode}
            className={`route-btn ${routeMode ? 'active' : ''}`}
          >
            <Route size={20} />
          </button>
        </div>
      </div>

      {/* Mapa */}
      <div className="map-container">
        <div ref={mapRef} id="map" />

        {/* Card de informações */}
        {selectedLavanderia && (
          <div className="info-card">
            <button
              onClick={() => setSelectedLavanderia(null)}
              className="close-btn"
            >
              ✕
            </button>

            <h3>{selectedLavanderia.nome}</h3>

            <div className="info-section">
              <MapPin size={16} />
              <span>{selectedLavanderia.endereco}</span>
            </div>

            <div className="info-section">
              <div style={{ display: 'flex' }}>{renderStars(selectedLavanderia.avaliacao)}</div>
              <span>({selectedLavanderia.avaliacao})</span>
            </div>

            <div className="info-section">
              <Phone size={16} />
              <span>{selectedLavanderia.telefone}</span>
            </div>

            <div className="info-section">
              <Clock size={16} />
              <span>{selectedLavanderia.horario}</span>
            </div>

            <div className="services">
              <p className="services-title">Serviços:</p>
              {selectedLavanderia.servicos.map((servico, index) => (
                <span key={index} className="service-badge">
                  {servico}
                </span>
              ))}
            </div>

            <div className="card-actions">
              <button className="details-btn">Ver Detalhes</button>
              <button className="trace-route-btn">Traçar Rota</button>
            </div>
          </div>
        )}

        {/* Indicador de rota */}
        {routeMode && (
          <div className="route-indicator">
            <Navigation size={16} />
            <span>Modo Rota Ativo</span>
          </div>
        )}
      </div>

      {/* Barra de navegação */}
      <div className="bottom-nav">
        <div className="nav-inner">
          {[
            { id: 'inicio', icon: Home, label: 'Início' },
            { id: 'historico', icon: Clock, label: 'Histórico' },
            { id: 'comparar', icon: BarChart3, label: 'Comparar' },
            { id: 'perfil', icon: User, label: 'Perfil' }
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`nav-button ${activeTab === id ? 'active' : ''}`}
            >
              <Icon size={24} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Map;