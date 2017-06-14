'use strict';

describe('Controller: IdeaGrowthCtrl', function () {

    // load the controller's module
    beforeEach(module('kf6App'));

    var IdeaGrowthCtrl, scope;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        IdeaGrowthCtrl = $controller('IdeaGrowthCtrl', {
            $scope: scope
        });
    }));

    it('should ...', function () {
        expect(1).toEqual(1);
    });
});