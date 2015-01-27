'use strict';

describe('Controller: ScaffoldeditorCtrl', function () {

  // load the controller's module
  beforeEach(module('kf6App'));

  var ScaffoldeditorCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ScaffoldeditorCtrl = $controller('ScaffoldeditorCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
