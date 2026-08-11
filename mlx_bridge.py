#!/usr/bin/env python3
"""
Anthropic → OpenAI Bridge Proxy for MLX Server
Translates Claude Code CLI requests (Anthropic format) to MLX server (OpenAI format).
Listens on port 11435, forwards to MLX on port 8080.
"""

import json
import http.server
import urllib.request

MLX_URL = "http://127.0.0.1:8083"
LISTEN_PORT = 11435
MODEL = "Jackrong/MLX-Qwopus3.5-27B-v3-6bit"


def anthropic_to_openai(anthropic_body: dict) -> dict:
    """Convert Anthropic messages format to OpenAI chat completions format."""
    messages = []

    # System prompt
    system = anthropic_body.get("system", "")
    if system:
        if isinstance(system, list):
            system = " ".join(b.get("text", "") for b in system if isinstance(b, dict))
        messages.append({"role": "system", "content": system})

    # Convert messages
    for msg in anthropic_body.get("messages", []):
        role = msg.get("role", "user")
        content = msg.get("content", "")

        if isinstance(content, list):
            # Flatten content blocks
            text_parts = []
            for block in content:
                if isinstance(block, dict):
                    if block.get("type") == "text":
                        text_parts.append(block.get("text", ""))
                    elif block.get("type") == "tool_use":
                        text_parts.append(
                            json.dumps(
                                {
                                    "tool_call": block.get("name"),
                                    "input": block.get("input"),
                                }
                            )
                        )
                    elif block.get("type") == "tool_result":
                        text_parts.append(str(block.get("content", "")))
                elif isinstance(block, str):
                    text_parts.append(block)
            content = "\n".join(text_parts)

        messages.append({"role": role, "content": content})

    req_body = {
        "model": MODEL,
        "messages": messages,
        "max_tokens": anthropic_body.get("max_tokens", 8192),
        "temperature": anthropic_body.get("temperature", 0.7),
        "stream": anthropic_body.get("stream", False),
    }

    tools = anthropic_body.get("tools", [])
    if tools:
        req_body["tools"] = [{"type": "function", "function": t} for t in tools]

    return req_body


def openai_to_anthropic(openai_resp: dict) -> dict:
    """Convert OpenAI response to Anthropic response format."""
    choices = openai_resp.get("choices", [{}])
    message = choices[0].get("message", {}) if choices else {}
    content_text = message.get("content", "")

    return {
        "id": "msg_" + openai_resp.get("id", "local"),
        "type": "message",
        "role": "assistant",
        "model": MODEL,
        "content": [{"type": "text", "text": content_text}],
        "stop_reason": "end_turn",
        "stop_sequence": None,
        "usage": {
            "input_tokens": openai_resp.get("usage", {}).get("prompt_tokens", 0),
            "output_tokens": openai_resp.get("usage", {}).get("completion_tokens", 0),
        },
    }


def openai_stream_to_anthropic_stream(data_lines):
    """Convert OpenAI SSE stream to Anthropic SSE stream."""
    # Start event
    yield 'event: message_start\ndata: {"type":"message_start","message":{"id":"msg_local","type":"message","role":"assistant","model":"' + MODEL + '","content":[],"stop_reason":null,"usage":{"input_tokens":0,"output_tokens":0}}}\n\n'
    yield 'event: content_block_start\ndata: {"type":"content_block_start","index":0,"content_block":{"type":"text","text":""}}\n\n'

    for line in data_lines:
        line = line.strip()
        if not line or not line.startswith("data: "):
            continue
        json_str = line[6:]
        if json_str == "[DONE]":
            break
        try:
            chunk = json.loads(json_str)
            delta = chunk.get("choices", [{}])[0].get("delta", {})
            text = delta.get("content", "")
            if text:
                escaped = json.dumps(text)[1:-1]  # escape for JSON
                yield f'event: content_block_delta\ndata: {{"type":"content_block_delta","index":0,"delta":{{"type":"text_delta","text":"{escaped}"}}}}\n\n'
        except (json.JSONDecodeError, IndexError, KeyError):
            continue

    yield 'event: content_block_stop\ndata: {"type":"content_block_stop","index":0}\n\n'
    yield 'event: message_delta\ndata: {"type":"message_delta","delta":{"stop_reason":"end_turn"},"usage":{"output_tokens":0}}\n\n'
    yield 'event: message_stop\ndata: {"type":"message_stop"}\n\n'


class BridgeHandler(http.server.BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        print(f"[Bridge] {args[0]}")

    def do_GET(self):
        if "/models" in self.path:
            resp = {
                "data": [
                    {
                        "id": "claude-sonnet-4-20250514",
                        "object": "model",
                        "created": 1700000000,
                    }
                ]
            }
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(resp).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length)

        try:
            anthropic_req = json.loads(body)
        except json.JSONDecodeError:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b'{"error":"Invalid JSON"}')
            return

        is_stream = anthropic_req.get("stream", False)
        openai_req = anthropic_to_openai(anthropic_req)
        req_data = json.dumps(openai_req).encode()

        try:
            if is_stream:
                self.send_response(200)
                self.send_header("Content-Type", "text/event-stream")
                self.send_header("Cache-Control", "no-cache")
                self.end_headers()

                import threading

                keep_alive_event = threading.Event()

                def keep_alive():
                    while not keep_alive_event.wait(5):
                        try:
                            self.wfile.write('event: ping\ndata: {"type": "ping"}\n\n'.encode())
                            self.wfile.flush()
                        except Exception:
                            break

                t = threading.Thread(target=keep_alive)
                t.daemon = True
                t.start()

                try:
                    msg_start = f'event: message_start\ndata: {{"type":"message_start","message":{{"id":"msg_local","type":"message","role":"assistant","model":"{MODEL}","content":[],"stop_reason":null,"usage":{{"input_tokens":0,"output_tokens":0}}}}}}\n\n'
                    self.wfile.write(msg_start.encode("utf-8"))

                    self.wfile.write(
                        'event: content_block_start\ndata: {"type":"content_block_start","index":0,"content_block":{"type":"text","text":""}}\n\n'.encode(
                            "utf-8"
                        )
                    )
                    self.wfile.flush()

                    req = urllib.request.Request(
                        f"{MLX_URL}/v1/chat/completions",
                        data=req_data,
                        headers={"Content-Type": "application/json"},
                        method="POST",
                    )

                    with urllib.request.urlopen(req, timeout=7200) as resp:
                        active_tool_idx = None
                        for line_bytes in resp:
                            keep_alive_event.set()
                            line = line_bytes.decode("utf-8").strip()
                            if not line or not line.startswith("data: "):
                                continue
                            json_str = line[6:]
                            if json_str == "[DONE]":
                                break
                            try:
                                chunk = json.loads(json_str)
                                delta = chunk.get("choices", [{}])[0].get("delta", {})

                                combined = ""
                                if delta.get("content"):
                                    combined += str(delta.get("content", ""))
                                if delta.get("reasoning"):
                                    combined += str(delta.get("reasoning", ""))

                                if combined:
                                    escaped = json.dumps(combined)[1:-1]
                                    self.wfile.write(
                                        f'event: content_block_delta\ndata: {{"type":"content_block_delta","index":0,"delta":{{"type":"text_delta","text":"{escaped}"}}}}\n\n'.encode(
                                            "utf-8"
                                        )
                                    )

                                tool_calls = delta.get("tool_calls")
                                if tool_calls:
                                    for tc in tool_calls:
                                        idx = tc.get("index", 0)
                                        if active_tool_idx != idx:
                                            if active_tool_idx is not None:
                                                self.wfile.write(
                                                    f'event: content_block_stop\ndata: {{"type":"content_block_stop","index":{1 + active_tool_idx}}}\n\n'.encode(
                                                        "utf-8"
                                                    )
                                                )
                                            active_tool_idx = idx
                                            func = tc.get("function", {})
                                            name = func.get("name", "")
                                            tid = tc.get("id", f"call_{idx}")
                                            self.wfile.write(
                                                f'event: content_block_start\ndata: {{"type":"content_block_start","index":{1 + idx},"content_block":{{"type":"tool_use","id":"{tid}","name":"{name}","input":{{}}}}}}\n\n'.encode(
                                                    "utf-8"
                                                )
                                            )

                                        arg_delta = tc.get("function", {}).get("arguments", "")
                                        if arg_delta:
                                            escaped_args = json.dumps(arg_delta)[1:-1]
                                            self.wfile.write(
                                                f'event: content_block_delta\ndata: {{"type":"content_block_delta","index":{1 + idx},"delta":{{"type":"input_json_delta","partial_json":"{escaped_args}"}}}}\n\n'.encode(
                                                    "utf-8"
                                                )
                                            )

                                self.wfile.flush()
                            except Exception:
                                continue

                        self.wfile.write(
                            'event: content_block_stop\ndata: {"type":"content_block_stop","index":0}\n\n'.encode()
                        )
                        if active_tool_idx is not None:
                            self.wfile.write(
                                f'event: content_block_stop\ndata: {{"type":"content_block_stop","index":{1 + active_tool_idx}}}\n\n'.encode(
                                    "utf-8"
                                )
                            )
                            self.wfile.write(
                                'event: message_delta\ndata: {"type":"message_delta","delta":{"stop_reason":"tool_use"},"usage":{"output_tokens":0}}\n\n'.encode()
                            )
                        else:
                            self.wfile.write(
                                'event: message_delta\ndata: {"type":"message_delta","delta":{"stop_reason":"end_turn"},"usage":{"output_tokens":0}}\n\n'.encode()
                            )
                        self.wfile.write(
                            'event: message_stop\ndata: {"type":"message_stop"}\n\n'.encode()
                        )
                        self.wfile.flush()
                except urllib.error.URLError as e:
                    self.wfile.write(
                        f'event: error\ndata: {{"type": "error", "error": {{"type": "api_error", "message": "MLX connection failed: {str(e)}"}}}}\n\n'.encode()
                    )
                except BrokenPipeError:
                    pass  # Client disconnected early
                finally:
                    keep_alive_event.set()
            else:
                req = urllib.request.Request(
                    f"{MLX_URL}/v1/chat/completions",
                    data=req_data,
                    headers={"Content-Type": "application/json"},
                    method="POST",
                )
                with urllib.request.urlopen(req, timeout=600) as resp:
                    openai_resp = json.loads(resp.read())
                    anthropic_resp = openai_to_anthropic(openai_resp)

                    self.send_response(200)
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps(anthropic_resp).encode())

        except BrokenPipeError:
            pass


def main():
    print(f"🐝 Anthropic→MLX Bridge Proxy starting on port {LISTEN_PORT}")
    print(f"   MLX backend: {MLX_URL}")
    print(f"   Model: {MODEL}")
    server = http.server.HTTPServer(("127.0.0.1", LISTEN_PORT), BridgeHandler)
    print(f"✅ Bridge ready — Claude CLI can connect via http://127.0.0.1:{LISTEN_PORT}")
    server.serve_forever()


if __name__ == "__main__":
    main()
