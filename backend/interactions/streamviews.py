import json
import time
from django.http import StreamingHttpResponse, JsonResponse
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

from .realtime import add_sse_client, remove_sse_client

def _user_from_bearer(request):
    auth = request.META.get("HTTP_AUTHORIZATION", "")
    if not auth.startswith("Bearer "):
        return None
    raw = auth.split(" ", 1)[1].strip()
    jwt_auth = JWTAuthentication()
    try:
        validated = jwt_auth.get_validated_token(raw)
        return jwt_auth.get_user(validated)
    except (InvalidToken, TokenError):
        return None

def notifications_stream(request):
    user = _user_from_bearer(request)
    if not user:
        return JsonResponse({"detail": "Unauthorized"}, status=401)

    q = add_sse_client(user.id)

    def gen():
        try:
            # keep-alive periodic (opțional)
            yield "event: ping\ndata: {}\n\n"

            while True:
                msg = q.get()  # blochează până vine un push_to_user
                yield f"data: {json.dumps(msg)}\n\n"
        finally:
            remove_sse_client(user.id, q)

    resp = StreamingHttpResponse(gen(), content_type="text/event-stream")
    resp["Cache-Control"] = "no-cache"
    resp["X-Accel-Buffering"] = "no"
    return resp
