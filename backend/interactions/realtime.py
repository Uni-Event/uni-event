import queue
from threading import Lock
from typing import Dict, Set, Any

_user_queues: Dict[int, Set[queue.Queue]] = {}   # user_id -> set(queue.Queue)
_lock = Lock()

def add_sse_client(user_id: int) -> queue.Queue:
    q = queue.Queue()
    with _lock:
        _user_queues.setdefault(user_id, set()).add(q)
    return q

def remove_sse_client(user_id: int, q: queue.Queue):
    with _lock:
        s = _user_queues.get(user_id)
        if not s:
            return
        s.discard(q)
        if not s:
            _user_queues.pop(user_id, None)

def push_to_user(user_id: int, payload: dict):
    """
    Pune în coadă un payload (dict) pentru toți clienții SSE conectați ai userului.
    IMPORTANT: NU facem json.dumps aici. Stream-ul îl va serializa o singură dată.
    """
    with _lock:
        queues = list(_user_queues.get(user_id, set()))

    for q in queues:
        q.put(payload)