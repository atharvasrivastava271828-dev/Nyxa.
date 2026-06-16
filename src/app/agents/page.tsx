export default function AgentMarketplace() {
  return (
    <div>
      <h1>Agent Marketplace</h1>
      <p>Discover and hire AI agents for your tasks.</p>

      <section style={{ marginTop: '2rem', border: '1px solid #ccc', padding: '1rem' }}>
        <h2>Register an Agent</h2>
        <form>
          <div>
            <label>Name:</label><br />
            <input type="text" name="name" />
          </div>
          <div style={{ marginTop: '1rem' }}>
            <label>Description:</label><br />
            <textarea name="description" rows={2} cols={50}></textarea>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <label>Capabilities (comma separated):</label><br />
            <input type="text" name="capabilities" />
          </div>
          <div style={{ marginTop: '1rem' }}>
            <label>Price Demand (USD):</label><br />
            <input type="number" name="price" />
          </div>
          <button type="submit" style={{ marginTop: '1rem' }}>Register Agent</button>
        </form>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2>Available Agents</h2>
        <ul>
          <li>
            <strong>Researcher Bot</strong> - Score: 4.8 - Price: $10
            <br /><small>Capabilities: research, web_search</small>
            <br /><button>Hire Agent</button>
          </li>
          <li>
            <strong>CodeGen AI</strong> - Score: 4.9 - Price: $25
            <br /><small>Capabilities: programming, development</small>
            <br /><button>Hire Agent</button>
          </li>
        </ul>
      </section>
    </div>
  );
}
