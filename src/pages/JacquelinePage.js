import React, { useState, useEffect } from 'react';
import { jacquelineProjectManager } from '../utils/jacquelineProjectManager';
import Swal from 'sweetalert2';
import '../utils/PaymentCalc.css'; // Reuse CSS for styling

function JacquelinePage({ isEditMode = false }) {
  const [projects, setProjects] = useState([]);
  const [sections, setSections] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    deliveryDate: '',
    status: 'pending', // 'pending' or 'ready'
    link: '',
    section: 'default'
  });
  const [sectionFormData, setSectionFormData] = useState({
    name: ''
  });

  useEffect(() => {
    loadProjects();
    loadSections();
  }, []);

  const loadProjects = () => {
    const allProjects = jacquelineProjectManager.getAllProjects();
    // Ensure all projects have a section
    const updatedProjects = allProjects.map(p => ({
      ...p,
      section: p.section || 'default'
    }));
    setProjects(updatedProjects.reverse()); // Newest first
  };

  const loadSections = () => {
    const allSections = jacquelineProjectManager.getAllSections();
    setSections(allSections);
  };

  const handleAddProject = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      deliveryDate: '',
      status: 'pending',
      link: '',
      section: 'default'
    });
    setShowModal(true);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      deliveryDate: project.deliveryDate,
      status: project.status,
      link: project.link,
      section: project.section || 'default'
    });
    setShowModal(true);
  };

  const handleDeleteProject = (projectId, projectName) => {
    Swal.fire({
      title: '¿Eliminar proyecto?',
      text: `¿Estás seguro de que deseas eliminar "${projectName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        jacquelineProjectManager.deleteProject(projectId);
        loadProjects();
        Swal.fire('Eliminado', 'El proyecto ha sido eliminado.', 'success');
      }
    });
  };

  const handleAddSection = () => {
    setEditingSection(null);
    setSectionFormData({ name: '' });
    setShowSectionModal(true);
  };

  const handleEditSection = (section) => {
    setEditingSection(section);
    setSectionFormData({ name: section.name });
    setShowSectionModal(true);
  };

  const handleDeleteSection = (sectionId, sectionName) => {
    Swal.fire({
      title: '¿Eliminar sección?',
      text: `¿Estás seguro de que deseas eliminar "${sectionName}"? Los proyectos se moverán a "General".`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        jacquelineProjectManager.deleteSection(sectionId);
        loadSections();
        loadProjects();
        Swal.fire('Eliminado', 'La sección ha sido eliminada.', 'success');
      }
    });
  };

  const handleSaveSection = () => {
    if (!sectionFormData.name.trim()) {
      Swal.fire('Error', 'El nombre de la sección es obligatorio.', 'error');
      return;
    }

    if (editingSection) {
      jacquelineProjectManager.updateSection(editingSection.id, sectionFormData);
      Swal.fire('Actualizado', 'La sección ha sido actualizada.', 'success');
    } else {
      jacquelineProjectManager.saveSection(sectionFormData);
      Swal.fire('Guardado', 'La sección ha sido guardada.', 'success');
    }
    setShowSectionModal(false);
    loadSections();
  };

  const handleSaveProject = () => {
    if (!formData.name.trim()) {
      Swal.fire('Error', 'El nombre del proyecto es obligatorio.', 'error');
      return;
    }

    if (editingProject) {
      jacquelineProjectManager.updateProject(editingProject.id, formData);
      Swal.fire('Actualizado', 'El proyecto ha sido actualizado.', 'success');
    } else {
      jacquelineProjectManager.saveProject(formData);
      Swal.fire('Guardado', 'El proyecto ha sido guardado.', 'success');
    }
    setShowModal(false);
    loadProjects();
  };

  const handleLinkClick = (project) => {
    if (project.link) {
      window.open(project.link, '_blank');
    } else {
      Swal.fire('Sin enlace', 'Este proyecto no tiene un enlace configurado.', 'info');
    }
  };

  return (
    <div className="calculator-container jacqueline-page">
      <h1>Proyectos de Jacqueline Sanchez</h1>
      {isEditMode && (
        <div className="edit-buttons">
          <button className="btn btn-primary" onClick={handleAddProject}>Agregar Proyecto</button>
          <button className="btn btn-secondary" onClick={handleAddSection}>Agregar Sección</button>
        </div>
      )}

      <div className="projects-sections">
        {sections.map(section => {
          const sectionProjects = projects.filter(p => p.section === section.id);
          return (
            <div key={section.id} className="section">
              <div className="section-header">
                <h2>{section.name}</h2>
                {isEditMode && (
                  <div className="section-actions">
                    <button className="btn btn-warning btn-sm" onClick={() => handleEditSection(section)}>Editar</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteSection(section.id, section.name)}>Eliminar</button>
                  </div>
                )}
              </div>
              <div className="projects-grid">
                {sectionProjects.map(project => (
                  <div key={project.id} className="project-card" onClick={() => handleLinkClick(project)} style={{ cursor: 'pointer' }}>
                    <h3>{project.name}</h3>
                    <p>Fecha de entrega: {project.deliveryDate || 'Sin fecha'}</p>
                    <p>Estado: {project.status === 'ready' ? 'Listo' : 'En Construccion'}</p>
                    {isEditMode && (
                      <div className="card-buttons" onClick={(e) => e.stopPropagation()}>
                        <button className="btn btn-warning" onClick={() => handleEditProject(project)}>Editar</button>
                        <button className="btn btn-danger" onClick={() => handleDeleteProject(project.id, project.name)}>Eliminar</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingProject ? 'Editar Proyecto' : 'Agregar Proyecto'}</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveProject(); }}>
              <div className="form-group">
                <label>Nombre del Proyecto:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Fecha de Entrega:</label>
                <input
                  type="date"
                  value={formData.deliveryDate}
                  onChange={(e) => setFormData({...formData, deliveryDate: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Sección:</label>
                <select
                  value={formData.section}
                  onChange={(e) => setFormData({...formData, section: e.target.value})}
                >
                  {sections.map(section => (
                    <option key={section.id} value={section.id}>{section.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Enlace:</label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({...formData, link: e.target.value})}
                  placeholder="https://..."
                />
              </div>
              <div className="modal-buttons">
                <button type="submit" className="btn btn-primary">Guardar</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSectionModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingSection ? 'Editar Sección' : 'Agregar Sección'}</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveSection(); }}>
              <div className="form-group">
                <label>Nombre de la Sección:</label>
                <input
                  type="text"
                  value={sectionFormData.name}
                  onChange={(e) => setSectionFormData({...sectionFormData, name: e.target.value})}
                  required
                />
              </div>
              <div className="modal-buttons">
                <button type="submit" className="btn btn-primary">Guardar</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowSectionModal(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default JacquelinePage;