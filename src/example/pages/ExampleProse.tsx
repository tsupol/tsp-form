export function ExampleProse() {
  return (
    <article className="prose">
      <h1>Prose Typography Demo</h1>
      <p className="lead">
        This section uses the opt‑in prose styles for readable, long‑form content.
      </p>

      <p>
        You can mix <strong>bold</strong>, <em>emphasis</em>, and <a href="#">links</a>.
        Lists, code, and quotes are also styled.
      </p>

      <h2>Lists</h2>
      <ul>
        <li>Unordered list item</li>
        <li>Another item</li>
      </ul>
      <ol>
        <li>Ordered list item</li>
        <li>Second item</li>
      </ol>

      <h3>Code</h3>
      <p>
        Inline code like <code>npm run dev</code> is styled. Blocks too:
      </p>
      <pre>
        <code>{`function greet(name: string) {
  return \`Hello, \${name}\`;
}`}</code>
      </pre>
      <pre className="max-h-64 overflow-auto better-scroll">
        <code>{`async function fetchUserData(userId: string) {
  try {
    const response = await fetch(\`/api/users/\${userId}\`);
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    throw error;
  }
}

// Example usage with Promise chaining
fetchUserData('123')
  .then(user => {
    console.log('User data:', user);
    return processUserData(user);
  })
  .catch(error => {
    displayErrorMessage(error);
    return fallbackUserData();
  })
  .finally(() => {
    hideLoadingSpinner();
  });`}</code>
      </pre>

      <h3>Blockquote</h3>
      <blockquote>
        <p>Typography should be easy to read and get out of the way.</p>
      </blockquote>

      <figure>
        <img src="https://via.placeholder.com/640x360" alt="Placeholder" />
        <figcaption>A simple figure with caption.</figcaption>
      </figure>

      <hr />

      <h4>Small print</h4>
      <p className="muted">
        This text is slightly muted for de‑emphasis. Use <code>.muted</code> or <code>.dim</code> helpers.
      </p>
    </article>
  );
}