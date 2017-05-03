Knowledge Forum 6
======================

Copyright(c) 2014-2015 Yoshiaki Matsuzawa All rights researved.

Creating Development Environment
--------------------------------

### Prerequisites ###

* mongodb
* node.js  
note: please use the following way to install node.js into ubuntu  

```shell
$ sudo apt-get install curl
$ curl -sL https://deb.nodesource.com/setup | sudo bash -  
$ sudo apt-get install nodejs  
```
* git

### Install ###

1. Install Development Tools (yo, bower, and grunt)
```shell
$ npm install --global yo bower grunt-cli
```

2. Download kf6 from git  
```shell
$ git clone https://github.com/matsuzawalab/kf6.git
```

3. Install Server-side Packages
```shell
$ npm install
```

4. Install Client-side Packages  
```shell
$ bower install
```
5. Configure server settings (v6.10+)

*  Version 6.10 introduces (temporarily) a settings.js file controlling mandatory and non mandatory settings such as username case sensibility for login. See settings.sample.js for an example file. 

### Run ###

1. run mongodb

2. run kf6 server  
```shell
$ grunt serve
```

