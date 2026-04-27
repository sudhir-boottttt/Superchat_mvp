const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export async function apiFetch(path, options = {}) {
  const { token, body, headers, ...rest } = options;

  const response = await fetch(`${API_URL}${path}`, {
    method: rest.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    ...rest
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export { API_URL };
