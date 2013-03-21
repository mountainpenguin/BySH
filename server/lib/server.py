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
import statvfs
import re
import time

import psutil

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
        self.set_header("Content-Type", "text/plain")

        loadavg = os.getloadavg()
        self.write("Load: %s, %s, %s\n" % loadavg)

        usage = os.statvfs("/")
        total = usage[statvfs.F_BLOCKS]
        free = usage[statvfs.F_BFREE]
        used = total - free
        block_size = usage[statvfs.F_BSIZE]
        self.write("Hdd: %s / %s\n" % (used*block_size, total*block_size))

        meminfofile = open("/proc/meminfo")
        meminfo = meminfofile.read()
        meminfofile.close()
        try:
            total = int(re.search("MemTotal:.*?(\d+) kB", meminfo).group(1))*1024
            free = int(re.search("MemFree:.*?(\d+) kB", meminfo).group(1))*1024
            cached = int(re.search("Cached:.*?(\d+) kB", meminfo).group(1))*1024
            buffers = int(re.search("Buffers:.*?(\d+) kB", meminfo).group(1))*1024
            effectivefree = free+cached+buffers
            used = total - effectivefree
        except:
            used, total = 0, 0
        self.write("Mem: %s / %s\n" % (used, total))

        boot_match =  re.search("btime (\d+)", open("/proc/stat").read())
        if boot_match:
            booted = int(boot_match.group(1))
            uptime = time.time() - booted
            self.write("Uptime: %s\n" % uptime)
        else:
            self.write("Uptime: ?\n")
