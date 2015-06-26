#!/bin/bash                                                                     

LOCK=./lock

if [ `whoami` != 'root' ]; then
    echo 'I am not a root.'
    exit;
fi

if [ -e $LOCK ]; then
	echo "already running.";
	exit;
else
	touch lock;
fi

((PORT=9000 ATTACHMENTS_PATH=../attachments grunt serve:dist) >> log.\
log) 2>> err.log &


