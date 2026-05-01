# routes/events.py
# Blueprint 'events' — sincronizzazione real-time via Server-Sent Events.
# GET /api/events → apre uno stream SSE per il client connesso.
# notify_all()    → funzione chiamata dalle altre route per trasmettere
#                   un evento a tutti i client connessi in quel momento.

import queue
import json
import threading
from flask import Blueprint, Response, stream_with_context
from auth.decorators import login_required

events_bp = Blueprint('events', __name__)

# Lista delle code attive, una per ogni client connesso.
# FIX: protetta da un Lock per evitare race condition in ambiente multi-thread.
_listeners: list[queue.Queue] = []
_listeners_lock = threading.Lock()


def notify_all(event_type: str, data: dict):
    """Invia un evento SSE a tutti i client attualmente connessi."""
    msg = f"event: {event_type}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"
    # FIX: copia snapshot della lista sotto lock per evitare modifiche concorrenti
    # durante l'iterazione (un client potrebbe disconnettersi mentre iteriamo)
    with _listeners_lock:
        targets = list(_listeners)
    for q in targets:
        try:
            q.put_nowait(msg)
        except queue.Full:
            pass


@events_bp.route('/api/events')
@login_required
def sse_stream():
    def generate():
        q = queue.Queue(maxsize=50)
        # FIX: append protetto da lock
        with _listeners_lock:
            _listeners.append(q)
        try:
            yield "event: connected\ndata: {}\n\n"
            while True:
                try:
                    msg = q.get(timeout=30)
                    yield msg
                except queue.Empty:
                    # Heartbeat: tiene viva la connessione SSE ogni 30s
                    yield ": heartbeat\n\n"
        except GeneratorExit:
            pass
        finally:
            # FIX: remove protetto da lock
            with _listeners_lock:
                if q in _listeners:
                    _listeners.remove(q)

    return Response(
        stream_with_context(generate()),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'X-Accel-Buffering': 'no',
        }
    )