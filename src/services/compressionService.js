// 数据压缩服务
// 使用 pako 库进行数据压缩和解压缩

import pako from 'pako';

class CompressionService {
  constructor() {
    this.compressionThreshold = 1024; // 超过1KB的数据才压缩
    this.compressionLevel = 6; // 压缩级别 1-9，6是平衡点
  }

  /**
   * 检查是否支持压缩
   */
  isCompressionSupported() {
    return typeof TextEncoder !== 'undefined' &&
           typeof TextDecoder !== 'undefined' &&
           typeof CompressionStream !== 'undefined';
  }

  /**
   * 压缩数据
   * @param {any} data - 要压缩的数据（对象会被转为JSON）
   * @returns {Uint8Array|string} - 压缩后的数据
   */
  compress(data) {
    try {
      // 转为字符串
      const jsonStr = typeof data === 'string' ? data : JSON.stringify(data);

      // 检查是否需要压缩
      if (jsonStr.length < this.compressionThreshold) {
        return jsonStr; // 小数据不压缩
      }

      // 压缩
      const encoder = new TextEncoder();
      const uint8Array = encoder.encode(jsonStr);
      const compressed = pako.deflate(uint8Array, {
        level: this.compressionLevel
      });


      return compressed;
    } catch (error) {
      console.error('[Compression] Compress failed:', error);
      // 返回原始数据
      return typeof data === 'string' ? data : JSON.stringify(data);
    }
  }

  /**
   * 解压数据
   * @param {Uint8Array|string} data - 压缩的数据
   * @returns {any} - 解压后的数据
   */
  decompress(data) {
    try {
      // 如果是字符串，说明没有压缩
      if (typeof data === 'string') {
        return JSON.parse(data);
      }

      // 解压
      const decompressed = pako.inflate(data, { to: 'string' });
      return JSON.parse(decompressed);
    } catch (error) {
      // 可能是未压缩的JSON字符串
      try {
        if (typeof data === 'string') {
          return JSON.parse(data);
        }
        // 尝试直接解析
        const decoder = new TextDecoder();
        const jsonStr = decoder.decode(data);
        return JSON.parse(jsonStr);
      } catch (e) {
        console.error('[Compression] Decompress failed:', e);
        return null;
      }
    }
  }

  /**
   * 压缩并编码为Base64（用于存储或传输）
   * @param {any} data - 要压缩的数据
   * @returns {string} - Base64编码的压缩数据
   */
  compressToBase64(data) {
    try {
      const compressed = this.compress(data);
      if (typeof compressed === 'string') {
        // 未压缩，直接返回base64
        return btoa(encodeURIComponent(compressed));
      }
      // Uint8Array 转 Base64
      let binary = '';
      for (let i = 0; i < compressed.length; i++) {
        binary += String.fromCharCode(compressed[i]);
      }
      return btoa(binary);
    } catch (error) {
      console.error('[Compression] Compress to base64 failed:', error);
      return null;
    }
  }

  /**
   * 从Base64解压
   * @param {string} base64 - Base64编码的压缩数据
   * @returns {any} - 解压后的数据
   */
  decompressFromBase64(base64) {
    try {
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return this.decompress(bytes);
    } catch (error) {
      // 可能是未压缩的base64
      try {
        const decoded = decodeURIComponent(atob(base64));
        return JSON.parse(decoded);
      } catch (e) {
        console.error('[Compression] Decompress from base64 failed:', e);
        return null;
      }
    }
  }

  /**
   * 获取压缩统计信息
   */
  getCompressionStats(originalSize, compressedSize) {
    return {
      originalSize,
      compressedSize,
      savedBytes: originalSize - compressedSize,
      compressionRatio: ((1 - compressedSize / originalSize) * 100).toFixed(2) + '%'
    };
  }
}

// 单例导出
export const compressionService = new CompressionService();