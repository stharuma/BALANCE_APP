'use strict';

describe('Controller: AttachmentCtrl', function () {

  // load the controller's module
  beforeEach(module('kf6App'));

  var AttachmentCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AttachmentCtrl = $controller('AttachmentCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
