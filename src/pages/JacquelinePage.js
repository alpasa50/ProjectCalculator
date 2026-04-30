import React, { useState, useEffect, useCallback } from 'react';
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

  // Helper functions (must be defined before useCallback hooks)
  const formatDateToDDMMYYYY = (deliveryDate) => {
    if (!deliveryDate) return '';
    const [year, month, day] = deliveryDate.split('-');
    return `${day}/${month}/${year}`;
  };

  const isPastDue = useCallback((deliveryDate) => {
    if (!deliveryDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(deliveryDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  }, []);

  const getProjectStatus = useCallback((project) => {
    if (!project.deliveryDate) {
      return project.status === 'ready' ? 'ready' : 'pending';
    }
    return isPastDue(project.deliveryDate) ? 'ready' : 'pending';
  }, [isPastDue]);

  const loadSections = useCallback(async () => {
    const allSections = await jacquelineProjectManager.getAllSections();
    setSections(allSections);
  }, []);

  const loadProjects = useCallback(async () => {
    const allProjects = await jacquelineProjectManager.getAllProjects();
    const normalizedProjects = await Promise.all(allProjects.map(async (p) => {
      const project = {
        ...p,
        section: p.section || 'default'
      };
      const status = getProjectStatus(project);
      if (status !== project.status) {
        await jacquelineProjectManager.updateProject(project.id, { ...project, status });
      }
      return {
        ...project,
        status
      };
    }));
    setProjects(normalizedProjects.reverse()); // Newest first
  }, [getProjectStatus]);

  useEffect(() => {
    loadProjects();
    loadSections();
  }, [loadProjects, loadSections]);

  useEffect(() => {
    const projectSubscription = jacquelineProjectManager.subscribeToProjectsChanges(async () => {
      await loadProjects();
    });
    const sectionSubscription = jacquelineProjectManager.subscribeToSectionsChanges(async () => {
      await loadSections();
    });

    return () => {
      if (projectSubscription?.unsubscribe) {
        projectSubscription.unsubscribe();
      }
      if (sectionSubscription?.unsubscribe) {
        sectionSubscription.unsubscribe();
      }
    };
  }, [loadProjects, loadSections]);

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

  const handleDeleteProject = async (projectId, projectName) => {
    const result = await Swal.fire({
      title: '¿Eliminar proyecto?',
      text: `¿Estás seguro de que deseas eliminar "${projectName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      await jacquelineProjectManager.deleteProject(projectId);
      await loadProjects();
      Swal.fire('Eliminado', 'El proyecto ha sido eliminado.', 'success');
    }
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

  const handleDeleteSection = async (sectionId, sectionName) => {
    const result = await Swal.fire({
      title: '¿Eliminar sección?',
      text: `¿Estás seguro de que deseas eliminar "${sectionName}"? Los proyectos se moverán a "General".`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      await jacquelineProjectManager.deleteSection(sectionId);
      await loadSections();
      await loadProjects();
      Swal.fire('Eliminado', 'La sección ha sido eliminada.', 'success');
    }
  };

  const handleSaveSection = async () => {
    if (!sectionFormData.name.trim()) {
      Swal.fire('Error', 'El nombre de la sección es obligatorio.', 'error');
      return;
    }

    if (editingSection) {
      await jacquelineProjectManager.updateSection(editingSection.id, sectionFormData);
      Swal.fire('Actualizado', 'La sección ha sido actualizada.', 'success');
    } else {
      await jacquelineProjectManager.saveSection(sectionFormData);
      Swal.fire('Guardado', 'La sección ha sido guardada.', 'success');
    }
    setShowSectionModal(false);
    await loadSections();
  };

  const handleSaveProject = async () => {
    if (!formData.name.trim()) {
      Swal.fire('Error', 'El nombre del proyecto es obligatorio.', 'error');
      return;
    }

    const projectData = {
      ...formData,
      status: isPastDue(formData.deliveryDate) ? 'ready' : formData.status,
      section: formData.section || 'default'
    };

    try {
      if (editingProject) {
        await jacquelineProjectManager.updateProject(editingProject.id, projectData);
        Swal.fire('Actualizado', 'El proyecto ha sido actualizado.', 'success');
      } else {
        await jacquelineProjectManager.saveProject(projectData);
        Swal.fire('Guardado', 'El proyecto ha sido guardado.', 'success');
      }
      setShowModal(false);
      await loadProjects();
    } catch (error) {
      console.error('Error saving project:', error);
      Swal.fire('Error', 'No se pudo guardar el proyecto. Revisa la consola.', 'error');
    }
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
                    <p>Fecha de entrega: {formatDateToDDMMYYYY(project.deliveryDate) || 'Sin fecha'}</p>
                    <p>Estado: {getProjectStatus(project) === 'ready' ? 'Listo' : 'En Construccion'}</p>
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