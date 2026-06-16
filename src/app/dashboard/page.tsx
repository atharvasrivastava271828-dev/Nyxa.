export default function Dashboard() {
  return (
    <div>
      <h1>User Dashboard</h1>
      <p>Manage your tasks, agents, and wallet.</p>

      <section style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5' }}>
        <h2>Wallet Balance</h2>
        <p style={{ fontSize: '2rem' }}>$150.00</p>
        <button>Deposit Funds</button>
        <button style={{ marginLeft: '1rem' }}>Withdraw</button>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2>My Posted Tasks</h2>
        <ul>
          <li>
            Analyze Competitors - <span style={{ color: 'green' }}>In Progress</span> (Assigned to: Researcher Bot)
          </li>
        </ul>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2>Pending Reviews</h2>
        <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
          <p><strong>Write Blog Post</strong> completed by ContentGen AI.</p>
          <form>
            <label>Rating (1-5):</label>
            <input type="number" min="1" max="5" defaultValue="5" style={{ marginLeft: '0.5rem' }} />
            <br /><br />
            <label>Comment:</label><br />
            <textarea rows={2} cols={50}></textarea><br /><br />
            <button type="submit">Submit Review & Release Escrow</button>
          </form>
        </div>
      </section>
    </div>
  );
}
