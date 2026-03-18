import { store, setTaskProgress, setError } from './store';

const GRAPHQL_URL = 'http://localhost:8080/query';

export async function fetchGraphQL(query: string, variables: any = {}) {
  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const result = await response.json();
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }
  return result.data;
}

export function subscribeToTask(taskId: string) {
  const eventSource = new EventSource(`http://localhost:8080/events/${taskId}`);

  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    store.dispatch(setTaskProgress(data));
    
    if (data.status === 'completed' || data.status === 'failed') {
      eventSource.close();
    }
  };

  eventSource.onerror = (err) => {
    console.error("SSE Error:", err);
    store.dispatch(setError("연결이 끊어졌습니다."));
    eventSource.close();
  };

  return () => eventSource.close();
}
