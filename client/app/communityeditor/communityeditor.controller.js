'use strict';

angular.module('kf6App')
    .controller('CommunityeditorCtrl', function($scope, $stateParams, $http, $community) {
        var communityId = $stateParams.communityId;

        $scope.community = {};

        $http.get('api/communities/' + communityId).success(function(community) {
            $scope.community = community;
        });

        $scope.save = function() {
            $http.put('api/communities/' + communityId, $scope.community).success(function() {
                window.alert('successed.');
            }).error(function() {
                window.alert('failed.');
            });
        };

        $scope.blockLoginWriters = function() {
            $scope.changeWritersState(function(member) {
                return member.role === 'writer';
            }, function(member) {
                member.blockLogin = true;
                $community.modifyObject(member);
            });
        };

        $scope.unblockLoginWriters = function() {
            $scope.changeWritersState(function(member) {
                return member.role === 'writer';
            }, function(member) {
                member.blockLogin = false;
                $community.modifyObject(member);
            });
        };

        $scope.activateWriters = function(){
            $scope.changeWritersState(function(member) {
                return member.status === 'inactive';
            }, function(member) {
                member.status = 'active';
                $community.modifyObject(member);
            });
        };

        $scope.changeWritersState = function(test, change) {
            var key = window.prompt('Please community registration key to confirm');
            if (key === $scope.community.registrationKey) {
                $community.enter($scope.community._id, function() {
                    $community.refreshMembers(function() {
                        var cData = $community.getCommunityData();
                        var targets = [];
                        cData.membersArray.forEach(function(member) {
                            if (test(member)) {
                                targets.push(member);
                            }
                        });
                        targets.forEach(function(member) {
                            change(member);
                        });
                        window.alert('OK: ' + targets.length);
                    });
                });
            }
        };


        $scope.updateAllCash = function() {
            $http.get('/api/links/updateallcache/' + communityId).
            success(function() {
                window.alert('updateing cache successed.');
            });
        };
    });
