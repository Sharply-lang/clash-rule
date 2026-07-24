
function main(config) {
    const filterNames = ['更新', '邀请', '客户端', '一元', 'yiyuanjichang', '感谢', '重置', '剩余', '到期', '导航', '网址'];

    // ===== 本地节点名称列表 =====
    const localProxies = config.proxies
        .map((p) => p.name)
        .filter(name => !filterNames.some(keyword => name.includes(keyword)));

    // 自动选择代理 分组名称
    const proxyGroupName = "自动选择";

    /*
     * +---------------------------------------------------------+
     * | proxy-group设置                                         |
     * +---------------------------------------------------------+
    */
    config["proxy-groups"] = [];

    config["proxy-groups"].push({
        name: "手动选择",
        type: "select",
        proxies: [proxyGroupName, ...localProxies, "负载均衡", "fallback", "REJECT", "DIRECT"],
    });
    config["proxy-groups"].push({
        name: proxyGroupName,
        type: "url-test",
        proxies: localProxies,
        url: "http://maps.googleapis.com/maps/api/mapsjs/gen_204",
        interval: 86400,
    });
    config["proxy-groups"].push({
        name: "负载均衡",
        type: "load-balance",
        proxies: localProxies,
        url: "http://maps.googleapis.com/maps/api/mapsjs/gen_204",
        interval: 86400,
    });
    config["proxy-groups"].push({
        name: "fallback",
        type: "fallback",
        proxies: localProxies,
        url: "http://maps.googleapis.com/maps/api/mapsjs/gen_204",
        interval: 86400,
    });
    config["proxy-groups"].push({
        name: "GLOBAL",
        type: "select",
        proxies: [proxyGroupName, ...localProxies, "负载均衡", "fallback", "DIRECT"],
    });

    /*
     * +---------------------------------------------------------+
     * | rule-providers                                         |
     * +---------------------------------------------------------+
    */
    config["rule-providers"] = config["rule-providers"] || {};
    config["rule-providers"]["reject"] = {
        "type": "http",
        "behavior": "domain",
        "url": "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/reject.txt",
        "path": "./ruleset/reject.yaml",
        "interval": 86400
    };
    config["rule-providers"]["gemini"] = {
        "type": "http",
        "behavior": "classical",
        "url": "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/BardAI/BardAI.yaml",
        "path": "./ruleset/gemini.yaml",
        "interval": 86400
    };
    config["rule-providers"]["openai"] = {
        "type": "http",
        "behavior": "classical",
        "url": "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/OpenAI/OpenAI.yaml",
        "path": "./ruleset/openai.yaml",
        "interval": 86400
    };
    config["rule-providers"]["telegram"] = {
        "type": "http",
        "behavior": "classical",
        "url": "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Telegram/Telegram_No_Resolve.yaml",
        "path": "./ruleset/telegram.yaml",
        "interval": 86400
    };
    config["rule-providers"]["china"] = {
        "type": "http",
        "behavior": "classical",
        "url": "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/ChinaMax/ChinaMax_Classical_No_IPv6_No_Resolve.yaml",
        "path": "./ruleset/china.yaml",
        "interval": 86400
    };
    config["rule-providers"]["self"] = {
        "type": "http",
        "behavior": "classical",
        "url": "https://cdn.jsdelivr.net/gh/Sharply-lang/clash-rule@master/rule-providers/self.yaml",
        "path": "./ruleset/china.yaml",
        "interval": 86400
    };


    /*
     * +---------------------------------------------------------+
     * | 覆写规则(黑名单模式:只有命中规则的网络流量，才使用代理) |
     * +---------------------------------------------------------+
    */
    config.rules = [
        // -- WhatsApp --
        "DOMAIN-SUFFIX,whatsapp.com," + proxyGroupName,
        "DOMAIN-SUFFIX,whatsapp.net," + proxyGroupName,
        "DOMAIN,web.whatsapp.com," + proxyGroupName,
        "DOMAIN,media.whatsapp.com," + proxyGroupName,
        "DOMAIN,static.whatsapp.net," + proxyGroupName,
        "DOMAIN-KEYWORD,whatsapp," + proxyGroupName,


        // -- Facebook / Meta --
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

        // -- GitHub --
        "DOMAIN-SUFFIX,github.com," + proxyGroupName,
        "DOMAIN-SUFFIX,github.io," + proxyGroupName,
        "DOMAIN-SUFFIX,githubapp.com," + proxyGroupName,
        "DOMAIN-SUFFIX,githubusercontent.com," + proxyGroupName,
        "DOMAIN-SUFFIX,githubassets.com," + proxyGroupName,
        "DOMAIN,gist.github.com," + proxyGroupName,
        "DOMAIN,raw.githubusercontent.com," + proxyGroupName,
        "DOMAIN,api.github.com," + proxyGroupName,

        "RULE-SET,reject,REJECT", // 广告
        "RULE-SET,gemini," + proxyGroupName,
        "RULE-SET,openai," + proxyGroupName,
        "RULE-SET,telegram," + proxyGroupName,
        "RULE-SET,self," + proxyGroupName,
        "RULE-SET,china,DIRECT",

        // 国内
        'DOMAIN-SUFFIX,cn,DIRECT',
        'DOMAIN-KEYWORD,-cn,DIRECT',
        'GEOIP,CN,DIRECT,no-resolve',

        // -- 全局直连 --
        "MATCH,手动选择",
    ];

    // ===== 基础网络设置 =====
    config["ipv6"] = true;

    // ===== 进程匹配 =====
    config["find-process-mode"] = "strict";

    // ===== TLS 指纹伪装 =====
    config["global-client-fingerprint"] = "chrome";

    // ===== TUN 模式 =====
    config.tun = {
        enable: true,
        stack: "mixed",
        "dns-hijack": ["any:53"],
        "auto-route": true,
        "auto-detect-interface": true,
    };

    // ===== DNS 安全设置 =====
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
        ],
        nameserver: [
            "https://dns.google/dns-query",
            "https://cloudflare-dns.com/dns-query",
            "https://dns.quad9.net/dns-query",
        ],
        fallback: ["https://dns.alidns.com/dns-query", "https://doh.pub/dns-query"],
        "fallback-filter": {
            geoip: true,
            ipcidr: ["240.0.0.0/4"]
        },
        "default-nameserver": ["8.8.8.8", "1.1.1.1"],
    };

    // 嗅探流量，自动识别协议
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

    // 内存节省模式
    config["profile"] = {
        "store-selected": true,   // 记住手动选择的节点
        "store-fake-ip": true     // 持久化 fake-ip 映射
    };

    config["external-controller"] = "0.0.0.0:9090";  // 允许局域网访问面板
    config["log-level"] = "warning";     // 降低日志级别减少 IO
    config["keep-alive-interval"] = 30;  // 心跳间隔（秒）
    config["max-connection-idle-time"] = 120;

    return config;
}
