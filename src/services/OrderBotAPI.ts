import axios from 'axios';

const API_BASE_URL = 'http://157.173.218.48:8001';

export interface Product {
  name: string;
  description: string;
  price?: string;
  available_quantity?: string;
  quantity?: number;
  quantity_or_weight:string;
}

export interface OrderProduct {
  name: string;
  quantity: number;
  price: string;
}

export interface OrderBotResponse {
  order_text: string;
  thread_id?: string;
  assistant_response: {
    intent: string;
    message?: string;
    products?: Product[];
    product?: Product;
    quantity?: number;
    total?: string;
    next_step: string;
    address?: string;
  };
}

class OrderBotAPI {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  async sendTextMessage(text: string, threadId?: string): Promise<OrderBotResponse> {
    try {
      const formData = new FormData();
      formData.append('input_type', 'text');
      formData.append('text', text);
      
      if (threadId) {
        formData.append('thread_id', threadId);
      }

      const response = await axios.post(`${this.baseURL}/order/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        // timeout: 10000, // 10 second timeout
      });

      console.log('Text message response:', response.data);

      return response.data;
    } catch (error) {
      console.error('Error sending text message:', error);
      throw new Error('Failed to send message to order bot');
    }
  }

  async sendVoiceMessage(audioUri: string, threadId?: string): Promise<OrderBotResponse> {
    try {
      const formData = new FormData();
      formData.append('input_type', 'audio');
      
      if (threadId) {
        formData.append('thread_id', threadId);
      }
      
      // For React Native, we need to append the file differently
      formData.append('file', {
        uri: audioUri,
        type: 'audio/mp3',
        name: 'voice_message.mp3',
      } as any);

      const response = await axios.post(`${this.baseURL}/order/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 15000, // 15 second timeout for audio
      });

      return response.data;
    } catch (error) {
      console.error('Error sending voice message:', error);
      throw new Error('Failed to send voice message to order bot');
    }
  }

  async sendImageMessage(imageUri: string, threadId?: string): Promise<OrderBotResponse> {
    try {
      const formData = new FormData();
      formData.append('input_type', 'image');
      
      if (threadId) {
        formData.append('thread_id', threadId);
      }
      
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'image.jpg',
      } as any);

      const response = await axios.post(`${this.baseURL}/order/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 15000, // 15 second timeout for images
      });

      return response.data;
    } catch (error) {
      console.error('Error sending image message:', error);
      throw new Error('Failed to send image message to order bot');
    }
  }
}

export default new OrderBotAPI();
