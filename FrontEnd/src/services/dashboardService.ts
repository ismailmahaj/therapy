import api from '../utils/api';
import type { User, Appointment, DonationContribution } from '../types';

export type DashboardData = {
  user: User;
  upcoming_appointments: Appointment[];
  total_donations: string;
};

export type DashboardAppointmentsResponse = {
  appointments: Appointment[];
};

export type DashboardDonationsResponse = {
  donations: DonationContribution[];
  total: string;
};

export const dashboardService = {
  getOverview: async (): Promise<DashboardData> => {
    const response = await api.get<DashboardData>('/dashboard');
    return response.data;
  },

  getAppointments: async (): Promise<Appointment[]> => {
    const response = await api.get<DashboardAppointmentsResponse>('/dashboard/appointments');
    return response.data.appointments;
  },

  getDonations: async (): Promise<DashboardDonationsResponse> => {
    const response = await api.get<DashboardDonationsResponse>('/dashboard/donations');
    return response.data;
  },
};
