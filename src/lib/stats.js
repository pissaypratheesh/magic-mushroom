// forever start stats.js localConfig.js

// todo -

var isBrowser = (typeof window !== 'undefined'),
	os = isBrowser ? null : require('os' + ''),
	host = isBrowser ? 'browser' : 'x11',
	_ = require('underscore');

// we don't use the service adpter for this, else we'll have an infinite loop of tracking service calls

var instance;

function stats(config) {
	if (instance && !config) {
		return instance;
	}
	if (!(this instanceof stats)) {
		return new stats(config);
	}
	var t = this;


	if (!isBrowser) {

/*
		this.client = new StatsD(_.extend({
			host: env.host,
			port: env.port,
			rate: 1,
			prefix: env.prefix + host + '.'
		}, config));
*/
	}

	this.queue = [];

	if (isBrowser) {
		// flush the queue every 10 seconds
		window.setInterval(function() {
			t.flush();
		}, 10000);

		// and do it once after two seconds, just to get things going
		window.setTimeout(function() {
			t.flush();
		}, 2000);

		// todo - store queue on localStorage as well, and attach it to the queue when browser starts.
	}

	instance = this;

}

stats.prototype.flush = function() {
	if (this.queue.length > 0) {
		var callbacks = _(this.queue).pluck('done');
		var data = _(this.queue).pluck('o');
		this.queue = [];
    console.log(" makinf call with data-->",JSON.stringify(data));
		//heads(request.post(resolve(':stats').proxy)).send(JSON.stringify(data)).end(function(err, res) {
			_.each(callbacks, function(cb) {
				cb('','');
			});
		//});
	}
};

var methods = ['increment', 'decrement', 'gauge', 'timing', 'set', 'unique'];

if (isBrowser) {
	_.reduce(methods, function(proto, method) {
		proto[method] = function(name, value, rate, done) {

			var o = {
				method: method,
				name: name
			};

			if (value) {
				o.value = value;
			}
			if (rate || (rate === 0)) {
				o.rate = rate;
			}

			if (process.env.NODE_ENV === 'development' || Math.random() > 0.95) {
				this.queue.push({
					o: o,
					done: done || function() {}
				});
			}


			if (this.queue.length > 50) {
				this.flush();
			}
		};
		return proto;
	}, stats.prototype);
} else {
	_.reduce(methods, function(proto, method) {
		proto[method] = function(name, value, rate, done) {
			if (method === 'timing' && process.env.NODE_ENV === 'development') {
				console.log(method, _(arguments).without(undefined));
			}
			if (name.match('.fail') && name !== 'services-sessions-get.fail') {
				console.error(_(arguments).without(undefined));
			}

			// if (process.env.NODE_ENV === 'development' || Math.random() > 0.999) {
			//this.client[method].apply(this.client, _([name, value, rate, done]).without(undefined));
			// }



			// this.client[method](name, value, rate, done);
		};
		return proto;
	}, stats.prototype);
}


module.exports = stats;
