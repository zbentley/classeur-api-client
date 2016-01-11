'use strict';

module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jsdoc: {
            dist: {
                src: ['src/*.js', 'lib/**.js'],
                options: {
                    configure: "doc/jsdoc.json",
                    recurse: true,
                    encoding: "utf8",
                    destination: "doc/generated"
                }
            }
        },
        mochaTest: {
            options: {
                reporter: 'spec',
                // Clear the require cache, since we enable/disable integrations via require.
                clearRequireCache: true,
            },
            unit: {
                options: {
                    require: function() {
                        delete global._ZB_INTEGRATION_TEST;
                    }
                },
                src: ['test/**/*.js']
            },
            integration: {
                options: {
                    require: function() {
                        global._ZB_INTEGRATION_TEST = true;
                    }
                },
                src: ['test/**/*.js']
            }
        }
    });

    grunt.registerTask('default', 'mochaTest:unit');
};