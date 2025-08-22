import { Loader, MapPin } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import './AddressInput.css';

const AddressInput = ({ 
  value = '', 
  onChange, 
  onCoordinatesChange,
  placeholder = 'Digite o endereço completo',
  required = false 
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cep, setCep] = useState('');
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Função para buscar endereço por CEP
  const searchByCep = async (cepValue) => {
    if (cepValue.length === 8) {
      setIsLoading(true);
      
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepValue}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          const formattedCep = cepValue.replace(/(\d{5})(\d{3})/, '$1-$2');
          const fullAddress = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}, ${formattedCep}`;
          
          onChange(fullAddress);
          
          // Buscar coordenadas para o endereço completo
          await geocodeAddress(fullAddress);
        } else {
        }
      } catch (error) {
      }
      setIsLoading(false);
    }
  };

  // Função para geocodificação usando Nominatim
  const geocodeAddress = async (address) => {
    try {
      const query = encodeURIComponent(`${address}, Brasil`);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1&countrycodes=br`,
        {
          headers: {
            'User-Agent': 'WishWash-App/1.0 (contact@wishwash.com)',
            'Accept': 'application/json'
          }
        }
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const coordinates = {
          latitude: parseFloat(lat),
          longitude: parseFloat(lon)
        };
        onCoordinatesChange && onCoordinatesChange(coordinates);
      } else {
      }
    } catch (error) {
      console.error('Erro na geocodificação:', error);
    }
  };

  // Função para buscar sugestões de endereços
  const searchAddressSuggestions = async (query) => {
    if (query.length < 5) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const encodedQuery = encodeURIComponent(`${query}, Brasil`);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=5&countrycodes=br&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'WishWash-App/1.0 (contact@wishwash.com)',
            'Accept': 'application/json'
          }
        }
      );
      const data = await response.json();
      
      const formattedSuggestions = data.map(item => ({
        display_name: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        address: item.address
      }));
      
      setSuggestions(formattedSuggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Erro ao buscar sugestões:', error);
      setSuggestions([]);
    }
    setIsLoading(false);
  };

  // Detectar CEP no input
  const detectCep = (text) => {
    const cepRegex = /\d{5}-?\d{3}/;
    const match = text.match(cepRegex);
    if (match) {
      const cleanCep = match[0].replace('-', '');
      if (cleanCep !== cep) {
        setCep(cleanCep);
        searchByCep(cleanCep);
      }
    }
  };

  // Handler para mudanças no input
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Detectar se é CEP
    detectCep(newValue);
    
    // Buscar sugestões se não for CEP
    if (!/\d{5}-?\d{3}/.test(newValue)) {
      // Debounce para evitar muitas requisições
      clearTimeout(window.addressSearchTimeout);
      window.addressSearchTimeout = setTimeout(() => {
        searchAddressSuggestions(newValue);
      }, 500);
    }
  };

  // Selecionar sugestão
  const selectSuggestion = (suggestion) => {
    onChange(suggestion.display_name);
    const coordinates = {
      latitude: suggestion.lat,
      longitude: suggestion.lon
    };
    onCoordinatesChange && onCoordinatesChange(coordinates);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  // Fechar sugestões quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="address-input-container">
      <div className="address-input-wrapper">
        <MapPin size={20} className="address-input-icon" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          required={required}
          className="address-input"
          autoComplete="off"
        />
        {isLoading && (
          <Loader size={20} className="address-input-loader spinning" />
        )}
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div ref={suggestionsRef} className="address-suggestions">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="address-suggestion"
              onClick={() => selectSuggestion(suggestion)}
            >
              <MapPin size={16} />
              <div>
                <div className="suggestion-main">
                  {suggestion.address?.road || suggestion.address?.hamlet || 'Endereço'} 
                  {suggestion.address?.house_number && `, ${suggestion.address.house_number}`}
                </div>
                <div className="suggestion-details">
                  {suggestion.address?.suburb || suggestion.address?.city_district}, {' '}
                  {suggestion.address?.city || suggestion.address?.town || suggestion.address?.village}, {' '}
                  {suggestion.address?.state}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="address-input-hint">
        💡 Digite o CEP ou endereço completo para localização automática
      </div>
    </div>
  );
};

export default AddressInput;