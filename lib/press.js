var fs = require('fs');
var mime = require('mime');
var uglifyjs = require('uglify-js');
var sqwish = require('sqwish');


var Press = function(options){
	console.log('--> Initializing Press...');
	console.log(__dirname);
	this.options = options;
	this.pressCheck();
};


Press.prototype = {

	pressCheck: function(){
		for (var route in this.options.combine) {
			var files = this.options.combine[route];
			this.press(route, files);
		}
	},

	minFile: function(path){
		var type = mime.lookup(path);
		var data = fs.readFileSync(path, 'UTF-8');

		switch(type){
			case 'text/css': 				return sqwish.minify(data);
			case 'application/javascript': 	return uglifyjs.minify(data, {fromString: true}).code;
			default: 						return data;
		}
	},

	press: function(to, files){
		console.log('\n\nPressing ' + files + ' to ' + to + ' file');
		var content = '';

		files.forEach(function(file){
			console.log('file :' + file);
			
			var path = this.options.directory + file;
			var body = this.minFile(path);

			fs.unwatchFile(path);

			fs.watchFile(path, function(prev, curr){
				if (curr.mtime.getTime() - prev.mtime.getTime()) {
					console.log('Recaching new ' + path + ' file');
					this.pressCheck();
				}
			}.bind(this));

			content += this.minFile(path);
		}.bind(this));

		this.save(this.options.directory + to, content);
	},

	save: function(path, content){
		fs.writeFile(path, content, function(err){
			if (err) throw err;
			console.log(path + ' is saved!');
		});
	}

};

//press(cssfiles).to(dir + '/stylesheets/all.css');
//press(jsfiles).to(dir + '/javascripts/all.js');

module.exports = Press;