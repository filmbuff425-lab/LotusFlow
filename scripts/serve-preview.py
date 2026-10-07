"""Local portfolio preview with enough concurrent slots and media seeking."""
import argparse
import os
import re
from functools import partial
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class PreviewServer(ThreadingHTTPServer):
    request_queue_size = 128
    daemon_threads = True


class PreviewHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Code changes must not leave old dependent modules cached in Safari.
        if self.path.split('?', 1)[0].endswith(('.js', '.css', '.html')) or '.' not in self.path.rsplit('/', 1)[-1].split('?', 1)[0]:
            self.send_header('Cache-Control', 'no-cache')
        self.send_header('Accept-Ranges', 'bytes')
        super().end_headers()

    def send_head(self):
        self.byte_range = None
        path = self.translate_path(self.path)
        header = self.headers.get('Range', '')
        if not header or not os.path.isfile(path):
            return super().send_head()
        match = re.fullmatch(r'bytes=(\d*)-(\d*)', header.strip())
        if not match:
            return super().send_head()
        source = open(path, 'rb')
        size = os.fstat(source.fileno()).st_size
        start, end = match.groups()
        if not start:
            start, end = max(0, size - int(end or size)), size - 1
        else:
            start, end = int(start), min(size - 1, int(end) if end else size - 1)
        if start >= size or start > end:
            source.close()
            self.send_response(HTTPStatus.REQUESTED_RANGE_NOT_SATISFIABLE)
            self.send_header('Content-Range', f'bytes */{size}')
            self.send_header('Content-Length', '0')
            self.end_headers()
            return None
        self.byte_range = (start, end)
        self.send_response(HTTPStatus.PARTIAL_CONTENT)
        self.send_header('Content-Type', self.guess_type(path))
        self.send_header('Content-Range', f'bytes {start}-{end}/{size}')
        self.send_header('Content-Length', str(end - start + 1))
        self.end_headers()
        source.seek(start)
        return source

    def copyfile(self, source, target):
        try:
            if self.byte_range is None:
                return super().copyfile(source, target)
            remaining = self.byte_range[1] - self.byte_range[0] + 1
            while remaining:
                data = source.read(min(65536, remaining))
                if not data:
                    break
                target.write(data)
                remaining -= len(data)
        except (BrokenPipeError, ConnectionResetError):
            pass  # A visitor moved away or sought to another media position.

    def log_message(self, format, *args):
        if args and str(args[1]) not in ('200', '206', '304'):
            super().log_message(format, *args)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=4190)
    parser.add_argument('--directory', default='deploy')
    options = parser.parse_args()
    server = PreviewServer(('127.0.0.1', options.port), partial(PreviewHandler, directory=os.path.abspath(options.directory)))
    print(f'Local preview: http://127.0.0.1:{options.port}/', flush=True)
    server.serve_forever()
