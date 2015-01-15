'use strict';

angular.module('kf6App')
    .config(function($stateProvider) {
        $stateProvider
            .state('contribution', {
                url: '/contribution/:contributionId',
                templateUrl: 'app/contribution/contribution.html',
                controller: 'ContributionCtrl'
            });
    });

angular.module('kf6App')
    .directive('KFDragSource', function($kftag) {
        return {
            restrict: 'C',
            link: function(scope, element) {
                var $scope = scope.$parent;
                var el = element[0];
                //el.draggable = true;
                el.addEventListener('dragstart', function(e) {
                    var dt = e.dataTransfer;
                    var original = dt.getData('text/plain');
                    var contrib = $scope.contribution;
                    var html = $kftag.createNewReferenceTag(contrib._id, contrib.title, contrib.authors, original);
                    dt.setData('kf', 'true');
                    dt.setData('kfid', $scope.contribution._id);
                    dt.setData('text/html', html);
                    dt.setData('text/plain', original);
                });
                el.addEventListener('copy', function(e) {
                    var dt = e.clipboardData;
                    var original = getSelected();
                    var contrib = $scope.contribution;
                    var html = $kftag.createNewReferenceTag(contrib._id, contrib.title, contrib.authors, original);
                    dt.setData('kf', 'true');
                    dt.setData('kfid', $scope.contribution._id);
                    dt.setData('text/html', html);
                    dt.setData('text/plain', original);
                    e.stopPropagation();
                    e.preventDefault();
                });

                //http://stackoverflow.com/questions/5643635/how-to-get-selected-html-text-with-javascript
                function getSelected() {
                    var text = '';
                    if (window.getSelection && window.getSelection().toString() && $(window.getSelection()).attr('type') !== 'Caret') {
                        text = window.getSelection().toString();
                        return text;
                    } else if (document.getSelection && document.getSelection().toString() && $(document.getSelection()).attr('type') !== 'Caret') {
                        text = window.getSelection().toString();
                        return text;
                    } else {
                        var selection = document.selection && document.selection.createRange();
                        if ((typeof selection !== 'undefined') && selection.text && selection.text.toString()) {
                            text = selection.text;
                            return text;
                        }
                    }
                    return false;
                }
            }
        };
    });