'use strict';

describe('Controller: ScaffoldCtrl', function () {

  // load the controller's module
  beforeEach(module('kf6App'));

  var ScaffoldCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ScaffoldCtrl = $controller('ScaffoldCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
