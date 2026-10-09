"""Vista previa local con HTTP Range. Python 3 estándar; detener con Ctrl+C.

Uso: python scripts/servir_web.py
Abrir http://localhost:8090/maplibre/. No publica el equipo en Internet.
"""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from functools import partial
import re

WEB = Path(__file__).resolve().parents[1] / 'web'

class Handler(SimpleHTTPRequestHandler):
    # Las solicitudes parciales son necesarias para leer PMTiles eficientemente.
    def send_head(self):
        self._remaining = None
        path = Path(self.translate_path(self.path))
        # Delega directorios e index.html en el servidor estándar de Python.
        if not path.is_file() or not self.headers.get('Range'):
            return super().send_head()
        total = path.stat().st_size
        match = re.fullmatch(r'bytes=(\d*)-(\d*)', self.headers['Range'])
        if not match or not any(match.groups()):
            self.send_error(400, 'Rango no válido'); return None
        a, b = match.groups()
        if a:
            start = int(a); end = min(int(b) if b else total - 1, total - 1)
        else:
            start = max(0, total-int(b)); end = total-1
        if start >= total or start > end:
            self.send_response(416)
            self.send_header('Content-Range', f'bytes */{total}')
            self.end_headers(); return None
        # Lee solo la parte solicitada, sin cargar todo el archivo en memoria.
        stream = path.open('rb'); stream.seek(start)
        self._remaining = end-start+1
        self.send_response(206)
        self.send_header('Content-Type', self.guess_type(str(path)))
        self.send_header('Content-Length', str(self._remaining))
        self.send_header('Content-Range', f'bytes {start}-{end}/{total}')
        self.send_header('Accept-Ranges', 'bytes')
        self.end_headers()
        return stream

    def copyfile(self, source, outputfile):
        if self._remaining is None:
            return super().copyfile(source, outputfile)
        remaining = self._remaining
        while remaining:
            block = source.read(min(65536, remaining))
            if not block: break
            outputfile.write(block); remaining -= len(block)

if __name__ == '__main__':
    server = ThreadingHTTPServer(('127.0.0.1', 8090), partial(Handler, directory=str(WEB)))
    print('Vista previa: http://localhost:8090/maplibre/ — Ctrl+C para detener')
    try: server.serve_forever()
    except KeyboardInterrupt: server.server_close()
