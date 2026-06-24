class DeviceUtil {
  static parseUserAgent(userAgent) {
    if (!userAgent) {
      return {
        device: 'Unknown',
        browser: 'Unknown',
        os: 'Unknown',
        isMobile: false,
        isTablet: false,
        isPc: true
      };
    }

    const browser = this.getBrowserInfo(userAgent);
    const os = this.getOsInfo(userAgent);
    const deviceType = this.getDeviceType(userAgent);

    return {
      device: deviceType,
      browser: browser.name + ' ' + browser.version,
      os: os.name + ' ' + os.version,
      isMobile: deviceType === 'Mobile',
      isTablet: deviceType === 'Tablet',
      isPc: deviceType === 'PC'
    };
  }

  static getDeviceType(userAgent) {
    if (!userAgent) return 'Unknown';

    const ua = userAgent.toLowerCase();

    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'Tablet';
    }

    if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile|lava|huawei|oppo|vivo|xiaomi|realme/i.test(ua)) {
      return 'Mobile';
    }

    return 'PC';
  }

  static getBrowserInfo(userAgent) {
    if (!userAgent) return { name: 'Unknown', version: '' };

    const ua = userAgent.toLowerCase();

    let name = 'Unknown';
    let version = '';

    if (ua.includes('edg/')) {
      const match = ua.match(/edg\/([\d.]+)/);
      name = 'Edge';
      version = match ? match[1] : '';
    } else if (ua.includes('chrome/')) {
      const match = ua.match(/chrome\/([\d.]+)/);
      name = 'Chrome';
      version = match ? match[1] : '';
    } else if (ua.includes('safari/')) {
      if (ua.includes('android')) {
        const match = ua.match(/version\/([\d.]+)/);
        name = 'Android Browser';
        version = match ? match[1] : '';
      } else {
        const match = ua.match(/version\/([\d.]+)/);
        name = 'Safari';
        version = match ? match[1] : '';
      }
    } else if (ua.includes('firefox/')) {
      const match = ua.match(/firefox\/([\d.]+)/);
      name = 'Firefox';
      version = match ? match[1] : '';
    } else if (ua.includes('msie') || ua.includes('trident/')) {
      const match = ua.match(/(?:msie |rv:)([\d.]+)/);
      name = 'IE';
      version = match ? match[1] : '';
    } else if (ua.includes('opera') || ua.includes('opr/')) {
      const match = ua.match(/(?:opera|opr)\/([\d.]+)/);
      name = 'Opera';
      version = match ? match[1] : '';
    }

    return { name, version };
  }

  static getOsInfo(userAgent) {
    if (!userAgent) return { name: 'Unknown', version: '' };

    const ua = userAgent.toLowerCase();

    let name = 'Unknown';
    let version = '';

    if (ua.includes('windows nt 10')) {
      name = 'Windows';
      version = '10';
    } else if (ua.includes('windows nt 6.3')) {
      name = 'Windows';
      version = '8.1';
    } else if (ua.includes('windows nt 6.2')) {
      name = 'Windows';
      version = '8';
    } else if (ua.includes('windows nt 6.1')) {
      name = 'Windows';
      version = '7';
    } else if (ua.includes('windows')) {
      name = 'Windows';
      version = 'Unknown';
    } else if (ua.includes('mac os x')) {
      const match = ua.match(/mac os x([\d_]+)/);
      name = 'macOS';
      version = match ? match[1].replace(/_/g, '.') : '';
    } else if (ua.includes('iphone os') || ua.includes('ipad')) {
      const match = ua.match(/(?:iphone os|ipad)(?:_os)?\s*([\d_]+)/);
      name = 'iOS';
      version = match ? match[1].replace(/_/g, '.') : '';
    } else if (ua.includes('android')) {
      const match = ua.match(/android\s*([\d.]+)/);
      name = 'Android';
      version = match ? match[1] : '';
    } else if (ua.includes('linux')) {
      name = 'Linux';
      version = '';
    } else if (ua.includes('ubuntu')) {
      name = 'Ubuntu';
      version = '';
    }

    return { name, version };
  }

  static formatDeviceInfo(deviceInfo) {
    if (!deviceInfo) return 'Unknown';

    if (typeof deviceInfo === 'string') {
      return deviceInfo;
    }

    return `${deviceInfo.os} / ${deviceInfo.browser}`;
  }
}

module.exports = DeviceUtil;
