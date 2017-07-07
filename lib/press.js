'use strict';

const fs = require('fs');
const mime = require('mime');
const sass = require('node-sass');
const uglifyjs = require('uglify-js');
const sqwish = require('sqwish');
const Press = function(){};

function compile(minify) {
    return {
        sass: function(str){
            let css = sass.renderSync({
                data: str
            }).css.toString();
            return minify
                ? sqwish.minify(css)
                : css;
        },

        js: function(str){
            return minify
                ? uglifyjs.minify(str, {fromString: true}).code
                : str;
        }
    };
}

function run(files, from, to, minify) {
    let content = files.map(file => {
        let path = __dirname + file;
        fs.unwatchFile(path);
        fs.watchFile(path, function(prev, curr){
            if (curr.mtime.getTime() - prev.mtime.getTime()) {
                run(files, from, to);
            }
        });
        return fs.readFileSync(path, 'UTF-8');
    }).join('\n');

    if (!from) {
        from = mime.extension(mime.lookup(to));
    }

    fs.writeFileSync(__dirname + to, compile(minify)[from](content));
    console.log(to + ' is saved!');
}


Press.prototype = {

    minify: function() {
        this._minify = true;
        return this;
    },

    files: function(files) {
        this._files = files;
        return this;
    },

    from: function(from) {
        this._from = from;
        return this;
    },

    to: function(to) {
        run(this._files, this._from, to, this._minify);
        this._reset();
    },

    _reset: function() {
        this._files = [];
        this._from = null;
    }
};


module.exports = Press;
