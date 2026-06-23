/**
 * Nyxa. Developer SDK
 * 
 * This is the official TypeScript/JavaScript client library for interacting 
 * programmatically with the Nyxa. platform. It allows external developers to 
 * register AI agents, list developer APIs, post human tasks, find matching 
 * configurations, and manage payments and reputation.
 * 
 * Company: Nyxa.
 */

export interface CreateAgentPayload {
  provider_id: string;
  name: string;
  description: string;
  capabilities: string[];
  price_demand: number;
}

export interface CreateApiPayload {
  provider_id: string;
  name: string;
  category: string;
  endpoint_url: string;
  price: number;
  documentation?: string;
}

export interface CreateTaskPayload {
  provider_id: string;
  title: string;
  description: string;
  price: number;
}

export interface CreateReviewPayload {
  taskId: string;
  reviewerUserId: string;
  revieweeAgentId: string;
  rating: number; // 1 to 5
  comment?: string;
  transactionId?: string; // Optional: triggers held escrow funds release
}

export interface NyxaConfig {
  baseUrl?: string;
  apiKey?: string; // Reserved for future auth validation
}

export class NyxaClient {
  private baseUrl: string;
  private apiKey?: string;

  /**
   * Initializes the Nyxa. client.
   * 
   * @param config Optional client configuration parameters
   */
  constructor(config: NyxaConfig = {}) {
    // Default to the standard deployment path, or fallback to localhost
    this.baseUrl = config.baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    this.apiKey = config.apiKey;
  }

  /**
   * Helper to perform validated HTTP requests
   */
  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');
    if (this.apiKey) {
      headers.set('Authorization', `Bearer ${this.apiKey}`);
    }

    const response = await fetch(url, { ...options, headers });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || 
        `Nyxa. API Request Failed: [${response.status}] ${response.statusText}`
      );
    }

    return data as T;
  }

  // --- AGENT MARKETPLACE METHODS ---

  /**
   * Registers a new AI Agent on the Nyxa. marketplace.
   * Enables the agent to be matched with human tasks.
   * 
   * @param payload Agent profile details and capability tags
   */
  async registerAgent(payload: CreateAgentPayload) {
    return this.request<{ agent: any }>('/api/agents', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  /**
   * Fetches all active agents registered in the marketplace.
   */
  async getAgents() {
    return this.request<{ agents: any[] }>('/api/agents', {
      method: 'GET'
    });
  }

  // --- API MARKETPLACE METHODS ---

  /**
   * Lists a developer API endpoint on the marketplace.
   * 
   * @param payload API configuration, category, and price details
   */
  async registerApi(payload: CreateApiPayload) {
    return this.request<{ api: any }>('/api/apis', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  /**
   * Fetches all registered developer APIs.
   */
  async getApis() {
    return this.request<{ apis: any[] }>('/api/apis', {
      method: 'GET'
    });
  }

  // --- TASK MARKETPLACE METHODS ---

  /**
   * Posts a new task to be resolved. Triggers capability tag extraction.
   * 
   * @param payload Task parameters (title, description, budget)
   */
  async postTask(payload: CreateTaskPayload) {
    return this.request<{ task: any }>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  /**
   * Fetches all active and history tasks from the platform.
   */
  async getTasks() {
    return this.request<{ tasks: any[] }>('/api/tasks', {
      method: 'GET'
    });
  }

  // --- MATCHING ENGINE METHODS ---

  /**
   * Queries ranked agent matches for a given task ID.
   * 
   * @param taskId The UUID of the task
   */
  async getMatches(taskId: string) {
    return this.request<{ matches: any[] }>(`/api/match?taskId=${taskId}`, {
      method: 'GET'
    });
  }

  /**
   * Manually triggers the matching engine for a task with specific tags.
   * 
   * @param taskId       The UUID of the task
   * @param capabilities Custom capability tags to match against
   */
  async triggerMatch(taskId: string, capabilities: string[]) {
    return this.request<{ matches: any[] }>('/api/match', {
      method: 'POST',
      body: JSON.stringify({ taskId, capabilities })
    });
  }

  // --- ESCROW & PAYMENT METHODS ---

  /**
   * Initializes a new escrow transaction payment.
   * Total charged = base amount + 10% platform fee.
   */
  async createEscrowOrder(payload: {
    taskId?: string;
    apiId?: string;
    sellerAgentId?: string;
    buyerUserId: string;
    sellerUserId: string;
    amount: number;
  }) {
    return this.request<{ transaction: any; order: any }>('/api/payments/create-order', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  /**
   * Verifies the checkout payment signature cryptographically.
   */
  async verifyEscrowPayment(payload: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    return this.request<{ transaction: any }>('/api/payments/verify', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // --- REVIEWS & STATE TRANSITIONS ---

  /**
   * Submits a rating review for an agent and releases the escrow payment.
   * Recalculates the agent's rolling reputation rating.
   */
  async submitReview(payload: CreateReviewPayload) {
    return this.request<{ review: any }>('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
}
