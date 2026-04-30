import { supabase } from './supabaseClient';

const normalizeProjectSection = (section) => {
  if (!section || section === 'General') return 'default';
  return section;
};

const mapProjectFromDb = (row) => ({
  ...row,
  deliveryDate: row.deliverydate || null,
  section: normalizeProjectSection(row.section)
});

const mapProjectToDb = (project) => ({
  id: project.id || Date.now().toString(),
  name: project.name,
  deliverydate: project.deliveryDate || null,
  status: project.status,
  link: project.link,
  section: normalizeProjectSection(project.section)
});

export const jacquelineProjectManager = {
  // Get all projects
  getAllProjects: async () => {
    try {
      const { data, error } = await supabase
        .from('jacqueline_projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(mapProjectFromDb);
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  },

  // Save new project
  saveProject: async (project) => {
    try {
      const newProject = mapProjectToDb({
        ...project,
        status: project.status || 'pending',
        section: project.section || 'default'
      });

      const { data, error } = await supabase
        .from('jacqueline_projects')
        .insert([newProject])
        .select();

      if (error) throw error;
      return mapProjectFromDb(data?.[0] || newProject);
    } catch (error) {
      console.error('Error saving project:', error);
      throw error;
    }
  },

  // Update project
  updateProject: async (projectId, updates) => {
    try {
      const dbUpdates = mapProjectToDb({ ...updates, id: projectId });
      const { data, error } = await supabase
        .from('jacqueline_projects')
        .update(dbUpdates)
        .eq('id', projectId)
        .select();

      if (error) throw error;
      return mapProjectFromDb(data?.[0] || updates);
    } catch (error) {
      console.error('Error updating project:', error);
      return updates;
    }
  },

  // Delete project
  deleteProject: async (projectId) => {
    try {
      const { error } = await supabase
        .from('jacqueline_projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      return false;
    }
  },

  // Get all sections
  getAllSections: async () => {
    try {
      const { data, error } = await supabase
        .from('jacqueline_sections')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // If no sections exist, create default ones
      if (!data || data.length === 0) {
        const defaultSections = [
          { id: 'default', name: 'General' },
          { id: 'pending', name: 'Pendientes' },
          { id: 'ready', name: 'Listos' }
        ];
        
        for (const section of defaultSections) {
          await supabase.from('jacqueline_sections').insert([section]).select();
        }
        
        return defaultSections;
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching sections:', error);
      return [];
    }
  },

  // Save new section
  saveSection: async (section) => {
    try {
      const newSection = {
        id: Date.now().toString(),
        name: section.name || ''
      };

      const { data, error } = await supabase
        .from('jacqueline_sections')
        .insert([newSection])
        .select();

      if (error) throw error;
      return data?.[0] || newSection;
    } catch (error) {
      console.error('Error saving section:', error);
      return section;
    }
  },

  // Update section
  updateSection: async (sectionId, updates) => {
    try {
      const { data, error } = await supabase
        .from('jacqueline_sections')
        .update(updates)
        .eq('id', sectionId)
        .select();

      if (error) throw error;
      return data?.[0] || updates;
    } catch (error) {
      console.error('Error updating section:', error);
      return updates;
    }
  },

  // Delete section
  deleteSection: async (sectionId) => {
    try {
      // Move projects in this section to default
      await supabase
        .from('jacqueline_projects')
        .update({ section: 'default' })
        .eq('section', sectionId);

      // Delete the section
      const { error } = await supabase
        .from('jacqueline_sections')
        .delete()
        .eq('id', sectionId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting section:', error);
      return false;
    }
  },

  // Subscribe to real-time updates
  subscribeToProjectsChanges: (callback) => {
    const subscription = supabase
      .channel('jacqueline_projects_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jacqueline_projects'
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();

    return subscription;
  },

  subscribeToSectionsChanges: (callback) => {
    const subscription = supabase
      .channel('jacqueline_sections_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jacqueline_sections'
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();

    return subscription;
  }
};