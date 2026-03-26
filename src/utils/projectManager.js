// Project Manager Utility - handles saving, loading, and deleting projects

const STORAGE_KEY = 'paymentCalculatorProjects';

export const projectManager = {
  // Get all saved projects
  getAllProjects: () => {
    const projects = localStorage.getItem(STORAGE_KEY);
    return projects ? JSON.parse(projects) : [];
  },

  // Save a new project
  saveProject: (projectData) => {
    const projects = projectManager.getAllProjects();
    const newProject = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...projectData
    };
    projects.push(newProject);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    return newProject;
  },

  // Load a specific project
  loadProject: (projectId) => {
    const projects = projectManager.getAllProjects();
    return projects.find(p => p.id === projectId);
  },

  // Update an existing project
  updateProject: (projectId, projectData) => {
    const projects = projectManager.getAllProjects();
    const index = projects.findIndex(p => p.id === projectId);
    if (index !== -1) {
      projects[index] = {
        ...projects[index],
        ...projectData,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
      return projects[index];
    }
    return null;
  },

  // Delete a project
  deleteProject: (projectId) => {
    const projects = projectManager.getAllProjects();
    const filtered = projects.filter(p => p.id !== projectId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },

  // Export projects as JSON
  exportProjects: () => {
    const projects = projectManager.getAllProjects();
    const dataStr = JSON.stringify(projects, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `projects_backup_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  },

  // Import projects from JSON
  importProjects: (projects) => {
    const existingProjects = projectManager.getAllProjects();
    const mergedProjects = [...existingProjects, ...projects];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedProjects));
  }
};

// Standard percentage presets for auto-fill
export const percentagePresets = [
  { name: 'Estándar (10-20-70)', signing: 10, building: 20, financial: 70 },
  { name: 'Agresivo (5-15-80)', signing: 5, building: 15, financial: 80 },
  { name: 'Conservador (10-30-60)', signing: 10, building: 30, financial: 60 },
  { name: 'Balanceado (10-35-55)', signing: 10, building: 35, financial: 55 },
  { name: 'Máxima construcción (10-80-10)', signing: 10, building: 80, financial: 10 },
];
