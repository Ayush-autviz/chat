import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = 'http://157.173.218.48:8001';

// Extend AxiosRequestConfig to include metadata for retry tracking
interface RetryConfig extends AxiosRequestConfig {
  metadata?: {
    retryCount: number;
  };
}

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  retryCondition: (error: AxiosError) => {
    // Retry on network errors, timeouts, and 5xx server errors
    return (
      !error.response || // Network error
      error.code === 'ECONNABORTED' || // Timeout
      error.code === 'ENOTFOUND' || // DNS error
      error.code === 'ECONNREFUSED' || // Connection refused
      (error.response.status >= 500 && error.response.status < 600) // Server errors
    );
  }
};

// Helper function to calculate delay with exponential backoff
const calculateDelay = (attempt: number): number => {
  const delay = RETRY_CONFIG.baseDelay * Math.pow(2, attempt - 1);
  return Math.min(delay, RETRY_CONFIG.maxDelay);
};

// Helper function to sleep
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

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
  private axiosInstance: any;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.axiosInstance = axios.create();
    this.setupRetryInterceptor();
  }

  private setupRetryInterceptor() {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config: RetryConfig) => {
        // Add retry count to config if not present
        if (!config.metadata) {
          config.metadata = { retryCount: 0 };
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor with retry logic
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error: AxiosError) => {
        const config = error.config as RetryConfig;
        
        if (!config || !config.metadata) {
          return Promise.reject(error);
        }

        const { retryCount = 0 } = config.metadata;

        // Check if we should retry
        if (retryCount < RETRY_CONFIG.maxRetries && RETRY_CONFIG.retryCondition(error)) {
          config.metadata.retryCount = retryCount + 1;
          
          const delay = calculateDelay(retryCount + 1);
          console.log(`Retrying request (attempt ${retryCount + 1}/${RETRY_CONFIG.maxRetries}) after ${delay}ms delay`);
          
          await sleep(delay);
          
          return this.axiosInstance(config);
        }

        return Promise.reject(error);
      }
    );
  }

  async sendTextMessage(text: string, threadId?: string): Promise<OrderBotResponse> {
    try {
      const formData = new FormData();
      formData.append('input_type', 'text');
      formData.append('text', text);
      
      if (threadId) {
        formData.append('thread_id', threadId);
      }

      const response = await this.axiosInstance.post(`${this.baseURL}/order/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 10000, // 10 second timeout
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

      const response = await this.axiosInstance.post(`${this.baseURL}/order/`, formData, {
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

      const response = await this.axiosInstance.post(`${this.baseURL}/order/`, formData, {
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
