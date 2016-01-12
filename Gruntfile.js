'use strict';

module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-touch');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
          doc: ['doc/generated'],
          placeholder: ['doc/placeholder.jsdoc']
        },
        touch: {
            src: ['doc/placeholder.jsdoc'],
        },
        jsdoc: {
            main: {
                src: ['lib/'],
                options: {
                    configure: 'doc/jsdoc.json',
                    recurse: true,
                    encoding: 'utf8',
                    destination: 'doc/generated/lib',
                    package: 'package.json',
                    template : 'node_modules/ink-docstrap/template',
                    readme: 'README.md'
                }
            },
            index: {
                src: ['doc/placeholder.jsdoc'],
                options: {
                    configure: 'doc/jsdoc.json',
                    recurse: false,
                    encoding: 'utf8',
                    destination: 'doc/generated',
                    template : 'node_modules/ink-docstrap/template',
                    readme: 'doc/VersionIndex.md'
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

    grunt.registerTask('doc', ['clean:doc', 'touch', 'jsdoc:index', 'jsdoc:main', 'clean:placeholder']);
    grunt.registerTask('default', 'mochaTest:unit');
};