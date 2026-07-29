//#region src/common.js
var filterNames = [
	"更新",
	"邀请",
	"客户端",
	"感谢",
	"重置",
	"剩余",
	"到期",
	"导航",
	"网址"
];
/**
* 过滤代理节点，移除包含特定关键词的节点
* @param {Object} config - Clash 配置对象
* @returns {Object} 修改后的配置
*/
function filterNodes(config) {
	config.proxies = (config.proxies || []).filter((p) => {
		if ("127.0.0.1" == (p.server ? p.server : "127.0.0.1")) return false;
		return !filterNames.some((keyword) => p.name.includes(keyword));
	});
	return config;
}
/**
* 获取自动选择分组名称
*/
function getProxyGroupName() {
	return "自动选择";
}
/**
* 获取所有 proxy-provider 名称
* @param {Object} config - Clash 配置对象
* @returns {string[]} proxy-provider 键名数组
*/
function getAllProxyProviders(config) {
	return Object.keys(config["proxy-providers"] || {});
}
/**
* 设置代理分组
* @param {Object} config - Clash 配置对象
* @returns {Object} 修改后的配置
*/
function setupProxyGroups(config) {
	const proxyGroupName = getProxyGroupName();
	const proxies = (config.proxies || []).map((p) => p.name);
	const providerNames = getAllProxyProviders(config);
	config["proxy-groups"] = [
		{
			name: "手动选择",
			type: "select",
			proxies: [
				proxyGroupName,
				...proxies,
				"负载均衡",
				"fallback",
				"REJECT",
				"DIRECT"
			],
			...providerNames.length && { use: providerNames }
		},
		{
			name: proxyGroupName,
			type: "url-test",
			proxies,
			url: testUrl,
			interval: 86400,
			...providerNames.length && { use: providerNames }
		},
		{
			name: "负载均衡",
			type: "load-balance",
			proxies,
			url: testUrl,
			interval: 86400,
			...providerNames.length && { use: providerNames }
		},
		{
			name: "fallback",
			type: "fallback",
			proxies,
			url: testUrl,
			interval: 86400,
			...providerNames.length && { use: providerNames }
		},
		{
			name: "GLOBAL",
			type: "select",
			proxies: [
				proxyGroupName,
				...proxies,
				"负载均衡",
				"fallback",
				"DIRECT"
			],
			...providerNames.length && { use: providerNames }
		}
	];
	return config;
}
/**
* 设置网络设置（TUN、DNS、嗅探等）
* @param {Object} config - Clash 配置对象
* @returns {Object} 修改后的配置
*/
function setupNetworkSettings(config) {
	config["ipv6"] = true;
	config["find-process-mode"] = "strict";
	config["global-client-fingerprint"] = "chrome";
	config.tun = {
		enable: true,
		stack: "mixed",
		"dns-hijack": ["any:53"],
		"auto-route": true,
		"auto-detect-interface": true
	};
	config.dns = {
		enable: true,
		listen: "127.0.0.1:1053",
		ipv6: true,
		"enhanced-mode": "fake-ip",
		"fake-ip-range": "198.18.0.1/16",
		"fake-ip-filter": [
			"*.lan",
			"*.local",
			"*.localhost",
			"dns.msftncsi.com",
			"www.msftncsi.com",
			"www.msftconnecttest.com",
			"+.alipay.com",
			"+.alipayobjects.com",
			"+.alipaysec.com",
			"+.taobao.com",
			"+.tmall.com",
			"+.alicdn.com",
			"+.aliyun.com",
			"+.weixin.qq.com",
			"+.qq.com",
			"+.163.com",
			"+.126.net",
			"+.jd.com"
		],
		nameserver: [
			"https://dns.google/dns-query",
			"https://cloudflare-dns.com/dns-query",
			"https://dns.quad9.net/dns-query"
		],
		fallback: ["https://dns.alidns.com/dns-query", "https://doh.pub/dns-query"],
		"fallback-filter": {
			geoip: true,
			ipcidr: ["240.0.0.0/4"]
		},
		"default-nameserver": ["8.8.8.8", "1.1.1.1"]
	};
	config["sniffer"] = {
		enable: true,
		"force-dns-mapping": true,
		"parse-pure-ip": true,
		"skip-domain": ["+.lan", "+.local"],
		"sniff": {
			TLS: { ports: [443] },
			HTTP: { ports: [80, 8080] },
			QUIC: { ports: [443] }
		}
	};
	config["profile"] = {
		"store-selected": true,
		"store-fake-ip": true
	};
	config["external-controller"] = "0.0.0.0:9090";
	config["log-level"] = "warning";
	config["keep-alive-interval"] = 30;
	config["max-connection-idle-time"] = 120;
	return config;
}
/**
* 设置基础配置
* @param {Object} config - Clash 配置对象
* @returns {Object} 修改后的配置
*/
function setupBaseConfig(config) {
	config["ipv6"] = true;
	config["find-process-mode"] = "strict";
	config["global-client-fingerprint"] = "chrome";
	config["external-controller"] = "0.0.0.0:9090";
	config["log-level"] = "warning";
	config["keep-alive-interval"] = 30;
	config["max-connection-idle-time"] = 120;
	return config;
}
/**
* 设置 profile 配置
* @param {Object} config - Clash 配置对象
* @returns {Object} 修改后的配置
*/
function setupProfile(config) {
	config["profile"] = {
		"store-selected": true,
		"store-fake-ip": true
	};
	return config;
}
/**
* 在 rules 最前面添加 RULE-SET 规则
* @param {Object} config - Clash 配置对象
* @returns {Object} 修改后的配置
*/
function addRuleProviders(config) {
	const proxyGroupName = getProxyGroupName();
	let ruleSets = {};
	ruleSets["reject"] = {
		"type": "http",
		"action": "REJECT",
		"behavior": "domain",
		"url": "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/reject.txt",
		"interval": 86400
	};
	ruleSets["gemini"] = {
		"type": "http",
		"behavior": "classical",
		"url": "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/BardAI/BardAI.yaml",
		"interval": 86400
	};
	ruleSets["openai"] = {
		"type": "http",
		"behavior": "classical",
		"url": "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/OpenAI/OpenAI.yaml",
		"interval": 86400
	};
	ruleSets["telegram"] = {
		"type": "http",
		"behavior": "classical",
		"url": "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Telegram/Telegram_No_Resolve.yaml",
		"interval": 86400
	};
	ruleSets["google"] = {
		"type": "http",
		"behavior": "classical",
		"url": "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Google/Google_No_Resolve.yaml",
		"interval": 86400
	};
	ruleSets["china"] = {
		"type": "http",
		"action": "DIRECT",
		"behavior": "classical",
		"url": "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/ChinaMax/ChinaMax_Classical_No_IPv6_No_Resolve.yaml",
		"interval": 86400
	};
	ruleSets["self"] = {
		"type": "http",
		"behavior": "classical",
		"url": "https://cdn.jsdelivr.net/gh/Sharply-lang/clash-rule@master/rule-providers/self.yaml",
		"interval": 86400
	};
	ruleSets["meta"] = {
		"type": "http",
		"behavior": "classical",
		"url": "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Facebook/Facebook.yaml",
		"interval": 86400
	};
	config["rule-providers"] = config["rule-providers"] || {};
	for (let name of Object.keys(ruleSets)) {
		let v = ruleSets[name];
		let action = v["action"] ? v["action"] : proxyGroupName;
		delete v["action"];
		config["rule-providers"][name] = v;
		config["rules"].unshift(`RULE-SET,${name},${action}`);
	}
	return config;
}
/**
* 设置基础规则（两个文件共用）
* @param {Object} config - Clash 配置对象
* @returns {Object} 修改后的配置
*/
function setupCommonRules(config) {
	const proxyGroupName = getProxyGroupName();
	config.rules = [
		"DOMAIN-SUFFIX,google.com," + proxyGroupName,
		"DOMAIN-SUFFIX,google.com.hk," + proxyGroupName,
		"DOMAIN-SUFFIX,google.com.sg," + proxyGroupName,
		"DOMAIN-SUFFIX,google.co.jp," + proxyGroupName,
		"DOMAIN-SUFFIX,google.co.kr," + proxyGroupName,
		"DOMAIN-SUFFIX,googleapis.com," + proxyGroupName,
		"DOMAIN-SUFFIX,gstatic.com," + proxyGroupName,
		"DOMAIN-SUFFIX,youtube.com," + proxyGroupName,
		"DOMAIN-SUFFIX,youtu.be," + proxyGroupName,
		"DOMAIN-SUFFIX,gmail.com," + proxyGroupName,
		"DOMAIN-SUFFIX,googleusercontent.com," + proxyGroupName,
		"DOMAIN-SUFFIX,telegram.org," + proxyGroupName,
		"DOMAIN-SUFFIX,t.me," + proxyGroupName,
		"DOMAIN,web.telegram.org," + proxyGroupName,
		"DOMAIN,desktop.telegram.org," + proxyGroupName,
		"DOMAIN,core.telegram.org," + proxyGroupName,
		"DOMAIN,updates.telegram.org," + proxyGroupName,
		"DOMAIN-KEYWORD,telegram," + proxyGroupName,
		"IP-CIDR,149.154.160.0/20," + proxyGroupName,
		"IP-CIDR,91.108.4.0/22," + proxyGroupName,
		"IP-CIDR,91.108.8.0/22," + proxyGroupName,
		"IP-CIDR,91.108.12.0/22," + proxyGroupName,
		"IP-CIDR,91.108.16.0/22," + proxyGroupName,
		"IP-CIDR,91.108.20.0/22," + proxyGroupName,
		"IP-CIDR,91.108.56.0/22," + proxyGroupName,
		"DOMAIN-SUFFIX,openai.com," + proxyGroupName,
		"DOMAIN-KEYWORD,openai," + proxyGroupName,
		"DOMAIN-KEYWORD,oaidalleapiprodscus," + proxyGroupName,
		"DOMAIN-SUFFIX,anthropic.com," + proxyGroupName,
		"DOMAIN-SUFFIX,claude.ai," + proxyGroupName,
		"DOMAIN-KEYWORD,anthropic," + proxyGroupName,
		"DOMAIN-SUFFIX,whatsapp.com," + proxyGroupName,
		"DOMAIN-SUFFIX,whatsapp.net," + proxyGroupName,
		"DOMAIN,web.whatsapp.com," + proxyGroupName,
		"DOMAIN,media.whatsapp.com," + proxyGroupName,
		"DOMAIN,static.whatsapp.net," + proxyGroupName,
		"DOMAIN-KEYWORD,whatsapp," + proxyGroupName,
		"DOMAIN-SUFFIX,facebook.com," + proxyGroupName,
		"DOMAIN-SUFFIX,fb.com," + proxyGroupName,
		"DOMAIN-SUFFIX,fbcdn.net," + proxyGroupName,
		"DOMAIN-SUFFIX,fb.watch," + proxyGroupName,
		"DOMAIN-SUFFIX,facebook.net," + proxyGroupName,
		"DOMAIN-SUFFIX,fbsbx.com," + proxyGroupName,
		"DOMAIN-SUFFIX,meta.com," + proxyGroupName,
		"DOMAIN-SUFFIX,instagram.com," + proxyGroupName,
		"DOMAIN-SUFFIX,threads.net," + proxyGroupName,
		"DOMAIN-KEYWORD,facebook," + proxyGroupName,
		"DOMAIN-KEYWORD,instagram," + proxyGroupName,
		"DOMAIN-SUFFIX,github.com," + proxyGroupName,
		"DOMAIN-SUFFIX,github.io," + proxyGroupName,
		"DOMAIN-SUFFIX,githubapp.com," + proxyGroupName,
		"DOMAIN-SUFFIX,githubusercontent.com," + proxyGroupName,
		"DOMAIN-SUFFIX,githubassets.com," + proxyGroupName,
		"DOMAIN,gist.github.com," + proxyGroupName,
		"DOMAIN,raw.githubusercontent.com," + proxyGroupName,
		"DOMAIN,api.github.com," + proxyGroupName,
		"DOMAIN-SUFFIX,alipay.com,DIRECT",
		"DOMAIN-SUFFIX,alipayobjects.com,DIRECT",
		"DOMAIN-SUFFIX,alipaysec.com,DIRECT",
		"DOMAIN-SUFFIX,alipayun.com,DIRECT",
		"DOMAIN-SUFFIX,alipaycloud.com,DIRECT",
		"DOMAIN-SUFFIX,antfin.com,DIRECT",
		"DOMAIN-SUFFIX,antgroup.com,DIRECT",
		"DOMAIN-SUFFIX,alicdn.com,DIRECT",
		"DOMAIN-SUFFIX,aliyun.com,DIRECT",
		"DOMAIN-SUFFIX,taobao.com,DIRECT",
		"DOMAIN-SUFFIX,tmall.com,DIRECT",
		"DOMAIN-SUFFIX,tmall.hk,DIRECT",
		"DOMAIN-SUFFIX,1688.com,DIRECT",
		"DOMAIN-SUFFIX,mmstat.com,DIRECT",
		"DOMAIN-SUFFIX,cn,DIRECT",
		"DOMAIN-KEYWORD,-cn,DIRECT",
		"GEOIP,CN,DIRECT,no-resolve",
		"MATCH,手动选择"
	];
	return config;
}
//#endregion
//#region src/clash-overwrite.js
function main(config) {
	config = setupCommonRules(config);
	config = filterNodes(config);
	config = setupProxyGroups(config);
	config = setupBaseConfig(config);
	config = setupProfile(config);
	config = setupNetworkSettings(config);
	config = addRuleProviders(config);
	return config;
}
//#endregion
