'use strict';

function versionIndexTemplate(path) {
    return {
        options: {
            data: {
                path: path
            }
        },
        files: {
            'doc/generated/tutorials/VersionIndex.md': ['doc/generator/VersionIndex.md.tpl'],
        }
    };
}

function branchDocumentationTasks(packageInfo, target) {
    target = target || packageInfo.version;
    const path = `doc/generated/versions/${target}`;
    return {
        jsdoc: {
            src: ['lib/'],
            options: {
                configure: 'doc/generator/jsdoc.json',
                recurse: true,
                encoding: 'utf8',
                destination: path,
                package: 'package.json',
                template : 'node_modules/ink-docstrap/template',
                readme: 'README.md',
                tutorials: 'doc/generated/tutorials/'
            }
        },
        copy: {
            cwd: `${path}/${packageInfo.name}/${packageInfo.version}`,
            expand: true,
            src: '**',
            dest: path,
        },
        clean: [`${path}/${packageInfo.name}/`],
    };
}

module.exports = function(grunt) {
    const packageInfo = grunt.file.readJSON('package.json');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-gh-pages');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-template');

    grunt.initConfig({
        pkg: packageInfo,
        template: {
            'index-root': versionIndexTemplate('./'),
            'index-version': versionIndexTemplate('../../')
        },
        clean: {
          'doc-all': ['doc/generated'],
          'doc-tutorials': ['doc/generated/tutorials'],
          'doc-current-version': branchDocumentationTasks(packageInfo).clean,
          'doc-master':  branchDocumentationTasks(packageInfo, 'master').clean,
        },
        copy: {
            'doc-master': branchDocumentationTasks(packageInfo, 'master').copy,
            'doc-current-version': branchDocumentationTasks(packageInfo).copy,
            'doc-index': {
                cwd: 'doc/tutorials',
                expand: true,
                src: ['*.md', 'tutorials.json'],
                dest: 'doc/generated/tutorials/',
            }
        },
        jsdoc: {
            master: branchDocumentationTasks(packageInfo, 'master').jsdoc,
            'current-version': branchDocumentationTasks(packageInfo).jsdoc,
            index: {
                src: ['doc/generator/index-placeholder.jsdoc'],
                options: {
                    configure: 'doc/generator/jsdoc.json',
                    recurse: false,
                    encoding: 'utf8',
                    destination: 'doc/generated',
                    template : 'node_modules/ink-docstrap/template',
                    readme: 'doc/generated/tutorials/VersionIndex.md',
                    tutorials: 'doc/generated/tutorials/'
                }
            }
        },
        'gh-pages': {
            options: {
                base: 'doc/generated',
                add: true,
                message: `Generated at NPM version ${packageInfo.version} on ${grunt.template.today('yyyy-mm-dd')}`,
            },
            src: ['**']
        },
        mochaTest: {
            options: {
                reporter: 'spec',
                // Clear the require cache, since we enable/disable integrations via require.
                clearRequireCache: true,
            },
            unit: {
                options: {
                    require: () => {
                        delete global._ZB_INTEGRATION_TEST;
                    }
                },
                src: ['test/**/*.js']
            },
            integration: {
                options: {
                    require: () => {
                        global._ZB_INTEGRATION_TEST = true;
                    }
                },
                src: ['test/**/*.js']
            }
        }
    });

    grunt.registerTask('doc:index', [
        // Remove all generated files.
        'clean:doc-all',
        // Render the version index template for the root (no relative links).
        // This has the beneficial side effect of creating the doc target
        // directory, `doc/generated` and `doc/generated/tutorials`.
        'template:index-root',
        // Copy the tutorials and their config file into `doc/generated/tutorials`.
        'copy:doc-index',
        // Generate documentation for an empty project (`index-empty.jsdoc`)
        // using the version index template as the README. This makes a decent
        // landing page without having to manually write any markup or menus.
        // Laziness trumps elegance.
        'jsdoc:index',
        // Re-render the version index template (it's no longer needed for the
        // landing page generation) with relative links that can be used by the
        // per-version documentation.
        'template:index-version'
    ]);
    grunt.registerTask('doc:master', [
        'doc:index',
        'jsdoc:master',
        'copy:doc-master',
        'clean:doc-master',
        'clean:doc-tutorials'
    ]);
    grunt.registerTask('doc:current-version', [
        'doc:index',
        'jsdoc:current-version',
        'copy:doc-current-version',
        'clean:doc-current-version',
        'clean:doc-tutorials'
    ]);
    grunt.registerTask('doc:master:push', [
        'doc:master',
        'gh-pages',
        'clean:doc-all'
    ]);
    grunt.registerTask('doc:current-version:push', [
        'doc:current-version',
        'gh-pages',
        'clean:doc-all'
    ]);
    grunt.registerTask('test:unit', 'mochaTest:unit');
    grunt.registerTask('test:integration', 'mochaTest:integration');
};