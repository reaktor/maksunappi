module.exports = function(grunt) {

  var config = require("./config.json");
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      all: ['Gruntfile.js', 'app.js', 'payment.js', 'providers/*', 'test/**/*.js']
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/unit/*.js']
      }
    },

    casperjs: {
      options: {
        async: {
          parallel: false
        },
        casperjsOptions: ['--ignore-ssl-errors=true']

      },
      files: ['test/functional/*.js']
    },

    express: {
      options: {
        port: config.port,
        server : 'sample/app.js',
        hostname : "localhost"
      }
    }

  });
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-casperjs');
  grunt.loadNpmTasks('grunt-express');
  // Default task(s).
  grunt.registerTask('default', ['jshint', 'mochaTest' ,'functional']);
  grunt.registerTask('functional', ['express-server', 'casperjs']);

};