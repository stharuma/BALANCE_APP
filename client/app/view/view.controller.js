'use strict';

angular.module('kf6App')
    .controller('ViewCtrl', function($scope, $http, $stateParams, socket, Auth) {
        var viewId = $stateParams.viewId;
        $scope.view = {};
        $scope.refs = [];

        $http.get('/api/views/' + viewId).success(function(view) {
            $scope.view = view;
            $scope.updateCanvas();
        });

        $scope.updateCanvas = function() {
            $http.get('/api/onviewrefs/view/' + viewId).success(function(refs) {
                $scope.refs = refs;
                socket.socket.emit('subscribe', viewId);
                $scope.$on('$destroy', function() {
                    socket.socket.emit('unsubscribe', viewId);
                    socket.unsyncUpdates('ref');
                });
                socket.syncUpdates('ref', $scope.refs, function(event, item) {
                    if (event === 'created') {
                        $scope.addRef(item);
                    }
                    if (event === 'updated') {
                        $scope.addRef(item);
                    }
                });
                //authors info
                $scope.refs.forEach(function(ref) {
                    $scope.addRef(ref);
                });
                $scope.updateCommunityMembers();
            });
        };

        $scope.addRef = function(ref) {
            ref.authorObjects = [];
            ref.getAuthorString = function() {
                var authorString = '';
                ref.authorObjects.forEach(function(each) {
                    if (authorString.length !== 0) {
                        authorString += ', ';
                    }
                    authorString += each.name;
                });
                return authorString;
            };
            ref.authors.forEach(function(id) {
                ref.authorObjects.push($scope.getMember(id));
            });
        }

        $scope.createNote = function() {
            var authors = [Auth.getCurrentUser()._id];
            $http.post('/api/notes', {
                    title: 'New Note',
                    body: '',
                    authors: authors
                })
                .success(function(note) {
                    $scope.createOnViewRef(note, 100, 100);
                });
        };

        $scope.createOnViewRef = function(contribution, x, y) {
            $http.post('/api/onviewrefs', {
                contributionId: contribution._id,
                viewId: $scope.view._id,
                x: x,
                y: y,
                title: contribution.title,
                authors: contribution.authors
            });
        };

        $scope.updateRef = function(ref) {
            $http.put('/api/onviewrefs/' + ref._id, ref);
        };

        $scope.openContoribution = function(id) {
            var url = './contribution/' + id;
            window.open(url, '_blank');
        };

        $scope.communityMembers = {};
        $scope.getMember = function(id) {
            if (!(id in $scope.communityMembers)) {
                $scope.communityMembers[id] = {
                    name: ""
                };
            }
            return $scope.communityMembers[id];
        };

        $scope.updateCommunityMembers = function() {
            $http.get('/api/users/').success(function(members) {
                members.forEach(function(each) {
                    $scope.getMember(each._id).name = each.name;
                });
            });
        };

    });