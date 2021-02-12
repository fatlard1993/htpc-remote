const { app, staticServer } = require('http-server');

const { rootPath } = require('./htpcRemote');

app.use(
	staticServer(rootPath('src/client/resources')),
	staticServer(rootPath('node_modules/@fortawesome/fontawesome-free')),
	staticServer(rootPath('node_modules/source-sans-pro'))
);

app.use(function(req, res, next){
	next(res.reqType === 'file' ? { code: 404, detail: `Could not find ${req.originalUrl}` } : null);
});

app.use(function(req, res, next){
	if(req.path !== '/' || req.method !== 'GET') return next();

	res.sendPage('htpc-remote');
});

app.use(function(req, res, next){
	if(res.reqType !== 'page') return next();

	res.redirect(307, '/');
});