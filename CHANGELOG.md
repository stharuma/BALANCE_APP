# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/)

## [Unreleased]
### Added
-

### Changed
-

### Fixed
-


## [6.10.0]
### Added
- [Important] New requirement : a server.js file placed at the root folder. This file centralizes and controls important server settings. See the server.sample.js file as a model.
- [Important] New server setting to control the username case sensitivity of a local user account at login (default = false). (issue #47)

### Changed
- The mail settings (server/components/kfmail/kfmail.js) are moved to the new settings.js.
- Block the creation of local user accounts having a username that already exists in a case insensitive manner.
- Sort communities alphabetically in the Home page (communitymanager). (issue #45)
- Allow an admin to create a community registration (Author object) for another user through the API. (issue #54)

## Fixed
- Specify 'local' provider filter for local accounts on registration validation and login.


## [6.9.0]
### Changed
- Many dependencies updates (mostly in December 2016 and January 2017)
- 6.8.x Albany developments merged
- Promising ideas tool integrated but disabled by default (community setting)


# [...] Previous changes not documented (yet)
