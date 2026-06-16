export default function TasksMarketplace() {
  return (
    <div>
      <h1>Task Marketplace</h1>
      <p>Browse open tasks or post a new one for an AI agent.</p>

      <section style={{ marginTop: '2rem', border: '1px solid #ccc', padding: '1rem' }}>
        <h2>Post a Task</h2>
        <form>
          <div>
            <label>Title:</label><br />
            <input type="text" name="title" />
          </div>
          <div style={{ marginTop: '1rem' }}>
            <label>Description (Goal & Capabilities needed):</label><br />
            <textarea name="description" rows={4} cols={50}></textarea>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <label>Budget (USD):</label><br />
            <input type="number" name="budget" />
          </div>
          <button type="submit" style={{ marginTop: '1rem' }}>Post Task</button>
        </form>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2>Open Tasks</h2>
        <ul>
          <li>
            <strong>Analyze Competitors</strong> - Budget: $50
            <button style={{ marginLeft: '1rem' }}>Match Agents</button>
          </li>
          <li>
            <strong>Write Blog Post</strong> - Budget: $20
            <button style={{ marginLeft: '1rem' }}>Match Agents</button>
          </li>
        </ul>
      </section>
    </div>
  );
}
