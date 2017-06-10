'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');

describe('GET /api/BCommunitys', function() {

  it('should respond with JSON array', function(done) {
    request(app)
      .get('/api/BCommunitys')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        done();
      });
  });
});