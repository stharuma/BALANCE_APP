/* global d3 */
'use strict';

angular.module('kf6App')
    .controller('BasicStatsCtrl', function($stateParams, $scope, $community, $http) {
        // 2 lignes ajoutées manuellement dans client/index.html... faudra trouver comment les mettre auto
        //<script src="https://code.highcharts.com/highcharts.js"></script>
        //<script src="https://code.highcharts.com/modules/exporting.js"></script>

        // arranger le début et la fin de l'année
        // commenter
        // traduire

        var viewId = $stateParams.viewId;

        var dtdebut = Date.UTC(2015,0,1), // fonction "début de l'année"
            dtfin = Date.UTC(2016,5,24); // fonction "fin de l'année"

        var scaffoldsAll = new Array();
        $community.getObject(viewId, function(view) {
            $scope.view = view;
            $community.enter($scope.view.communityId);
            $scope.community = $community.getCommunityData();
            
            $scope.communityMembers = $community.getMembersArray();
            $community.refreshMembers(function(){
            $scope.scaffolds = $community.getScaffolds();
                $community.refreshScaffolds(function() {
                    scaffoldsAll = $scope.scaffolds;
                    refresh();
                });
            });
        });

        var refresh = function() {
            $http.post('/api/contributions/' + $scope.view.communityId + '/search', {
                query: {
                    communityId: $scope.view.communityId,
                    /*viewIds: [$scope.view._id],*/
                    pagesize: 1000
                }
            }).success(function(contributions) {
                var data = processData(contributions);
                refreshViewYear(data.slice(0, 2));
                refreshViewWeek(data.slice(2, 4));
                refreshViewAuthors(data.slice(4, 5));
            });
        };

        var processData = function(notes) {
            var dataAll = new Array();
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
            var day = 86400000
            for (var i = dtdebut; i <= dtfin; i+=day){
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
                dataAll[parseInt((currentdtUTC-dtdebut)/day, 10)][1]++;
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
                    dataUser[parseInt((currentdtUTC-dtdebut)/day, 10)][1]++;
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
        };

        var refreshViewYear = function(data) {
            $('#notesyear').highcharts({
                chart: {zoomType: 'x'},
                credits: {enabled: false},
                title: {text: 'Participation : nombre de notes cette année'}, // traduire
                subtitle: { text: document.ontouchstart === undefined ? 'Sélectionnez une plage pour zoomer' : 'Pincez pour zoomer'}, // traduire
                xAxis: {type: 'datetime'},
                yAxis: {title: {text: 'Nombre de notes'}}, // traduire
                legend: {enabled: true},
                rangeSelector : {
                    selected : 4           
                },series: [{
                    type: 'line',
                    name: 'Nombre de notes rédigées par la communauté', // traduire
                    data: data[0]
                },{
                    type: 'line',
                    name: 'Nombre de notes rédigées par ' + $scope.community.author.getName(), // traduire
                    data: data[1]
                }]
            });
        };            

        var refreshViewWeek = function(data) {
            $('#notesweek').highcharts({
                title: {text: 'Participation : nombre de notes par jour de la semaine'}, // traduire
                credits: {enabled: false},
                xAxis: {categories: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']}, // traduire
                yAxis: {title: {text: 'Nombre de notes'}}, // traduire
                legend: {enabled: true},
                series: [{
                    type: 'line',
                    name: 'Nombre de notes rédigées par la communauté', // traduire
                    data: data[0]
                },{
                    type: 'line',
                    name: 'Nombre de notes rédigées par ' + $scope.community.author.getName(), // traduire
                    data: data[1]
                }]
            });
        };

        var refreshViewScaffolds = function(data) {
            var supportUsed = new Array();
            $scope.scaffolds.forEach(function(scaffold){
                scaffold.supports.forEach(function(support){
                    supportUsed.push({name: support._to.title, y : (typeof data[support._to.title] !== 'undefined' ? data[support._to.title] : 0)});
                });

                $('#scaffoldsused').append('<div></div>').highcharts({
                    chart: {
                        plotBackgroundColor: null,
                        plotBorderWidth: null,
                        plotShadow: false,
                        type: 'pie'
                    },
                    credits: {enabled: false},
                    title: {
                        text: "Utilisation de l'échafaudage « " + scaffold.title + " »" // traduire
                    },
                    plotOptions: {
                        pie: {
                            allowPointSelect: true,
                            cursor: 'pointer',
                            dataLabels: {
                                enabled: true,
                                format: '<b>{point.name}</b>: {point.percentage:.1f} %'
                            },
                            showInLegend: false
                        }
                    },
                    series: [{
                        name: 'Supports',
                        colorByPoint: true,
                        data: supportUsed
                    }]
                });
            });
        };


        var refreshViewAuthors = function(data) {
            data = data[0]
            var writtenByAuthors = new Array();
            var i = 1;
            $scope.communityMembers.forEach(function(author){
                writtenByAuthors.push(
                    {name: ($scope.community.author._id == author._id ? author.getName() : "Membre " + i), // traduire 
                    y : (typeof data[author._id] !== 'undefined' ? data[author._id] : 0),
                    color: ($scope.community.author._id == author._id ? "#7cb5ec" : "#aaa")
                });
            });

            $('#notesauthors').highcharts({
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    type: 'pie'
                },
                credits: {enabled: false},
                title: {
                    text: "Nombre de notes rédigées par auteurs" // traduire
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: false,
                            format: '<b>{point.percentage:.1f} %'
                        },
                        showInLegend: false
                    }
                },
                series: [{
                    name: 'Nombre de notes',
                    colorByPoint: true,
                    data: writtenByAuthors
                }]
            });

        };       

    });