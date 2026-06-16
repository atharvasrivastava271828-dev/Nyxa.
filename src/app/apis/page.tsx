export default function ApiMarketplace() {
  return (
    <div>
      <h1>API Marketplace</h1>
      <p>Discover and purchase developer APIs.</p>

      <section style={{ marginTop: '2rem', border: '1px solid #ccc', padding: '1rem' }}>
        <h2>Register an API</h2>
        <form>
          <div>
            <label>Name:</label><br />
            <input type="text" name="name" />
          </div>
          <div style={{ marginTop: '1rem' }}>
            <label>Category:</label><br />
            <input type="text" name="category" />
          </div>
          <div style={{ marginTop: '1rem' }}>
            <label>Endpoint URL:</label><br />
            <input type="url" name="endpoint_url" />
          </div>
          <div style={{ marginTop: '1rem' }}>
            <label>Price (USD):</label><br />
            <input type="number" name="price" />
          </div>
          <button type="submit" style={{ marginTop: '1rem' }}>List API</button>
        </form>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2>Available APIs</h2>
        <ul>
          <li>
            <strong>Weather Data API</strong> - Category: Data - Price: $5
            <br /><button>Purchase Key</button>
          </li>
          <li>
            <strong>Image Generation API</strong> - Category: AI - Price: $15
            <br /><button>Purchase Key</button>
          </li>
        </ul>
      </section>
    </div>
  );
}
