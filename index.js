/**
* Compile hogan templates into a js file
*/
var through = require('through');
var os = require('os');
var path = require('path');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var File = gutil.File;
var _ = require('lodash');

module.exports = function(fileName, options) {
    if (!fileName) {
        throw new PluginError('gulp-hogan-compile',  'Missing fileName argument for gulp-hogan-compile');
    }
    options = _.assign({
        newLine: gutil.linefeed,
        wrapper: 'wantering',
        templateOptions: {},
        templateName: function(file) {
            var name = path.basename(file.relative, path.extname(file.relative));
            name = name.replace(/([^\W_]+[^\s\_]*) */g, function(txt){
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            }).replace(/_/g,'');

            return name;
            // return path.basename(file.relative, path.extname(file.relative));
        },
    }, options || {});

    // Fix this
    _.templateSettings.interpolate = /\{\{(.+?)\}\}/gim;
    _.templateSettings.evaluate = /\{\#(.+?)\#\}/gim;

    var buffer = [],
        firstFile = null,
        templateName,
        compiledTemplate,
        jsString;

    function bufferContents(file) {
        if (file.isNull()) {
            return;
        }
        if (file.isStream()) {
            return this.emit('error', new PluginError('gulp-hogan-compile', 'Streaming not supported'));
        }
        if (!firstFile) {
            firstFile = file;
        }
        templateName = options.templateName(file);
        templateContents = _.template(file.contents.toString('utf8'), false, options.templateSettings).source;
        jsString = 'templates[\'' + templateName + '\'] = ' + templateContents + ';';
        buffer.push(jsString);
    }

    function endStream(){
        if (buffer.length === 0) {
            return this.emit('end');
        }
        // Unwrapped
        buffer.unshift("var templates = {};");

        // All wrappers return the templates object
        if (options.wrapper) {
            buffer.push("return templates;");
        }
        // AMD wrapper
        if (options.wrapper === 'amd') {
            buffer.unshift("define(function(require) {");
            buffer.push("})");
        }
        // CommonJS wrapper
        else if (options.wrapper === 'commonjs') {
            buffer.unshift("module.exports = (function() {");
            buffer.push("})();");
        }

        // Window wrapper
        else if (options.wrapper === 'window') {
            buffer.unshift("window['Templates'] = (function() {");
            buffer.push("})();");
        }

        // Wantering wrapper
        else if (options.wrapper === 'wantering') {
            buffer.unshift("var Templates = (function() {");
            buffer.push("})();");
            buffer.push("if (typeof module !== 'undefined') {");
            buffer.push("    module.exports = Templates;");
            buffer.push("};");
        }

        this.emit('data', new File({
            cwd: firstFile.cwd,
            base: firstFile.base,
            path: path.join(firstFile.base, fileName),
            contents: new Buffer(buffer.join(options.newLine))
        }));

        this.emit('end');
    }

    return through(bufferContents, endStream);
};
