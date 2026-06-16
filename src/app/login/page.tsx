export default function Login() {
  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '2rem', border: '1px solid #ccc' }}>
      <h1>Login</h1>
      <form>
        <div style={{ marginTop: '1rem' }}>
          <label>Email:</label><br />
          <input type="email" style={{ width: '100%' }} />
        </div>
        <div style={{ marginTop: '1rem' }}>
          <label>Password:</label><br />
          <input type="password" style={{ width: '100%' }} />
        </div>
        <button type="submit" style={{ marginTop: '1rem', width: '100%' }}>Login</button>
      </form>
      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        Don't have an account? <a href="/register">Register</a>
      </p>
    </div>
  );
}
