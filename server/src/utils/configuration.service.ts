import { readFileSync } from 'fs'
import { load } from 'js-yaml'

export class ConfigurationService {
	private _configuration: any = {};
	
	private static _instance: ConfigurationService = new ConfigurationService();
	public static get instance(): ConfigurationService {
		return this._instance;
	}

	load( filepath: string, preffix: string = "" ) {
		let loadedConfig = load( readFileSync( filepath, 'utf8' ) );
		
		if( preffix ) {
			this._configuration[preffix] = loadedConfig;
		} else {
			this._configuration = {...this._configuration, ...loadedConfig};
		}
	}

	get( attr: string ): any {
		let attr_path = attr.split('.')

		let v = this._configuration
		for( let a of attr_path )
			if(  v[a] ) v = v[a]
			else return null

		return v
	}
}

export function getConfigValue( attr: string ) {
	return ConfigurationService.instance.get(attr);
}

export function loadConfigFile( filepath: string ) {
	return ConfigurationService.instance.load( filepath );
}
