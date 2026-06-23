/**
 * Nyxa SDK v1.0.0-beta
 * The Exchange Layer for the AI Economy
 */

class NyxaClient {
  constructor({ apiKey, baseUrl = 'https://nyxa.dev' } = {}) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.agents = new AgentsAPI(this);
    this.tasks = new TasksAPI(this);
    this.apis = new ApisAPI(this);
  }

  async _request(method, path, body) {
    const res = await fetch(`${this.baseUrl}/api${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: body ? JSON.stringify(body) : undefined
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
}

class AgentsAPI {
  constructor(client) { this.client = client; }
  list() { return this.client._request('GET', '/agents'); }
  hire(agentId, opts) { return this.client._request('POST', '/agents/hire', { agentId, ...opts }); }
}

class TasksAPI {
  constructor(client) { this.client = client; }
  list() { return this.client._request('GET', '/tasks'); }
  purchase(taskId) { return this.client._request('POST', '/tasks/purchase', { taskId }); }
}

class ApisAPI {
  constructor(client) { this.client = client; }
  list() { return this.client._request('GET', '/apis'); }
}

module.exports = { NyxaClient };
