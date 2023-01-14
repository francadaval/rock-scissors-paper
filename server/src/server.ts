const express = require('express')

import { getConfigValue } from './utils/configuration.service'
import { getLogger } from 'log4js'

export function initWebServer() {
	const port = getConfigValue( "web.port" )
	const server = express()
	const logger = getLogger("WebServer")

	server.use(express.static('dist/rock-paper-scissors'))
	server.listen(port, () => {
		logger.info("Listening on port " + port)
	})
}
