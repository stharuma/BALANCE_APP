'use strict';

describe('Controller: EvaluationCtrl', function () {

  // load the controller's module
  beforeEach(module('kf6App'));

  var EvaluationCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    EvaluationCtrl = $controller('EvaluationCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
