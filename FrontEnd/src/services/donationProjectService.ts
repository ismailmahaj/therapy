import api from '../utils/api';
import type { DonationProject, DonationDocument } from '../types';

export type CreateProjectData = {
  type: string;
  pays: string;
  nom: string;
  description?: string;
  image?: string;
  montant_requis: number;
  is_featured?: boolean;
  start_date?: string;
  end_date?: string;
  beneficiaries_count?: number;
};

export type UpdateProjectData = Partial<CreateProjectData> & {
  statut?: 'draft' | 'active' | 'completed' | 'cancelled';
};

export const donationProjectService = {
  // Liste des projets (pour gestionnaires)
  getProjects: async (params?: {
    statut?: string;
    type?: string;
    pays?: string;
    featured?: boolean;
  }): Promise<DonationProject[]> => {
    const response = await api.get<{ data: DonationProject[] }>('/donation/projects', { params });
    return response.data.data || response.data;
  },

  // Obtenir un projet
  getProject: async (id: number): Promise<DonationProject> => {
    const response = await api.get<{ project: DonationProject }>(`/donation/projects/${id}`);
    return response.data.project;
  },

  // Créer un projet
  createProject: async (data: CreateProjectData): Promise<DonationProject> => {
    const response = await api.post<{ message: string; project: DonationProject }>('/donation/projects', data);
    return response.data.project;
  },

  // Modifier un projet
  updateProject: async (id: number, data: UpdateProjectData): Promise<DonationProject> => {
    const response = await api.patch<{ message: string; project: DonationProject }>(`/donation/projects/${id}`, data);
    return response.data.project;
  },

  // Activer un projet
  activateProject: async (id: number): Promise<DonationProject> => {
    const response = await api.patch<{ message: string; project: DonationProject }>(`/donation/projects/${id}/activate`);
    return response.data.project;
  },

  // Supprimer un projet
  deleteProject: async (id: number): Promise<void> => {
    await api.delete(`/donation/projects/${id}`);
  },

  // Documents d'un projet
  getProjectDocuments: async (projectId: number): Promise<DonationDocument[]> => {
    const response = await api.get<{ documents: DonationDocument[] }>(`/donation/projects/${projectId}/documents`);
    return response.data.documents;
  },

  // Uploader un document
  uploadDocument: async (projectId: number, file: File, title: string, description?: string): Promise<DonationDocument> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    if (description) {
      formData.append('description', description);
    }

    const response = await api.post<{ message: string; document: DonationDocument }>(
      `/donation/projects/${projectId}/documents`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.document;
  },

  // Télécharger un document
  downloadDocument: async (documentId: number): Promise<Blob> => {
    const response = await api.get(`/donation/documents/${documentId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Supprimer un document (admin uniquement)
  deleteDocument: async (documentId: number): Promise<void> => {
    await api.delete(`/donation/documents/${documentId}`);
  },
};
