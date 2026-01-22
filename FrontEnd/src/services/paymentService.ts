import api from '../utils/api';

export interface PaymentIntentResponse {
  client_secret: string;
  payment_intent_id: string;
}

export interface ConfirmPaymentResponse {
  message: string;
  payment: any;
  appointment: any;
}

export const paymentService = {
  createPaymentIntent: async (appointmentId: number): Promise<PaymentIntentResponse> => {
    const response = await api.post<PaymentIntentResponse>('/payments/create-intent', {
      appointment_id: appointmentId,
    });
    return response.data;
  },

  confirmPayment: async (paymentIntentId: string): Promise<ConfirmPaymentResponse> => {
    const response = await api.post<ConfirmPaymentResponse>('/payments/confirm', {
      payment_intent_id: paymentIntentId,
    });
    return response.data;
  },
};
