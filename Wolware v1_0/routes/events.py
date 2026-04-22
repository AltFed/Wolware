# routes/events.py
# Blueprint 'events' — sincronizzazione real-time via Server-Sent Events.
# GET /api/events → apre uno stream SSE per il client connesso.
# notify_all()    → funzione chiamata dalle altre route per trasmettere
#                   un evento a tutti i client connessi in quel momento.

import queue
import json
from flask import Blueprint, Response, stream_with_context
from auth.decorators import login_required

events_bp = Blueprint('events', __name__)

# Lista delle code attive, una per ogni client connesso
_listeners: list[queue.Queue] = []


def notify_all(event_type: str, data: dict):
    """Invia un evento SSE a tutti i client attualmente connessi."""
    msg = f"event: {event_type}\ndata: {json.dumps(data)}\n\n"
    for q in _listeners[:]:
        try:
            q.put_nowait(msg)
        except queue.Full:
            pass


@events_bp.route('/api/events')
@login_required
def sse_stream():
    def generate():
        q = queue.Queue(maxsize=50)
        _listeners.append(q)
        try:
            # Messaggio iniziale per confermare la connessione
            yield "event: connected\ndata: {}\n\n"
            while True:
                msg = q.get(timeout=30)
                yield msg
        except Exception:
            pass
        finally:
            if q in _listeners:
                _listeners.remove(q)

    return Response(
        stream_with_context(generate()),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'X-Accel-Buffering': 'no'
        }
    )