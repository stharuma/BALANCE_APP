'use strict';

describe('Controller: BasicStatsCtrl', function () {

  // load the controller's module
  beforeEach(module('kf6App'));

  var BasicStatsCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    BasicStatsCtrl = $controller('BasicStatsCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
