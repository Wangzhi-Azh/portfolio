"""本地 / 局域网预览服务器

用法：
  python serve.py                    只在本机打开（默认 127.0.0.1:6123）
  python serve.py --host 0.0.0.0     同一 Wi-Fi 下的手机、同事电脑也能打开
  python serve.py --port 8000        换端口
  python serve.py --open            启动后自动打开浏览器

要点：
  - 多线程：首屏会并发请求 30+ 张图，单线程服务器会排队超时，图片显示不出来
  - 补全 .webp / .woff2 的 MIME 类型（Windows 注册表常缺，缺了浏览器可能拒绝渲染）
  - no-store：改完文件刷新就能看到，不会命中旧缓存
"""

import argparse
import functools
import http.server
import mimetypes
import os
import socket
import socketserver
import sys
import threading
import webbrowser

ROOT = os.path.dirname(os.path.abspath(__file__))

for ext, mime in [
    ('.webp', 'image/webp'),
    ('.woff2', 'font/woff2'),
    ('.woff', 'font/woff'),
    ('.svg', 'image/svg+xml'),
    ('.avif', 'image/avif'),
    ('.json', 'application/json'),
    ('.js', 'text/javascript'),
    ('.css', 'text/css'),
]:
    mimetypes.add_type(mime, ext)


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        super().end_headers()

    def log_message(self, fmt, *args):  # 安静模式
        pass


def lan_ip():
    """尽量拿到本机在局域网里的地址"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        try:
            return socket.gethostbyname(socket.gethostname())
        except Exception:
            return None


def main():
    parser = argparse.ArgumentParser(description='王智作品集 · 本地预览')
    parser.add_argument('--host', default='127.0.0.1', help='监听地址，局域网共享用 0.0.0.0')
    parser.add_argument('--port', type=int, default=6123, help='端口，默认 6123')
    parser.add_argument('--open', action='store_true', help='启动后自动打开浏览器')
    args = parser.parse_args()

    os.chdir(ROOT)
    socketserver.ThreadingTCPServer.allow_reuse_address = True
    socketserver.ThreadingTCPServer.daemon_threads = True
    handler = functools.partial(Handler, directory=ROOT)

    with socketserver.ThreadingTCPServer((args.host, args.port), handler) as httpd:
        httpd.request_queue_size = 64
        local = f'http://127.0.0.1:{args.port}/'
        print('')
        print('  王智 · 工业设计作品集')
        print(f'  本机：   {local}')
        if args.host not in ('127.0.0.1', 'localhost'):
            ip = lan_ip()
            if ip:
                print(f'  局域网： http://{ip}:{args.port}/   （手机连同一 Wi-Fi 即可打开）')
        print('  Ctrl+C 停止')
        print('')
        if args.open:
            threading.Timer(0.6, lambda: webbrowser.open(local)).start()
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print('\n已停止')


if __name__ == '__main__':
    sys.exit(main())
