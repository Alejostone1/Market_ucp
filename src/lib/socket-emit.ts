const SOCKET_SERVER_URL = process.env.SOCKET_SERVER_URL;
const SOCKET_EMIT_SECRET = process.env.SOCKET_EMIT_SECRET;

export async function emitSocketEvent(
  room: string,
  event: string,
  data: unknown
): Promise<void> {
  if (!SOCKET_SERVER_URL || !SOCKET_EMIT_SECRET) return;

  try {
    await fetch(`${SOCKET_SERVER_URL}/emit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SOCKET_EMIT_SECRET}`,
      },
      body: JSON.stringify({ room, event, data }),
    });
  } catch {
    // Socket server unavailable — polling fallback handles delivery
  }
}
