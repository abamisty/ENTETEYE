import axios, { AxiosResponse } from "axios";
import crypto from "crypto";

interface PaystackCustomer {
  customer_code: string;
  email: string;
  id: number;
}

interface PaystackTransaction {
  reference: string;
  authorization_url: string;
  access_code: string;
}

interface PaystackAuthorization {
  authorization_code: string;
  subscription_code?: string;
  next_payment_date?: string;
}

interface PaystackTransactionVerification {
  status: string;
  reference: string;
  amount: number;
  paid_at: string;
  authorization: PaystackAuthorization;
}

interface PaystackSubscription {
  subscription_code: string;
}

export class PaystackService {
  private readonly apiKey: string;
  private readonly baseUrl: string = "https://api.paystack.co";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private getHeaders() {
    return {
      Authorization: `Bearer sk_test_4658e776237e9660db942c2ffdbdc7ad76df28df`,
      "Content-Type": "application/json",
    };
  }

  async createCustomer(
    email: string,
    first_name: string,
    last_name: string
  ): Promise<PaystackCustomer> {
    try {
      const response: AxiosResponse<{ data: PaystackCustomer }> =
        await axios.post(
          `${this.baseUrl}/customer`,
          { email, first_name, last_name },
          { headers: this.getHeaders() }
        );
      return response.data.data;
    } catch (error) {
      console.error(
        "Paystack createCustomer error:",
        axios.isAxiosError(error) ? error.response?.data : error
      );
      throw error;
    }
  }

  async initializeTransaction(params: {
    email: string;
    amount: number;
    reference?: string;
    plan?: string;
    metadata?: any;
  }): Promise<PaystackTransaction> {
    try {
      const response: AxiosResponse<{ data: PaystackTransaction }> =
        await axios.post(`${this.baseUrl}/transaction/initialize`, params, {
          headers: this.getHeaders(),
        });
      return response.data.data;
    } catch (error) {
      console.error(
        "Paystack initializeTransaction error:",
        axios.isAxiosError(error) ? error.response?.data : error
      );
      throw error;
    }
  }

  async verifyTransaction(
    reference: string
  ): Promise<PaystackTransactionVerification> {
    try {
      const response: AxiosResponse<{ data: PaystackTransactionVerification }> =
        await axios.get(`${this.baseUrl}/transaction/verify/${reference}`, {
          headers: this.getHeaders(),
        });
      return response.data.data;
    } catch (error) {
      console.error(
        "Paystack verifyTransaction error:",
        axios.isAxiosError(error) ? error.response?.data : error
      );
      throw error;
    }
  }

  async createSubscription(params: {
    customer: string;
    plan: string;
    authorization: string;
  }): Promise<PaystackSubscription> {
    try {
      const response: AxiosResponse<{ data: PaystackSubscription }> =
        await axios.post(`${this.baseUrl}/subscription`, params, {
          headers: this.getHeaders(),
        });
      return response.data.data;
    } catch (error) {
      console.error(
        "Paystack createSubscription error:",
        axios.isAxiosError(error) ? error.response?.data : error
      );
      throw error;
    }
  }

  async disableSubscription(code: string, token: string): Promise<any> {
    try {
      const response: AxiosResponse<{ data: any }> = await axios.post(
        `${this.baseUrl}/subscription/disable`,
        { code, token },
        { headers: this.getHeaders() }
      );
      return response.data.data;
    } catch (error) {
      console.error(
        "Paystack disableSubscription error:",
        axios.isAxiosError(error) ? error.response?.data : error
      );
      throw error;
    }
  }

  verifyWebhook(body: any, signature: string, secret: string): boolean {
    const hash = crypto
      .createHmac("sha512", secret)
      .update(JSON.stringify(body))
      .digest("hex");
    return hash === signature;
  }
}
