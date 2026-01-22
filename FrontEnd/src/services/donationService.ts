import api from '../utils/api';
import type { DonationContribution, DonationProject, CreateContributionData } from '../types';

// Ré-exporter les types pour compatibilité
export type { DonationContribution as Donation, CreateContributionData as CreateDonationData } from '../types';

export type CreateContributionResponse = {
  message: string;
  contribution: DonationContribution;
  client_secret: string;
};

export const donationService = {
  // Obtenir les projets de donation disponibles
  getProjects: async (params?: {
    type?: string;
    pays?: string;
    featured?: boolean;
  }): Promise<DonationProject[]> => {
    const response = await api.get<{ data: DonationProject[] }>('/client/donation/projects', { params });
    return response.data.data || response.data;
  },

  // Obtenir un projet spécifique
  getProject: async (id: number): Promise<DonationProject> => {
    const response = await api.get<{ project: DonationProject }>(`/client/donation/projects/${id}`);
    return response.data.project;
  },

  // Faire une contribution (remplace create donation)
  contribute: async (data: CreateContributionData): Promise<CreateContributionResponse> => {
    const response = await api.post<CreateContributionResponse>('/client/donation/contributions', data);
    return response.data;
  },

  // Faire plusieurs contributions en une fois (multi-dons)
  contributeMultiple: async (contributions: CreateContributionData[]): Promise<{
    message: string;
    contributions: DonationContribution[];
    client_secret: string;
    total_amount: number;
  }> => {
    const response = await api.post<{
      message: string;
      contributions: DonationContribution[];
      client_secret: string;
      total_amount: number;
    }>('/client/donation/contributions/multiple', { contributions });
    return response.data;
  },

  // Confirmer le paiement d'une contribution
  confirmPayment: async (paymentIntentId: string): Promise<DonationContribution> => {
    const response = await api.post<{ message: string; contribution: DonationContribution }>(
      '/client/donation/contributions/confirm-payment',
      { payment_intent_id: paymentIntentId }
    );
    return response.data.contribution;
  },

  // Confirmer le paiement de plusieurs contributions
  confirmMultiplePayments: async (paymentIntentId: string): Promise<{
    message: string;
    contributions: DonationContribution[];
  }> => {
    const response = await api.post<{
      message: string;
      contributions: DonationContribution[];
    }>(
      '/client/donation/contributions/confirm-multiple-payments',
      { payment_intent_id: paymentIntentId }
    );
    return response.data;
  },

  // Obtenir mes contributions
  getMyContributions: async (params?: {
    statut?: string;
  }): Promise<DonationContribution[]> => {
    const response = await api.get<{ data: DonationContribution[] }>('/client/donation/contributions', { params });
    return response.data.data || response.data;
  },

  // Méthodes de compatibilité avec l'ancien système
  getAll: async (): Promise<DonationContribution[]> => {
    return donationService.getMyContributions();
  },

  getById: async (id: number): Promise<DonationContribution> => {
    const contributions = await donationService.getMyContributions();
    const contribution = contributions.find(c => c.id === id);
    if (!contribution) {
      throw new Error('Contribution non trouvée');
    }
    return contribution;
  },

  create: async (data: CreateContributionData): Promise<CreateContributionResponse> => {
    return donationService.contribute(data);
  },
};
