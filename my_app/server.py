from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import os

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/lessons":
            try:
                with open("lessons.json", "r", encoding="utf-8") as f:
                    data = f.read()
            except:
                data = "[]"
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(data.encode("utf-8"))
        elif self.path.startswith("/lessons/"):
            try:
                lid = int(self.path.split("/")[-1])
                with open("lessons.json", "r", encoding="utf-8") as f:
                    lessons = json.loads(f.read())
                lesson = next((l for l in lessons if l["id"] == lid), None)
                data = json.dumps(lesson, ensure_ascii=False) if lesson else "null"
            except:
                data = "null"
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(data.encode("utf-8"))
        elif self.path == "/" or self.path == "/index.html":
            self.serve_file("index.html", "text/html; charset=utf-8")
        elif self.path == "/script.js":
            self.serve_file("script.js", "application/javascript; charset=utf-8")
        elif self.path == "/style.css":
            self.serve_file("style.css", "text/css; charset=utf-8")
        elif self.path == "/add-lesson.html":
            self.serve_file("add-lesson.html", "text/html; charset=utf-8")
        else:
            self.send_response(404)
            self.end_headers()

    def serve_file(self, filename, content_type):
        try:
            with open(filename, "r", encoding="utf-8") as f:
                content = f.read()
            self.send_response(200)
            self.send_header("Content-Type", content_type)
            self.end_headers()
            self.wfile.write(content.encode("utf-8"))
        except:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path == "/lessons":
            length = int(self.headers["Content-Length"])
            body = self.rfile.read(length).decode("utf-8")
            try:
                with open("lessons.json", "r", encoding="utf-8") as f:
                    lessons = json.loads(f.read())
            except:
                lessons = []
            lessons.append(json.loads(body))
            with open("lessons.json", "w", encoding="utf-8") as f:
                f.write(json.dumps(lessons, ensure_ascii=False))
            self.send_response(200)
            self.end_headers()
        else:
            self.send_response(404)
            self.end_headers()

    def do_PUT(self):
        if self.path.startswith("/lessons/"):
            lid = int(self.path.split("/")[-1])
            length = int(self.headers["Content-Length"])
            body = self.rfile.read(length).decode("utf-8")
            new_data = json.loads(body)
            with open("lessons.json", "r", encoding="utf-8") as f:
                lessons = json.loads(f.read())
            for l in lessons:
                if l["id"] == lid:
                    l.update(new_data)
                    break
            with open("lessons.json", "w", encoding="utf-8") as f:
                f.write(json.dumps(lessons, ensure_ascii=False))
            self.send_response(200)
            self.end_headers()
        else:
            self.send_response(404)
            self.end_headers()

    def do_DELETE(self):
        if self.path.startswith("/lessons/"):
            lid = int(self.path.split("/")[-1])
            with open("lessons.json", "r", encoding="utf-8") as f:
                lessons = json.loads(f.read())
            lessons = [l for l in lessons if l["id"] != lid]
            with open("lessons.json", "w", encoding="utf-8") as f:
                f.write(json.dumps(lessons, ensure_ascii=False))
            self.send_response(200)
            self.end_headers()
        else:
            self.send_response(404)
            self.end_headers()

HTTPServer(("", 8000), Handler).serve_forever()
