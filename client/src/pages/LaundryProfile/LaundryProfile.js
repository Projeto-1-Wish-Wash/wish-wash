import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LaundryProfile.css";
import { Modal, Button } from "react-bootstrap";
import { AiOutlineUser, AiOutlineMail, AiOutlineLogout, AiOutlineLock } from "react-icons/ai";
import { BsTrash3, BsPinMap, BsTelephone, BsShop} from "react-icons/bs";
import { MdOutlineLocalLaundryService } from "react-icons/md";

const LaundryProfile = () => {
  const [proprietario, setProprietario] = useState({
    nome: "",
    email: "",
    senha: ""
  });

  const [lavanderia, setLavanderia] = useState({
    nome: "",
    endereco: "",
    telefone: ""
  });

  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fieldToEdit, setFieldToEdit] = useState("");
  const [editValue, setEditValue] = useState("");
  const [isEditModalChanged, setIsEditModalChanged] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editContext, setEditContext] = useState("");

  const navigate = useNavigate();

  const getUserAuthData = () => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    return { token, userId: user?.id };
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
        const userRes = await fetch(`/api/usuarios/${userId}`, {
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
        const laundryRes = await fetch(`/api/lavanderias/proprietario/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const laundryJson = await laundryRes.json();
        if (!laundryRes.ok) throw new Error(laundryJson.error || "Erro ao carregar lavanderia");

        if (laundryJson.lavanderias && laundryJson.lavanderias.length > 0) {
          const primeiraLavanderia = laundryJson.lavanderias[0];
          setLavanderia({
            nome: primeiraLavanderia.nome || "",
            endereco: primeiraLavanderia.endereco || "",
            telefone: primeiraLavanderia.telefone || ""
          });
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

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

        const res = await fetch(`/api/usuarios/${userId}`, {
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
        const laundryRes = await fetch(`/api/lavanderias/proprietario/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const laundryJson = await laundryRes.json();
        if (!laundryRes.ok) throw new Error(laundryJson.error || "Erro ao carregar lavanderia");

        if (laundryJson.lavanderias && laundryJson.lavanderias.length > 0) {
          const laundryId = laundryJson.lavanderias[0].id;

          const updatedData = {};
          if (fieldToEdit === "nome") updatedData.nome = editValue;
          if (fieldToEdit === "endereco") updatedData.endereco = editValue;
          if (fieldToEdit === "telefone") updatedData.telefone = editValue;

          const updateRes = await fetch(`/api/lavanderias/${laundryId}`, {
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

      const res = await fetch(`/api/usuarios/${userId}`, {
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
      </div>

      {/* Modal de exclusão */}
      <Modal
        show={showDeleteModal}
        onHide={closeDeleteModal}
        centered
        dialogClassName="laundry-modal-dialog"
        contentClassName="laundry-modal-content"
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
        centered
        dialogClassName="laundry-modal-dialog"
        contentClassName="laundry-modal-content"
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
        <Modal.Body>
          <form onSubmit={handleSave} className="modal-edit-form">
            <div className="input-group">
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
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button type="button" variant="secondary" onClick={closeEditModal}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            className={`save-modal-button ${isEditModalChanged ? "active" : ""}`}
            disabled={!isEditModalChanged}
          >
            Salvar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default LaundryProfile;