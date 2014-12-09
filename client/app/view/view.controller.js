'use strict';

angular.module('kf6App')
    .controller('ViewCtrl', function($scope, $http, $stateParams, $member, socket, Auth) {
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
                $member.updateCommunityMembers();

                //read
                $scope.refreshRead();
            });
        };

        $scope.addRef = function(ref) {
            ref.getColor = function(){
                if(ref.read === true){
                    return '#FF0000';
                }
                return '#0000FF';
            };
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
                ref.authorObjects.push($member.getMember(id));
            });
        };

        $scope.refreshRead = function() {
            $http.get('/api/records/count/' + $scope.view._id + '/' + Auth.getCurrentUser()._id).success(function(res) {
                res.forEach(function(each) {
                    $scope.refs.forEach(function(ref) {
                        if (ref.contributionId === each._id) {
                            ref.read = true;
                        }
                    });
                });
            });
        };

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

        $scope.openContribution = function(ref) {
            var url = './contribution/' + ref.contributionId;
            window.open(url, '_blank');
        };

        $scope.contextOpen = function(childScope) {
            $scope.contextTarget = childScope.ref;
        };

        $scope.delete = function() {
            if ($scope.contextTarget === undefined) {
                window.alert('contextTarget is not set.');
                return;
            }
            var ref = $scope.contextTarget;
            $http.delete('/api/onviewrefs/' + ref._id);
        };

    });