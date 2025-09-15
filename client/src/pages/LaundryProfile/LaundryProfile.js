import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { AiOutlineLock, AiOutlineLogout, AiOutlineMail, AiOutlineUser } from "react-icons/ai";
import { BsPinMap, BsShop, BsTelephone, BsTrash3 } from "react-icons/bs";
import { MdOutlineLocalLaundryService, MdSupportAgent } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import AddressInput from "../../components/AddressInput";
import "./LaundryProfile.css";

const LaundryProfile = () => {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const [proprietario, setProprietario] = useState({
    nome: "",
    email: "",
    senha: ""
  });

  const [lavanderia, setLavanderia] = useState({
    nome: "",
    endereco: "",
    telefone: "",
    id: null
  });
  
  const [maquinas, setMaquinas] = useState([]);
  const [coordinates, setCoordinates] = useState({ latitude: null, longitude: null });
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fieldToEdit, setFieldToEdit] = useState("");
  const [editValue, setEditValue] = useState("");
  const [isEditModalChanged, setIsEditModalChanged] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editContext, setEditContext] = useState("");
  const [showAddMaquinaModal, setShowAddMaquinaModal] = useState(false);
  const [newMaquinaName, setNewMaquinaName] = useState("");
  const [newMaquinaCapacidade, setNewMaquinaCapacidade] = useState("");
  const [newMaquinaValor, setNewMaquinaValor] = useState("");

  const navigate = useNavigate();

  const getUserAuthData = () => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    return { token, userId: user?.id };
  };

  const modalCommonProps = {
    centered: true,
    backdrop: "static",
    keyboard: false,
    size: "md",
    scrollable: false,
  };

  // Modal de exclusão
  const openDeleteModal = () => setShowDeleteModal(true);
  const closeDeleteModal = () => setShowDeleteModal(false);

  // Modal de edição
  const openEditModal = (context, field) => {
    setEditContext(context);
    setFieldToEdit(field);

    if (context === "proprietario") {
      setEditValue(field === "senha" ? "" : proprietario[field]);
    } else {
      setEditValue(lavanderia[field] || "");
    }

    setIsEditModalChanged(false);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setFieldToEdit("");
    setEditValue("");
    setIsEditModalChanged(false);
    setEditContext("");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { token, userId } = getUserAuthData();
        if (!token || !userId) {
          navigate("/login");
          return;
        }

        // Buscar dados do proprietário
        const userRes = await fetch(`${API_URL}/api/usuarios/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userJson = await userRes.json();
        if (!userRes.ok) throw new Error(userJson.error || "Erro ao carregar perfil");

        setProprietario({
          nome: userJson.user.nome || userJson.user.name || "",
          email: userJson.user.email || "",
          senha: "",
        });

        // Buscar dados da lavanderia
        const laundryRes = await fetch(`${API_URL}/api/lavanderias/proprietario/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const laundryJson = await laundryRes.json();
        if (!laundryRes.ok) throw new Error(laundryJson.error || "Erro ao carregar lavanderia");

        if (laundryJson.lavanderias && laundryJson.lavanderias.length > 0) {
          const primeiraLavanderia = laundryJson.lavanderias[0];
          setLavanderia({
            id: primeiraLavanderia.id,
            nome: primeiraLavanderia.nome || "",
            endereco: primeiraLavanderia.endereco || "",
            telefone: primeiraLavanderia.telefone || ""
          });
          
          setCoordinates({
            latitude: primeiraLavanderia.latitude || null,
            longitude: primeiraLavanderia.longitude || null,
          });

          // Carregar máquinas da lavanderia
          await fetchMaquinas(primeiraLavanderia.id, token);
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, API_URL]);

  const handleChange = (e) => {
    setEditValue(e.target.value);
    if (fieldToEdit === "senha") {
      setIsEditModalChanged(e.target.value.trim() !== "");
    } else {
      if (editContext === "proprietario") {
        setIsEditModalChanged(e.target.value !== proprietario[fieldToEdit]);
      } else {
        setIsEditModalChanged(e.target.value !== lavanderia[fieldToEdit]);
      }
    }
  };

  // Handler específico para mudanças no endereço da lavanderia
  const handleAddressChange = (value) => {
    setEditValue(value);
    setIsEditModalChanged(value !== lavanderia.endereco);
  };

  // Handler para mudanças nas coordenadas da lavanderia
  const handleCoordinatesChange = (newCoordinates) => {
    setCoordinates(newCoordinates);
  };

  // Função para carregar máquinas da lavanderia
  const fetchMaquinas = async (lavanderiaId, token) => {
    try {
      const response = await fetch(`${API_URL}/api/maquinas/lavanderia/${lavanderiaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setMaquinas(data.maquinas || []);
      }
    } catch (error) {
      console.error('Erro ao carregar máquinas:', error);
    }
  };

  // Função para atualizar status da máquina
  const updateMaquinaStatus = async (maquinaId, novoStatus) => {
    try {
      const { token } = getUserAuthData();
      const response = await fetch(`${API_URL}/api/maquinas/${maquinaId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: novoStatus }),
      });

      if (response.ok) {
        // Recarregar máquinas
        await fetchMaquinas(lavanderia.id, token);
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao atualizar status');
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status da máquina');
    }
  };

  // Função para adicionar nova máquina
  const addMaquina = async () => {
    if (!newMaquinaName.trim()) {
      alert('Nome da máquina é obrigatório');
      return;
    }

    try {
      const { token } = getUserAuthData();
      const response = await fetch(`${API_URL}/api/maquinas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome: newMaquinaName,
          capacidade: newMaquinaCapacidade,
          valor_lavagem: newMaquinaValor ? parseFloat(newMaquinaValor) : null,
          lavanderia_id: lavanderia.id,
        }),
      });

      if (response.ok) {
        // Recarregar máquinas
        await fetchMaquinas(lavanderia.id, token);
        setNewMaquinaName("");
        setNewMaquinaCapacidade("");
        setNewMaquinaValor("");
        setShowAddMaquinaModal(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao adicionar máquina');
      }
    } catch (error) {
      console.error('Erro ao adicionar máquina:', error);
      alert('Erro ao adicionar máquina');
    }
  };

  // Função para deletar máquina
  const deleteMaquina = async (maquinaId) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('Tem certeza que deseja excluir esta máquina?')) {
      return;
    }

    try {
      const { token } = getUserAuthData();
      const response = await fetch(`${API_URL}/api/maquinas/${maquinaId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        // Recarregar máquinas
        await fetchMaquinas(lavanderia.id, token);
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao excluir máquina');
      }
    } catch (error) {
      console.error('Erro ao excluir máquina:', error);
      alert('Erro ao excluir máquina');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isEditModalChanged) return;

    try {
      const { token, userId } = getUserAuthData();
      if (!token || !userId) {
        navigate("/login");
        return;
      }

      if (editContext === "proprietario") {
        // Atualizar dados do proprietário
        const updatedData = {};
        if (fieldToEdit === "nome") updatedData.nome = editValue;
        if (fieldToEdit === "email") updatedData.email = editValue;
        if (fieldToEdit === "senha" && editValue.trim() !== "") updatedData.senha = editValue;

        const res = await fetch(`${API_URL}/api/usuarios/${userId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedData),
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Erro ao salvar perfil");

        setProprietario({ ...proprietario, [fieldToEdit]: fieldToEdit === "senha" ? "" : editValue });

      } else {
        // Atualizar dados da lavanderia
        const laundryRes = await fetch(`${API_URL}/api/lavanderias/proprietario/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const laundryJson = await laundryRes.json();
        if (!laundryRes.ok) throw new Error(laundryJson.error || "Erro ao carregar lavanderia");

        if (laundryJson.lavanderias && laundryJson.lavanderias.length > 0) {
          const laundryId = laundryJson.lavanderias[0].id;

          const updatedData = {};
          if (fieldToEdit === "nome") updatedData.nome = editValue;
          if (fieldToEdit === "endereco") {
            updatedData.endereco = editValue;
            if (coordinates.latitude && coordinates.longitude) {
              updatedData.latitude = coordinates.latitude;
              updatedData.longitude = coordinates.longitude;
            }
          }
          if (fieldToEdit === "telefone") updatedData.telefone = editValue;

          const updateRes = await fetch(`${API_URL}/api/lavanderias/${laundryId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updatedData),
          });

          const updateJson = await updateRes.json();
          if (!updateRes.ok) throw new Error(updateJson.error || "Erro ao atualizar lavanderia");

          setLavanderia({ ...lavanderia, [fieldToEdit]: editValue });
        }
      }

      closeEditModal();
    } catch (err) {
      alert(err.message);
    }
  };

  const confirmDelete = async () => {
    closeDeleteModal();
    try {
      const { token, userId } = getUserAuthData();
      if (!token || !userId) {
        navigate("/login");
        return;
      }

      const res = await fetch(`${API_URL}/api/usuarios/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erro ao excluir conta");

      localStorage.clear();
      navigate("/signup");
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="profile-page loading-state">
        <p>Carregando perfil...</p>
      </div>
    );
  }

  return (
    <div className="laundry-profile-page">
      <div className="laundry-profile-content-box">
        <div className="laundry-profile-header">
          <div className="laundry-icon">
            <BsShop
              size={80}
              color="#2d80da"
              className="bi bi-shop"
            />
          </div>
          <p className="laundry-profile-name">{lavanderia.nome}</p>
          <p className="laundry-profile-ownername">Proprietário: {proprietario.nome}</p>
          {lavanderia.endereco && (
            <p className="laundry-profile-address" style={{ color: '#6b7280', fontSize: '14px', marginTop: '5px' }}>
              📍 {lavanderia.endereco}
            </p>
          )}
        </div>

        <div className="laundry-profile-options">
          {/* Proprietário */}
          <button className="laundry-option-item" onClick={() => openEditModal("proprietario", "nome")}>
            <AiOutlineUser className="laundry-option-icon" />
            <span>Alterar Nome do Proprietário</span>
          </button>
          <button className="laundry-option-item" onClick={() => openEditModal("proprietario", "email")}>
            <AiOutlineMail className="laundry-option-icon" />
            <span>Alterar Email do Proprietário</span>
          </button>
          <button className="laundry-option-item" onClick={() => openEditModal("proprietario", "senha")}>
            <AiOutlineLock className="laundry-option-icon" />
            <span>Alterar Senha do Proprietário</span>
          </button>

          {/* Lavanderia */}
          <button className="laundry-option-item" onClick={() => openEditModal("lavanderia", "nome")}>
            <MdOutlineLocalLaundryService className="laundry-option-icon laundry-service-icon" />
            <span>Alterar Nome da Lavanderia</span>
          </button>
          <button className="laundry-option-item" onClick={() => openEditModal("lavanderia", "endereco")}>
            <BsPinMap className="laundry-option-icon" />
            <span>Alterar Endereço da Lavanderia</span>
          </button>
          <button className="laundry-option-item" onClick={() => openEditModal("lavanderia", "telefone")}>
            <BsTelephone className="laundry-option-icon" />
            <span>Alterar Telefone</span>
          </button>

          <button className="laundry-option-item" onClick={() => navigate("/support")}>
            <MdSupportAgent className="laundry-option-icon" />
            <span>Solicitar Suporte</span>
          </button>

          <button
            className="laundry-option-item logout-item"
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
          >
            <AiOutlineLogout className="laundry-option-icon" />
            <span>Sair</span>
          </button>

          <button
            type="button"
            className="laundry-option-item delete-item"
            onClick={openDeleteModal}
          >
            <BsTrash3 className="laundry-option-icon" />
            <span>Excluir Conta</span>
          </button>
        </div>

        {/* Seção de Máquinas */}
        <div className="machines-section">
          <div className="machines-header">
            <h3>Máquinas ({maquinas.length})</h3>
            <button 
              className="add-machine-btn"
              onClick={() => setShowAddMaquinaModal(true)}
            >
              + Adicionar Máquina
            </button>
          </div>
          
          {maquinas.length === 0 ? (
            <div className="no-machines">
              <p>Nenhuma máquina cadastrada ainda.</p>
              <p>Clique em "Adicionar Máquina" para começar.</p>
            </div>
          ) : (
            <div className="machines-list">
              {maquinas.map((maquina) => (
                <div key={maquina.id} className="machine-item">
                  <div className="machine-info">
                    <h4>{maquina.nome}</h4>
                    {maquina.capacidade && (
                      <span className="machine-capacity">{maquina.capacidade}</span>
                    )}
                    {maquina.valor_lavagem && (
                      <span className="machine-price">R$ {maquina.valor_lavagem.toFixed(2).replace('.', ',')}</span>
                    )}
                    <span className={`machine-status ${maquina.status}`}>
                      {maquina.status === 'disponivel' && '🟢 Disponível'}
                      {maquina.status === 'em_uso' && '🔴 Em Uso'}
                      {maquina.status === 'manutencao' && '🟡 Manutenção'}
                    </span>
                  </div>
                  
                  <div className="machine-actions">
                    <select 
                      value={maquina.status}
                      onChange={(e) => updateMaquinaStatus(maquina.id, e.target.value)}
                      className="status-select"
                    >
                      <option value="disponivel">Disponível</option>
                      <option value="em_uso">Em Uso</option>
                      <option value="manutencao">Manutenção</option>
                    </select>
                    
                    <button 
                      className="delete-machine-btn"
                      onClick={() => deleteMaquina(maquina.id)}
                      title="Excluir máquina"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de exclusão */}
      <Modal
        show={showDeleteModal}
        onHide={closeDeleteModal}
        {...modalCommonProps}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
        dialogClassName="custom-modal-dialog"
      >
        <Modal.Header>
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Tem certeza de que deseja excluir sua conta? Esta ação é irreversível.</p>
        </Modal.Body>
        <Modal.Footer className="laundry-modal-footer">
          <Button type="button" variant="secondary" onClick={closeDeleteModal}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Excluir Conta
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modais de edição */}
      <Modal
        show={showEditModal}
        onHide={closeEditModal}
        {...modalCommonProps}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
        dialogClassName="custom-modal-dialog"
      >
        <Modal.Header>
          <Modal.Title>
            {editContext === "proprietario" && fieldToEdit === "nome" && "Alterar Nome do Proprietário"}
            {editContext === "proprietario" && fieldToEdit === "email" && "Alterar Email do Proprietário"}
            {editContext === "proprietario" && fieldToEdit === "senha" && "Alterar Senha do Proprietário"}
            {editContext === "lavanderia" && fieldToEdit === "nome" && "Alterar Nome da Lavanderia"}
            {editContext === "lavanderia" && fieldToEdit === "endereco" && "Alterar Endereço da Lavanderia"}
            {editContext === "lavanderia" && fieldToEdit === "telefone" && "Alterar Telefone"}
          </Modal.Title>
        </Modal.Header>
        <form onSubmit={handleSave} className="modal-edit-form">
          <Modal.Body>
            <div className="input-group">
              {editContext === "lavanderia" && fieldToEdit === "endereco" ? (
                <AddressInput
                  value={editValue}
                  onChange={handleAddressChange}
                  onCoordinatesChange={handleCoordinatesChange}
                  placeholder="Digite o endereço completo ou CEP da lavanderia"
                  required
                />
              ) : (
                <input
                  type={fieldToEdit === "senha" ? "password" : "text"}
                  id={fieldToEdit}
                  name={fieldToEdit}
                  className="modal-input"
                  placeholder={
                    fieldToEdit === "senha"
                      ? "Digite a nova senha"
                      : fieldToEdit === "nome"
                        ? "Digite o nome"
                        : fieldToEdit === "email"
                          ? "Digite o e-mail"
                          : fieldToEdit === "endereco"
                            ? "Digite o endereço"
                            : "Digite o telefone"
                  }
                  value={editValue}
                  onChange={handleChange}
                  required
                />
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button type="button" variant="secondary" onClick={closeEditModal}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              className={`save-modal-button ${isEditModalChanged ? "active" : ""}`}
              disabled={!isEditModalChanged}
            >
              Salvar
            </Button>
          </Modal.Footer>
        </form>
      </Modal>

      {/* Modal para adicionar máquina */}
      <Modal
        show={showAddMaquinaModal}
        onHide={() => setShowAddMaquinaModal(false)}
        {...modalCommonProps}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
        dialogClassName="custom-modal-dialog"
      >
        <Modal.Header>
          <Modal.Title>Adicionar Nova Máquina</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="input-group">
            <label htmlFor="machineName">Nome da Máquina</label>
            <input
              type="text"
              id="machineName"
              className="modal-input"
              placeholder="Ex: Máquina 01"
              value={newMaquinaName}
              onChange={(e) => setNewMaquinaName(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="machineCapacity">Capacidade (opcional)</label>
            <input
              type="text"
              id="machineCapacity"
              className="modal-input"
              placeholder="Ex: 8kg, 12kg"
              value={newMaquinaCapacidade}
              onChange={(e) => setNewMaquinaCapacidade(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="machinePrice">Valor da Lavagem</label>
            <input
              type="number"
              step="0.01"
              min="0"
              id="machinePrice"
              className="modal-input"
              placeholder="Ex: 5.00"
              value={newMaquinaValor}
              onChange={(e) => setNewMaquinaValor(e.target.value)}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            type="button" 
            variant="secondary" 
            onClick={() => setShowAddMaquinaModal(false)}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={addMaquina}
            disabled={!newMaquinaName.trim()}
          >
            Adicionar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default LaundryProfile;