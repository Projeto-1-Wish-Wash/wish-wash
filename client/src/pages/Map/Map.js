import {
  Clock,
  MapPin,
  Navigation,
  Route,
  Search,
  User
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { MdSupportAgent } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import "./Map.css";

const Map = () => {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [lavanderias, setLavanderias] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("mapa");
  const [userLocation, setUserLocation] = useState(null);
  const userMarkerRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [lavanderiasMaquinas, setLavanderiasMaquinas] = useState({});

  // Função para recarregar dados das lavanderias (útil após avaliações)
  const recarregarLavanderias = async () => {
    try {
      const response = await fetch("/api/lavanderias");
      if (response.ok) {
        const data = await response.json();
        const lavanderiasFiltradas =
          data.lavanderias?.filter((l) => l.latitude && l.longitude) || [];
        
        if (lavanderiasFiltradas.length > 0) {
          setLavanderias(lavanderiasFiltradas);
        }
      }
    } catch (err) {
      console.error("Erro ao recarregar lavanderias:", err);
    }
  };

  // Buscar dados do usuário logado
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUser(user);

      // Se o usuário tem coordenadas cadastradas, usar elas
      if (user.latitude && user.longitude) {
        setUserLocation({ lat: user.latitude, lng: user.longitude });
      }
    }
  }, []);

  // Buscar lavanderias da API
  useEffect(() => {
    const lavanderiasPadrao = [
      {
        id: 1,
        nome: "Lavanderia Central",
        endereco: "Rua das Flores, 123 - Centro, Campina Grande/PB",
        telefone: "(83) 3333-1234",
        latitude: -7.2186,
        longitude: -35.8811,
        horario: "08:00 - 18:00",
        avaliacao: 4.5,
        servicos: '["Lavagem", "Secagem", "Passagem"]',
      },
      {
        id: 2,
        nome: "WashMax Bodocongó",
        endereco: "Av. Brasília, 456 - Bodocongó, Campina Grande/PB",
        telefone: "(83) 3333-5678",
        latitude: -7.23,
        longitude: -35.87,
        horario: "07:00 - 19:00",
        avaliacao: 4.2,
        servicos: '["Lavagem", "Secagem"]',
      },
      {
        id: 3,
        nome: "CleanWash Premium",
        endereco: "Rua José Américo, 789 - Catolé, Campina Grande/PB",
        telefone: "(83) 3333-9999",
        latitude: -7.21,
        longitude: -35.89,
        horario: "06:00 - 20:00",
        avaliacao: 4.8,
        servicos: '["Lavagem", "Secagem", "Passagem", "Lavagem a Seco"]',
      },
    ];

    fetch("/api/lavanderias")
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar lavanderias");
        return res.json();
      })
      .then((data) => {
        const lavanderiasFiltradas =
          data.lavanderias?.filter((l) => l.latitude && l.longitude) || [];

        if (lavanderiasFiltradas.length > 0) {
          setLavanderias(lavanderiasFiltradas);
        } else {
          setLavanderias(lavanderiasPadrao);
        }
      })
      .catch((err) => {
        console.error("Erro ao buscar lavanderias:", err);
        setLavanderias(lavanderiasPadrao);
      });
  }, []);

  // Obter localização do usuário (fallback se não tem coordenadas cadastradas)
  useEffect(() => {
    if (
      !userLocation &&
      currentUser &&
      !currentUser.latitude &&
      !currentUser.longitude
    ) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation({ lat: latitude, lng: longitude });
          },
          (error) => {
            setUserLocation({ lat: -7.2186, lng: -35.8811 });
          },
        );
      } else {
        setUserLocation({ lat: -7.2186, lng: -35.8811 });
      }
    }
  }, [userLocation, currentUser]);

  // Inicializar mapa
  useEffect(() => {
    if (!mapRef.current || map) return;

    const initializeMap = () => {
      if (window.L && mapRef.current && !map) {
        try {
          const initialCenter = userLocation
            ? [userLocation.lat, userLocation.lng]
            : [-7.2186, -35.8811];
          const newMap = window.L.map(mapRef.current, {
            zoomControl: true,
            dragging: true,
            touchZoom: true,
            doubleClickZoom: true,
            scrollWheelZoom: true,
            boxZoom: true,
            keyboard: true,
            zoomAnimation: true,
            zoomSnap: 1,
            zoomDelta: 1,
          }).setView(initialCenter, 13);

          window.L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
              attribution: "© OpenStreetMap contributors",
            },
          ).addTo(newMap);

          setMap(newMap);

          setTimeout(() => {
            if (newMap && typeof newMap.invalidateSize === "function") {
              newMap.invalidateSize();
            }
          }, 100);
        } catch (error) {
          console.error("Erro ao inicializar mapa:", error);
        }
      }
    };

    if (window.L) {
      initializeMap();
    } else {
      const leafletScript = document.createElement("script");
      leafletScript.src =
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";

      leafletScript.onload = () => {
        const leafletCSS = document.createElement("link");
        leafletCSS.rel = "stylesheet";
        leafletCSS.href =
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
        document.head.appendChild(leafletCSS);

        setTimeout(initializeMap, 100);
      };

      leafletScript.onerror = () => {
        console.error("Erro ao carregar biblioteca Leaflet");
      };

      document.head.appendChild(leafletScript);
    }
  }, [map, userLocation]);

  // Adicionar marcador do usuário
  useEffect(() => {
    if (!map || !userLocation) return;

    // Remover marcador anterior se a referência existir
    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
    }

    // Criar ícone personalizado para o usuário
    const userIcon = window.L.divIcon({
      html: '<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>',
      iconSize: [20, 20],
      className: "user-location-marker",
    });

    const popupText = currentUser?.endereco
      ? `<div style="font-family: Arial, sans-serif; min-width: 200px; text-align: center;">
          <div style="margin-bottom: 8px;">
            <strong style="color: #2563eb; font-size: 16px;">📍 ${currentUser.nome}</strong>
          </div>
          <div style="color: #374151; font-size: 14px; margin-bottom: 8px;">
            <strong>Endereço cadastrado:</strong>
          </div>
          <div style="color: #6b7280; font-size: 13px; line-height: 1.4;">
            ${currentUser.endereco}
          </div>
          <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 11px;">
            Lat: ${userLocation.lat.toFixed(6)}<br/>
            Lng: ${userLocation.lng.toFixed(6)}
          </div>
        </div>`
      : `<div style="font-family: Arial, sans-serif; text-align: center;">
          <strong style="color: #2563eb;">📍 Sua localização atual</strong><br/>
          <small style="color: #6b7280;">
            Lat: ${userLocation.lat.toFixed(6)}<br/>
            Lng: ${userLocation.lng.toFixed(6)}
          </small>
        </div>`;

    const newUserMarker = window.L.marker(
      [userLocation.lat, userLocation.lng],
      { icon: userIcon },
    )
      .addTo(map)
      .bindPopup(popupText);

    // Guarda a referência ao novo marcador SEM causar re-renderização
    userMarkerRef.current = newUserMarker;

    map.setView([userLocation.lat, userLocation.lng], 14);

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    // O array de dependências agora está correto e não causa o loop
  }, [map, userLocation, currentUser]);

  // Adicionar marcadores das lavanderias
  useEffect(() => {
    if (!map || !window.L || lavanderias.length === 0) return;

    try {
      // Limpar marcadores anteriores de forma mais segura
      const layersToRemove = [];
      map.eachLayer((layer) => {
        if (layer.options && layer.options.isLavanderiaMarker) {
          layersToRemove.push(layer);
        }
      });

      layersToRemove.forEach((layer) => {
        try {
          map.removeLayer(layer);
        } catch (e) {
          console.warn("Erro ao remover layer:", e);
        }
      });

      lavanderias.forEach((lavanderia) => {
        if (
          !lavanderia ||
          !lavanderia.latitude ||
          !lavanderia.longitude ||
          !lavanderia.id
        )
          return;

        try {
          // Ícone personalizado para lavanderias
          const lavanderiaIcon = window.L.divIcon({
            html: '<div style="background-color: #10b981; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">⚡</div>',
            iconSize: [24, 24],
            className: "lavanderia-marker",
          });

          // Criar popup inicial
          const initialPopupContent = `
            <div style="font-family: Arial, sans-serif; min-width: 250px; max-width: 300px;">
              <h3 style="margin: 0 0 10px 0; color: #2563eb;">${lavanderia.nome || "Lavanderia"}</h3>
              <p style="margin: 5px 0;"><strong>Endereço:</strong> ${lavanderia.endereco || "Não informado"}</p>
              <p style="margin: 5px 0;"><strong>Avaliação:</strong> ${"★".repeat(Math.floor(lavanderia.avaliacao || 0))} ${lavanderia.avaliacao || "Não avaliado"}</p>
              <p style="margin: 5px 0;"><strong>Telefone:</strong> ${lavanderia.telefone || "Não informado"}</p>
              <p style="margin: 5px 0;"><strong>Horário:</strong> ${lavanderia.horario || "Consultar"}</p>
              
              <!-- Botão de Traçar Rota -->
              <div style="margin: 10px 0; text-align: center;">
                <button onclick="if(window.tracarRota) window.tracarRota(${lavanderia.latitude}, ${lavanderia.longitude}, '${lavanderia.nome}')" 
                  style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 13px; cursor: pointer; font-weight: 600; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3); transition: all 0.2s;">
                  <span style="margin-right: 5px;">🗺️</span>Traçar Rota
                </button>
              </div>
              
              <div id="maquinas-${lavanderia.id}" style="margin-top: 10px;">
                <div style="text-align: center; padding: 10px; color: #6c757d;">
                  <div style="display: inline-block; width: 16px; height: 16px; border: 2px solid #6c757d; border-top: 2px solid #2563eb; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                  <div style="margin-top: 5px; font-size: 12px;">Carregando máquinas...</div>
                </div>
              </div>
            </div>
          `;

          const marker = window.L.marker(
            [lavanderia.latitude, lavanderia.longitude],
            {
              icon: lavanderiaIcon,
              isLavanderiaMarker: true,
            },
          )
            .addTo(map)
            .bindPopup(initialPopupContent, {
              maxWidth: 350,
              className: "custom-popup",
            });

          // Event listener para quando o popup abrir
          marker.on("popupopen", async () => {
            try {
              const maquinas = await fetchMaquinasLavanderia(lavanderia.id);

              // Passar as máquinas diretamente para evitar problema de timing do React state
              const maquinasHTML = generateMaquinasHTMLDirect(
                maquinas,
                lavanderia.id,
              );

              // Atualizar o conteúdo do popup com as máquinas
              const updatedContent = `
                <div style="font-family: Arial, sans-serif; min-width: 250px; max-width: 300px;">
                  <h3 style="margin: 0 0 10px 0; color: #2563eb;">${lavanderia.nome || "Lavanderia"}</h3>
                  <p style="margin: 5px 0;"><strong>Endereço:</strong> ${lavanderia.endereco || "Não informado"}</p>
                  <p style="margin: 5px 0;"><strong>Avaliação:</strong> ${"★".repeat(Math.floor(lavanderia.avaliacao || 0))} ${lavanderia.avaliacao || "Não avaliado"}</p>
                  <p style="margin: 5px 0;"><strong>Telefone:</strong> ${lavanderia.telefone || "Não informado"}</p>
                  <p style="margin: 5px 0;"><strong>Horário:</strong> ${lavanderia.horario || "Consultar"}</p>
                  
                  <!-- Botão de Traçar Rota -->
                  <div style="margin: 10px 0; text-align: center;">
                    <button onclick="if(window.tracarRota) window.tracarRota(${lavanderia.latitude}, ${lavanderia.longitude}, '${lavanderia.nome}')" 
                      style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 13px; cursor: pointer; font-weight: 600; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3); transition: all 0.2s;">
                      <span style="margin-right: 5px;">🗺️</span>Traçar Rota
                    </button>
                  </div>
                  
                  ${maquinasHTML}
                </div>
              `;

              marker.setPopupContent(updatedContent);
            } catch (error) {
              console.error("💥 Erro ao carregar máquinas no popup:", error);
              const errorContent = `
                <div style="font-family: Arial, sans-serif; min-width: 250px; max-width: 300px;">
                  <h3 style="margin: 0 0 10px 0; color: #2563eb;">${lavanderia.nome || "Lavanderia"}</h3>
                  <p style="margin: 5px 0;"><strong>Endereço:</strong> ${lavanderia.endereco || "Não informado"}</p>
                  <p style="margin: 5px 0;"><strong>Avaliação:</strong> ${"★".repeat(Math.floor(lavanderia.avaliacao || 0))} ${lavanderia.avaliacao || "Não avaliado"}</p>
                  <p style="margin: 5px 0;"><strong>Telefone:</strong> ${lavanderia.telefone || "Não informado"}</p>
                  <p style="margin: 5px 0;"><strong>Horário:</strong> ${lavanderia.horario || "Consultar"}</p>
                  
                  <!-- Botão de Traçar Rota -->
                  <div style="margin: 10px 0; text-align: center;">
                    <button onclick="if(window.tracarRota) window.tracarRota(${lavanderia.latitude}, ${lavanderia.longitude}, '${lavanderia.nome}')" 
                      style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 13px; cursor: pointer; font-weight: 600; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3); transition: all 0.2s;">
                      <span style="margin-right: 5px;">🗺️</span>Traçar Rota
                    </button>
                  </div>
                  
                  <div style="margin-top: 10px; padding: 8px; background: #ffebee; border-radius: 4px; color: #c62828;">
                    Erro ao carregar máquinas
                  </div>
                </div>
              `;
              marker.setPopupContent(errorContent);
            }
          });
        } catch (error) {
          console.error(
            "Erro ao criar marcador para lavanderia:",
            lavanderia.id,
            error,
          );
        }
      });

      // Expor funções globalmente para uso nos botões HTML
      if (typeof window !== "undefined") {
        window.reservarMaquina = reservarMaquina;
        window.recarregarLavanderias = recarregarLavanderias;
        window.tracarRota = traceRouteToLavanderia;
      }
    } catch (error) {
      console.error("Erro ao adicionar marcadores das lavanderias:", error);
    }

    return () => {
      // Cleanup: remover funções globais
      try {
        if (typeof window !== "undefined") {
          if (window.reservarMaquina) {
            delete window.reservarMaquina;
          }
          if (window.recarregarLavanderias) {
            delete window.recarregarLavanderias;
          }
          if (window.reservarMaquina) delete window.reservarMaquina;
          if (window.tracarRota) delete window.tracarRota;
        }
      } catch (error) {
        console.warn("Erro no cleanup:", error);
      }
    };
  }, [map, lavanderias, userLocation]); // Removido routeMode das dependências

  const handleSearch = () => {
    if (!searchTerm.trim()) return;

    const found = lavanderias.find(
      (l) =>
        l.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.endereco?.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    if (found && map) {
      map.setView([found.latitude, found.longitude], 16);
    } else {
      alert(`Nenhuma lavanderia encontrada para: "${searchTerm}"`);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const decodePolyline = (str, precision = 5) => {
    let index = 0;
    let lat = 0;
    let lng = 0;
    const coordinates = [];
    let shift = 0;
    let result = 0;
    let byte = null;
    let latitude_change;
    let longitude_change;
    const factor = Math.pow(10, precision);

    while (index < str.length) {
      byte = null;
      shift = 0;
      result = 0;

      do {
        byte = str.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      latitude_change = result & 1 ? ~(result >> 1) : result >> 1;
      shift = result = 0;

      do {
        byte = str.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      longitude_change = result & 1 ? ~(result >> 1) : result >> 1;
      lat += latitude_change;
      lng += longitude_change;
      coordinates.push([lat / factor, lng / factor]);
    }

    return coordinates;
  };

  const fallbackStraightLine = (
    destLat,
    destLng,
    lavanderiaName = "Lavanderia",
  ) => {
    if (!map || !userLocation) return;

    if (window.routePolyline && map.hasLayer(window.routePolyline)) {
      map.removeLayer(window.routePolyline);
    }

    const coords = [
      [userLocation.lat, userLocation.lng],
      [destLat, destLng],
    ];
    const polyline = window.L.polyline(coords, {
      color: "#ff6b6b",
      weight: 4,
      dashArray: "10, 5",
    }).addTo(map);

    window.routePolyline = polyline;
    map.fitBounds(polyline.getBounds());

    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      destLat,
      destLng,
    );
    alert(
      `Rota para ${lavanderiaName}\nDistância aproximada: ${distance.toFixed(2)} km`,
    );
  };

  const traceRouteToLavanderia = async (
    destLat,
    destLng,
    lavanderiaName = "Lavanderia",
  ) => {
    if (!map || !userLocation) {
      alert("Mapa ou localização do usuário não disponível");
      return;
    }

    try {
      if (window.routePolyline && map.hasLayer(window.routePolyline)) {
        map.removeLayer(window.routePolyline);
      }

      const GRAPHHOPPER_API_KEY = "4dd41875-1549-46ac-9241-58e258b32a69";

      const url = `https://graphhopper.com/api/1/route?point=${userLocation.lat},${userLocation.lng}&point=${destLat},${destLng}&vehicle=car&locale=pt&key=${GRAPHHOPPER_API_KEY}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`GraphHopper erro: ${response.status}`);

      const data = await response.json();
      if (!data.paths || data.paths.length === 0) {
        throw new Error("Nenhuma rota encontrada");
      }

      const path = data.paths[0];
      const coords = decodePolyline(path.points).map((coord) => [
        coord[0],
        coord[1],
      ]);

      const polyline = window.L.polyline(coords, {
        color: "#3b82f6",
        weight: 5,
      }).addTo(map);

      window.routePolyline = polyline;
      map.fitBounds(polyline.getBounds());

      const distance = (path.distance / 1000).toFixed(2);
      const duration = Math.round(path.time / 1000 / 60);
      alert(`Rota para ${lavanderiaName}\n${distance} km - ${duration} min`);
    } catch (error) {
      console.error("Erro GraphHopper:", error);
      fallbackStraightLine(destLat, destLng, lavanderiaName);
    }
  };

  // Função para carregar máquinas de uma lavanderia
  const fetchMaquinasLavanderia = async (lavanderiaId) => {
    if (!lavanderiaId) {
      console.warn("ID da lavanderia não fornecido");
      return [];
    }

    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
      };

      // Adicionar token se disponível (não obrigatório para essa rota)
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/maquinas/lavanderia/${lavanderiaId}`, {
        method: "GET",
        headers: headers,
      });

      if (response.ok) {
        const data = await response.json();
        const maquinas = data.maquinas || [];

        setLavanderiasMaquinas((prev) => ({
          ...prev,
          [lavanderiaId]: maquinas,
        }));

        return maquinas;
      } else {
        const errorText = await response.text();
        console.warn(
          `❌ Erro ao carregar máquinas (${response.status}):`,
          errorText,
        );
      }
    } catch (error) {
      console.error("💥 Erro ao carregar máquinas:", error);
    }
    return [];
  };

  // Função para reservar uma máquina (alterar status para em_uso)
  const reservarMaquina = async (maquinaId, lavanderiaId) => {
    if (!maquinaId || !lavanderiaId) {
      alert("Dados inválidos para reserva");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Você precisa estar logado para reservar uma máquina");
        return;
      }

      const response = await fetch(`/api/maquinas/${maquinaId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "em_uso" }),
      });

      if (response.ok) {
        // Recarregar máquinas para atualizar o status
        await fetchMaquinasLavanderia(lavanderiaId);
        alert("Máquina reservada com sucesso!");
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(
          errorData.error || `Erro ao reservar máquina (${response.status})`,
        );
      }
    } catch (error) {
      console.error("Erro ao reservar máquina:", error);
      alert("Erro de conexão ao reservar máquina. Tente novamente.");
    }
  };

  // Função para gerar HTML das máquinas (recebe máquinas diretamente)
  const generateMaquinasHTMLDirect = (maquinas, lavanderiaId) => {
    try {
      if (maquinas.length === 0) {
        return '<div style="margin-top: 10px; padding: 8px; background: #f8f9fa; border-radius: 4px; color: #6c757d;">Nenhuma máquina cadastrada</div>';
      }

      const htmlMaquinas = maquinas
        .map((maquina) => {
          if (!maquina || !maquina.id) {
            return "";
          }

          const nome = maquina.nome || "Máquina";
          const capacidade = maquina.capacidade || "";
          const status = maquina.status || "disponivel";

          const statusColor =
            status === "disponivel"
              ? "#28a745"
              : status === "em_uso"
                ? "#dc3545"
                : "#ffc107";
          const statusText =
            status === "disponivel"
              ? "🟢 Disponível"
              : status === "em_uso"
                ? "🔴 Em Uso"
                : "🟡 Manutenção";

          return `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 8px; margin: 4px 0; background: #f8f9fa; border-radius: 4px; border-left: 3px solid ${statusColor};">
            <div style="flex: 1;">
              <div style="font-weight: 500; font-size: 13px; color: #333;">${nome}</div>
              ${capacidade ? `<div style="font-size: 11px; color: #6c757d;">${capacidade}</div>` : ""}
              ${maquina.valor_lavagem ? `<div style="font-size: 11px; color: #28a745; font-weight: 500;">R$ ${maquina.valor_lavagem.toFixed(2).replace(".", ",")}</div>` : ""}
              <div style="font-size: 11px; font-weight: 500; color: ${statusColor};">
                ${statusText}
              </div>
            </div>
            ${
              status === "disponivel"
                ? `<button onclick="if(window.reservarMaquina) window.reservarMaquina(${maquina.id}, ${lavanderiaId})" 
                style="background: #28a745; color: white; border: none; padding: 4px 8px; border-radius: 3px; font-size: 11px; cursor: pointer; font-weight: 500;">
                Reservar
              </button>`
                : `<span style="background: #e9ecef; color: #6c757d; padding: 4px 8px; border-radius: 3px; font-size: 11px;">
                ${status === "em_uso" ? "Ocupada" : "Manutenção"}
              </span>`
            }
          </div>
        `;
        })
        .join("");

      return `
        <div style="margin-top: 10px; border-top: 1px solid #e5e7eb; padding-top: 10px;">
          <h4 style="margin: 0 0 8px 0; color: #2563eb; font-size: 14px;">Máquinas (${maquinas.length})</h4>
          ${htmlMaquinas}
        </div>
      `;
    } catch (error) {
      console.error("💥 Erro ao gerar HTML das máquinas:", error);
      return '<div style="margin-top: 10px; padding: 8px; background: #ffebee; border-radius: 4px; color: #c62828;">Erro ao carregar máquinas</div>';
    }
  };

  // Função para gerar HTML das máquinas (usando estado - mantida para compatibilidade)
  const generateMaquinasHTML = (lavanderiaId) => {
    try {
      const maquinas = lavanderiasMaquinas[lavanderiaId] || [];

      if (maquinas.length === 0) {
        return '<div style="margin-top: 10px; padding: 8px; background: #f8f9fa; border-radius: 4px; color: #6c757d;">Nenhuma máquina cadastrada</div>';
      }

      const htmlMaquinas = maquinas
        .map((maquina, index) => {
          if (!maquina || !maquina.id) {
            return "";
          }

          const nome = maquina.nome || "Máquina";
          const capacidade = maquina.capacidade || "";
          const status = maquina.status || "disponivel";

          const statusColor =
            status === "disponivel"
              ? "#28a745"
              : status === "em_uso"
                ? "#dc3545"
                : "#ffc107";
          const statusText =
            status === "disponivel"
              ? "🟢 Disponível"
              : status === "em_uso"
                ? "🔴 Em Uso"
                : "🟡 Manutenção";

          const htmlMaquina = `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 8px; margin: 4px 0; background: #f8f9fa; border-radius: 4px; border-left: 3px solid ${statusColor};">
            <div style="flex: 1;">
              <div style="font-weight: 500; font-size: 13px; color: #333;">${nome}</div>
              ${capacidade ? `<div style="font-size: 11px; color: #6c757d;">${capacidade}</div>` : ""}
              <div style="font-size: 11px; font-weight: 500; color: ${statusColor};">
                ${statusText}
              </div>
            </div>
            ${
              status === "disponivel"
                ? `<button onclick="if(window.reservarMaquina) window.reservarMaquina(${maquina.id}, ${lavanderiaId})" 
                style="background: #28a745; color: white; border: none; padding: 4px 8px; border-radius: 3px; font-size: 11px; cursor: pointer; font-weight: 500;">
                Reservar
              </button>`
                : `<span style="background: #e9ecef; color: #6c757d; padding: 4px 8px; border-radius: 3px; font-size: 11px;">
                ${status === "em_uso" ? "Ocupada" : "Manutenção"}
              </span>`
            }
          </div>
        `;

          return htmlMaquina;
        })
        .join("");

      const htmlFinal = `
        <div style="margin-top: 10px; border-top: 1px solid #e5e7eb; padding-top: 10px;">
          <h4 style="margin: 0 0 8px 0; color: #2563eb; font-size: 14px;">Máquinas (${maquinas.length})</h4>
          ${htmlMaquinas}
        </div>
      `;

      return htmlFinal;
    } catch (error) {
      console.error("💥 GenerateHTML: Erro ao gerar HTML das máquinas:", error);
      return '<div style="margin-top: 10px; padding: 8px; background: #ffebee; border-radius: 4px; color: #c62828;">Erro ao carregar máquinas</div>';
    }
  };

  // Funções de navegação
  const handleNavigation = (tabId) => {
    setActiveTab(tabId);
    switch (tabId) {
      case "historico":
        navigate("/history");
        break;
      case "perfil":
        navigate("/profile"); // Corrigido: agora vai para /profile
        break;
      case "mapa":
        // Já estamos no mapa
        break;
      case "suporte":
        navigate("/support")
        break;
      default:
        break;
    }
  };

  return (
    <div className="container">
      {/* Header - Removido botão de rota */}
      <div className="header">
        <div className="header-inner">
          <div className="input-wrapper">
            <Search size={20} />
            <input
              type="text"
              placeholder="Buscar lavanderias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <button onClick={handleSearch} className="search-btn">
            Buscar
          </button>
        </div>
      </div>

      {/* Mapa */}
      <div className="map-container">
        <div ref={mapRef} id="map" />
      </div>

      {/* Barra de navegação */}
      <div className="bottom-nav">
        <div className="nav-inner">
          {[
            { id: "historico", icon: Clock, label: "Histórico" },
            { id: "perfil", icon: User, label: "Perfil" },
            { id: "mapa", icon: MapPin, label: "Mapa" },
            { id: "suporte", icon: MdSupportAgent, label: "Suporte" },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => handleNavigation(id)}
              className={`nav-button ${activeTab === id ? "active" : ""}`}
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
