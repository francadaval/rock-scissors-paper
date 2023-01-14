import { initWebServer } from './server'
import * as Log4JS from 'log4js'

import { loadConfigFile, getConfigValue } from './utils/configuration.service'
import { WebSocketsService } from './websockets/websockets.service'
import { SessionManagerService } from './session/sessions-manager.service';
import { DummyUserRepositoryImpl } from './repository/dummy/dummy-user.repository-impl';
import { DummyUserSessionRepositoryImpl } from './repository/dummy/dummy-user-session.repository-impl';

loadConfigFile( 'config.yml' );

Log4JS.configure({
	appenders: { pipeline: { type: 'file', filename: getConfigValue('log.files_path') + 'rock-paper-scissors.' + (new Date().getTime()) +'.log' } },
	categories: { default: { appenders: ['pipeline'], level: getConfigValue('log.level') || 'trace' } }
});

let logger = Log4JS.getLogger("Main");

logger.info("Initialize Web Server");
initWebServer();

let webSocketServer = new WebSocketsService(getConfigValue('ws.port'));

let sessionManagerService = new SessionManagerService(
	new DummyUserRepositoryImpl(),
	new DummyUserSessionRepositoryImpl(),
	webSocketServer
);
