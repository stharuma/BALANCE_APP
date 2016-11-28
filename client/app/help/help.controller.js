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
        $scope.input = {fb_Title:'',fb_Content:''};
        $scope.msgShow = false;
        $scope.emails.push({"id":"anonymous", "name":"Anonymous"});
        $scope.sendFeedback = function(){
            if($scope.input.fb_Title === undefined || $scope.input.fb_Title === "") {
                $scope.msgShow = true;
                $scope.msg = "Title feild can not be empty.";
                return;
            }
            if($scope.input.fb_Content === undefined || $scope.input.fb_Content === ""){
                $scope.msgShow = true;
                $scope.msg = "Description feild can not be empty.";
                return;
            }
            $http.post('/api/help/send', {
                email:$scope.email,
                subject:$scope.input.fb_Title,
                content:$scope.input.fb_Content
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
