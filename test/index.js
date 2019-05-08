const rimraf = require('rimraf')
// let assert = require('assert');
const equal = require('assert-dir-equal')
const Metalsmith = require('metalsmith')
const layouts = require('metalsmith-layouts')
const debug = require('metalsmith-debug')
const paths = require('metalsmith-paths')
const parse = require('..')

describe('metalsmith-markdown-parse', function() {
  before(function(done) {
    rimraf('test/fixtures/*/build', done)
  })

  it('should interpret a basic workflow', function(done) {
    Metalsmith('test/fixtures/basic')
      .metadata({ organisations: [] })
      .use(
        parse({
          title: 'Workflow',
          replace: '<a href="$start">Start</a>',
        })
      )
      .use(paths())
      .use(debug())
      .use(layouts({ default: 'default.pug', directory: '../../layouts' }))
      .build(function(err) {
        if (err) return done(err)
        equal('test/fixtures/basic/build', 'test/fixtures/basic/expected')
        done()
      })
  })
  // 
  // it('should deal with quotes properly', function(done) {
  //   Metalsmith('test/fixtures/quotes')
  //     .metadata({ organisations: [] })
  //     .use(
  //       parse({
  //         title: 'Workflow',
  //         replace: '<a href="$start">Start</a>',
  //       })
  //     )
  //     .use(paths())
  //     .use(layouts({ default: 'default.pug', directory: '../../layouts' }))
  //     .build(function(err) {
  //       if (err) return done(err)
  //       equal('test/fixtures/quotes/build', 'test/fixtures/quotes/expected')
  //       done()
  //     })
  // })
  //
  // it('should deal with a complex example', function(done) {
  //   Metalsmith('test/fixtures/complex')
  //     .metadata({ organisations: [] })
  //     .use(
  //       parse({
  //         title: 'Workflow',
  //         replace: '<a href="$start">Start</a>',
  //       })
  //     )
  //     .use(paths())
  //     .use(layouts({ default: 'default.pug', directory: '../../layouts' }))
  //     .build(function(err) {
  //       if (err) return done(err)
  //       equal('test/fixtures/complex/build', 'test/fixtures/complex/expected')
  //       done()
  //     })
  // })
})
