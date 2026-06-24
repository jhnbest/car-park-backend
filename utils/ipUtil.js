class IpUtil {
  static getClientIp(req) {
    const forwarded = req.headers['x-forwarded-for'];
    const realIp = req.headers['x-real-ip'];

    let ip = '';

    if (forwarded) {
      const ips = forwarded.split(',');
      ip = ips[0].trim();
    } else if (realIp) {
      ip = realIp;
    } else {
      ip = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || '';
    }

    ip = this.parseIpAddress(ip);

    if (ip === '::1' || ip === '::ffff:127.0.0.1') {
      ip = '127.0.0.1';
    }

    return ip;
  }

  static parseIpAddress(ip) {
    if (!ip) return '';

    if (ip.startsWith('::ffff:')) {
      return ip.substring(7);
    }

    return ip;
  }

  static isPrivateIp(ip) {
    if (!ip) return false;

    const parts = ip.split('.');
    if (parts.length !== 4) return false;

    const first = parseInt(parts[0], 10);
    const second = parseInt(parts[1], 10);

    if (first === 10) return true;
    if (first === 172 && second >= 16 && second <= 31) return true;
    if (first === 192 && second === 168) return true;
    if (first === 127) return true;

    return false;
  }

  static isValidIp(ip) {
    if (!ip) return false;

    const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipv4Pattern.test(ip)) return false;

    const parts = ip.split('.');
    for (const part of parts) {
      const num = parseInt(part, 10);
      if (num < 0 || num > 255) return false;
    }

    return true;
  }
}

module.exports = IpUtil;
