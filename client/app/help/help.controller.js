'use strict';

angular.module('kf6App')
    .controller('HelpCtrl', function($scope, $http, $window) {
        $scope.emails = [];
        $http.get('/api/users/me').success(function(me) {
                var myself = {};
                myself.id = me.email;
                myself.name = me.email;
                $scope.emails.push(myself);
                $scope.email = me.email;
        });
        
        $scope.msg_show = false;
        $scope.emails.push({"id":"anonymous", "name":"Anonymous"});
        $scope.sendFeedback = function(){
            if($scope.title==undefined || $scope.title=="") {
                $scope.msg_show = true;
                $scope.msg = "Title feild can not be empty.";
                return;
            }
            if($scope.content==undefined || $scope.content==""){
                $scope.msg_show = true;
                $scope.msg = "Description feild can not be empty.";
                return;
            }
            $http.post('/api/help/send', {
                email:$scope.email,
                subject:$scope.title,
                content:$scope.content
            }).success(function(result) {
                // $scope.msg_show = true;
                // $scope.msg = "Your feedback has been sent to the administrator.";
                // document.getElementById("msg_div").style.color = "green";
                alert("Your feedback has been sent to the administrator.");
                $window.close();
            }).error(function() {
                $scope.msg_show = true;
                $scope.msg = "Failed to send your feedback.";
                document.getElementById("msg_div").style.color = "red";
            });
        };

        $scope.cancel = function(){
            $window.close();
        }

    });
