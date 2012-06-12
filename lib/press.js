

var fs 		= require('fs');
var mime 	= require('mime');
var jsmin 	= require('./deps/jsmin').minify;
var cssmin 	= require('./deps/cssmin').minify;


var Press = function(options){
	console.log('--> Initializing Press...');
	this.options = options;
	this.pressCheck();
};


Press.prototype = {

	pressCheck: function(changed_file){
		for (var route in this.options.combine) {
			var files = this.options.combine[route];
			this.press(route, files);
		}
	},

	minFile: function(path){
		var type = mime.lookup(path);
		var data = fs.readFileSync(path, 'UTF-8');

		switch(type){
			case 'text/css': 				return cssmin(data);
			case 'application/javascript': 	return jsmin(data);
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
					this.pressCheck(file);
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


module.exports = Press;
