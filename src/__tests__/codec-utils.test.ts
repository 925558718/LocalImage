import { describe, it, expect } from 'vitest';

// Test the core codec utilities directly without DOM dependencies
describe('Codec Utilities', () => {
  describe('Base64 Codec', () => {
    it('should encode and decode text correctly', () => {
      const text = 'Hello World';
      const encoded = btoa(unescape(encodeURIComponent(text)));
      const decoded = decodeURIComponent(escape(atob(encoded)));
      
      expect(encoded).toBe('SGVsbG8gV29ybGQ=');
      expect(decoded).toBe(text);
    });

    it('should handle Unicode characters', () => {
      const text = '你好世界';
      const encoded = btoa(unescape(encodeURIComponent(text)));
      const decoded = decodeURIComponent(escape(atob(encoded)));
      
      expect(decoded).toBe(text);
    });
  });

  describe('URL Codec', () => {
    it('should encode and decode URLs correctly', () => {
      const text = 'Hello World @#$%';
      const encoded = encodeURIComponent(text);
      const decoded = decodeURIComponent(encoded);
      
      expect(encoded).toBe('Hello%20World%20%40%23%24%25');
      expect(decoded).toBe(text);
    });

    it('should handle Chinese characters', () => {
      const text = '你好';
      const encoded = encodeURIComponent(text);
      const decoded = decodeURIComponent(encoded);
      
      expect(decoded).toBe(text);
    });
  });

  describe('Unicode Escape Codec', () => {
    const unicodeEncode = (text: string): string => {
      return text.split('').map(char => {
        const code = char.charCodeAt(0);
        return code > 127 ? `\\u${code.toString(16).padStart(4, '0')}` : char;
      }).join('');
    };

    const unicodeDecode = (encoded: string): string => {
      return encoded.replace(/\\u([0-9a-fA-F]{4})/g, (match, code) => {
        return String.fromCharCode(parseInt(code, 16));
      });
    };

    it('should encode and decode Unicode escapes correctly', () => {
      const text = '你好世界';
      const encoded = unicodeEncode(text);
      const decoded = unicodeDecode(encoded);
      
      expect(encoded).toBe('\\u4f60\\u597d\\u4e16\\u754c');
      expect(decoded).toBe(text);
    });

    it('should leave ASCII characters unchanged in encoding', () => {
      const text = 'Hello World';
      const encoded = unicodeEncode(text);
      
      expect(encoded).toBe('Hello World');
    });
  });

  describe('JWT Parsing', () => {
    const jwtDecode = (token: string) => {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }
      
      const base64Decode = (str: string): string => {
        let standardBase64 = str.replace(/-/g, '+').replace(/_/g, '/');
        while (standardBase64.length % 4) {
          standardBase64 += '=';
        }
        return decodeURIComponent(escape(atob(standardBase64)));
      };
      
      return {
        header: JSON.parse(base64Decode(parts[0])),
        payload: JSON.parse(base64Decode(parts[1])),
        signature: parts[2]
      };
    };

    it('should parse a valid JWT token', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      
      const result = jwtDecode(token);
      
      expect(result.header).toEqual({
        alg: 'HS256',
        typ: 'JWT'
      });
      
      expect(result.payload).toEqual({
        sub: '1234567890',
        name: 'John Doe',
        iat: 1516239022
      });
      
      expect(result.signature).toBe('SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
    });

    it('should throw error for invalid JWT format', () => {
      expect(() => jwtDecode('invalid.jwt')).toThrow('Invalid JWT format');
      expect(() => jwtDecode('one.two.three.four')).toThrow('Invalid JWT format');
    });
  });
}); 