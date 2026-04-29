// Alejandro Paez Project Manager Utility - handles saving, loading, and deleting Alejandro's projects and sections

const STORAGE_KEY_PROJECTS = 'alejandroProjects';
const STORAGE_KEY_SECTIONS = 'alejandroSections';

export const alejandroProjectManager = {
  // Get all saved projects
  getAllProjects: () => {
    const projects = localStorage.getItem(STORAGE_KEY_PROJECTS);
    return projects ? JSON.parse(projects) : [];
  },

  // Save a new project
  saveProject: (projectData) => {
    const projects = alejandroProjectManager.getAllProjects();
    const newProject = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      section: 'default', // default section
      ...projectData
    };
    projects.push(newProject);
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
    return newProject;
  },

  // Load a specific project
  loadProject: (projectId) => {
    const projects = alejandroProjectManager.getAllProjects();
    return projects.find(p => p.id === projectId);
  },

  // Update an existing project
  updateProject: (projectId, projectData) => {
    const projects = alejandroProjectManager.getAllProjects();
    const index = projects.findIndex(p => p.id === projectId);
    if (index !== -1) {
      projects[index] = {
        ...projects[index],
        ...projectData,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
      return projects[index];
    }
    return null;
  },

  // Delete a project
  deleteProject: (projectId) => {
    const projects = alejandroProjectManager.getAllProjects();
    const filtered = projects.filter(p => p.id !== projectId);
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(filtered));
  },

  // Get all sections
  getAllSections: () => {
    const sections = localStorage.getItem(STORAGE_KEY_SECTIONS);
    if (sections) {
      return JSON.parse(sections);
    }
    // Default sections
    const defaultSections = [
      { id: 'default', name: 'General' },
      { id: 'pending', name: 'Pendientes' },
      { id: 'ready', name: 'Listos' }
    ];
    localStorage.setItem(STORAGE_KEY_SECTIONS, JSON.stringify(defaultSections));
    return defaultSections;
  },

  // Save a new section
  saveSection: (sectionData) => {
    const sections = alejandroProjectManager.getAllSections();
    const newSection = {
      id: Date.now().toString(),
      ...sectionData
    };
    sections.push(newSection);
    localStorage.setItem(STORAGE_KEY_SECTIONS, JSON.stringify(sections));
    return newSection;
  },

  // Update a section
  updateSection: (sectionId, sectionData) => {
    const sections = alejandroProjectManager.getAllSections();
    const index = sections.findIndex(s => s.id === sectionId);
    if (index !== -1) {
      sections[index] = {
        ...sections[index],
        ...sectionData
      };
      localStorage.setItem(STORAGE_KEY_SECTIONS, JSON.stringify(sections));
      return sections[index];
    }
    return null;
  },

  // Delete a section
  deleteSection: (sectionId) => {
    const sections = alejandroProjectManager.getAllSections();
    const filtered = sections.filter(s => s.id !== sectionId);
    localStorage.setItem(STORAGE_KEY_SECTIONS, JSON.stringify(filtered));
    // Move projects in this section to default
    const projects = alejandroProjectManager.getAllProjects();
    projects.forEach(p => {
      if (p.section === sectionId) {
        p.section = 'default';
      }
    });
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
  },

  // Export projects as JSON
  exportProjects: () => {
    const projects = alejandroProjectManager.getAllProjects();
    const dataStr = JSON.stringify(projects, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `alejandro_projects_backup_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  },

  // Import projects from JSON
  importProjects: (projects) => {
    const existingProjects = alejandroProjectManager.getAllProjects();
    const mergedProjects = [...existingProjects, ...projects];
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(mergedProjects));
  }
};