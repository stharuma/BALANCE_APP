'use strict';

describe('Controller: SupporteditorCtrl', function () {

  // load the controller's module
  beforeEach(module('kf6App'));

  var SupporteditorCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SupporteditorCtrl = $controller('SupporteditorCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
