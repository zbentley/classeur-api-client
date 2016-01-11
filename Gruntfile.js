module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
     mochaTest: {
       unit: {
         options: {
           reporter: 'spec',
           // Clear the require cache, since we enable/disable integrations via require.
           clearRequireCache: true,
           require: function() { delete global._ZB_INTEGRATION_TEST; }
         },
         src: ['test/**/*.js']
       },
       integration: {
         options: {
           reporter: 'spec',
           // Clear the require cache, since we enable/disable integrations via require.
           clearRequireCache: true,
           require: function() { global._ZB_INTEGRATION_TEST = true; }
         },
         src: ['test/**/*.js']
       }
     }
  });

  grunt.registerTask('default', 'mochaTest:unit');
};