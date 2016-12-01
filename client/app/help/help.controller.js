'use strict';

angular.module('kf6App')
    .controller('HelpCtrl', function($scope, $http) {
        $scope.emails = [];
        $http.get('/api/users/me').success(function(me) {
                var myself = {};
                myself.id = me.email;
                myself.name = me.email;
                $scope.emails.push(myself);
                $scope.email = me.email;
        });
        $scope.input = {fbTitle:'',fbContent:''};
        $scope.msgShow = false;
        $scope.emails.push({"id":"anonymous", "name":"Anonymous"});
        $scope.sendFeedback = function(){
            if($scope.input.fbTitle === undefined || $scope.input.fbTitle === "") {
                $scope.msgShow = true;
                $scope.msg = "Title feild can not be empty.";
                return;
            }
            if($scope.input.fbContent === undefined || $scope.input.fbContent === ""){
                $scope.msgShow = true;
                $scope.msg = "Description feild can not be empty.";
                return;
            }
            $http.post('/api/help/send', {
                email:$scope.email,
                subject:$scope.input.fbTitle,
                content:$scope.input.fbContent
            }).success(function(result) {
                // $scope.msg_show = true;
                // $scope.msg = "Your feedback has been sent to the administrator.";
                // document.getElementById("msg_div").style.color = "green";
                window.alert("Your feedback("+result.id+") has been sent to the administrator. ");
                $scope.msgShow = false;
                //$window.close();
            }).error(function() {
                $scope.msgShow = true;
                $scope.msg = "Failed to send your feedback.";
                document.getElementById("msg_div").style.color = "red";
            });
        };

        $scope.clearForm = function(){
            $scope.input = {};
            $scope.msgShow = false;
        };

    });
