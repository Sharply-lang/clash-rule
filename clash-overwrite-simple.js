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
    // ===== 覆写规则(黑名单模式:只有命中规则的网络流量，才使用代理) =====
    config.rules = [
        // -- Google 全家桶 --
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

        // -- WhatsApp --
        "DOMAIN-SUFFIX,whatsapp.com," + proxyGroupName,
        "DOMAIN-SUFFIX,whatsapp.net," + proxyGroupName,
        "DOMAIN,web.whatsapp.com," + proxyGroupName,
        "DOMAIN,media.whatsapp.com," + proxyGroupName,
        "DOMAIN,static.whatsapp.net," + proxyGroupName,
        "DOMAIN-KEYWORD,whatsapp," + proxyGroupName,

        // -- Telegram --
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

        // -- OpenAI --
        "DOMAIN-SUFFIX,openai.com," + proxyGroupName,
        "DOMAIN-KEYWORD,openai," + proxyGroupName,
        "DOMAIN-KEYWORD,oaidalleapiprodscus," + proxyGroupName,

        // -- Claude Code / Anthropic --
        "DOMAIN-SUFFIX,anthropic.com," + proxyGroupName,
        "DOMAIN-SUFFIX,claude.ai," + proxyGroupName,
        "DOMAIN-KEYWORD,anthropic," + proxyGroupName,

        // -- GitHub --
        "DOMAIN-SUFFIX,github.com," + proxyGroupName,
        "DOMAIN-SUFFIX,github.io," + proxyGroupName,
        "DOMAIN-SUFFIX,githubapp.com," + proxyGroupName,
        "DOMAIN-SUFFIX,githubusercontent.com," + proxyGroupName,
        "DOMAIN-SUFFIX,githubassets.com," + proxyGroupName,
        "DOMAIN,gist.github.com," + proxyGroupName,
        "DOMAIN,raw.githubusercontent.com," + proxyGroupName,
        "DOMAIN,api.github.com," + proxyGroupName,
        "DOMAIN-KEYWORD,github," + proxyGroupName,


        // 国内
        'IP-CIDR,127.0.0.0/8,DIRECT',
        'IP-CIDR,172.16.0.0/12,DIRECT',
        'IP-CIDR,192.168.0.0/16,DIRECT',
        'IP-CIDR,10.0.0.0/8,DIRECT',
        'IP-CIDR,17.0.0.0/8,DIRECT',
        'IP-CIDR,100.64.0.0/10,DIRECT',
        'IP-CIDR,224.0.0.0/4,DIRECT',
        'IP-CIDR6,fe80::/10,DIRECT',
        'DOMAIN-SUFFIX,cn,DIRECT',
        'DOMAIN-KEYWORD,-cn,DIRECT',
        'GEOIP,CN,DIRECT',

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
