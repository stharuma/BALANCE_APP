/* global d3 */
'use strict';

angular.module('kf6App')
    //.controller('EvaluationCtrl', function($stateParams, $scope, $community, $http) {
      .controller('EvaluationCtrl', function($stateParams, $scope, Auth, $community) {
        // 2 lignes ajoutées manuellement dans client/index.html... faudra trouver comment les mettre auto
        //<script src="https://code.highcharts.com/highcharts.js"></script>
        //<script src="https://code.highcharts.com/modules/exporting.js"></script>

        var viewId = $stateParams.viewId;

        $scope.isAdmin = Auth.isAdmin;

        console.log($scope.isAdmin())

        $community.getObject(viewId, function(view) {
            $scope.view = view;
            $community.enter($scope.view.communityId);
            $scope.community = $community.getCommunityData();
            
            $scope.communityMembers = $community.getMembersArray();
            $community.refreshMembers(function(){
            $scope.scaffolds = $community.getScaffolds();
                $community.refreshScaffolds(function() {
                    //scaffoldsAll = $scope.scaffolds;
                    //refresh();
                    
                });
            });
        });

        var refresh = function() {
            /*$http.post('/api/contributions/' + $scope.view.communityId + '/search', {
                query: {
                    communityId: $scope.view.communityId,
                    viewIds: [$scope.view._id],
                    pagesize: 1000
                }
            }).success(function(contributions) {
                var data = processData(contributions);
                refreshViewYear(data.slice(0, 2));
                refreshViewWeek(data.slice(2, 4));
                refreshViewAuthors(data.slice(4, 5));
            });
*/
        };

        var processData = function(notes) {
            /*var dataAll = new Array();
            var dataUser = new Array();
            var dataWeekAll = new Array();
            var dataWeekUser = new Array();
            var scaffoldsUser = new Array();
            var nbnotesAll = new Array();

            var currentdt, currentdtUTC;
            var nbnotes = notes.length;
            var nbnotesUser = 0;
            var pendingrqt = 0;

            // initialize every day of the scholar year at 0 notes
            for (var i = dtdebut; i <= dtfin; i+=86400000){
                  dataAll.push(new Array(i, 0));
                  dataUser.push(new Array(i, 0));
            }

            // initialize 7 days of the week at 0 notes
            for (var i = 0; i <= 6; i++){
                dataWeekAll[i] = 0;
                dataWeekUser[i] = 0;
            }

            notes.forEach(function(note) {
                currentdtUTC = Date.UTC(parseInt(note.created.substr(0, 4), 10), parseInt(note.created.substr(5, 2), 10) - 1, parseInt(note.created.substr(8, 2), 10) + 1);
                currentdt = new Date(currentdtUTC)
                
                // update number of notes by day and by day of the week for all users and for the connected user
                dataAll[parseInt((currentdtUTC-dtdebut)/86400000, 10)][1]++;
                dataWeekAll[currentdt.getDay()]++;

                note.authors.forEach(function(author){
                    if (typeof nbnotesAll[author] !== 'undefined') {
                        nbnotesAll[author]++;
                    }
                    else{
                        nbnotesAll[author] = 1
                    }
                })
                    
                if ($.inArray($scope.community.author._id, note.authors) > -1){
                    dataUser[parseInt((currentdtUTC-dtdebut)/86400000, 10)][1]++;
                    dataWeekUser[currentdt.getDay()]++;
                    nbnotesUser++;
                    pendingrqt++;
                    $http.get('/api/links/to/' + note._id).success(function(links) {
                        links.forEach(function(link){
                            if (link.type == "supports"){
                                if (typeof scaffoldsUser[link._from.title] !== 'undefined') {
                                    scaffoldsUser[link._from.title]++;
                                }
                                else{
                                    scaffoldsUser[link._from.title] = 1
                                }
                            }
                        });
                        pendingrqt--;
                        if (pendingrqt == 0){
                            refreshViewScaffolds(scaffoldsUser);
                        }
                    });
                } 
            });

            for (var i = 0; i <= 6; i++){
                dataWeekAll[i] = dataWeekAll[i] / nbnotes * 100;
                dataWeekUser[i] = dataWeekUser[i] / nbnotesUser * 100;
            }
            return [dataAll, dataUser, dataWeekAll, dataWeekUser, nbnotesAll];
            */
        };    

    });