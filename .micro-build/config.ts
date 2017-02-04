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

const args = [
	'--localaddr', `0.0.0.0:${kcptun.server_port}`,
	'--remoteaddr', `${shadowsocks.server}:${kcptun.server_port}`,
	'--mode', '' + kcptun.mode || 'fast3',
	'--crypt', '' + kcptun.crypt || 'xor',
	'--key', '' + shadowsocks.password,
	'--sndwnd', '' + kcptun.sndwnd,
	'--rcvwnd', '' + kcptun.rcvwnd,
];
if (!kcptun.hasOwnProperty('nocomp') || kcptun.nocomp) {
	args.push('--nocomp');
}

build.forwardPort(kcptun.server_port, 'tcp').publish(kcptun.server_port);
build.startupCommand.apply(build, args);
build.shellCommand('/go/bin/client');
