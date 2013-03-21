#!/usr/bin/env python

""" Copyright (C) 2013 mountainpenguin (pinguino.de.montana@googlemail.com)
    <http://github.com/mountainpenguin/BySH>
    
    This file is part of BySH.

    BySH is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    BySH is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with BySH.  If not, see <http://www.gnu.org/licenses/>.
"""

import lib.tornado as tornado
import lib.tornado.ioloop
import lib.tornado.httpserver
import lib.tornado.options
import lib.tornado.web

import os
import sys
import socket
import logging
import signal

class Server(object):
    def __init__(self):
        pass

    def shutdown(self, *args, **kwargs):
        if self._PID != os.getpid():
            return
        logging.info("SIGTERM received, shutting down")
        self.instance.stop()

    def main(self, host, portnum):
        signal.signal(signal.SIGTERM, self.shutdown)

        tornado.options.parse_command_line(["--logging=debug"])
        application = tornado.web.Application([
            (r"/", indexHandler),
        ], gzip=True, debug=False)
        
        http_server = tornado.httpserver.HTTPServer(application)
        http_server.listen(portnum, host)
        self._PID = os.getpid()
        self.instance = tornado.ioloop.IOLoop.instance()
        self.instance.start()

class indexHandler(tornado.web.RequestHandler):
    def get(self):
        self.write("Ohai der")
