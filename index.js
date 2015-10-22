#!/usr/bin/env node

var Promise = require('bluebird');
var pm2 = require('pm2');
var rc = require('rc');
var librato = require('librato-node');

var connect = Promise.promisify(pm2.connect);
var disconnect = Promise.promisify(pm2.disconnect);
var list    = Promise.promisify(pm2.list);

function getProcesses () {
	var details;

	return connect().then(function () {
		return list();
	}).then(function (results) {
		details = results.map(function (item) {
			var uptime = Date.now() - item.pm2_env.pm_uptime;
			return {
				name: item.name,
				status: item.pm2_env.status,
				restarts: item.pm2_env.unstable_restarts,
				memory: item.monit.memory,
				cpu: item.monit.cpu,
				uptime: uptime / 1000
			};
		});
		return disconnect();
	}).then(function () {
		return details;
	});
}

var config = rc('librato-pm2', {
	email: '',
	token: '',
	interval: 10,
	metricPrefix: 'pm2.'
});

if (!config.email || !config.token) {
	console.error('Could not load librato config. Ensure a ~/.librato-pm2rc file exists.');
	process.exit(-1);
}

librato.configure(config);
librato.start();

function update () {

	getProcesses().then(function (results) {
		results.forEach(function (item) {
			var prefix = config.metricPrefix + item.name;
			librato.measure(prefix + '.online',   item.status === 'online');
			librato.measure(prefix + '.restarts', item.restarts);
			librato.measure(prefix + '.memory',   item.memory);
			librato.measure(prefix + '.cpu',      item.cpu);
			librato.measure(prefix + '.uptime',   item.uptime);
		});
		process.stdout.write('.');
	}).catch(console.error);

}

update();

var timer = setInterval(update, (config.interval || 10) * 1000);

var shutdown = function () {
	clearInterval(timer);
	librato.stop();
};

process.on('SIGUSR2', shutdown);
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
