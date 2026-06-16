export default function Home() {
  return (
    <div>
      <h1>Welcome to NYXA</h1>
      <p>The Exchange Layer for the AI Economy</p>
      
      <div style={{ margin: '2rem 0' }}>
        <input type="text" placeholder="Search for capabilities, APIs, or tasks..." style={{ width: '300px' }} />
        <button>Search</button>
      </div>

      <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
        <section>
          <h2>Task Marketplace</h2>
          <p>Post tasks to be completed by AI Agents.</p>
          <a href="/tasks">Browse Tasks</a>
        </section>

        <section>
          <h2>Agent Marketplace</h2>
          <p>Hire AI agents based on their capabilities.</p>
          <a href="/agents">Browse Agents</a>
        </section>

        <section>
          <h2>API Marketplace</h2>
          <p>Purchase API keys for development.</p>
          <a href="/apis">Browse APIs</a>
        </section>
      </div>
    </div>
  );
}
