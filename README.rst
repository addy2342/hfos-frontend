HFOS - The Hackerfleet Operating System
=======================================

    A modern, opensource approach to maritime navigation.

    This software package is supposed to run on your ship/car/plane/ufo's
    board computer.

*Obligatory Warning*: **Do not use for navigational purposes!**

*Always have up to date paper maps and know how to use them!*

Frontend
========

This is the frontend submodule. Please check <https://github.com/hackerfleet/hfos>
for more information about HFOS.


License
=======

Copyright (C) 2011-2015 riot <riot@hackerfleet.org> and others.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

Bugs & Discussion
=================

Please research any bugs you find via our `Github issue tracker for
HFOS <https://github.com/hackerfleet/hfos/issues>`__ and report them,
if they're still unknown.

If you want to discuss (opensource) maritime technology in general
incl. where we're heading, head over to our `Github discussion
forum <https://github.com/hackerfleet/discussion/issues>`__
...which is cleverly disguised as a Github issue tracker.

Installation
------------

To install the frontend, update and pull this submodule, then change into
it and either install or develop.

.. code-block:: bash

    $ git submodule init
    $ git submodule update
    $ cd frontend
    $ npm install
    $ sudo npm install -g bower grunt grunt-cli
    $ bower install
    $ grunt serve

Point your browser to localhost:9000 to observe the magic. Don't forget
to start the backend!

You can also copy a static version of the frontend by instructing grunt to:

.. code-block:: bash

    $ sudo grunt copy:dev

Using this method is not meant for live editing, but for the final production 
installation.

Assets
------

This is migrating over to hfos-frontend submodule.

-  Fabulous icons by iconmonstr.com and Hackerfleet contributors
-  Tumbeasts from http://theoatmeal.com/pl/state_web_winter/tumblr for
   the error page (CC-BY)


-- :boat: :+1:
