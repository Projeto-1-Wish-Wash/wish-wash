import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import { Modal, Button } from "react-bootstrap";
import { AiOutlineUser, AiOutlineMail, AiOutlineLogout, AiOutlineLock} from "react-icons/ai";
import { BsTrash3 } from "react-icons/bs";

const Profile = () => {
  const [formData, setFormData] = useState({ nome: "", email: "", senha: "" });
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [fieldToEdit, setFieldToEdit] = useState("");
  const [editValue, setEditValue] = useState("");
  const [isEditModalChanged, setIsEditModalChanged] = useState(false);

  const navigate = useNavigate();

  const getUserAuthData = () => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    return { token, userId: user?.id };
  };

  const modalCommonProps = {
    centered: true,
    backdrop: "static",
    keyboard: false,
    container: typeof document !== "undefined" ? document.body : undefined,
  };

  // Abrir e fechar modais
  const openDeleteModal = () => setShowDeleteModal(true);
  const closeDeleteModal = () => setShowDeleteModal(false);

  const openEditModal = (field) => {
    setFieldToEdit(field);
    setEditValue(field === "senha" ? "" : formData[field] || "");
    setIsEditModalChanged(false);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setFieldToEdit("");
    setEditValue("");
    setIsEditModalChanged(false);
  };

  // Busca dados do usuário
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { token, userId } = getUserAuthData();
        if (!token || !userId) {
          navigate("/login");
          return;
        }

        const res = await fetch(`/api/usuarios/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Erro ao carregar perfil");

        setFormData({
          nome: json.user.nome || json.user.name || "",
          email: json.user.email || "",
          senha: "",
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  // handlers
  const handleChange = (e) => {
    const value = e.target.value;
    setEditValue(value);

    if (fieldToEdit === "senha") {
      setIsEditModalChanged(value.trim() !== "");
    } else {
      setIsEditModalChanged(value !== formData[fieldToEdit]);
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

      const updatedData = {};
      if (fieldToEdit === "nome") updatedData.nome = editValue;
      if (fieldToEdit === "email") updatedData.email = editValue;
      if (fieldToEdit === "senha" && editValue.trim() !== "")
        updatedData.senha = editValue;

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

      setFormData((prev) => ({
        ...prev,
        [fieldToEdit]: fieldToEdit === "senha" ? "" : editValue,
      }));
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
    <div className="profile-page">
      <div className="profile-content-box">
        <div className="profile-header">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="100"
            height="100"
            color="#2d80da"
            fill="currentColor"
            className="bi bi-person-fill profile-avatar"
            viewBox="0 0 16 16"
          >
            <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
          </svg>
          <p className="profile-name">{formData.nome}</p>
          <p className="profile-email">{formData.email}</p>
        </div>

        <div className="profile-options">
          <button className="option-item" onClick={() => openEditModal("nome")}>
            <AiOutlineUser className="option-icon" />
            <span>Alterar Nome</span>
          </button>

          <button className="option-item" onClick={() => openEditModal("email")}>
            <AiOutlineMail className="option-icon" />
            <span>Alterar Email</span>
          </button>

          <button className="option-item" onClick={() => openEditModal("senha")}>
            <AiOutlineLock className="option-icon" />
            <span>Alterar Senha</span>
          </button>

          <button
            className="option-item logout-item"
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
          >
            <AiOutlineLogout className="option-icon" />
            <span>Sair</span>
          </button>

          <button
            type="button"
            className="option-item delete-item"
            onClick={openDeleteModal}
          >
            <BsTrash3 className="option-icon" />
            <span>Excluir conta</span>
          </button>
        </div>

        {/*Modal de exclusão */}
        <Modal show={showDeleteModal} onHide={closeDeleteModal} {...modalCommonProps}>
          <Modal.Header>
            <Modal.Title>Confirmar Exclusão</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Tem certeza de que deseja excluir sua conta? Esta ação é irreversível.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeDeleteModal}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Excluir Conta
            </Button>
          </Modal.Footer>
        </Modal>

        {/*Modais de edição*/}
        <Modal show={showEditModal} onHide={closeEditModal} {...modalCommonProps}>
          <Modal.Header>
            <Modal.Title>
              {fieldToEdit === "nome" && "Alterar Nome"}
              {fieldToEdit === "email" && "Alterar Email"}
              {fieldToEdit === "senha" && "Alterar Senha"}
            </Modal.Title>
          </Modal.Header>

          <form onSubmit={handleSave} className="modal-edit-form">
            <Modal.Body>
              <div className="input-group">
                <input
                  type={fieldToEdit === "senha" ? "password" : "text"}
                  value={editValue}
                  onChange={handleChange}
                  className="modal-input"
                  placeholder={
                    fieldToEdit === "senha"
                      ? "Digite a nova senha"
                      : fieldToEdit
                  }
                  required
                />
              </div>
            </Modal.Body>

            <Modal.Footer>
              <Button variant="secondary" onClick={closeEditModal} type="button">
                Cancelar
              </Button>
              <Button variant="primary" type="submit" disabled={!isEditModalChanged}>
                Salvar
              </Button>
            </Modal.Footer>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default Profile;