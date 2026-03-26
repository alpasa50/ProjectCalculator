import React, { useState, useEffect } from 'react';
import { projectManager } from '../utils/projectManager';
import Swal from 'sweetalert2';
import '../utils/PaymentCalc.css';

function ProjectsList({ onLoadProject, onRefresh }) {
  const [projects, setProjects] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadProjects();
  }, [onRefresh]);

  const loadProjects = () => {
    const allProjects = projectManager.getAllProjects();
    setProjects(allProjects.reverse()); // Show newest first
  };

  const handleLoadProject = (project) => {
    onLoadProject(project);
    setIsOpen(false);
    Swal.fire({
      title: 'Proyecto cargado',
      text: `${project.projectName} ha sido cargado correctamente.`,
      icon: 'success',
      confirmButtonText: 'OK'
    });
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
        projectManager.deleteProject(projectId);
        loadProjects();
        Swal.fire('Eliminado', 'El proyecto ha sido eliminado.', 'success');
      }
    });
  };

  const handleExport = () => {
    if (projects.length === 0) {
      Swal.fire('Sin proyectos', 'No hay proyectos para exportar.', 'info');
      return;
    }
    projectManager.exportProjects();
    Swal.fire('Exportado', 'Los proyectos han sido exportados como archivo JSON.', 'success');
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '10px 20px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '0.95rem',
          marginBottom: isOpen ? '10px' : '0'
        }}
      >
        📁 Proyectos Guardados ({projects.length})
      </button>

      {isOpen && (
        <div style={{
          backgroundColor: '#f3f4f6',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          padding: '15px',
          marginTop: '10px',
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          {projects.length === 0 ? (
            <p style={{ color: '#6b7280', marginBottom: '10px' }}>
              No hay proyectos guardados. ¡Crea uno nuevo!
            </p>
          ) : (
            <div>
              {projects.map((project) => (
                <div
                  key={project.id}
                  style={{
                    backgroundColor: 'white',
                    padding: '12px',
                    marginBottom: '10px',
                    borderRadius: '6px',
                    borderLeft: '4px solid #10b981',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', color: '#1f2937' }}>
                      {project.projectName || 'Sin nombre'}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                      {project.currency} {project.totalCost?.toLocaleString() || '0'}
                      {' • '}
                      {new Date(project.timestamp).toLocaleDateString('es')}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleLoadProject(project)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 'bold'
                      }}
                    >
                      Cargar
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id, project.projectName)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 'bold'
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{
            marginTop: '15px',
            paddingTop: '15px',
            borderTop: '1px solid #d1d5db',
            display: 'flex',
            gap: '10px'
          }}>
            <button
              onClick={handleExport}
              style={{
                padding: '8px 12px',
                backgroundColor: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                flex: 1
              }}
            >
              Exportar todos
            </button>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                flex: 1
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectsList;
