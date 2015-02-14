var config = require('./config.js')
	express = require('express'),
	routes = require('./routes/routes.js'),
	http = require('http'),
	path = require('path'),
	app = express();
app.use(express.compress());  
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('hogan-express'));
app.set('view engine', 'html');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}
//Server side pages
app.get('/resume/pdf', routes.resume_pdf);
app.get('/resume/html', routes.resume_html);
app.get('/resume/json', routes.api_resume);
//API calls
app.get('/api/header', routes.api_header);
app.get('/api/resume', routes.api_resume);
app.get('/api/projects', routes.api_projects);
app.get('/api/project/:project', routes.api_project);
app.post('/api/contact', routes.api_contact);
//Send everything else to Angular app
app.all('*', routes.index);
//Run server
http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});