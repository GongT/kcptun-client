import {MicroBuildHelper} from "./x/microbuild-helper";
import {MicroBuildConfig, ELabelNames, EPlugins} from "./x/microbuild-config";
import {JsonEnv} from "../.jsonenv/_current_result";
declare const build: MicroBuildConfig;
declare const helper: MicroBuildHelper;
/*
 +==================================+
 | <**DON'T EDIT ABOVE THIS LINE**> |
 | THIS IS A PLAIN JAVASCRIPT FILE  |
 |   NOT A TYPESCRIPT OR ES6 FILE   |
 |    ES6 FEATURES NOT AVAILABLE    |
 +==================================+
 */

/* Example config file */

const projectName = 'kcptun-client';

build.baseImage('xtaci/kcptun', 'latest');
build.projectName(projectName);
build.domainName(projectName + '.' + JsonEnv.baseDomainName);

build.isInChina(JsonEnv.gfw.isInChina, JsonEnv.gfw);

build.noDataCopy();
build.disablePlugin(EPlugins.jenv);

if (!JsonEnv.gfw.hasOwnProperty('kcptun')) {
	throw new Error('no kcptun config.');
}
if (!JsonEnv.gfw.hasOwnProperty('shadowsocks')) {
	throw new Error('no shadowsocks config.');
}
const kcptun = JsonEnv.gfw.kcptun;
const shadowsocks = JsonEnv.gfw.shadowsocks;

Object.assign(kcptun, {
	localaddr: `0.0.0.0:${kcptun.RemotePort}`,
	remoteaddr: `${shadowsocks.server}:${kcptun.RemotePort}`,
	key: `${shadowsocks.password}`,
});

build.appendDockerFileContent('COPY ./config.json /data/config.json');

build.forwardPort(parseInt(kcptun.RemotePort), 'tcp').publish(parseInt(kcptun.RemotePort));
build.startupCommand('-c', './config.json');
build.shellCommand('/go/bin/client');

build.onConfig(() => {
	const configJson = helper.createTextFile(JSON.stringify(kcptun, null, 4));
	configJson.save('./config.json');
});
