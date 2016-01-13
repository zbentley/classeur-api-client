'use strict';

function branchDocumentationTasks(packageInfo, target) {
    target = target || packageInfo.version;
    const path = `doc/generated/versions/${target}`;
    return {
        jsdoc: {
            src: ['lib/'],
            options: {
                configure: 'doc/jsdoc.json',
                recurse: true,
                encoding: 'utf8',
                destination: path,
                package: 'package.json',
                template : 'node_modules/ink-docstrap/template',
                readme: 'README.md'
            }
        },
        pages: {
            options: {
                base: 'doc/generated',
                add: true
            },
            src: ['**']
        },
        copy: {
            cwd: `${path}/${packageInfo.name}/${packageInfo.version}`,
            expand: true,
            src: "**",
            dest: path,
        },
        clean: ['doc/placeholder.jsdoc', `${path}/${packageInfo.name}/`],
    };
}

module.exports = function(grunt) {
    const packageInfo = grunt.file.readJSON('package.json');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-touch');
    grunt.loadNpmTasks('grunt-gh-pages');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.initConfig({
        pkg: packageInfo,
        clean: {
          'doc-all': ['doc/generated'],
          'doc-current-version': branchDocumentationTasks(packageInfo).clean,
          'doc-master':  branchDocumentationTasks(packageInfo, 'master').clean,
        },
        touch: {
            'doc-placeholder': {
                src: 'doc/placeholder.jsdoc'
            }
        },
        copy: {
            'doc-master': branchDocumentationTasks(packageInfo, 'master').copy,
            'doc-current-version': branchDocumentationTasks(packageInfo).copy
        },
        jsdoc: {
            master: branchDocumentationTasks(packageInfo, 'master').jsdoc,
            'current-version': branchDocumentationTasks(packageInfo).jsdoc,
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
        'gh-pages': {
            master: branchDocumentationTasks(packageInfo, 'master').pages,
            'current-version': branchDocumentationTasks(packageInfo).pages
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

    grunt.registerTask('doc:index', ['clean:doc-all', 'touch:doc-placeholder', 'jsdoc:index']);
    grunt.registerTask('doc:master', ['doc:index', 'jsdoc:master', 'copy:doc-master', 'clean:doc-master']);
    grunt.registerTask('doc:current-version', ['doc:index', 'jsdoc:current-version', 'copy:doc-current-version', 'clean:doc-current-version']);
    grunt.registerTask('doc:master:push', ['doc:master', 'gh-pages:master']);
    grunt.registerTask('doc:current-version:push', ['doc:current-version', 'gh-pages:current-version']);
    grunt.registerTask('default', 'mochaTest:unit');
};