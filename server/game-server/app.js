var pomelo = require('pomelo');
var areaService = require('./app/services/areaService');
var instanceManager = require('./app/services/instanceManager');
var Scene = require('./app/domain/area/scene');
var InstancePool = require('./app/domain/area/instancePool');
var dataApi = require('./app/util/dataApi');
var routeUtil = require('./app/util/routeUtil');
var playerFilter = require('./app/servers/area/filter/playerFilter');
var ChatService = require('./app/services/chatService');
var MarketService = require('./app/services/marketService');
var federationService = require('./app/services/federationService');
var GuildService = require('./app/services/guildService');
var fightService = require('./app/services/fightService');
var sync = require('pomelo-sync-plugin');

var AreaManager = require('./app/domain/area/areaManager');


//var masterhaPlugin = require('pomelo-masterha-plugin');
//process.argv.push('mode=stand-alone');

/**
 * Init app for client
 */
var app = pomelo.createApp();
app.set('name', 'lord of pomelo');

// configure for global
// app.configure('production|development', function() {

app.configure('production', function() {
	app.before(pomelo.filters.toobusy());
	// app.rpcFilter(pomelo.rpcFilters.rpcLog());
	app.enable('systemMonitor');
	// require('./app/util/httpServer');

	if (typeof app.registerAdmin === 'function') {
		// var sceneInfo = require('./app/modules/sceneInfo');
		var onlineUser = require('./app/modules/onlineUser');
		// app.registerAdmin(sceneInfo, {
		// 	app: app
		// });
		app.registerAdmin(onlineUser, {
			app: app
		});
	}
	//Set areasIdMap, a map from area id to serverId.
	if (app.serverType !== 'master') {
		var areas = app.get('servers').area;
		var areaIdMap = {};
		var areaData;
		for (var id in areas) {
			areaData=areas[id];
			if (!areaData.instance) {
				areaIdMap[areaData.area] =areaData.id;
			}
			// areaIdMap[areas[id].area] = areas[id].id;
		}
		app.set('areaIdMap', areaIdMap);
	}
	// proxy configures
	app.set('proxyConfig', {
		cacheMsg: true,
		interval: 30,
		lazyConnection: true
	});

	// remote configures
	app.set('remoteConfig', {
		cacheMsg: true,
		interval: 30
	});

	// route configures
	app.route('area', routeUtil.area);
	app.route('connector', routeUtil.connector);

	app.loadConfig('mysql', app.getBase() + '/../shared/config/mysql.json');
	// app.filter(pomelo.filters.timeout());


	// master high availability
	//app.use(masterhaPlugin, {
	//  zookeeper: {
	//    server: '127.0.0.1:2181',
	//    path: '/pomelo/master'
	//  }
	//});

});

// Configure for auth server
app.configure('production|development', 'auth', function() {
	// load session congfigures
	app.set('session', require('./config/session.json'));
});

// Configure for area server
app.configure('production|development', 'area', function() {
	// app.filter(pomelo.filters.serial());
	app.before(playerFilter());

	//Load scene server and instance server
	areaService.init();
	var server = app.curServer;
	if (server.areas) {
		if(typeof server.areas==="string"){
			server.areas=JSON.parse(server.areas);
		}

		var areaManager=new AreaManager();
		areaManager.initScenes(server.areas);
		var instancePool=new InstancePool();
		instancePool.init();
		areaManager.setInstancePool(instancePool);
		app.areaManager=areaManager;
		return;
	}

	if (server.instance) {
		var instancePool=new InstancePool();
		instancePool.init();
		app.areaManager = instancePool;
		// areaService.init();
	} else {
		// scene.init(dataApi.area.findById(server.area));
		var areaData=dataApi.area.findById(server.area);
		if(areaData){
			var scene=new Scene(areaData);
			app.areaManager = scene;
		}else{
			logger.error("areaData==null areaId="+server.area);
		}

		/*
		 kill -SIGUSR2 <pid>
		 http://localhost:3272/inspector.html?host=localhost:9999&page=0
		*/
		/*
		// disable webkit-devtools-agent
		var areaId = parseInt(server.area);
		if(areaId === 3) { // area-server-3
		  require('webkit-devtools-agent');
		  var express = require('express');
		  var expressSvr = express.createServer();
		  expressSvr.use(express.static(__dirname + '/devtools_agent_page'));
		  var tmpPort = 3270 + areaId - 1;
		  expressSvr.listen(tmpPort);
		}
		*/
	}

	//Init areaService
	// areaService.init();
});

// Configure database
app.configure('production|development', 'area|auth|connector|master|trade|manager|fight', function() {
	var dbclient = require('./app/dao/mysql/mysql').init(app);
	app.set('dbclient', dbclient);
	// app.load(pomelo.sync, {path:__dirname + '/app/dao/mapping', dbclient: dbclient});
	app.use(sync, {
		sync: {
			path: __dirname + '/app/dao/mapping',
			dbclient: dbclient
		}
	});
});

app.configure('production|development', 'manager', function() {
	var events = pomelo.events;

	app.event.on(events.ADD_SERVERS, instanceManager.addServers);
	app.event.on(events.REMOVE_SERVERS, instanceManager.removeServers);

	app.set('guildService', new GuildService(app));
	fightService.init();
	app.set('chatService', new ChatService(app));
});

app.configure('production|development', 'connector', function() {
	var dictionary = app.components['__dictionary__'];
	var dict = null;
	if (!!dictionary) {
		dict = dictionary.getDict();
	}

	app.set('connectorConfig', {
		connector: pomelo.connectors.hybridconnector,
		heartbeat: 30,
		useDict: true,
		useProtobuf: false,
		disconnectOnTimeout:true,
		setNoDelay:true,
		handshake: function(msg, cb) {
			// console.error("ERROR:connectorConfig handshake:msg="+JSON.stringify(msg));
			cb(null, {});
		}
	});
});

app.configure('production|development', 'gate', function() {
	app.set('connectorConfig', {
		connector: pomelo.connectors.hybridconnector,
		useProtobuf: false
	});
});
// Configure for chat server
app.configure('production|development', 'chat', function() {
	app.set('chatService', new ChatService(app));
});

app.configure('production|development', 'trade', function() {
	app.set('marketService', new MarketService(app));
	federationService.init();
});

app.configure('production|development', 'fight', function() {
	// app.set('marketService', new MarketService(app));
	fightService.init();
});

//start
app.start();

// Uncaught exception handler
process.on('uncaughtException', function(err) {
	console.error(' Caught exception: ' + err.stack);
});



