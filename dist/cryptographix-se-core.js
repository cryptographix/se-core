  import { ByteArray, ByteEncoding, Kind, KindBuilder, Message } from 'cryptographix-sim-core';

export class Key {
    constructor() {
        this._type = 0;
        this._size = -1;
        this._componentArray = [];
    }
    setType(keyType) {
        this._type = keyType;
    }
    getType() {
        return this._type;
    }
    setSize(size) {
        this._size = size;
    }
    getSize() {
        return this._size;
    }
    setComponent(comp, value) {
        this._componentArray[comp] = value;
    }
    getComponent(comp) {
        return this._componentArray[comp];
    }
}
Key.SECRET = 1;
Key.PRIVATE = 2;
Key.PUBLIC = 3;
Key.DES = 1;
Key.AES = 2;
Key.MODULUS = 3;
Key.EXPONENT = 4;
Key.CRT_P = 5;
Key.CRT_Q = 6;
Key.CRT_DP1 = 7;
Key.CRT_DQ1 = 8;
Key.CRT_PQ = 9;



export class Crypto {
    constructor() {
    }
    encrypt(key, mech, data) {
        var k = key.getComponent(Key.SECRET).byteArray;
        if (k.length == 16) {
            var orig = k;
            k = new ByteArray([]).setLength(24);
            k.setBytesAt(0, orig);
            k.setBytesAt(16, orig.viewAt(0, 8));
        }
        var cryptoText = new ByteArray(this.des(k.backingArray, data.byteArray.backingArray, 1, 0));
        return new ByteString(cryptoText);
    }
    decrypt(key, mech, data) {
        return data;
    }
    sign(key, mech, data, iv) {
        var k = key.getComponent(Key.SECRET).byteArray;
        var keyData = k;
        if (k.length == 16) {
            keyData = new ByteArray();
            keyData
                .setLength(24)
                .setBytesAt(0, k)
                .setBytesAt(16, k.bytesAt(0, 8));
        }
        if (iv == undefined)
            iv = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
        var cryptoText = new ByteArray(this.des(keyData.backingArray, data.byteArray.backingArray, 1, 1, iv, 4));
        return new ByteString(cryptoText).bytes(-8);
    }
    des(key, message, encrypt, mode, iv, padding) {
        function des_createKeys(key) {
            if (Crypto.desPC == undefined) {
                Crypto.desPC = {
                    pc2bytes0: new Uint32Array([0, 0x4, 0x20000000, 0x20000004, 0x10000, 0x10004, 0x20010000, 0x20010004, 0x200, 0x204, 0x20000200, 0x20000204, 0x10200, 0x10204, 0x20010200, 0x20010204]),
                    pc2bytes1: new Uint32Array([0, 0x1, 0x100000, 0x100001, 0x4000000, 0x4000001, 0x4100000, 0x4100001, 0x100, 0x101, 0x100100, 0x100101, 0x4000100, 0x4000101, 0x4100100, 0x4100101]),
                    pc2bytes2: new Uint32Array([0, 0x8, 0x800, 0x808, 0x1000000, 0x1000008, 0x1000800, 0x1000808, 0, 0x8, 0x800, 0x808, 0x1000000, 0x1000008, 0x1000800, 0x1000808]),
                    pc2bytes3: new Uint32Array([0, 0x200000, 0x8000000, 0x8200000, 0x2000, 0x202000, 0x8002000, 0x8202000, 0x20000, 0x220000, 0x8020000, 0x8220000, 0x22000, 0x222000, 0x8022000, 0x8222000]),
                    pc2bytes4: new Uint32Array([0, 0x40000, 0x10, 0x40010, 0, 0x40000, 0x10, 0x40010, 0x1000, 0x41000, 0x1010, 0x41010, 0x1000, 0x41000, 0x1010, 0x41010]),
                    pc2bytes5: new Uint32Array([0, 0x400, 0x20, 0x420, 0, 0x400, 0x20, 0x420, 0x2000000, 0x2000400, 0x2000020, 0x2000420, 0x2000000, 0x2000400, 0x2000020, 0x2000420]),
                    pc2bytes6: new Uint32Array([0, 0x10000000, 0x80000, 0x10080000, 0x2, 0x10000002, 0x80002, 0x10080002, 0, 0x10000000, 0x80000, 0x10080000, 0x2, 0x10000002, 0x80002, 0x10080002]),
                    pc2bytes7: new Uint32Array([0, 0x10000, 0x800, 0x10800, 0x20000000, 0x20010000, 0x20000800, 0x20010800, 0x20000, 0x30000, 0x20800, 0x30800, 0x20020000, 0x20030000, 0x20020800, 0x20030800]),
                    pc2bytes8: new Uint32Array([0, 0x40000, 0, 0x40000, 0x2, 0x40002, 0x2, 0x40002, 0x2000000, 0x2040000, 0x2000000, 0x2040000, 0x2000002, 0x2040002, 0x2000002, 0x2040002]),
                    pc2bytes9: new Uint32Array([0, 0x10000000, 0x8, 0x10000008, 0, 0x10000000, 0x8, 0x10000008, 0x400, 0x10000400, 0x408, 0x10000408, 0x400, 0x10000400, 0x408, 0x10000408]),
                    pc2bytes10: new Uint32Array([0, 0x20, 0, 0x20, 0x100000, 0x100020, 0x100000, 0x100020, 0x2000, 0x2020, 0x2000, 0x2020, 0x102000, 0x102020, 0x102000, 0x102020]),
                    pc2bytes11: new Uint32Array([0, 0x1000000, 0x200, 0x1000200, 0x200000, 0x1200000, 0x200200, 0x1200200, 0x4000000, 0x5000000, 0x4000200, 0x5000200, 0x4200000, 0x5200000, 0x4200200, 0x5200200]),
                    pc2bytes12: new Uint32Array([0, 0x1000, 0x8000000, 0x8001000, 0x80000, 0x81000, 0x8080000, 0x8081000, 0x10, 0x1010, 0x8000010, 0x8001010, 0x80010, 0x81010, 0x8080010, 0x8081010]),
                    pc2bytes13: new Uint32Array([0, 0x4, 0x100, 0x104, 0, 0x4, 0x100, 0x104, 0x1, 0x5, 0x101, 0x105, 0x1, 0x5, 0x101, 0x105])
                };
            }
            var iterations = key.length > 8 ? 3 : 1;
            var keys = new Uint32Array(32 * iterations);
            var shifts = [0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0];
            var lefttemp, righttemp, m = 0, n = 0, temp;
            for (var j = 0; j < iterations; j++) {
                left = (key[m++] << 24) | (key[m++] << 16) | (key[m++] << 8) | key[m++];
                right = (key[m++] << 24) | (key[m++] << 16) | (key[m++] << 8) | key[m++];
                temp = ((left >>> 4) ^ right) & 0x0f0f0f0f;
                right ^= temp;
                left ^= (temp << 4);
                temp = ((right >>> -16) ^ left) & 0x0000ffff;
                left ^= temp;
                right ^= (temp << -16);
                temp = ((left >>> 2) ^ right) & 0x33333333;
                right ^= temp;
                left ^= (temp << 2);
                temp = ((right >>> -16) ^ left) & 0x0000ffff;
                left ^= temp;
                right ^= (temp << -16);
                temp = ((left >>> 1) ^ right) & 0x55555555;
                right ^= temp;
                left ^= (temp << 1);
                temp = ((right >>> 8) ^ left) & 0x00ff00ff;
                left ^= temp;
                right ^= (temp << 8);
                temp = ((left >>> 1) ^ right) & 0x55555555;
                right ^= temp;
                left ^= (temp << 1);
                temp = (left << 8) | ((right >>> 20) & 0x000000f0);
                left = (right << 24) | ((right << 8) & 0xff0000) | ((right >>> 8) & 0xff00) | ((right >>> 24) & 0xf0);
                right = temp;
                for (var i = 0; i < shifts.length; i++) {
                    if (shifts[i]) {
                        left = (left << 2) | (left >>> 26);
                        right = (right << 2) | (right >>> 26);
                    }
                    else {
                        left = (left << 1) | (left >>> 27);
                        right = (right << 1) | (right >>> 27);
                    }
                    left &= -0xf;
                    right &= -0xf;
                    lefttemp = Crypto.desPC.pc2bytes0[left >>> 28] | Crypto.desPC.pc2bytes1[(left >>> 24) & 0xf]
                        | Crypto.desPC.pc2bytes2[(left >>> 20) & 0xf] | Crypto.desPC.pc2bytes3[(left >>> 16) & 0xf]
                        | Crypto.desPC.pc2bytes4[(left >>> 12) & 0xf] | Crypto.desPC.pc2bytes5[(left >>> 8) & 0xf]
                        | Crypto.desPC.pc2bytes6[(left >>> 4) & 0xf];
                    righttemp = Crypto.desPC.pc2bytes7[right >>> 28] | Crypto.desPC.pc2bytes8[(right >>> 24) & 0xf]
                        | Crypto.desPC.pc2bytes9[(right >>> 20) & 0xf] | Crypto.desPC.pc2bytes10[(right >>> 16) & 0xf]
                        | Crypto.desPC.pc2bytes11[(right >>> 12) & 0xf] | Crypto.desPC.pc2bytes12[(right >>> 8) & 0xf]
                        | Crypto.desPC.pc2bytes13[(right >>> 4) & 0xf];
                    temp = ((righttemp >>> 16) ^ lefttemp) & 0x0000ffff;
                    keys[n++] = lefttemp ^ temp;
                    keys[n++] = righttemp ^ (temp << 16);
                }
            }
            return keys;
        }
        if (Crypto.desSP == undefined) {
            Crypto.desSP = {
                spfunction1: new Uint32Array([0x1010400, 0, 0x10000, 0x1010404, 0x1010004, 0x10404, 0x4, 0x10000, 0x400, 0x1010400, 0x1010404, 0x400, 0x1000404, 0x1010004, 0x1000000, 0x4, 0x404, 0x1000400, 0x1000400, 0x10400, 0x10400, 0x1010000, 0x1010000, 0x1000404, 0x10004, 0x1000004, 0x1000004, 0x10004, 0, 0x404, 0x10404, 0x1000000, 0x10000, 0x1010404, 0x4, 0x1010000, 0x1010400, 0x1000000, 0x1000000, 0x400, 0x1010004, 0x10000, 0x10400, 0x1000004, 0x400, 0x4, 0x1000404, 0x10404, 0x1010404, 0x10004, 0x1010000, 0x1000404, 0x1000004, 0x404, 0x10404, 0x1010400, 0x404, 0x1000400, 0x1000400, 0, 0x10004, 0x10400, 0, 0x1010004]),
                spfunction2: new Uint32Array([-0x7fef7fe0, -0x7fff8000, 0x8000, 0x108020, 0x100000, 0x20, -0x7fefffe0, -0x7fff7fe0, -0x7fffffe0, -0x7fef7fe0, -0x7fef8000, -0x80000000, -0x7fff8000, 0x100000, 0x20, -0x7fefffe0, 0x108000, 0x100020, -0x7fff7fe0, 0, -0x80000000, 0x8000, 0x108020, -0x7ff00000, 0x100020, -0x7fffffe0, 0, 0x108000, 0x8020, -0x7fef8000, -0x7ff00000, 0x8020, 0, 0x108020, -0x7fefffe0, 0x100000, -0x7fff7fe0, -0x7ff00000, -0x7fef8000, 0x8000, -0x7ff00000, -0x7fff8000, 0x20, -0x7fef7fe0, 0x108020, 0x20, 0x8000, -0x80000000, 0x8020, -0x7fef8000, 0x100000, -0x7fffffe0, 0x100020, -0x7fff7fe0, -0x7fffffe0, 0x100020, 0x108000, 0, -0x7fff8000, 0x8020, -0x80000000, -0x7fefffe0, -0x7fef7fe0, 0x108000]),
                spfunction3: new Uint32Array([0x208, 0x8020200, 0, 0x8020008, 0x8000200, 0, 0x20208, 0x8000200, 0x20008, 0x8000008, 0x8000008, 0x20000, 0x8020208, 0x20008, 0x8020000, 0x208, 0x8000000, 0x8, 0x8020200, 0x200, 0x20200, 0x8020000, 0x8020008, 0x20208, 0x8000208, 0x20200, 0x20000, 0x8000208, 0x8, 0x8020208, 0x200, 0x8000000, 0x8020200, 0x8000000, 0x20008, 0x208, 0x20000, 0x8020200, 0x8000200, 0, 0x200, 0x20008, 0x8020208, 0x8000200, 0x8000008, 0x200, 0, 0x8020008, 0x8000208, 0x20000, 0x8000000, 0x8020208, 0x8, 0x20208, 0x20200, 0x8000008, 0x8020000, 0x8000208, 0x208, 0x8020000, 0x20208, 0x8, 0x8020008, 0x20200]),
                spfunction4: new Uint32Array([0x802001, 0x2081, 0x2081, 0x80, 0x802080, 0x800081, 0x800001, 0x2001, 0, 0x802000, 0x802000, 0x802081, 0x81, 0, 0x800080, 0x800001, 0x1, 0x2000, 0x800000, 0x802001, 0x80, 0x800000, 0x2001, 0x2080, 0x800081, 0x1, 0x2080, 0x800080, 0x2000, 0x802080, 0x802081, 0x81, 0x800080, 0x800001, 0x802000, 0x802081, 0x81, 0, 0, 0x802000, 0x2080, 0x800080, 0x800081, 0x1, 0x802001, 0x2081, 0x2081, 0x80, 0x802081, 0x81, 0x1, 0x2000, 0x800001, 0x2001, 0x802080, 0x800081, 0x2001, 0x2080, 0x800000, 0x802001, 0x80, 0x800000, 0x2000, 0x802080]),
                spfunction5: new Uint32Array([0x100, 0x2080100, 0x2080000, 0x42000100, 0x80000, 0x100, 0x40000000, 0x2080000, 0x40080100, 0x80000, 0x2000100, 0x40080100, 0x42000100, 0x42080000, 0x80100, 0x40000000, 0x2000000, 0x40080000, 0x40080000, 0, 0x40000100, 0x42080100, 0x42080100, 0x2000100, 0x42080000, 0x40000100, 0, 0x42000000, 0x2080100, 0x2000000, 0x42000000, 0x80100, 0x80000, 0x42000100, 0x100, 0x2000000, 0x40000000, 0x2080000, 0x42000100, 0x40080100, 0x2000100, 0x40000000, 0x42080000, 0x2080100, 0x40080100, 0x100, 0x2000000, 0x42080000, 0x42080100, 0x80100, 0x42000000, 0x42080100, 0x2080000, 0, 0x40080000, 0x42000000, 0x80100, 0x2000100, 0x40000100, 0x80000, 0, 0x40080000, 0x2080100, 0x40000100]),
                spfunction6: new Uint32Array([0x20000010, 0x20400000, 0x4000, 0x20404010, 0x20400000, 0x10, 0x20404010, 0x400000, 0x20004000, 0x404010, 0x400000, 0x20000010, 0x400010, 0x20004000, 0x20000000, 0x4010, 0, 0x400010, 0x20004010, 0x4000, 0x404000, 0x20004010, 0x10, 0x20400010, 0x20400010, 0, 0x404010, 0x20404000, 0x4010, 0x404000, 0x20404000, 0x20000000, 0x20004000, 0x10, 0x20400010, 0x404000, 0x20404010, 0x400000, 0x4010, 0x20000010, 0x400000, 0x20004000, 0x20000000, 0x4010, 0x20000010, 0x20404010, 0x404000, 0x20400000, 0x404010, 0x20404000, 0, 0x20400010, 0x10, 0x4000, 0x20400000, 0x404010, 0x4000, 0x400010, 0x20004010, 0, 0x20404000, 0x20000000, 0x400010, 0x20004010]),
                spfunction7: new Uint32Array([0x200000, 0x4200002, 0x4000802, 0, 0x800, 0x4000802, 0x200802, 0x4200800, 0x4200802, 0x200000, 0, 0x4000002, 0x2, 0x4000000, 0x4200002, 0x802, 0x4000800, 0x200802, 0x200002, 0x4000800, 0x4000002, 0x4200000, 0x4200800, 0x200002, 0x4200000, 0x800, 0x802, 0x4200802, 0x200800, 0x2, 0x4000000, 0x200800, 0x4000000, 0x200800, 0x200000, 0x4000802, 0x4000802, 0x4200002, 0x4200002, 0x2, 0x200002, 0x4000000, 0x4000800, 0x200000, 0x4200800, 0x802, 0x200802, 0x4200800, 0x802, 0x4000002, 0x4200802, 0x4200000, 0x200800, 0, 0x2, 0x4200802, 0, 0x200802, 0x4200000, 0x800, 0x4000002, 0x4000800, 0x800, 0x200002]),
                spfunction8: new Uint32Array([0x10001040, 0x1000, 0x40000, 0x10041040, 0x10000000, 0x10001040, 0x40, 0x10000000, 0x40040, 0x10040000, 0x10041040, 0x41000, 0x10041000, 0x41040, 0x1000, 0x40, 0x10040000, 0x10000040, 0x10001000, 0x1040, 0x41000, 0x40040, 0x10040040, 0x10041000, 0x1040, 0, 0, 0x10040040, 0x10000040, 0x10001000, 0x41040, 0x40000, 0x41040, 0x40000, 0x10041000, 0x1000, 0x40, 0x10040040, 0x1000, 0x41040, 0x10001000, 0x40, 0x10000040, 0x10040000, 0x10040040, 0x10000000, 0x40000, 0x10001040, 0, 0x10041040, 0x40040, 0x10000040, 0x10040000, 0x10001000, 0x10001040, 0, 0x10041040, 0x41000, 0x41000, 0x1040, 0x1040, 0x40040, 0x10000000, 0x10041000]),
            };
        }
        var keys = des_createKeys(key);
        var m = 0, i, j, temp, left, right, looping;
        var cbcleft, cbcleft2, cbcright, cbcright2;
        var len = message.length;
        var iterations = keys.length == 32 ? 3 : 9;
        if (iterations == 3) {
            looping = encrypt ? [0, 32, 2] : [30, -2, -2];
        }
        else {
            looping = encrypt ? [0, 32, 2, 62, 30, -2, 64, 96, 2] : [94, 62, -2, 32, 64, 2, 30, -2, -2];
        }
        if ((padding != undefined) && (padding != 4)) {
            var unpaddedMessage = message;
            var pad = 8 - (len % 8);
            message = new Uint8Array(len + 8);
            message.set(unpaddedMessage, 0);
            switch (padding) {
                case 0:
                    message.set(new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]), len);
                    break;
                case 1:
                    {
                        message.set(new Uint8Array([pad, pad, pad, pad, pad, pad, pad, pad]), 8);
                        if (pad == 8)
                            len += 8;
                        break;
                    }
                case 2:
                    message.set(new Uint8Array([0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20]), 8);
                    break;
            }
            len += 8 - (len % 8);
        }
        var result = new Uint8Array(len);
        if (mode == 1) {
            var m = 0;
            cbcleft = (iv[m++] << 24) | (iv[m++] << 16) | (iv[m++] << 8) | iv[m++];
            cbcright = (iv[m++] << 24) | (iv[m++] << 16) | (iv[m++] << 8) | iv[m++];
        }
        var rm = 0;
        while (m < len) {
            left = (message[m++] << 24) | (message[m++] << 16) | (message[m++] << 8) | message[m++];
            right = (message[m++] << 24) | (message[m++] << 16) | (message[m++] << 8) | message[m++];
            if (mode == 1) {
                if (encrypt) {
                    left ^= cbcleft;
                    right ^= cbcright;
                }
                else {
                    cbcleft2 = cbcleft;
                    cbcright2 = cbcright;
                    cbcleft = left;
                    cbcright = right;
                }
            }
            temp = ((left >>> 4) ^ right) & 0x0f0f0f0f;
            right ^= temp;
            left ^= (temp << 4);
            temp = ((left >>> 16) ^ right) & 0x0000ffff;
            right ^= temp;
            left ^= (temp << 16);
            temp = ((right >>> 2) ^ left) & 0x33333333;
            left ^= temp;
            right ^= (temp << 2);
            temp = ((right >>> 8) ^ left) & 0x00ff00ff;
            left ^= temp;
            right ^= (temp << 8);
            temp = ((left >>> 1) ^ right) & 0x55555555;
            right ^= temp;
            left ^= (temp << 1);
            left = ((left << 1) | (left >>> 31));
            right = ((right << 1) | (right >>> 31));
            for (j = 0; j < iterations; j += 3) {
                var endloop = looping[j + 1];
                var loopinc = looping[j + 2];
                for (i = looping[j]; i != endloop; i += loopinc) {
                    var right1 = right ^ keys[i];
                    var right2 = ((right >>> 4) | (right << 28)) ^ keys[i + 1];
                    temp = left;
                    left = right;
                    right = temp ^ (Crypto.desSP.spfunction2[(right1 >>> 24) & 0x3f] | Crypto.desSP.spfunction4[(right1 >>> 16) & 0x3f]
                        | Crypto.desSP.spfunction6[(right1 >>> 8) & 0x3f] | Crypto.desSP.spfunction8[right1 & 0x3f]
                        | Crypto.desSP.spfunction1[(right2 >>> 24) & 0x3f] | Crypto.desSP.spfunction3[(right2 >>> 16) & 0x3f]
                        | Crypto.desSP.spfunction5[(right2 >>> 8) & 0x3f] | Crypto.desSP.spfunction7[right2 & 0x3f]);
                }
                temp = left;
                left = right;
                right = temp;
            }
            left = ((left >>> 1) | (left << 31));
            right = ((right >>> 1) | (right << 31));
            temp = ((left >>> 1) ^ right) & 0x55555555;
            right ^= temp;
            left ^= (temp << 1);
            temp = ((right >>> 8) ^ left) & 0x00ff00ff;
            left ^= temp;
            right ^= (temp << 8);
            temp = ((right >>> 2) ^ left) & 0x33333333;
            left ^= temp;
            right ^= (temp << 2);
            temp = ((left >>> 16) ^ right) & 0x0000ffff;
            right ^= temp;
            left ^= (temp << 16);
            temp = ((left >>> 4) ^ right) & 0x0f0f0f0f;
            right ^= temp;
            left ^= (temp << 4);
            if (mode == 1) {
                if (encrypt) {
                    cbcleft = left;
                    cbcright = right;
                }
                else {
                    left ^= cbcleft2;
                    right ^= cbcright2;
                }
            }
            result.set(new Uint8Array([(left >>> 24) & 0xff, (left >>> 16) & 0xff, (left >>> 8) & 0xff, (left) & 0xff, (right >>> 24) & 0xff, (right >>> 16) & 0xff, (right >>> 8) & 0xff, (right) & 0xff]), rm);
            rm += 8;
        }
        return result;
    }
    verify(key, mech, data, signature, iv) {
        return data;
    }
    digest(mech, data) {
        return data;
    }
}
Crypto.DES_CBC = 2;
Crypto.DES_ECB = 5;
Crypto.DES_MAC = 8;
Crypto.DES_MAC_EMV = 9;
Crypto.ISO9797_METHOD_1 = 11;
Crypto.ISO9797_METHOD_2 = 12;
Crypto.MD5 = 13;
Crypto.RSA = 14;
Crypto.SHA_1 = 15;
Crypto.SHA_512 = 25;



export class ByteString {
    constructor(value, encoding) {
        if (!encoding) {
            if (value instanceof ByteString)
                this.byteArray = value.byteArray.clone();
            else if (value instanceof ByteArray)
                this.byteArray = value.clone();
        }
        else {
            switch (encoding) {
                case ByteString.HEX:
                    this.byteArray = new ByteArray(value, ByteArray.HEX);
                    break;
                default:
                    throw "ByteString unsupported encoding";
            }
        }
    }
    get length() {
        return this.byteArray.length;
    }
    bytes(offset, count) {
        return new ByteString(this.byteArray.viewAt(offset, count));
    }
    byteAt(offset) {
        return this.byteArray.byteAt(offset);
    }
    equals(otherByteString) {
    }
    concat(value) {
        this.byteArray.concat(value.byteArray);
        return this;
    }
    left(count) {
        return new ByteString(this.byteArray.viewAt(0));
    }
    right(count) {
        return new ByteString(this.byteArray.viewAt(-count));
    }
    not() {
        return new ByteString(this.byteArray.clone().not());
    }
    and(value) {
        return new ByteString(this.byteArray.clone().and(value.byteArray));
    }
    or(value) {
        return new ByteString(this.byteArray.clone().or(value.byteArray));
    }
    pad(method, optional) {
        var bs = new ByteBuffer(this.byteArray);
        if (optional == undefined)
            optional = false;
        if (((bs.length & 7) != 0) || (!optional)) {
            var newlen = ((bs.length + 8) & ~7);
            if (method == Crypto.ISO9797_METHOD_1)
                bs.append(0x80);
            while (bs.length < newlen)
                bs.append(0x00);
        }
        return bs.toByteString();
    }
    toString(encoding) {
        return this.byteArray.toString(ByteArray.HEX);
    }
}
ByteString.HEX = ByteEncoding.HEX;
ByteString.BASE64 = ByteEncoding.BASE64;
export const HEX = ByteString.HEX;
export const BASE64 = ByteString.BASE64;


export class ByteBuffer {
    constructor(value, encoding) {
        if (value instanceof ByteArray) {
            this.byteArray = value.clone();
        }
        else if (value instanceof ByteString) {
            this.byteArray = value.byteArray.clone();
        }
        else if (encoding != undefined) {
            this.byteArray = new ByteString(value, encoding).byteArray.clone();
        }
        else
            this.byteArray = new ByteArray([]);
    }
    get length() {
        return this.byteArray.length;
    }
    toByteString() {
        return new ByteString(this.byteArray);
    }
    clear() {
        this.byteArray = new ByteArray([]);
    }
    append(value) {
        let valueArray;
        if ((value instanceof ByteString) || (value instanceof ByteBuffer)) {
            valueArray = value.byteArray;
        }
        else if (typeof value == "number") {
            valueArray = new ByteArray([(value & 0xff)]);
        }
        this.byteArray.concat(valueArray);
        return this;
    }
}

export class BaseTLV {
    constructor(tag, value, encoding) {
        this.encoding = encoding || BaseTLV.Encodings.EMV;
        switch (this.encoding) {
            case BaseTLV.Encodings.EMV:
                {
                    var tlvBuffer = new ByteArray([]);
                    if (tag >= 0x100)
                        tlvBuffer.addByte((tag >> 8) & 0xFF);
                    tlvBuffer.addByte(tag & 0xFF);
                    var len = value.length;
                    if (len > 0xFF) {
                        tlvBuffer.addByte(0x82);
                        tlvBuffer.addByte((len >> 8) & 0xFF);
                    }
                    else if (len > 0x7F)
                        tlvBuffer.addByte(0x81);
                    tlvBuffer.addByte(len & 0xFF);
                    tlvBuffer.concat(value);
                    this.byteArray = tlvBuffer;
                    break;
                }
        }
    }
    static parseTLV(buffer, encoding) {
        var res = { tag: 0, len: 0, value: undefined, lenOffset: 0, valueOffset: 0 };
        var off = 0;
        var bytes = buffer.backingArray;
        switch (encoding) {
            case BaseTLV.Encodings.EMV:
                {
                    while ((off < bytes.length) && ((bytes[off] == 0x00) || (bytes[off] == 0xFF)))
                        ++off;
                    if (off >= bytes.length)
                        return res;
                    if ((bytes[off] & 0x1F) == 0x1F) {
                        res.tag = bytes[off++] << 8;
                        if (off >= bytes.length) {
                            return null;
                        }
                    }
                    res.tag |= bytes[off++];
                    res.lenOffset = off;
                    if (off >= bytes.length) {
                        return null;
                    }
                    var ll = (bytes[off] & 0x80) ? (bytes[off++] & 0x7F) : 1;
                    while (ll-- > 0) {
                        if (off >= bytes.length) {
                            return null;
                        }
                        res.len = (res.len << 8) | bytes[off++];
                    }
                    res.valueOffset = off;
                    if (off + res.len > bytes.length) {
                        return null;
                    }
                    res.value = bytes.slice(res.valueOffset, res.valueOffset + res.len);
                    break;
                }
        }
        return res;
    }
    get tag() {
        return BaseTLV.parseTLV(this.byteArray, this.encoding).tag;
    }
    get value() {
        return BaseTLV.parseTLV(this.byteArray, this.encoding).value;
    }
    get len() {
        return BaseTLV.parseTLV(this.byteArray, this.encoding).len;
    }
}
BaseTLV.Encodings = {
    EMV: 1,
    DGI: 2
};
BaseTLV.Encodings["CTV"] = 4;



export class TLV {
    constructor(tag, value, encoding) {
        this.tlv = new BaseTLV(tag, value.byteArray, encoding);
        this.encoding = encoding;
    }
    getTLV() {
        return new ByteString(this.tlv.byteArray);
    }
    getTag() {
        return this.tlv.tag;
    }
    getValue() {
        return new ByteString(this.tlv.value);
    }
    getL() {
        var info = BaseTLV.parseTLV(this.tlv.byteArray, this.encoding);
        return new ByteString(this.tlv.byteArray.viewAt(info.lenOffset, info.valueOffset));
    }
    getLV() {
        var info = BaseTLV.parseTLV(this.tlv.byteArray, this.encoding);
        return new ByteString(this.tlv.byteArray.viewAt(info.lenOffset, info.valueOffset + info.len));
    }
    static parseTLV(buffer, encoding) {
        let info = BaseTLV.parseTLV(buffer.byteArray, encoding);
        return {
            tag: info.tag,
            len: info.len,
            value: new ByteString(info.value),
            lenOffset: info.lenOffset,
            valueOffset: info.valueOffset
        };
    }
}
TLV.EMV = BaseTLV.Encodings.EMV;
TLV.DGI = BaseTLV.Encodings.DGI;


export class TLVList {
    constructor(tlvStream, encoding) {
        this._tlvs = [];
        var off = 0;
        while (off < tlvStream.length) {
            var tlvInfo = TLV.parseTLV(tlvStream.bytes(off), encoding);
            if (tlvInfo == null) {
                break;
            }
            else {
                if (tlvInfo.valueOffset == 0)
                    break;
                this._tlvs.push(new TLV(tlvInfo.tag, tlvInfo.value, encoding));
                off += tlvInfo.valueOffset + tlvInfo.len;
            }
        }
    }
    index(index) {
        return this._tlvs[index];
    }
}











export class CommandAPDU {
    constructor(attributes) {
        Kind.initFields(this, attributes);
    }
    toJSON() {
        return {
            CLA: this.CLA,
            INS: this.INS,
            P1: this.P1,
            P2: this.P2,
            data: this.data && this.data.backingArray,
            Le: this.Le,
            description: this.description,
            details: this.details
        };
    }
    toString() {
        function hex2(val) { return ("00" + val.toString(16).toUpperCase()).substr(-2); }
        let s = 'CommandAPDU ';
        s += 'CLA=0x' + hex2(this.CLA);
        s += ',' + 'INS=0x' + hex2(this.INS);
        s += ',' + 'P1=0x' + hex2(this.P1);
        s += ',' + 'P2=0x' + hex2(this.P2);
        if (this.data && this.data.length) {
            s += ',' + 'Lc=' + this.Lc;
            s += ',' + 'Data=' + this.data.toString(ByteArray.HEX);
        }
        if (this.Le)
            s += ',' + 'Le=' + this.Le;
        if (this.description)
            s += ' (' + this.description + ')';
        return s;
    }
    get Lc() { return this.data.length; }
    get header() { return new ByteArray([this.CLA, this.INS, this.P1, this.P2]); }
    static init(CLA, INS, P1, P2, data) {
        return (new CommandAPDU()).set(CLA, INS, P1, P2, data);
    }
    set(CLA, INS, P1, P2, data) {
        this.CLA = CLA;
        this.INS = INS;
        this.P1 = P1;
        this.P2 = P2;
        this.data = data || new ByteArray();
        this.Le = undefined;
        return this;
    }
    setCLA(CLA) { this.CLA = CLA; return this; }
    setINS(INS) { this.INS = INS; return this; }
    setP1(P1) { this.P1 = P1; return this; }
    setP2(P2) { this.P2 = P2; return this; }
    setData(data) { this.data = data; return this; }
    setLe(Le) { this.Le = Le; return this; }
    setDescription(description) {
        this.description = description;
        return this;
    }
    setDetails(details) {
        this.details = details;
        return this;
    }
    encodeBytes(options) {
        let dlen = ((this.Lc > 0) ? 1 + this.Lc : 0);
        let len = 4 + dlen + ((this.Le > 0) ? 1 : 0);
        let ba = new ByteArray().setLength(len);
        ba.setBytesAt(0, this.header);
        if (this.Lc) {
            ba.setByteAt(4, this.Lc);
            ba.setBytesAt(5, this.data);
        }
        if (this.Le > 0) {
            ba.setByteAt(4 + dlen, this.Le);
        }
        return ba;
    }
    decodeBytes(byteArray, options) {
        if (byteArray.length < 4)
            throw new Error('CommandAPDU: Invalid buffer');
        let offset = 0;
        this.CLA = byteArray.byteAt(offset++);
        this.INS = byteArray.byteAt(offset++);
        this.P1 = byteArray.byteAt(offset++);
        this.P2 = byteArray.byteAt(offset++);
        if (byteArray.length > offset + 1) {
            var Lc = byteArray.byteAt(offset++);
            this.data = byteArray.bytesAt(offset, Lc);
            offset += Lc;
        }
        if (byteArray.length > offset)
            this.Le = byteArray.byteAt(offset++);
        if (byteArray.length != offset)
            throw new Error('CommandAPDU: Invalid buffer');
        return this;
    }
}
KindBuilder.init(CommandAPDU, 'ISO7816 Command APDU')
    .byteField('CLA', 'Class')
    .byteField('INS', 'Instruction')
    .byteField('P1', 'P1 Param')
    .byteField('P2', 'P2 Param')
    .uint32Field('Lc', 'Command Length', { calculated: true })
    .field('data', 'Command Data', ByteArray)
    .uint32Field('Le', 'Expected Length')
    .stringField('description', 'Description', {})
    .stringField('details', 'Details', {});

export var ISO7816;
(function (ISO7816) {
    ISO7816[ISO7816["CLA_ISO"] = 0] = "CLA_ISO";
    ISO7816[ISO7816["INS_EXTERNAL_AUTHENTICATE"] = 130] = "INS_EXTERNAL_AUTHENTICATE";
    ISO7816[ISO7816["INS_GET_CHALLENGE"] = 132] = "INS_GET_CHALLENGE";
    ISO7816[ISO7816["INS_INTERNAL_AUTHENTICATE"] = 136] = "INS_INTERNAL_AUTHENTICATE";
    ISO7816[ISO7816["INS_SELECT_FILE"] = 164] = "INS_SELECT_FILE";
    ISO7816[ISO7816["INS_READ_RECORD"] = 178] = "INS_READ_RECORD";
    ISO7816[ISO7816["INS_UPDATE_RECORD"] = 220] = "INS_UPDATE_RECORD";
    ISO7816[ISO7816["INS_VERIFY"] = 32] = "INS_VERIFY";
    ISO7816[ISO7816["INS_BLOCK_APPLICATION"] = 30] = "INS_BLOCK_APPLICATION";
    ISO7816[ISO7816["INS_UNBLOCK_APPLICATION"] = 24] = "INS_UNBLOCK_APPLICATION";
    ISO7816[ISO7816["INS_UNBLOCK_CHANGE_PIN"] = 36] = "INS_UNBLOCK_CHANGE_PIN";
    ISO7816[ISO7816["INS_GET_DATA"] = 202] = "INS_GET_DATA";
    ISO7816[ISO7816["TAG_APPLICATION_TEMPLATE"] = 97] = "TAG_APPLICATION_TEMPLATE";
    ISO7816[ISO7816["TAG_FCI_PROPRIETARY_TEMPLATE"] = 165] = "TAG_FCI_PROPRIETARY_TEMPLATE";
    ISO7816[ISO7816["TAG_FCI_TEMPLATE"] = 111] = "TAG_FCI_TEMPLATE";
    ISO7816[ISO7816["TAG_AID"] = 79] = "TAG_AID";
    ISO7816[ISO7816["TAG_APPLICATION_LABEL"] = 80] = "TAG_APPLICATION_LABEL";
    ISO7816[ISO7816["TAG_LANGUAGE_PREFERENCES"] = 24365] = "TAG_LANGUAGE_PREFERENCES";
    ISO7816[ISO7816["TAG_APPLICATION_EFFECTIVE_DATE"] = 24357] = "TAG_APPLICATION_EFFECTIVE_DATE";
    ISO7816[ISO7816["TAG_APPLICATION_EXPIRY_DATE"] = 24356] = "TAG_APPLICATION_EXPIRY_DATE";
    ISO7816[ISO7816["TAG_CARDHOLDER_NAME"] = 24352] = "TAG_CARDHOLDER_NAME";
    ISO7816[ISO7816["TAG_ISSUER_COUNTRY_CODE"] = 24360] = "TAG_ISSUER_COUNTRY_CODE";
    ISO7816[ISO7816["TAG_ISSUER_URL"] = 24400] = "TAG_ISSUER_URL";
    ISO7816[ISO7816["TAG_PAN"] = 90] = "TAG_PAN";
    ISO7816[ISO7816["TAG_PAN_SEQUENCE_NUMBER"] = 24372] = "TAG_PAN_SEQUENCE_NUMBER";
    ISO7816[ISO7816["TAG_SERVICE_CODE"] = 24368] = "TAG_SERVICE_CODE";
    ISO7816[ISO7816["ISO_PINBLOCK_SIZE"] = 8] = "ISO_PINBLOCK_SIZE";
    ISO7816[ISO7816["APDU_LEN_LE_MAX"] = 256] = "APDU_LEN_LE_MAX";
    ISO7816[ISO7816["SW_SUCCESS"] = 36864] = "SW_SUCCESS";
    ISO7816[ISO7816["SW_WARNING_NV_MEMORY_UNCHANGED"] = 25088] = "SW_WARNING_NV_MEMORY_UNCHANGED";
    ISO7816[ISO7816["SW_PART_OF_RETURN_DATA_CORRUPTED"] = 25217] = "SW_PART_OF_RETURN_DATA_CORRUPTED";
    ISO7816[ISO7816["SW_END_FILE_REACHED_BEFORE_LE_BYTE"] = 25218] = "SW_END_FILE_REACHED_BEFORE_LE_BYTE";
    ISO7816[ISO7816["SW_SELECTED_FILE_INVALID"] = 25219] = "SW_SELECTED_FILE_INVALID";
    ISO7816[ISO7816["SW_FCI_NOT_FORMATTED_TO_ISO"] = 25220] = "SW_FCI_NOT_FORMATTED_TO_ISO";
    ISO7816[ISO7816["SW_WARNING_NV_MEMORY_CHANGED"] = 25344] = "SW_WARNING_NV_MEMORY_CHANGED";
    ISO7816[ISO7816["SW_FILE_FILLED_BY_LAST_WRITE"] = 25473] = "SW_FILE_FILLED_BY_LAST_WRITE";
    ISO7816[ISO7816["SW_WRONG_LENGTH"] = 26368] = "SW_WRONG_LENGTH";
    ISO7816[ISO7816["SW_FUNCTIONS_IN_CLA_NOT_SUPPORTED"] = 26624] = "SW_FUNCTIONS_IN_CLA_NOT_SUPPORTED";
    ISO7816[ISO7816["SW_LOGICAL_CHANNEL_NOT_SUPPORTED"] = 26753] = "SW_LOGICAL_CHANNEL_NOT_SUPPORTED";
    ISO7816[ISO7816["SW_SECURE_MESSAGING_NOT_SUPPORTED"] = 26754] = "SW_SECURE_MESSAGING_NOT_SUPPORTED";
    ISO7816[ISO7816["SW_COMMAND_NOT_ALLOWED"] = 26880] = "SW_COMMAND_NOT_ALLOWED";
    ISO7816[ISO7816["SW_COMMAND_INCOMPATIBLE_WITH_FILE_STRUCTURE"] = 27009] = "SW_COMMAND_INCOMPATIBLE_WITH_FILE_STRUCTURE";
    ISO7816[ISO7816["SW_SECURITY_STATUS_NOT_SATISFIED"] = 27010] = "SW_SECURITY_STATUS_NOT_SATISFIED";
    ISO7816[ISO7816["SW_FILE_INVALID"] = 27011] = "SW_FILE_INVALID";
    ISO7816[ISO7816["SW_DATA_INVALID"] = 27012] = "SW_DATA_INVALID";
    ISO7816[ISO7816["SW_CONDITIONS_NOT_SATISFIED"] = 27013] = "SW_CONDITIONS_NOT_SATISFIED";
    ISO7816[ISO7816["SW_COMMAND_NOT_ALLOWED_AGAIN"] = 27014] = "SW_COMMAND_NOT_ALLOWED_AGAIN";
    ISO7816[ISO7816["SW_EXPECTED_SM_DATA_OBJECTS_MISSING"] = 27015] = "SW_EXPECTED_SM_DATA_OBJECTS_MISSING";
    ISO7816[ISO7816["SW_SM_DATA_OBJECTS_INCORRECT"] = 27016] = "SW_SM_DATA_OBJECTS_INCORRECT";
    ISO7816[ISO7816["SW_WRONG_PARAMS"] = 27136] = "SW_WRONG_PARAMS";
    ISO7816[ISO7816["SW_WRONG_DATA"] = 27264] = "SW_WRONG_DATA";
    ISO7816[ISO7816["SW_FUNC_NOT_SUPPORTED"] = 27265] = "SW_FUNC_NOT_SUPPORTED";
    ISO7816[ISO7816["SW_FILE_NOT_FOUND"] = 27266] = "SW_FILE_NOT_FOUND";
    ISO7816[ISO7816["SW_RECORD_NOT_FOUND"] = 27267] = "SW_RECORD_NOT_FOUND";
    ISO7816[ISO7816["SW_NOT_ENOUGH_SPACE_IN_FILE"] = 27268] = "SW_NOT_ENOUGH_SPACE_IN_FILE";
    ISO7816[ISO7816["SW_LC_INCONSISTENT_WITH_TLV"] = 27269] = "SW_LC_INCONSISTENT_WITH_TLV";
    ISO7816[ISO7816["SW_INCORRECT_P1P2"] = 27270] = "SW_INCORRECT_P1P2";
    ISO7816[ISO7816["SW_LC_INCONSISTENT_WITH_P1P2"] = 27271] = "SW_LC_INCONSISTENT_WITH_P1P2";
    ISO7816[ISO7816["SW_REFERENCED_DATA_NOT_FOUND"] = 27272] = "SW_REFERENCED_DATA_NOT_FOUND";
    ISO7816[ISO7816["SW_WRONG_P1P2"] = 27392] = "SW_WRONG_P1P2";
    ISO7816[ISO7816["SW_INS_NOT_SUPPORTED"] = 27904] = "SW_INS_NOT_SUPPORTED";
    ISO7816[ISO7816["SW_CLA_NOT_SUPPORTED"] = 28160] = "SW_CLA_NOT_SUPPORTED";
    ISO7816[ISO7816["SW_UNKNOWN"] = 28416] = "SW_UNKNOWN";
})(ISO7816 || (ISO7816 = {}));

export class ResponseAPDU {
    constructor(attributes) {
        Kind.initFields(this, attributes);
    }
    toJSON() {
        return {
            data: this.data && this.data.backingArray,
            SW: this.SW,
            description: this.description,
            details: this.details
        };
    }
    toString() {
        function hex4(val) { return ("0000" + val.toString(16).toUpperCase()).substr(-4); }
        let s = 'ResponseAPDU ';
        s += 'SW=0x' + hex4(this.SW);
        if (this.data && this.data.length) {
            s += ',' + 'La=' + this.La;
            s += ',' + 'Data=' + this.data.toString(ByteArray.HEX);
        }
        if (this.description)
            s += ' (' + this.description + ')';
        return s;
    }
    get La() { return this.data.length; }
    static init(sw, data) {
        return (new ResponseAPDU()).set(sw, data);
    }
    set(sw, data) {
        this.SW = sw;
        this.data = data || new ByteArray();
        return this;
    }
    setSW(SW) { this.SW = SW; return this; }
    setSW1(SW1) { this.SW = (this.SW & 0xFF) | (SW1 << 8); return this; }
    setSW2(SW2) { this.SW = (this.SW & 0xFF00) | SW2; return this; }
    setData(data) { this.data = data; return this; }
    setDescription(description) {
        this.description = description;
        return this;
    }
    setDetails(details) {
        this.details = details;
        return this;
    }
    encodeBytes(options) {
        let ba = new ByteArray().setLength(this.La + 2);
        ba.setBytesAt(0, this.data);
        ba.setByteAt(this.La, (this.SW >> 8) & 0xff);
        ba.setByteAt(this.La + 1, (this.SW >> 0) & 0xff);
        return ba;
    }
    decodeBytes(byteArray, options) {
        if (byteArray.length < 2)
            throw new Error('ResponseAPDU Buffer invalid');
        let la = byteArray.length - 2;
        this.SW = byteArray.wordAt(la);
        this.data = (la) ? byteArray.bytesAt(0, la) : new ByteArray();
        return this;
    }
}
KindBuilder.init(ResponseAPDU, 'ISO7816 Response APDU')
    .uint32Field('SW', 'Status Word')
    .uint32Field('La', 'Actual Length', { calculated: true })
    .field('data', 'Response Data', ByteArray)
    .stringField('description', 'Description', {})
    .stringField('details', 'Details', {});




export class SlotProtocol {
    static getHandler() {
        return new SlotProtocolHandler();
    }
    static getProxy(endPoint) {
        return new SlotProtocolProxy(endPoint);
    }
}
export class SlotProtocolProxy {
    constructor(endPoint) {
        this.endPoint = endPoint;
        let me = this;
        endPoint.onMessage((msg) => {
            let pendingOp = me.pending;
            if (pendingOp) {
                if (msg.header.isResponse && (msg.header.method == pendingOp.method)) {
                    pendingOp.resolve(msg.payload);
                    return;
                }
                else {
                    pendingOp.reject(msg.payload);
                }
            }
        });
    }
    powerCommand(method) {
        let me = this;
        return new Promise((resolve, reject) => {
            me.pending = {
                method: method,
                resolve: resolve,
                reject: reject
            };
            me.endPoint.sendMessage(new Message({ method: method }, null));
        });
    }
    powerOn() {
        return this.powerCommand('powerOn');
    }
    reset() {
        return this.powerCommand('reset');
    }
    powerOff() {
        return this.powerCommand('powerOff');
    }
    get isPresent() {
        return false;
    }
    get isPowered() {
        return false;
    }
    executeAPDU(cmd) {
        let me = this;
        return new Promise((resolve, reject) => {
            me.pending = {
                method: 'executeAPDU',
                resolve: resolve,
                reject: reject
            };
            me.endPoint.sendMessage(new Message({ method: 'executeAPDU' }, cmd));
        });
    }
}
export class SlotProtocolHandler {
    constructor() {
    }
    linkSlot(slot, endPoint) {
        let me = this;
        this.endPoint = endPoint;
        this.slot = slot;
        endPoint.onMessage((msg, ep) => {
            me.onMessage(msg, ep);
        });
    }
    unlinkSlot() {
        this.endPoint.onMessage(null);
        this.endPoint = null;
        this.slot = null;
    }
    onMessage(packet, receivingEndPoint) {
        let hdr = packet.header;
        let payload = packet.payload;
        let response;
        let replyHeader = { method: hdr.method, isResponse: true };
        switch (hdr.method) {
            case "executeAPDU":
                if (!(payload instanceof CommandAPDU))
                    break;
                response = this.slot.executeAPDU(payload);
                response.then((responseAPDU) => {
                    let replyPacket = new Message(replyHeader, responseAPDU);
                    receivingEndPoint.sendMessage(replyPacket);
                });
                break;
            case "powerOff":
                response = this.slot.powerOff()
                    .then((respData) => {
                    receivingEndPoint.sendMessage(new Message(replyHeader, new ByteArray()));
                });
                break;
            case "powerOn":
                response = this.slot.powerOn()
                    .then((respData) => {
                    receivingEndPoint.sendMessage(new Message(replyHeader, respData));
                });
                break;
            case "reset":
                response = this.slot.reset()
                    .then((respData) => {
                    receivingEndPoint.sendMessage(new Message(replyHeader, respData));
                });
                break;
            default:
                response = Promise.reject(new Error("Invalid method" + hdr.method));
                break;
        }
        response.catch((e) => {
            let errorPacket = new Message({ method: "error" }, e);
            receivingEndPoint.sendMessage(errorPacket);
        });
    }
}

class JSSimulatedSlot {
    OnMessage(e) {
        if (this.stop)
            return;
        if (e.data.command == "debug") {
            console.log(e.data.data);
        }
        else if (e.data.command == "executeAPDU") {
            if (this.onAPDUResponse) {
                var bs = e.data.data, len = bs.length;
                this.onAPDUResponse((bs[len - 2] << 8) | bs[len - 1], (len > 2) ? new ByteArray(bs.subarray(0, len - 2)) : null);
            }
        }
        else {
            console.log("cmd: " + e.data.command + " data: " + e.data.data);
        }
    }
    init() {
        this.cardWorker = new Worker("js/SmartCardSlotSimulator/SmartCardSlotWorker.js");
        this.cardWorker.onmessage = this.OnMessage.bind(this);
        this.cardWorker.onerror = function (e) {
        };
    }
    sendToWorker(command, data) {
        this.cardWorker.postMessage({
            "command": command,
            "data": data
        });
    }
    executeAPDUCommand(bCLA, bINS, bP1, bP2, commandData, wLe, onAPDUResponse) {
        var cmd = [bCLA, bINS, bP1, bP2];
        var len = 4;
        var bsCommandData = (commandData instanceof ByteArray) ? commandData : new ByteArray(commandData, ByteArray.HEX);
        if (bsCommandData.length > 0) {
            cmd[len++] = bsCommandData.length;
            for (var i = 0; i < bsCommandData.length; ++i)
                cmd[len++] = bsCommandData.byteAt(i);
        }
        else if (wLe != undefined)
            cmd[len++] = wLe & 0xFF;
        this.sendToWorker("executeAPDU", cmd);
        this.onAPDUResponse = onAPDUResponse;
        return;
    }
}




export class JSIMScriptApplet {
    selectApplication(commandAPDU) {
        return Promise.resolve(new ResponseAPDU({ sw: 0x9000 }));
    }
    deselectApplication() {
    }
    executeAPDU(commandAPDU) {
        return Promise.resolve(new ResponseAPDU({ sw: 0x6D00 }));
    }
}

export class JSIMScriptCard {
    constructor() {
        this.applets = [];
        this._atr = new ByteArray([]);
    }
    loadApplication(aid, applet) {
        this.applets.push({ aid: aid, applet: applet });
    }
    get isPowered() {
        return this._powerIsOn;
    }
    powerOn() {
        this._powerIsOn = true;
        return Promise.resolve(this._atr);
    }
    powerOff() {
        this._powerIsOn = false;
        this.selectedApplet = undefined;
        return Promise.resolve();
    }
    reset() {
        this._powerIsOn = true;
        this.selectedApplet = undefined;
        return Promise.resolve(this._atr);
    }
    exchangeAPDU(commandAPDU) {
        if (commandAPDU.INS == 0xA4) {
            if (this.selectedApplet) {
                this.selectedApplet.deselectApplication();
                this.selectedApplet = undefined;
            }
            this.selectedApplet = this.applets[0].applet;
            return this.selectedApplet.selectApplication(commandAPDU);
        }
        return this.selectedApplet.executeAPDU(commandAPDU);
    }
}

export class JSIMSlot {
    constructor(card) {
        this.card = card;
    }
    get isPresent() {
        return !!this.card;
    }
    get isPowered() {
        return this.isPresent && this.card.isPowered;
    }
    powerOn() {
        if (!this.isPresent)
            return Promise.reject(new Error("JSIM: Card not present"));
        return this.card.powerOn();
    }
    powerOff() {
        if (!this.isPresent)
            return Promise.reject(new Error("JSIM: Card not present"));
        return this.card.powerOff();
    }
    reset() {
        if (!this.isPresent)
            return Promise.reject(new Error("JSIM: Card not present"));
        return this.card.reset();
    }
    executeAPDU(commandAPDU) {
        if (!this.isPresent)
            return Promise.reject(new Error("JSIM: Card not present"));
        if (!this.isPowered)
            return Promise.reject(new Error("JSIM: Card unpowered"));
        return this.card.exchangeAPDU(commandAPDU);
    }
    insertCard(card) {
        if (this.card)
            this.ejectCard();
        this.card = card;
    }
    ejectCard() {
        if (this.card) {
            if (this.card.isPowered)
                this.card.powerOff();
            this.card = undefined;
        }
    }
}

export function hex2(val) { return ("00" + val.toString(16).toUpperCase()).substr(-2); }
export function hex4(val) { return ("0000" + val.toString(16).toUpperCase()).substr(-4); }
export var MEMFLAGS;
(function (MEMFLAGS) {
    MEMFLAGS[MEMFLAGS["READ_ONLY"] = 1] = "READ_ONLY";
    MEMFLAGS[MEMFLAGS["TRANSACTIONABLE"] = 2] = "TRANSACTIONABLE";
    MEMFLAGS[MEMFLAGS["TRACE"] = 4] = "TRACE";
})(MEMFLAGS || (MEMFLAGS = {}));
export class Segment {
    constructor(segType, size, flags, base) {
        this.inTransaction = false;
        this.transBlocks = [];
        this.memType = segType;
        this.readOnly = (flags & MEMFLAGS.READ_ONLY) ? true : false;
        if (base) {
            this.memData = new ByteArray(base);
        }
        else {
            this.memData = new ByteArray([]).setLength(size);
        }
    }
    getType() { return this.memType; }
    getLength() { return this.memData.length; }
    getFlags() { return this.flags; }
    getDebug() { return { memData: this.memData, memType: this.memType, readOnly: this.readOnly, inTransaction: this.inTransaction, transBlocks: this.transBlocks }; }
    beginTransaction() {
        this.inTransaction = true;
        this.transBlocks = [];
    }
    endTransaction(commit) {
        if (!commit && this.inTransaction) {
            this.inTransaction = false;
            for (var i = 0; i < this.transBlocks.length; i++) {
                var block = this.transBlocks[i];
                this.writeBytes(block.addr, block.data);
            }
        }
        this.transBlocks = [];
    }
    readByte(addr) {
        return this.memData[addr];
    }
    zeroBytes(addr, len) {
        for (var i = 0; i < len; ++i)
            this.memData[addr + i] = 0;
    }
    readBytes(addr, len) {
        return this.memData.viewAt(addr, len);
    }
    copyBytes(fromAddr, toAddr, len) {
        this.writeBytes(toAddr, this.readBytes(fromAddr, len));
    }
    writeBytes(addr, val) {
        if (this.inTransaction && (this.flags & MEMFLAGS.TRANSACTIONABLE)) {
            this.transBlocks.push({ addr: addr, data: this.readBytes(addr, val.length) });
        }
        this.memData.setBytesAt(addr, val);
    }
    newAccessor(addr, len, name) {
        return new Accessor(this, addr, len, name);
    }
}
export class Accessor {
    constructor(seg, addr, len, name) {
        this.seg = seg;
        this.offset = addr;
        this.length = len;
        this.id = name;
    }
    traceMemoryOp(op, addr, len, addr2) {
        if (this.id != "code")
            this.seg.memTraces.push({ op: op, name: this.id, addr: addr, len: len, addr2: addr2 });
    }
    traceMemoryValue(val) {
        if (this.id != "code") {
            var memTrace = this.seg.memTraces[this.seg.memTraces.length - 1];
            memTrace.val = val;
        }
    }
    zeroBytes(addr, len) {
        if (addr + len > this.length) {
            this.traceMemoryOp("ZR-error", addr, this.length);
            throw new Error("MM: Invalid Zero");
        }
        this.traceMemoryOp("ZR", addr, len);
        this.seg.zeroBytes(this.offset + addr, len);
        this.traceMemoryValue([0]);
    }
    readByte(addr) {
        if (addr + 1 > this.length) {
            this.traceMemoryOp("RD-error", addr, 1);
            throw new Error("MM: Invalid Read");
        }
        this.traceMemoryOp("RD", addr, 1);
        var val = this.seg.readByte(this.offset + addr);
        this.traceMemoryValue([val]);
        return val;
    }
    readBytes(addr, len) {
        if (addr + len > this.length) {
            this.traceMemoryOp("RD-error", addr, len);
            throw new Error("MM: Invalid Read");
        }
        this.traceMemoryOp("RD", addr, len);
        var val = this.seg.readBytes(this.offset + addr, len);
        this.traceMemoryValue(val);
        return val;
    }
    copyBytes(fromAddr, toAddr, len) {
        if ((fromAddr + len > this.length) || (toAddr + len > this.length)) {
            this.traceMemoryOp("CP-error", fromAddr, len, toAddr);
            throw new Error("MM: Invalid Read");
        }
        {
            this.traceMemoryOp("CP", fromAddr, len, toAddr);
            var val = this.seg.readBytes(this.offset + fromAddr, len);
            this.traceMemoryValue(val);
        }
        this.seg.copyBytes(this.offset + fromAddr, this.offset + toAddr, len);
        return val;
    }
    writeByte(addr, val) {
        if (addr + 1 > this.length) {
            this.traceMemoryOp("WR-error", addr, 1);
            throw new Error("MM: Invalid Write");
        }
        this.traceMemoryOp("WR", addr, 1);
        this.seg.writeBytes(this.offset + addr, new ByteArray([val]));
        this.traceMemoryValue([val]);
    }
    writeBytes(addr, val) {
        if (addr + val.length > this.length) {
            this.traceMemoryOp("WR-error", addr, val.length);
            throw new Error("MM: Invalid Write");
        }
        this.traceMemoryOp("WR", addr, val.length);
        this.seg.writeBytes(this.offset + addr, val);
        this.traceMemoryValue(val);
    }
    getType() { return this.seg.getType(); }
    getLength() { return this.length; }
    getID() { return this.id; }
    getDebug() { return { offset: this.offset, length: this.length, seg: this.seg }; }
}
function sliceData(base, offset, size) {
    return base.subarray(offset, offset + size);
}
export class MemoryManager {
    constructor() {
        this.memorySegments = [];
        this.memTraces = [];
    }
    newSegment(memType, size, flags) {
        let newSeg = new Segment(memType, size, flags);
        this.memorySegments[memType] = newSeg;
        newSeg.memTraces = this.memTraces;
        return newSeg;
    }
    getMemTrace() { return this.memTraces; }
    initMemTrace() { this.memTraces = []; }
    getSegment(type) { return this.memorySegments[type]; }
}

export var MELINST;
(function (MELINST) {
    MELINST[MELINST["melSYSTEM"] = 0] = "melSYSTEM";
    MELINST[MELINST["melBRANCH"] = 1] = "melBRANCH";
    MELINST[MELINST["melJUMP"] = 2] = "melJUMP";
    MELINST[MELINST["melCALL"] = 3] = "melCALL";
    MELINST[MELINST["melSTACK"] = 4] = "melSTACK";
    MELINST[MELINST["melPRIMRET"] = 5] = "melPRIMRET";
    MELINST[MELINST["melINVALID"] = 6] = "melINVALID";
    MELINST[MELINST["melLOAD"] = 7] = "melLOAD";
    MELINST[MELINST["melSTORE"] = 8] = "melSTORE";
    MELINST[MELINST["melLOADI"] = 9] = "melLOADI";
    MELINST[MELINST["melSTOREI"] = 10] = "melSTOREI";
    MELINST[MELINST["melLOADA"] = 11] = "melLOADA";
    MELINST[MELINST["melINDEX"] = 12] = "melINDEX";
    MELINST[MELINST["melSETB"] = 13] = "melSETB";
    MELINST[MELINST["melCMPB"] = 14] = "melCMPB";
    MELINST[MELINST["melADDB"] = 15] = "melADDB";
    MELINST[MELINST["melSUBB"] = 16] = "melSUBB";
    MELINST[MELINST["melSETW"] = 17] = "melSETW";
    MELINST[MELINST["melCMPW"] = 18] = "melCMPW";
    MELINST[MELINST["melADDW"] = 19] = "melADDW";
    MELINST[MELINST["melSUBW"] = 20] = "melSUBW";
    MELINST[MELINST["melCLEARN"] = 21] = "melCLEARN";
    MELINST[MELINST["melTESTN"] = 22] = "melTESTN";
    MELINST[MELINST["melINCN"] = 23] = "melINCN";
    MELINST[MELINST["melDECN"] = 24] = "melDECN";
    MELINST[MELINST["melNOTN"] = 25] = "melNOTN";
    MELINST[MELINST["melCMPN"] = 26] = "melCMPN";
    MELINST[MELINST["melADDN"] = 27] = "melADDN";
    MELINST[MELINST["melSUBN"] = 28] = "melSUBN";
    MELINST[MELINST["melANDN"] = 29] = "melANDN";
    MELINST[MELINST["melORN"] = 30] = "melORN";
    MELINST[MELINST["melXORN"] = 31] = "melXORN";
})(MELINST || (MELINST = {}));
;
export var MELTAGADDR;
(function (MELTAGADDR) {
    MELTAGADDR[MELTAGADDR["melAddrTOS"] = 0] = "melAddrTOS";
    MELTAGADDR[MELTAGADDR["melAddrSB"] = 1] = "melAddrSB";
    MELTAGADDR[MELTAGADDR["melAddrST"] = 2] = "melAddrST";
    MELTAGADDR[MELTAGADDR["melAddrDB"] = 3] = "melAddrDB";
    MELTAGADDR[MELTAGADDR["melAddrLB"] = 4] = "melAddrLB";
    MELTAGADDR[MELTAGADDR["melAddrDT"] = 5] = "melAddrDT";
    MELTAGADDR[MELTAGADDR["melAddrPB"] = 6] = "melAddrPB";
    MELTAGADDR[MELTAGADDR["melAddrPT"] = 7] = "melAddrPT";
})(MELTAGADDR || (MELTAGADDR = {}));
;
export var MELTAGCOND;
(function (MELTAGCOND) {
    MELTAGCOND[MELTAGCOND["melCondSPEC"] = 0] = "melCondSPEC";
    MELTAGCOND[MELTAGCOND["melCondEQ"] = 1] = "melCondEQ";
    MELTAGCOND[MELTAGCOND["melCondLT"] = 2] = "melCondLT";
    MELTAGCOND[MELTAGCOND["melCondLE"] = 3] = "melCondLE";
    MELTAGCOND[MELTAGCOND["melCondGT"] = 4] = "melCondGT";
    MELTAGCOND[MELTAGCOND["melCondGE"] = 5] = "melCondGE";
    MELTAGCOND[MELTAGCOND["melCondNE"] = 6] = "melCondNE";
    MELTAGCOND[MELTAGCOND["melCondALL"] = 7] = "melCondALL";
})(MELTAGCOND || (MELTAGCOND = {}));
;
export var MELTAGSYSTEM;
(function (MELTAGSYSTEM) {
    MELTAGSYSTEM[MELTAGSYSTEM["melSystemNOP"] = 0] = "melSystemNOP";
    MELTAGSYSTEM[MELTAGSYSTEM["melSystemSetSW"] = 1] = "melSystemSetSW";
    MELTAGSYSTEM[MELTAGSYSTEM["melSystemSetLa"] = 2] = "melSystemSetLa";
    MELTAGSYSTEM[MELTAGSYSTEM["melSystemSetSWLa"] = 3] = "melSystemSetSWLa";
    MELTAGSYSTEM[MELTAGSYSTEM["melSystemExit"] = 4] = "melSystemExit";
    MELTAGSYSTEM[MELTAGSYSTEM["melSystemExitSW"] = 5] = "melSystemExitSW";
    MELTAGSYSTEM[MELTAGSYSTEM["melSystemExitLa"] = 6] = "melSystemExitLa";
    MELTAGSYSTEM[MELTAGSYSTEM["melSystemExitSWLa"] = 7] = "melSystemExitSWLa";
})(MELTAGSYSTEM || (MELTAGSYSTEM = {}));
;
export var MELTAGSTACK;
(function (MELTAGSTACK) {
    MELTAGSTACK[MELTAGSTACK["melStackPUSHZ"] = 0] = "melStackPUSHZ";
    MELTAGSTACK[MELTAGSTACK["melStackPUSHB"] = 1] = "melStackPUSHB";
    MELTAGSTACK[MELTAGSTACK["melStackPUSHW"] = 2] = "melStackPUSHW";
    MELTAGSTACK[MELTAGSTACK["melStackXX4"] = 3] = "melStackXX4";
    MELTAGSTACK[MELTAGSTACK["melStackPOPN"] = 4] = "melStackPOPN";
    MELTAGSTACK[MELTAGSTACK["melStackPOPB"] = 5] = "melStackPOPB";
    MELTAGSTACK[MELTAGSTACK["melStackPOPW"] = 6] = "melStackPOPW";
    MELTAGSTACK[MELTAGSTACK["melStackXX7"] = 7] = "melStackXX7";
})(MELTAGSTACK || (MELTAGSTACK = {}));
;
export var MELTAGPRIMRET;
(function (MELTAGPRIMRET) {
    MELTAGPRIMRET[MELTAGPRIMRET["melPrimRetPRIM0"] = 0] = "melPrimRetPRIM0";
    MELTAGPRIMRET[MELTAGPRIMRET["melPrimRetPRIM1"] = 1] = "melPrimRetPRIM1";
    MELTAGPRIMRET[MELTAGPRIMRET["melPrimRetPRIM2"] = 2] = "melPrimRetPRIM2";
    MELTAGPRIMRET[MELTAGPRIMRET["melPrimRetPRIM3"] = 3] = "melPrimRetPRIM3";
    MELTAGPRIMRET[MELTAGPRIMRET["melPrimRetRET"] = 4] = "melPrimRetRET";
    MELTAGPRIMRET[MELTAGPRIMRET["melPrimRetRETI"] = 5] = "melPrimRetRETI";
    MELTAGPRIMRET[MELTAGPRIMRET["melPrimRetRETO"] = 6] = "melPrimRetRETO";
    MELTAGPRIMRET[MELTAGPRIMRET["melPrimRetRETIO"] = 7] = "melPrimRetRETIO";
})(MELTAGPRIMRET || (MELTAGPRIMRET = {}));
;
export var MELPARAMDEF;
(function (MELPARAMDEF) {
    MELPARAMDEF[MELPARAMDEF["melParamDefNone"] = 0] = "melParamDefNone";
    MELPARAMDEF[MELPARAMDEF["melParamDefTopOfStack"] = 1] = "melParamDefTopOfStack";
    MELPARAMDEF[MELPARAMDEF["melParamDefByteOperLen"] = 17] = "melParamDefByteOperLen";
    MELPARAMDEF[MELPARAMDEF["melParamDefByteImmediate"] = 18] = "melParamDefByteImmediate";
    MELPARAMDEF[MELPARAMDEF["melParamDefByteCodeRelative"] = 24] = "melParamDefByteCodeRelative";
    MELPARAMDEF[MELPARAMDEF["melParamDefWordImmediate"] = 32] = "melParamDefWordImmediate";
    MELPARAMDEF[MELPARAMDEF["melParamDefWordOffsetSB"] = 33] = "melParamDefWordOffsetSB";
    MELPARAMDEF[MELPARAMDEF["melParamDefWordOffsetST"] = 34] = "melParamDefWordOffsetST";
    MELPARAMDEF[MELPARAMDEF["melParamDefWordOffsetDB"] = 35] = "melParamDefWordOffsetDB";
    MELPARAMDEF[MELPARAMDEF["melParamDefWordOffsetLB"] = 36] = "melParamDefWordOffsetLB";
    MELPARAMDEF[MELPARAMDEF["melParamDefWordOffsetDT"] = 37] = "melParamDefWordOffsetDT";
    MELPARAMDEF[MELPARAMDEF["melParamDefWordOffsetPB"] = 38] = "melParamDefWordOffsetPB";
    MELPARAMDEF[MELPARAMDEF["melParamDefWordOffsetPT"] = 39] = "melParamDefWordOffsetPT";
    MELPARAMDEF[MELPARAMDEF["melParamDefWordCodeAddress"] = 40] = "melParamDefWordCodeAddress";
})(MELPARAMDEF || (MELPARAMDEF = {}));
;
function MELPARAM4(a, b, c, d) { return ((d << 24) | (c << 16) | (b << 8) | (a << 0)); }
function OPTAG2MELINST(opCode, tag) { return (((opCode & 0x1f) << 3) | tag); }
export function MEL2OPCODE(byteCode) { return ((byteCode >> 3) & 0x1f); }
export function MEL2INST(byteCode) { return MEL2OPCODE(byteCode); }
export function MEL2TAG(byteCode) { return ((byteCode) & 7); }
;
function MELPARAMSIZE(paramType) {
    return (paramType == MELPARAMDEF.melParamDefNone)
        ? 0
        : (paramType < MELPARAMDEF.melParamDefWordImmediate) ? 1 : 2;
}
export class MEL {
}
MEL.melDecode = [];
function setMelDecode(byteCode, instName, param1, param2, param3, param4) {
    param1 = param1 || MELPARAMDEF.melParamDefNone;
    param2 = param2 || MELPARAMDEF.melParamDefNone;
    param3 = param3 || MELPARAMDEF.melParamDefNone;
    param4 = param4 || MELPARAMDEF.melParamDefNone;
    MEL.melDecode[byteCode] = {
        byteCode: byteCode,
        instLen: 1 + MELPARAMSIZE(param1) + MELPARAMSIZE(param2) + MELPARAMSIZE(param3) + MELPARAMSIZE(param4),
        instName: instName,
        paramDefs: MELPARAM4(param1, param2, param3, param4)
    };
}
function setMelDecodeStdModes(melInst, instName, param1Def) {
    setMelDecode(OPTAG2MELINST(melInst, MELTAGADDR.melAddrSB), instName, param1Def, MELPARAMDEF.melParamDefWordOffsetSB);
    setMelDecode(OPTAG2MELINST(melInst, MELTAGADDR.melAddrST), instName, param1Def, MELPARAMDEF.melParamDefWordOffsetST);
    setMelDecode(OPTAG2MELINST(melInst, MELTAGADDR.melAddrDB), instName, param1Def, MELPARAMDEF.melParamDefWordOffsetDB);
    setMelDecode(OPTAG2MELINST(melInst, MELTAGADDR.melAddrLB), instName, param1Def, MELPARAMDEF.melParamDefWordOffsetLB);
    setMelDecode(OPTAG2MELINST(melInst, MELTAGADDR.melAddrDT), instName, param1Def, MELPARAMDEF.melParamDefWordOffsetDT);
    setMelDecode(OPTAG2MELINST(melInst, MELTAGADDR.melAddrPB), instName, param1Def, MELPARAMDEF.melParamDefWordOffsetPB);
    setMelDecode(OPTAG2MELINST(melInst, MELTAGADDR.melAddrPT), instName, param1Def, MELPARAMDEF.melParamDefWordOffsetPT);
}
function setMelDecodeStdModesAndTOS(melInst, instName, param1Def) {
    setMelDecode(OPTAG2MELINST(melInst, MELTAGADDR.melAddrTOS), instName, param1Def, MELPARAMDEF.melParamDefTopOfStack);
    setMelDecodeStdModes(melInst, instName, param1Def);
}
function fillMelDecode() {
    setMelDecodeStdModesAndTOS(MELINST.melLOAD, "LOAD", MELPARAMDEF.melParamDefByteOperLen);
    setMelDecodeStdModesAndTOS(MELINST.melSTORE, "STORE", MELPARAMDEF.melParamDefByteOperLen);
    setMelDecodeStdModesAndTOS(MELINST.melLOADI, "LOADI", MELPARAMDEF.melParamDefByteOperLen);
    setMelDecodeStdModesAndTOS(MELINST.melSTOREI, "STOREI", MELPARAMDEF.melParamDefByteOperLen);
    setMelDecode(OPTAG2MELINST(MELINST.melLOADA, MELTAGADDR.melAddrSB), "LOADA", MELPARAMDEF.melParamDefWordOffsetSB);
    setMelDecode(OPTAG2MELINST(MELINST.melLOADA, MELTAGADDR.melAddrST), "LOADA", MELPARAMDEF.melParamDefWordOffsetST);
    setMelDecode(OPTAG2MELINST(MELINST.melLOADA, MELTAGADDR.melAddrDB), "LOADA", MELPARAMDEF.melParamDefWordOffsetDB);
    setMelDecode(OPTAG2MELINST(MELINST.melLOADA, MELTAGADDR.melAddrLB), "LOADA", MELPARAMDEF.melParamDefWordOffsetLB);
    setMelDecode(OPTAG2MELINST(MELINST.melLOADA, MELTAGADDR.melAddrDT), "LOADA", MELPARAMDEF.melParamDefWordOffsetDT);
    setMelDecode(OPTAG2MELINST(MELINST.melLOADA, MELTAGADDR.melAddrPB), "LOADA", MELPARAMDEF.melParamDefWordOffsetPB);
    setMelDecode(OPTAG2MELINST(MELINST.melLOADA, MELTAGADDR.melAddrPT), "LOADA", MELPARAMDEF.melParamDefWordOffsetPT);
    setMelDecodeStdModes(MELINST.melINDEX, "INDEX", MELPARAMDEF.melParamDefByteImmediate);
    setMelDecodeStdModesAndTOS(MELINST.melSETB, "SETB", MELPARAMDEF.melParamDefByteImmediate);
    setMelDecodeStdModesAndTOS(MELINST.melCMPB, "CMPB", MELPARAMDEF.melParamDefByteImmediate);
    setMelDecodeStdModesAndTOS(MELINST.melADDB, "ADDB", MELPARAMDEF.melParamDefByteImmediate);
    setMelDecodeStdModesAndTOS(MELINST.melSUBB, "SUBB", MELPARAMDEF.melParamDefByteImmediate);
    setMelDecodeStdModesAndTOS(MELINST.melSETW, "SETW", MELPARAMDEF.melParamDefWordImmediate);
    setMelDecodeStdModesAndTOS(MELINST.melCMPW, "CMPW", MELPARAMDEF.melParamDefWordImmediate);
    setMelDecodeStdModesAndTOS(MELINST.melADDW, "ADDW", MELPARAMDEF.melParamDefWordImmediate);
    setMelDecodeStdModesAndTOS(MELINST.melSUBW, "SUBW", MELPARAMDEF.melParamDefWordImmediate);
    setMelDecodeStdModesAndTOS(MELINST.melCLEARN, "CLEARN", MELPARAMDEF.melParamDefByteOperLen);
    setMelDecodeStdModesAndTOS(MELINST.melTESTN, "TESTN", MELPARAMDEF.melParamDefByteOperLen);
    setMelDecodeStdModesAndTOS(MELINST.melINCN, "INCN", MELPARAMDEF.melParamDefByteOperLen);
    setMelDecodeStdModesAndTOS(MELINST.melDECN, "DECN", MELPARAMDEF.melParamDefByteOperLen);
    setMelDecodeStdModesAndTOS(MELINST.melNOTN, "NOTN", MELPARAMDEF.melParamDefByteOperLen);
    setMelDecodeStdModesAndTOS(MELINST.melCMPN, "CMPN", MELPARAMDEF.melParamDefByteOperLen);
    setMelDecodeStdModesAndTOS(MELINST.melADDN, "ADDN", MELPARAMDEF.melParamDefByteOperLen);
    setMelDecodeStdModesAndTOS(MELINST.melSUBN, "SUBN", MELPARAMDEF.melParamDefByteOperLen);
    setMelDecodeStdModesAndTOS(MELINST.melANDN, "ANDN", MELPARAMDEF.melParamDefByteOperLen);
    setMelDecodeStdModesAndTOS(MELINST.melORN, "ORN", MELPARAMDEF.melParamDefByteOperLen);
    setMelDecodeStdModesAndTOS(MELINST.melXORN, "XORN", MELPARAMDEF.melParamDefByteOperLen);
    setMelDecode(OPTAG2MELINST(MELINST.melSYSTEM, MELTAGSYSTEM.melSystemNOP), "NOP");
    setMelDecode(OPTAG2MELINST(MELINST.melSYSTEM, MELTAGSYSTEM.melSystemSetSW), "SETSW", MELPARAMDEF.melParamDefWordImmediate);
    setMelDecode(OPTAG2MELINST(MELINST.melSYSTEM, MELTAGSYSTEM.melSystemSetLa), "SETLA", MELPARAMDEF.melParamDefWordImmediate);
    setMelDecode(OPTAG2MELINST(MELINST.melSYSTEM, MELTAGSYSTEM.melSystemSetSWLa), "SETSWLA", MELPARAMDEF.melParamDefWordImmediate, MELPARAMDEF.melParamDefWordImmediate);
    setMelDecode(OPTAG2MELINST(MELINST.melSYSTEM, MELTAGSYSTEM.melSystemExit), "EXIT");
    setMelDecode(OPTAG2MELINST(MELINST.melSYSTEM, MELTAGSYSTEM.melSystemExitSW), "EXITSW", MELPARAMDEF.melParamDefWordImmediate);
    setMelDecode(OPTAG2MELINST(MELINST.melSYSTEM, MELTAGSYSTEM.melSystemExitLa), "EXITA", MELPARAMDEF.melParamDefWordImmediate);
    setMelDecode(OPTAG2MELINST(MELINST.melSYSTEM, MELTAGSYSTEM.melSystemExitSWLa), "EXITSWLA", MELPARAMDEF.melParamDefWordImmediate, MELPARAMDEF.melParamDefWordImmediate);
    setMelDecode(OPTAG2MELINST(MELINST.melBRANCH, MELTAGCOND.melCondEQ), "BEQ", MELPARAMDEF.melParamDefByteCodeRelative);
    setMelDecode(OPTAG2MELINST(MELINST.melBRANCH, MELTAGCOND.melCondLT), "BLT", MELPARAMDEF.melParamDefByteCodeRelative);
    setMelDecode(OPTAG2MELINST(MELINST.melBRANCH, MELTAGCOND.melCondLE), "BLE", MELPARAMDEF.melParamDefByteCodeRelative);
    setMelDecode(OPTAG2MELINST(MELINST.melBRANCH, MELTAGCOND.melCondGT), "BGT", MELPARAMDEF.melParamDefByteCodeRelative);
    setMelDecode(OPTAG2MELINST(MELINST.melBRANCH, MELTAGCOND.melCondGE), "BGE", MELPARAMDEF.melParamDefByteCodeRelative);
    setMelDecode(OPTAG2MELINST(MELINST.melBRANCH, MELTAGCOND.melCondNE), "BNE", MELPARAMDEF.melParamDefByteCodeRelative);
    setMelDecode(OPTAG2MELINST(MELINST.melBRANCH, MELTAGCOND.melCondALL), "BA", MELPARAMDEF.melParamDefByteCodeRelative);
    setMelDecode(OPTAG2MELINST(MELINST.melJUMP, MELTAGCOND.melCondSPEC), "JA", MELPARAMDEF.melParamDefNone);
    setMelDecode(OPTAG2MELINST(MELINST.melJUMP, MELTAGCOND.melCondEQ), "JEQ", MELPARAMDEF.melParamDefWordCodeAddress);
    setMelDecode(OPTAG2MELINST(MELINST.melJUMP, MELTAGCOND.melCondLT), "JLT", MELPARAMDEF.melParamDefWordCodeAddress);
    setMelDecode(OPTAG2MELINST(MELINST.melJUMP, MELTAGCOND.melCondLE), "JLE", MELPARAMDEF.melParamDefWordCodeAddress);
    setMelDecode(OPTAG2MELINST(MELINST.melJUMP, MELTAGCOND.melCondGT), "JGT", MELPARAMDEF.melParamDefWordCodeAddress);
    setMelDecode(OPTAG2MELINST(MELINST.melJUMP, MELTAGCOND.melCondGE), "JGE", MELPARAMDEF.melParamDefWordCodeAddress);
    setMelDecode(OPTAG2MELINST(MELINST.melJUMP, MELTAGCOND.melCondNE), "JNE", MELPARAMDEF.melParamDefWordCodeAddress);
    setMelDecode(OPTAG2MELINST(MELINST.melJUMP, MELTAGCOND.melCondALL), "JA", MELPARAMDEF.melParamDefWordCodeAddress);
    setMelDecode(OPTAG2MELINST(MELINST.melCALL, MELTAGCOND.melCondSPEC), "CA", MELPARAMDEF.melParamDefNone);
    setMelDecode(OPTAG2MELINST(MELINST.melCALL, MELTAGCOND.melCondEQ), "CEQ", MELPARAMDEF.melParamDefWordCodeAddress);
    setMelDecode(OPTAG2MELINST(MELINST.melCALL, MELTAGCOND.melCondLT), "CLT", MELPARAMDEF.melParamDefWordCodeAddress);
    setMelDecode(OPTAG2MELINST(MELINST.melCALL, MELTAGCOND.melCondLE), "CLE", MELPARAMDEF.melParamDefWordCodeAddress);
    setMelDecode(OPTAG2MELINST(MELINST.melCALL, MELTAGCOND.melCondGT), "CGT", MELPARAMDEF.melParamDefWordCodeAddress);
    setMelDecode(OPTAG2MELINST(MELINST.melCALL, MELTAGCOND.melCondGE), "CGE", MELPARAMDEF.melParamDefWordCodeAddress);
    setMelDecode(OPTAG2MELINST(MELINST.melCALL, MELTAGCOND.melCondNE), "CNE", MELPARAMDEF.melParamDefWordCodeAddress);
    setMelDecode(OPTAG2MELINST(MELINST.melCALL, MELTAGCOND.melCondALL), "CA", MELPARAMDEF.melParamDefWordCodeAddress);
    setMelDecode(OPTAG2MELINST(MELINST.melSTACK, MELTAGSTACK.melStackPUSHZ), "PUSHZ", MELPARAMDEF.melParamDefByteOperLen);
    setMelDecode(OPTAG2MELINST(MELINST.melSTACK, MELTAGSTACK.melStackPUSHB), "PUSHB", MELPARAMDEF.melParamDefByteImmediate);
    setMelDecode(OPTAG2MELINST(MELINST.melSTACK, MELTAGSTACK.melStackPUSHW), "PUSHW", MELPARAMDEF.melParamDefWordImmediate);
    setMelDecode(OPTAG2MELINST(MELINST.melSTACK, MELTAGSTACK.melStackPOPN), "POPN", MELPARAMDEF.melParamDefByteOperLen);
    setMelDecode(OPTAG2MELINST(MELINST.melSTACK, MELTAGSTACK.melStackPOPB), "POPB");
    setMelDecode(OPTAG2MELINST(MELINST.melSTACK, MELTAGSTACK.melStackPOPW), "POPW");
    setMelDecode(OPTAG2MELINST(MELINST.melPRIMRET, MELTAGPRIMRET.melPrimRetPRIM0), "PRIM", MELPARAMDEF.melParamDefByteImmediate);
    setMelDecode(OPTAG2MELINST(MELINST.melPRIMRET, MELTAGPRIMRET.melPrimRetPRIM1), "PRIM", MELPARAMDEF.melParamDefByteImmediate, MELPARAMDEF.melParamDefByteImmediate);
    setMelDecode(OPTAG2MELINST(MELINST.melPRIMRET, MELTAGPRIMRET.melPrimRetPRIM2), "PRIM", MELPARAMDEF.melParamDefByteImmediate, MELPARAMDEF.melParamDefByteImmediate, MELPARAMDEF.melParamDefByteImmediate);
    setMelDecode(OPTAG2MELINST(MELINST.melPRIMRET, MELTAGPRIMRET.melPrimRetPRIM3), "PRIM", MELPARAMDEF.melParamDefByteImmediate, MELPARAMDEF.melParamDefByteImmediate, MELPARAMDEF.melParamDefByteImmediate, MELPARAMDEF.melParamDefByteImmediate);
    setMelDecode(OPTAG2MELINST(MELINST.melPRIMRET, MELTAGPRIMRET.melPrimRetRET), "RET");
    setMelDecode(OPTAG2MELINST(MELINST.melPRIMRET, MELTAGPRIMRET.melPrimRetRETI), "RET", MELPARAMDEF.melParamDefByteOperLen);
    setMelDecode(OPTAG2MELINST(MELINST.melPRIMRET, MELTAGPRIMRET.melPrimRetRETO), "RET", MELPARAMDEF.melParamDefByteOperLen);
    setMelDecode(OPTAG2MELINST(MELINST.melPRIMRET, MELTAGPRIMRET.melPrimRetRETIO), "RET", MELPARAMDEF.melParamDefByteOperLen, MELPARAMDEF.melParamDefByteOperLen);
}
fillMelDecode();
export var MELDecode = MEL.melDecode;
export const MEL_CCR_Z = 0x01;
export const MEL_CCR_C = 0x02;



function hex(val) { return val.toString(16); }
function hex2(val) { return ("00" + val.toString(16)).substr(-2); }
function hex4(val) { return ("0000" + val.toString(16)).substr(-4); }
function ljust(str, w) { return (str + Array(w + 1).join(" ")).substr(0, w); }
function rjust(str, w) { return (Array(w + 1).join(" ") + str).substr(-w); }
function BA2W(val) {
    return (val[0] << 8) | val[1];
}
function W2BA(val) {
    return new ByteArray([val >> 8, val & 0xFF]);
}
export class MELVirtualMachine {
    constructor() {
        this.segs = ["", "SB", "ST", "DB", "LB", "DT", "PB", "PT"];
    }
    initMVM(params) {
        this.romSegment = params.romSegment;
        this.ramSegment = params.ramSegment;
        this.publicArea = this.ramSegment.newAccessor(0, 512, "P");
    }
    disassembleCode(resetIP, stepToNextIP) {
        var dismText = "";
        function print(str) { dismText += str; }
        if (resetIP)
            this.currentIP = 0;
        if (this.currentIP >= this.codeArea.getLength())
            return null;
        try {
            var nextIP = this.currentIP;
            var instByte = this.codeArea.readByte(nextIP++);
            var paramCount = 0;
            var paramVal = [];
            var paramDef = [];
            var melInst = MEL.MELDecode[instByte];
            if (melInst == undefined) {
                print("[" + hex4(this.currentIP) + "]          " + ljust("ERROR:" + hex2(instByte), 8) + " ********\n");
            }
            else {
                var paramDefs = melInst.paramDefs;
                while (paramDefs != 0) {
                    paramDef[paramCount] = paramDefs & 0xFF;
                    switch (paramDefs & 0xF0) {
                        case 0x00: break;
                        case 0x10:
                            paramVal[paramCount] = this.codeArea.readByte(nextIP++);
                            break;
                        case 0x20:
                            paramVal[paramCount] = BA2W([this.codeArea.readByte(nextIP++), this.codeArea.readByte(nextIP++)]);
                            break;
                    }
                    paramCount++;
                    paramDefs >>= 8;
                }
                print("[" + hex4(this.currentIP) + "]          " + ljust(melInst.instName, 8));
                if ((paramCount > 1)
                    && ((paramDef[0] == MEL.MELPARAMDEF.melParamDefByteOperLen)
                        || (paramDef[0] == MEL.MELPARAMDEF.melParamDefByteImmediate)
                        || (paramDef[0] == MEL.MELPARAMDEF.melParamDefWordImmediate))
                    && (paramDef[1] != MEL.MELPARAMDEF.melParamDefByteImmediate)
                    && (paramDef[1] != MEL.MELPARAMDEF.melParamDefByteOperLen)) {
                    var tempVal = paramVal[1];
                    paramVal[1] = paramVal[0];
                    paramVal[0] = tempVal;
                    var tempDef = paramDef[1];
                    paramDef[1] = paramDef[0];
                    paramDef[0] = tempDef;
                }
                for (var paramIndex = 0; paramIndex < paramCount; ++paramIndex) {
                    var v = paramVal[paramIndex];
                    var d = paramDef[paramIndex];
                    switch (d) {
                        case MEL.MELPARAMDEF.melParamDefByteOperLen:
                            if (v > 0)
                                print("0x" + hex(v));
                            else
                                print(v);
                            break;
                        case MEL.MELPARAMDEF.melParamDefByteImmediate:
                            if (v > 0)
                                print("0x" + hex(v));
                            else
                                print(v);
                            break;
                        case MEL.MELPARAMDEF.melParamDefWordImmediate:
                            print("0x" + hex(v));
                            break;
                        case MEL.MELPARAMDEF.melParamDefWordCodeAddress:
                            print(hex4(v));
                            break;
                        case MEL.MELPARAMDEF.melParamDefByteCodeRelative:
                            print(hex4(this.currentIP + 2 + v));
                            break;
                        case MEL.MELPARAMDEF.melParamDefWordOffsetSB:
                        case MEL.MELPARAMDEF.melParamDefWordOffsetST:
                        case MEL.MELPARAMDEF.melParamDefWordOffsetDB:
                        case MEL.MELPARAMDEF.melParamDefWordOffsetLB:
                        case MEL.MELPARAMDEF.melParamDefWordOffsetDT:
                        case MEL.MELPARAMDEF.melParamDefWordOffsetPB:
                        case MEL.MELPARAMDEF.melParamDefWordOffsetPT:
                            {
                                var seg = ["", "SB", "ST", "DB", "LB", "DT", "PB", "PT"];
                                print(seg[d & 0x07]);
                                if (v > 0)
                                    print("[0x" + hex(v) + "]");
                                else
                                    print("[" + v + "]");
                                break;
                            }
                    }
                    if (paramIndex < paramCount - 1)
                        print(", ");
                }
                print("\n");
            }
            if (stepToNextIP)
                this.currentIP = nextIP;
        }
        catch (e) {
            print(e);
        }
        ;
        return dismText;
    }
    mapToSegmentAddr(addrTag, addrOffset) {
        var targetAccess = this.checkDataAccess(addrTag, addrOffset, 0);
        switch (addrTag) {
            case MEL.MELTAGADDR.melAddrTOS:
            case MEL.MELTAGADDR.melAddrDB:
            case MEL.MELTAGADDR.melAddrLB:
            case MEL.MELTAGADDR.melAddrDT:
                return 0x8000 + targetAccess.dataOffset;
            case MEL.MELTAGADDR.melAddrSB:
            case MEL.MELTAGADDR.melAddrST:
                return targetAccess.dataOffset;
            case MEL.MELTAGADDR.melAddrPB:
            case MEL.MELTAGADDR.melAddrPT:
                return 0xF000 + targetAccess.dataOffset;
        }
    }
    mapFromSegmentAddr(segmentAddr) {
        if (segmentAddr & 0x8000) {
            if (segmentAddr >= 0xF000) {
                return {
                    dataArea: this.publicArea,
                    dataAddrTag: MEL.MELTAGADDR.melAddrPB,
                    dataOffset: segmentAddr & 0x0FFF
                };
            }
            else {
                return {
                    dataArea: this.dynamicArea,
                    dataAddrTag: MEL.MELTAGADDR.melAddrDB,
                    dataOffset: segmentAddr & 0x3FFF
                };
            }
        }
        else {
            return {
                dataArea: this.staticArea,
                dataAddrTag: MEL.MELTAGADDR.melAddrSB,
                dataOffset: segmentAddr & 0x7FFF
            };
        }
    }
    checkDataAccess(addrTag, offset, length) {
        var dataArea;
        var dataOffset = offset;
        var areaLimit;
        switch (addrTag) {
            case MEL.MELTAGADDR.melAddrTOS:
                dataArea = this.dynamicArea;
                areaLimit = this.dynamicArea.getLength();
                dataOffset += this.localBase;
                break;
            case MEL.MELTAGADDR.melAddrDB:
                dataArea = this.dynamicArea;
                areaLimit = this.dynamicArea.getLength();
                break;
            case MEL.MELTAGADDR.melAddrLB:
                dataArea = this.dynamicArea;
                areaLimit = this.dynamicArea.getLength();
                dataOffset += this.localBase;
                break;
            case MEL.MELTAGADDR.melAddrDT:
                dataArea = this.dynamicArea;
                areaLimit = this.dynamicArea.getLength();
                dataOffset += this.dynamicTop;
                break;
            case MEL.MELTAGADDR.melAddrSB:
                dataArea = this.staticArea;
                areaLimit = this.staticArea.getLength();
                break;
            case MEL.MELTAGADDR.melAddrST:
                dataArea = this.staticArea;
                areaLimit = this.staticArea.getLength();
                dataOffset += areaLimit;
                break;
            case MEL.MELTAGADDR.melAddrPB:
                dataArea = this.publicArea;
                areaLimit = this.publicArea.getLength();
                break;
            case MEL.MELTAGADDR.melAddrPT:
                dataArea = this.publicArea;
                areaLimit = this.publicArea.getLength();
                dataOffset += areaLimit;
                break;
        }
        dataOffset &= 0xffff;
        if ((dataOffset < areaLimit) && (dataOffset + length < areaLimit)) {
            return {
                dataArea: dataArea,
                dataOffset: dataOffset
            };
        }
    }
    readSegmentData(addrTag, offset, length) {
        var targetAccess = this.checkDataAccess(addrTag, offset, 1);
        if (targetAccess == undefined)
            return;
        return targetAccess.dataArea.readBytes(targetAccess.dataOffset, length);
    }
    writeSegmentData(addrTag, offset, val) {
        var targetAccess = this.checkDataAccess(addrTag, offset, 1);
        if (targetAccess == undefined)
            return;
        targetAccess.dataArea.writeBytes(targetAccess.dataOffset, val);
    }
    pushZerosToStack(cnt) {
        this.dynamicArea.zeroBytes(this.dynamicTop, cnt);
        this.dynamicTop += cnt;
    }
    pushConstToStack(cnt, val) {
        if (cnt == 1)
            this.dynamicArea.writeBytes(this.dynamicTop, [val]);
        else
            this.dynamicArea.writeBytes(this.dynamicTop, W2BA(val));
        this.dynamicTop += cnt;
    }
    copyOnStack(fromOffset, toOffset, cnt) {
        this.dynamicArea.copyBytes(fromOffset, toOffset, cnt);
    }
    pushToStack(addrTag, offset, cnt) {
        this.dynamicTop += cnt;
        this.dynamicArea.writeBytes(this.dynamicTop, this.readSegmentData(addrTag, offset, cnt));
    }
    popFromStackAndStore(addrTag, offset, cnt) {
        this.dynamicTop -= cnt;
        this.writeSegmentData(addrTag, offset, this.dynamicArea.readBytes(this.dynamicTop, cnt));
    }
    popFromStack(cnt) {
        this.dynamicTop -= cnt;
        return this.dynamicArea.readBytes(this.dynamicTop, cnt);
    }
    setupApplication(execParams) {
        this.codeArea = execParams.codeArea;
        this.staticArea = execParams.staticArea;
        this.sessionSize = execParams.sessionSize;
        this.dynamicArea = this.ramSegment.newAccessor(0, 512, "D");
        this.initExecution();
    }
    initExecution() {
        this.currentIP = 0;
        this.isExecuting = true;
        this.localBase = this.sessionSize;
        this.dynamicTop = this.localBase;
        this.conditionCodeReg = 0;
    }
    constByteBinaryOperation(opCode, constVal, addrTag, addrOffset) {
        var targetAccess = this.checkDataAccess(addrTag, addrOffset, 1);
        if (targetAccess == undefined)
            return;
        var tempVal = targetAccess.dataArea.readByte(targetAccess.dataOffset);
        switch (opCode) {
            case MEL.MELINST.melADDB:
                this.conditionCodeReg &= ~(MEL.MEL_CCR_C | MEL.MEL_CCR_Z);
                tempVal = (tempVal + constVal);
                if (tempVal < constVal)
                    this.conditionCodeReg |= MEL.MEL_CCR_C;
                break;
            case MEL.MELINST.melSUBB:
                this.conditionCodeReg &= ~(MEL.MEL_CCR_C | MEL.MEL_CCR_Z);
                tempVal = (tempVal - constVal);
                if (tempVal > constVal)
                    this.conditionCodeReg |= MEL.MEL_CCR_C;
                break;
            case MEL.MELINST.melCMPB:
                this.conditionCodeReg &= ~(MEL.MEL_CCR_C | MEL.MEL_CCR_Z);
                tempVal = (tempVal - constVal);
                if (tempVal > constVal)
                    this.conditionCodeReg |= MEL.MEL_CCR_C;
                break;
            case MEL.MELINST.melSETB:
                this.conditionCodeReg &= ~(MEL.MEL_CCR_C | MEL.MEL_CCR_Z);
                tempVal = constVal;
                break;
        }
        if (tempVal == 0)
            this.conditionCodeReg |= MEL.MEL_CCR_Z;
        if (opCode != MEL.MELINST.melCMPB) {
            targetAccess.dataArea.writeByte(targetAccess.dataOffset, tempVal);
        }
    }
    constWordBinaryOperation(opCode, constVal, addrTag, addrOffset) {
        var targetAccess = this.checkDataAccess(addrTag, addrOffset, 2);
        if (targetAccess == undefined)
            return;
        var tempVal = BA2W(targetAccess.dataArea.readBytes(targetAccess.dataOffset, 2));
        switch (opCode) {
            case MEL.MELINST.melADDB:
                this.conditionCodeReg &= ~(MEL.MEL_CCR_C | MEL.MEL_CCR_Z);
                tempVal = (tempVal + constVal);
                if (tempVal < constVal)
                    this.conditionCodeReg |= MEL.MEL_CCR_C;
                break;
            case MEL.MELINST.melSUBB:
                this.conditionCodeReg &= ~(MEL.MEL_CCR_C | MEL.MEL_CCR_Z);
                tempVal = (tempVal - constVal);
                if (tempVal > constVal)
                    this.conditionCodeReg |= MEL.MEL_CCR_C;
                break;
            case MEL.MELINST.melCMPB:
                this.conditionCodeReg &= ~(MEL.MEL_CCR_C | MEL.MEL_CCR_Z);
                tempVal = (tempVal - constVal);
                if (tempVal > constVal)
                    this.conditionCodeReg |= MEL.MEL_CCR_C;
                break;
            case MEL.MELINST.melSETB:
                this.conditionCodeReg &= ~(MEL.MEL_CCR_C | MEL.MEL_CCR_Z);
                tempVal = constVal;
                break;
        }
        if (tempVal == 0)
            this.conditionCodeReg |= MEL.MEL_CCR_Z;
        if (opCode != MEL.MELINST.melCMPW) {
            targetAccess.dataArea.writeBytes(targetAccess.dataOffset, W2BA(tempVal));
        }
    }
    binaryOperation(opCode, opSize, addrTag, addrOffset) {
        var targetAccess = this.checkDataAccess(addrTag, addrOffset, 1);
        if (targetAccess == undefined)
            return;
        this.checkDataAccess(-opSize - 1, opSize, MEL.MELTAGADDR.melAddrTOS);
    }
    unaryOperation(opCode, opSize, addrTag, addrOffset) {
        var targetAccess = this.checkDataAccess(addrTag, addrOffset, 1);
        if (targetAccess == undefined)
            return;
        switch (opCode) {
            case MEL.MELINST.melCLEARN:
                targetAccess.dataArea.zeroBytes(targetAccess.dataOffset, opSize);
                break;
            case MEL.MELINST.melTESTN:
            case MEL.MELINST.melINCN:
            case MEL.MELINST.melDECN:
            case MEL.MELINST.melNOTN:
                ;
        }
    }
    handleReturn(inBytes, outBytes) {
        var retValOffset = this.dynamicTop - outBytes;
        var returnIP = BA2W(this.dynamicArea.readBytes(this.localBase - 2, 2));
        this.localBase = BA2W(this.dynamicArea.readBytes(this.localBase - 4, 2));
        this.dynamicTop = this.localBase + outBytes;
        if (outBytes)
            this.copyOnStack(retValOffset, this.localBase, outBytes);
        return returnIP;
    }
    isCondition(tag) {
        switch (tag) {
            case MEL.MELTAGCOND.melCondEQ:
                return (this.conditionCodeReg & MEL.MEL_CCR_Z);
            case MEL.MELTAGCOND.melCondLT:
                return !(this.conditionCodeReg & MEL.MEL_CCR_C);
            case MEL.MELTAGCOND.melCondLE:
                return (this.conditionCodeReg & MEL.MEL_CCR_Z) || !(this.conditionCodeReg & MEL.MEL_CCR_C);
            case MEL.MELTAGCOND.melCondGT:
                return (this.conditionCodeReg & MEL.MEL_CCR_C);
            case MEL.MELTAGCOND.melCondGE:
                return (this.conditionCodeReg & MEL.MEL_CCR_Z) || (this.conditionCodeReg & MEL.MEL_CCR_C);
            case MEL.MELTAGCOND.melCondNE:
                return !(this.conditionCodeReg & MEL.MEL_CCR_Z);
            case MEL.MELTAGCOND.melCondALL:
                return true;
            default:
        }
        return false;
    }
    executeStep() {
        try {
            var nextIP = this.currentIP;
            var instByte = this.codeArea.readByte(nextIP++);
            var paramCount = 0;
            var paramVal = [];
            var paramDef = [];
            var melInst = MEL.MELDecode[instByte];
            if (melInst == undefined) {
                return null;
            }
            else {
                var paramDefs = melInst.paramDefs;
                while (paramDefs != 0) {
                    paramDef[paramCount] = paramDefs & 0xFF;
                    switch (paramDefs & 0xF0) {
                        case 0x00: break;
                        case 0x10:
                            paramVal[paramCount] = this.codeArea.readByte(nextIP++);
                            break;
                        case 0x20:
                            paramVal[paramCount] = BA2W([this.codeArea.readByte(nextIP++), this.codeArea.readByte(nextIP++)]);
                            break;
                    }
                    paramCount++;
                    paramDefs >>= 8;
                }
            }
            var opCode = MEL.MEL2OPCODE(instByte);
            var tag = MEL.MEL2TAG(instByte);
            switch (opCode) {
                case MEL.MELINST.melSYSTEM:
                    {
                        var publicTop = this.publicArea.getLength();
                        switch (tag) {
                            case MEL.MELTAGSYSTEM.melSystemExit:
                                this.isExecuting = false;
                            case MEL.MELTAGSYSTEM.melSystemNOP:
                                break;
                            case MEL.MELTAGSYSTEM.melSystemExitSW:
                                this.isExecuting = false;
                            case MEL.MELTAGSYSTEM.melSystemSetSW:
                                this.publicArea.writeBytes(publicTop - 2, W2BA(paramVal[0]));
                                break;
                            case MEL.MELTAGSYSTEM.melSystemExitLa:
                                this.isExecuting = false;
                            case MEL.MELTAGSYSTEM.melSystemSetLa:
                                this.publicArea.writeBytes(publicTop - 4, W2BA(paramVal[0]));
                                break;
                            case MEL.MELTAGSYSTEM.melSystemExitSWLa:
                                this.isExecuting = false;
                            case MEL.MELTAGSYSTEM.melSystemSetSWLa:
                                this.publicArea.writeBytes(publicTop - 2, W2BA(paramVal[0]));
                                this.publicArea.writeBytes(publicTop - 4, W2BA(paramVal[1]));
                                break;
                        }
                        break;
                    }
                case MEL.MELINST.melBRANCH:
                    if (this.isCondition(tag))
                        nextIP = nextIP + paramVal[0];
                    break;
                case MEL.MELINST.melJUMP:
                    if (this.isCondition(tag))
                        nextIP = paramVal[0];
                    break;
                case MEL.MELINST.melCALL:
                    if (this.isCondition(tag)) {
                        this.pushConstToStack(2, this.localBase);
                        this.pushConstToStack(2, nextIP);
                        nextIP = paramVal[0];
                        this.localBase = this.dynamicTop;
                    }
                    break;
                case MEL.MELINST.melSTACK:
                    {
                        switch (tag) {
                            case MEL.MELTAGSTACK.melStackPUSHZ:
                                {
                                    this.pushZerosToStack(paramVal[0]);
                                    break;
                                }
                            case MEL.MELTAGSTACK.melStackPUSHB:
                                this.pushConstToStack(1, paramVal[0]);
                                break;
                            case MEL.MELTAGSTACK.melStackPUSHW:
                                this.pushConstToStack(2, paramVal[0]);
                                break;
                            case MEL.MELTAGSTACK.melStackPOPN:
                                this.popFromStack(paramVal[0]);
                                break;
                            case MEL.MELTAGSTACK.melStackPOPB:
                                this.popFromStack(1);
                                break;
                            case MEL.MELTAGSTACK.melStackPOPW:
                                this.popFromStack(2);
                                break;
                        }
                        break;
                    }
                case MEL.MELINST.melPRIMRET:
                    {
                        switch (tag) {
                            case MEL.MELTAGPRIMRET.melPrimRetPRIM0:
                            case MEL.MELTAGPRIMRET.melPrimRetPRIM1:
                            case MEL.MELTAGPRIMRET.melPrimRetPRIM2:
                            case MEL.MELTAGPRIMRET.melPrimRetPRIM3:
                                break;
                            case MEL.MELTAGPRIMRET.melPrimRetRET:
                                nextIP = this.handleReturn(0, 0);
                                break;
                            case MEL.MELTAGPRIMRET.melPrimRetRETI:
                                nextIP = this.handleReturn(paramVal[0], 0);
                                break;
                            case MEL.MELTAGPRIMRET.melPrimRetRETO:
                                nextIP = this.handleReturn(0, paramVal[0]);
                                break;
                            case MEL.MELTAGPRIMRET.melPrimRetRETIO:
                                nextIP = this.handleReturn(paramVal[0], paramVal[1]);
                                break;
                        }
                        break;
                    }
                case MEL.MELINST.melLOAD:
                    if (tag == MEL.MELTAGADDR.melAddrTOS) {
                        this.copyOnStack(this.dynamicTop - paramVal[0], this.dynamicTop, paramVal[0]);
                        this.dynamicTop += paramVal[0];
                    }
                    else
                        this.pushToStack(tag, paramVal[1], paramVal[0]);
                    break;
                case MEL.MELINST.melSTORE:
                    if (tag == MEL.MELTAGADDR.melAddrTOS) {
                        this.dynamicTop -= paramVal[0];
                        this.copyOnStack(this.dynamicTop, this.dynamicTop - paramVal[0], paramVal[0]);
                    }
                    else
                        this.popFromStackAndStore(tag, paramVal[1], paramVal[0]);
                    break;
                case MEL.MELINST.melLOADI:
                    {
                        var segmentAddr = BA2W(this.readSegmentData(tag, paramVal[1], 2));
                        var targetAccess = this.mapFromSegmentAddr(segmentAddr);
                        this.pushToStack(targetAccess.dataAddrTag, targetAccess.dataOffset, paramVal[0]);
                        break;
                    }
                case MEL.MELINST.melSTOREI:
                    {
                        var segmentAddr = BA2W(this.readSegmentData(tag, paramVal[1], 2));
                        var targetAccess = this.mapFromSegmentAddr(segmentAddr);
                        this.popFromStackAndStore(targetAccess.dataAddrTag, targetAccess.dataOffset, paramVal[0]);
                        break;
                    }
                case MEL.MELINST.melLOADA:
                    this.pushConstToStack(2, this.mapToSegmentAddr(tag, paramVal[0]));
                    break;
                case MEL.MELINST.melINDEX:
                    break;
                case MEL.MELINST.melSETB:
                case MEL.MELINST.melCMPB:
                case MEL.MELINST.melADDB:
                case MEL.MELINST.melSUBB:
                    if (tag == MEL.MELTAGADDR.melAddrTOS)
                        this.constByteBinaryOperation(opCode, paramVal[0], MEL.MELTAGADDR.melAddrDT, -1);
                    else
                        this.constByteBinaryOperation(opCode, paramVal[0], tag, paramVal[1]);
                    break;
                case MEL.MELINST.melSETW:
                case MEL.MELINST.melCMPW:
                case MEL.MELINST.melADDW:
                case MEL.MELINST.melSUBW:
                    if (tag == MEL.MELTAGADDR.melAddrTOS)
                        this.constWordBinaryOperation(opCode, paramVal[0], MEL.MELTAGADDR.melAddrDT, -2);
                    else
                        this.constWordBinaryOperation(opCode, paramVal[0], tag, paramVal[1]);
                    break;
                case MEL.MELINST.melCLEARN:
                case MEL.MELINST.melTESTN:
                case MEL.MELINST.melINCN:
                case MEL.MELINST.melDECN:
                case MEL.MELINST.melNOTN:
                    if (tag == MEL.MELTAGADDR.melAddrTOS)
                        this.unaryOperation(opCode, paramVal[0], MEL.MELTAGADDR.melAddrDT, -1 * paramVal[0]);
                    else
                        this.unaryOperation(opCode, paramVal[0], tag, paramVal[1]);
                    break;
                case MEL.MELINST.melCMPN:
                case MEL.MELINST.melADDN:
                case MEL.MELINST.melSUBN:
                case MEL.MELINST.melANDN:
                case MEL.MELINST.melORN:
                case MEL.MELINST.melXORN:
                    if (tag == MEL.MELTAGADDR.melAddrTOS)
                        this.binaryOperation(opCode, paramVal[0], MEL.MELTAGADDR.melAddrDT, -2 * paramVal[0]);
                    else
                        this.binaryOperation(opCode, paramVal[0], tag, paramVal[1]);
                    break;
            }
            this.currentIP = nextIP;
        }
        catch (e) {
        }
    }
    setCommandAPDU(commandAPDU) {
        var publicTop = this.publicArea.getLength();
        this.publicArea.writeBytes(publicTop - 2, W2BA(0x9000));
        this.publicArea.writeBytes(publicTop - 4, W2BA(0x0000));
        this.publicArea.writeBytes(publicTop - 6, W2BA(commandAPDU.Le));
        this.publicArea.writeBytes(publicTop - 8, W2BA(commandAPDU.data.length));
        this.publicArea.writeBytes(publicTop - 13, commandAPDU.header);
        this.publicArea.writeBytes(0, commandAPDU.data);
        this.initExecution();
    }
    getResponseAPDU() {
        var publicTop = this.publicArea.getLength();
        var la = BA2W(this.publicArea.readBytes(publicTop - 4, 2));
        return new ResponseAPDU({ sw: BA2W(this.publicArea.readBytes(publicTop - 2, 2)), data: this.publicArea.readBytes(0, la) });
    }
    get getDebug() {
        return {
            ramSegment: this.ramSegment,
            dynamicArea: this.dynamicArea,
            publicArea: this.publicArea,
            staticArea: this.staticArea,
            currentIP: this.currentIP,
            dynamicTop: this.dynamicTop,
            localBase: this.localBase
        };
    }
}




function BA2W(val) {
    return (val[0] << 8) | val[1];
}
export class JSIMMultosApplet {
    constructor(codeArea, staticArea, sessionSize) {
        this.codeArea = codeArea;
        this.staticArea = staticArea;
        this.sessionSize = sessionSize;
    }
}
export class JSIMMultosCard {
    constructor(config) {
        if (config)
            this.cardConfig = config;
        else
            this.cardConfig = JSIMMultosCard.defaultConfig;
        this.atr = new ByteArray([]);
        this.applets = [];
    }
    loadApplication(aid, alu) {
        var len = 0;
        var off = 8;
        len = alu.wordAt(off);
        off += 2;
        let codeArea = this.nvramSegment.newAccessor(0, len, "code");
        codeArea.writeBytes(0, alu.viewAt(off, len));
        off += len;
        len = alu.wordAt(off);
        off += 2;
        let staticArea = this.nvramSegment.newAccessor(codeArea.getLength(), len, "S");
        staticArea.writeBytes(0, alu.viewAt(off, len));
        off += len;
        let applet = new JSIMMultosApplet(codeArea, staticArea, 0);
        this.applets.push({ aid: aid, applet: applet });
    }
    get isPowered() {
        return this.powerIsOn;
    }
    powerOn() {
        this.powerIsOn = true;
        this.initializeVM(this.cardConfig);
        return Promise.resolve(this.atr);
    }
    powerOff() {
        this.powerIsOn = false;
        this.resetVM();
        this.selectedApplet = undefined;
        return Promise.resolve();
    }
    reset() {
        this.powerIsOn = true;
        this.selectedApplet = undefined;
        this.shutdownVM();
        return Promise.resolve(this.atr);
    }
    exchangeAPDU(commandAPDU) {
        if (commandAPDU.INS == 0xA4) {
            if (this.selectedApplet) {
                this.selectedApplet = undefined;
            }
            this.selectedApplet = this.applets[0].applet;
            let fci = new ByteArray([0x6F, 0x00]);
            this.mvm.setupApplication(this.selectedApplet);
            return Promise.resolve(new ResponseAPDU({ sw: 0x9000, data: fci }));
        }
        this.mvm.setCommandAPDU(commandAPDU);
        return Promise.resolve(new ResponseAPDU({ sw: 0x9000, data: [] }));
    }
    initializeVM(config) {
        this.memoryManager = new MemoryManager();
        this.romSegment = this.memoryManager.newSegment(0, this.cardConfig.romSize, MEMFLAGS.READ_ONLY);
        this.ramSegment = this.memoryManager.newSegment(1, this.cardConfig.ramSize, 0);
        this.nvramSegment = this.memoryManager.newSegment(2, this.cardConfig.nvramSize, MEMFLAGS.TRANSACTIONABLE);
        this.mvm = new MELVirtualMachine();
        this.resetVM();
    }
    resetVM() {
        var mvmParams = {
            ramSegment: this.ramSegment,
            romSegment: this.romSegment,
            publicSize: this.cardConfig.publicSize
        };
        this.mvm.initMVM(mvmParams);
    }
    shutdownVM() {
        this.resetVM();
        this.mvm = null;
    }
    selectApplication(applet, sessionSize) {
        var execParams = {
            codeArea: applet.codeArea,
            staticArea: applet.staticArea,
            sessionSize: sessionSize
        };
        this.mvm.execApplication(execParams);
    }
    executeStep() {
        return this.mvm.executeStep();
    }
}
JSIMMultosCard.defaultConfig = {
    romSize: 0,
    ramSize: 1024,
    publicSize: 512,
    nvramSize: 32768
};

var setZeroPrimitives = {
    0x01: {
        name: "CHECK_CASE",
        proc: function () {
        }
    },
    0x02: {
        name: "RESET_WWT",
        proc: function () {
        }
    },
    0x05: {
        name: "LOAD_CCR",
        proc: function () {
        }
    },
    0x06: {
        name: "STORE_CCR",
        proc: function () {
        }
    },
    0x07: {
        name: "SET_ATR_FILE_RECORD",
        proc: function () {
        }
    },
    0x08: {
        name: "SET_ATR_HISTORICAL_CHARACTERS",
        proc: function () {
        }
    },
    0x09: {
        name: "GET_MEMORY_RELIABILITY",
        proc: function () {
        }
    },
    0xa: {
        name: "LOOKUP",
        proc: function () {
        }
    },
    0xb: {
        name: "MEMORY_COMPARE",
        proc: function () {
        }
    },
    0xc: {
        name: "MEMORY_COPY",
        proc: function () {
        }
    },
    0xd: {
        name: "QUERY_INTERFACE_TYPE",
        proc: function () {
        }
    },
    0x10: {
        name: "CONTROL_AUTO_RESET_WWT",
        proc: function () {
        }
    },
    0x11: {
        name: "SET_FCI_FILE_RECORD",
        proc: function () {
        }
    },
    0x80: {
        name: "DELEGATE",
        proc: function () {
        }
    },
    0x81: {
        name: "RESET_SESSION_DATA",
        proc: function () {
        }
    },
    0x82: {
        name: "CHECKSUM",
        proc: function () {
        }
    },
    0x83: {
        name: "CALL_CODELET",
        proc: function () {
        }
    },
    0x84: {
        name: "QUERY_CODELET",
        proc: function () {
        }
    },
    0xc1: {
        name: "DES_ECB_ENCIPHER",
        proc: function () {
        }
    },
    0xc2: {
        name: "MODULAR_MULTIPLICATION",
        proc: function () {
        }
    },
    0xc3: {
        name: "MODULAR_REDUCTION",
        proc: function () {
        }
    },
    0xc4: {
        name: "GET_RANDOM_NUMBER",
        proc: function () {
        }
    },
    0xc5: {
        name: "DES_ECB_DECIPHER",
        proc: function () {
        }
    },
    0xc6: {
        name: "GENERATE_DES_CBC_SIGNATURE",
        proc: function () {
        }
    },
    0xc7: {
        name: "GENERATE_TRIPLE_DES_CBC_SIGNATURE",
        proc: function () {
        }
    },
    0xc8: {
        name: "MODULAR_EXPONENTIATION",
        proc: function () {
        }
    },
    0xc9: {
        name: "MODULAR_EXPONENTIATION_CRT",
        proc: function () {
        }
    },
    0xca: {
        name: "SHA1",
        proc: function () {
        }
    },
    0xcc: {
        name: "GENERATE_RANDOM_PRIME",
        proc: function () {
        }
    },
    0xcd: {
        name: "SEED_ECB_DECIPHER",
        proc: function () {
        }
    },
    0xce: {
        name: "SEED_ECB_ENCIPHER",
        proc: function () {
        }
    }
};
var setOnePrimitives = {
    0x00: {
        name: "QUERY0",
        proc: function () {
        }
    },
    0x01: {
        name: "QUERY1",
        proc: function () {
        }
    },
    0x02: {
        name: "QUERY2",
        proc: function () {
        }
    },
    0x03: {
        name: "QUERY3",
        proc: function () {
        }
    },
    0x08: {
        name: "DIVIDEN",
        proc: function () {
        }
    },
    0x09: {
        name: "GET_DIR_FILE_RECORD",
        proc: function () {
        }
    },
    0x0a: {
        name: "GET_FILE_CONTROL_INFORMATION",
        proc: function () {
        }
    },
    0x0b: {
        name: "GET_MANUFACTURER_DATA",
        proc: function () {
        }
    },
    0x0c: {
        name: "GET_MULTOS_DATA",
        proc: function () {
        }
    },
    0x0d: {
        name: "GET_PURSE_TYPE",
        proc: function () {
        }
    },
    0x0e: {
        name: "MEMORY_COPY_FIXED_LENGTH",
        proc: function () {
        }
    },
    0x0f: {
        name: "MEMORY_COMPARE_FIXED_LENGTH",
        proc: function () {
        }
    },
    0x10: {
        name: "MULTIPLYN",
        proc: function () {
        }
    },
    0x80: {
        name: "SET_TRANSACTION_PROTECTION",
        proc: function () {
        }
    },
    0x81: {
        name: "GET_DELEGATOR_AID",
        proc: function () {
        }
    },
    0xc4: {
        name: "GENERATE_ASYMMETRIC_HASH",
        proc: function () {
        }
    }
};
function bitManipulate(bitmap, literal, data) {
    var modify = ((bitmap & (1 << 7)) == (1 << 7));
    if (bitmap & 0x7c)
        throw new Error("Undefined arguments");
    switch (bitmap & 3) {
        case 3:
            data &= literal;
            break;
        case 2:
            data |= literal;
            break;
        case 1:
            data = ~(data ^ literal);
            break;
        case 0:
            data ^= literal;
            break;
    }
    return modify;
}
var setTwoPrimitives = {
    0x01: {
        name: "BIT_MANIPULATE_BYTE",
        proc: function () {
        }
    },
    0x02: {
        name: "SHIFT_LEFT",
        proc: function () {
        }
    },
    0x03: {
        name: "SHIFT_RIGHT",
        proc: function () {
        }
    },
    0x04: {
        name: "SET_SELECT_SW",
        proc: function () {
        }
    },
    0x05: {
        name: "CARD_BLOCK",
        proc: function () {
        }
    },
    0x80: {
        name: "RETURN_FROM_CODELET",
        proc: function () {
        }
    }
};
var setThreePrimitives = {
    0x01: {
        name: "BIT_MANIPULATE_WORD",
        proc: function () {
        }
    },
    0x80: {
        name: "CALL_EXTENSION_PRIMITIVE0",
        proc: function () {
        }
    },
    0x81: {
        name: "CALL_EXTENSION_PRIMITIVE1",
        proc: function () {
        }
    },
    0x82: {
        name: "CALL_EXTENSION_PRIMITIVE2",
        proc: function () {
        }
    },
    0x83: {
        name: "CALL_EXTENSION_PRIMITIVE3",
        proc: function () {
        }
    },
    0x84: {
        name: "CALL_EXTENSION_PRIMITIVE4",
        proc: function () {
        }
    },
    0x85: {
        name: "CALL_EXTENSION_PRIMITIVE5",
        proc: function () {
        }
    },
    0x86: {
        name: "CALL_EXTENSION_PRIMITIVE6",
        proc: function () {
        }
    }
};
var primitiveSets = [
    setZeroPrimitives,
    setOnePrimitives,
    setTwoPrimitives,
    setThreePrimitives
];
export function callPrimitive(ctx, prim, set, arg1, arg2, arg3) {
    var primInfo = primitiveSets[set][prim];
    if (primInfo) {
        switch (set) {
            case 0:
                primInfo.proc();
                break;
            case 1:
                primInfo.proc(arg1);
                break;
            case 2:
                primInfo.proc(arg1, arg2);
                break;
            case 3:
                primInfo.proc(arg1, arg2, arg3);
                break;
        }
    }
    else {
        throw new Error("Primitive not Implemented");
    }
}

export class SecurityManager {
    initSecurity() {
    }
    processAPDU(apdu) {
        return false;
    }
}

export class ADC {
}

export class ALC {
}

export class ALU {
    constructor(attributes) {
        Kind.initFields(this, attributes);
    }
    ;
    ;
    ;
    toJSON() {
        return {
            code: this.code,
            data: this.data,
            fci: this.fci,
            dir: this.dir
        };
    }
    getALUSegment(bytes, segmentID) {
        var offset = 8;
        while ((segmentID > 1) && (offset < bytes.length)) {
            offset += 2 + bytes.wordAt(offset);
            --segmentID;
        }
        return bytes.viewAt(offset + 2, bytes.wordAt(offset));
    }
    decodeBytes(bytes, options) {
        this.code = this.getALUSegment(bytes, 1);
        this.data = this.getALUSegment(bytes, 2);
        this.dir = this.getALUSegment(bytes, 3);
        this.fci = this.getALUSegment(bytes, 4);
        return this;
    }
    encodeBytes(options) {
        return new ByteArray([]);
    }
}
KindBuilder.init(ALU, "MULTOS Application Load Unit")
    .field("code", "Code Segment", ByteArray)
    .field("data", "Data Segment", ByteArray)
    .field("fci", "FCI Segment", ByteArray)
    .field("dir", "DIR Segment", ByteArray);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdsb2JhbC1wbGF0Zm9ybS1zY3JpcHRpbmcva2V5LnRzIiwiZ2xvYmFsLXBsYXRmb3JtLXNjcmlwdGluZy9jcnlwdG8udHMiLCJnbG9iYWwtcGxhdGZvcm0tc2NyaXB0aW5nL2J5dGUtc3RyaW5nLnRzIiwiZ2xvYmFsLXBsYXRmb3JtLXNjcmlwdGluZy9ieXRlLWJ1ZmZlci50cyIsImlzbzc4MTYvYmFzZS10bHYudHMiLCJnbG9iYWwtcGxhdGZvcm0tc2NyaXB0aW5nL3Rsdi50cyIsImdsb2JhbC1wbGF0Zm9ybS1zY3JpcHRpbmcvdGx2LWxpc3QudHMiLCJjb21wb25lbnRzL2J5dGUtZGF0YS1pbnB1dC5qcyIsImNvbXBvbmVudHMvYnl0ZS1kYXRhLW91dHB1dC5qcyIsImNvbXBvbmVudHMvY3J5cHRvci1ib3guanMiLCJjb21wb25lbnRzL3JzYS1rZXktYnVpbGRlci5qcyIsImNvbXBvbmVudHMvc2VjcmV0LWtleS1idWlsZGVyLmpzIiwiaXNvNzgxNi9jb21tYW5kLWFwZHUudHMiLCJpc283ODE2L2lzbzc4MTYudHMiLCJpc283ODE2L3Jlc3BvbnNlLWFwZHUudHMiLCJpc283ODE2L3Nsb3QuanMiLCJpc283ODE2L3Nsb3QtcHJvdG9jb2wudHMiLCJqc2ltLWNhcmQvU2xvdHMudHMiLCJqc2ltLWNhcmQvanNpbS1jYXJkLmpzIiwianNpbS1jYXJkL2pzaW0tc2NyaXB0LWFwcGxldC50cyIsImpzaW0tY2FyZC9qc2ltLXNjcmlwdC1jYXJkLnRzIiwianNpbS1jYXJkL2pzaW0tc2xvdC50cyIsImpzaW0tbXVsdG9zL21lbW9yeS1tYW5hZ2VyLnRzIiwianNpbS1tdWx0b3MvbWVsLWRlZmluZXMudHMiLCJqc2ltLW11bHRvcy92aXJ0dWFsLW1hY2hpbmUudHMiLCJqc2ltLW11bHRvcy9qc2ltLW11bHRvcy1jYXJkLnRzIiwianNpbS1tdWx0b3MvcHJpbWl0aXZlcy50cyIsImpzaW0tbXVsdG9zL3NlY3VyaXR5LW1hbmFnZXIudHMiLCJtdWx0b3MvYWRjLnRzIiwibXVsdG9zL2FsYy50cyIsIm11bHRvcy9hbHUudHMiXSwibmFtZXMiOlsiS2V5IiwiS2V5LmNvbnN0cnVjdG9yIiwiS2V5LnNldFR5cGUiLCJLZXkuZ2V0VHlwZSIsIktleS5zZXRTaXplIiwiS2V5LmdldFNpemUiLCJLZXkuc2V0Q29tcG9uZW50IiwiS2V5LmdldENvbXBvbmVudCIsIkNyeXB0byIsIkNyeXB0by5jb25zdHJ1Y3RvciIsIkNyeXB0by5lbmNyeXB0IiwiQ3J5cHRvLmRlY3J5cHQiLCJDcnlwdG8uc2lnbiIsIkNyeXB0by5kZXMiLCJDcnlwdG8uZGVzLmRlc19jcmVhdGVLZXlzIiwiQ3J5cHRvLnZlcmlmeSIsIkNyeXB0by5kaWdlc3QiLCJCeXRlU3RyaW5nIiwiQnl0ZVN0cmluZy5jb25zdHJ1Y3RvciIsIkJ5dGVTdHJpbmcubGVuZ3RoIiwiQnl0ZVN0cmluZy5ieXRlcyIsIkJ5dGVTdHJpbmcuYnl0ZUF0IiwiQnl0ZVN0cmluZy5lcXVhbHMiLCJCeXRlU3RyaW5nLmNvbmNhdCIsIkJ5dGVTdHJpbmcubGVmdCIsIkJ5dGVTdHJpbmcucmlnaHQiLCJCeXRlU3RyaW5nLm5vdCIsIkJ5dGVTdHJpbmcuYW5kIiwiQnl0ZVN0cmluZy5vciIsIkJ5dGVTdHJpbmcucGFkIiwiQnl0ZVN0cmluZy50b1N0cmluZyIsIkJ5dGVCdWZmZXIiLCJCeXRlQnVmZmVyLmNvbnN0cnVjdG9yIiwiQnl0ZUJ1ZmZlci5sZW5ndGgiLCJCeXRlQnVmZmVyLnRvQnl0ZVN0cmluZyIsIkJ5dGVCdWZmZXIuY2xlYXIiLCJCeXRlQnVmZmVyLmFwcGVuZCIsIkJhc2VUTFYiLCJCYXNlVExWLmNvbnN0cnVjdG9yIiwiQmFzZVRMVi5wYXJzZVRMViIsIkJhc2VUTFYudGFnIiwiQmFzZVRMVi52YWx1ZSIsIkJhc2VUTFYubGVuIiwiVExWIiwiVExWLmNvbnN0cnVjdG9yIiwiVExWLmdldFRMViIsIlRMVi5nZXRUYWciLCJUTFYuZ2V0VmFsdWUiLCJUTFYuZ2V0TCIsIlRMVi5nZXRMViIsIlRMVi5wYXJzZVRMViIsIlRMVkxpc3QiLCJUTFZMaXN0LmNvbnN0cnVjdG9yIiwiVExWTGlzdC5pbmRleCIsIkNvbW1hbmRBUERVIiwiQ29tbWFuZEFQRFUuY29uc3RydWN0b3IiLCJDb21tYW5kQVBEVS50b0pTT04iLCJDb21tYW5kQVBEVS50b1N0cmluZyIsIkNvbW1hbmRBUERVLnRvU3RyaW5nLmhleDIiLCJDb21tYW5kQVBEVS5MYyIsIkNvbW1hbmRBUERVLmhlYWRlciIsIkNvbW1hbmRBUERVLmluaXQiLCJDb21tYW5kQVBEVS5zZXQiLCJDb21tYW5kQVBEVS5zZXRDTEEiLCJDb21tYW5kQVBEVS5zZXRJTlMiLCJDb21tYW5kQVBEVS5zZXRQMSIsIkNvbW1hbmRBUERVLnNldFAyIiwiQ29tbWFuZEFQRFUuc2V0RGF0YSIsIkNvbW1hbmRBUERVLnNldExlIiwiQ29tbWFuZEFQRFUuc2V0RGVzY3JpcHRpb24iLCJDb21tYW5kQVBEVS5zZXREZXRhaWxzIiwiQ29tbWFuZEFQRFUuZW5jb2RlQnl0ZXMiLCJDb21tYW5kQVBEVS5kZWNvZGVCeXRlcyIsIklTTzc4MTYiLCJSZXNwb25zZUFQRFUiLCJSZXNwb25zZUFQRFUuY29uc3RydWN0b3IiLCJSZXNwb25zZUFQRFUudG9KU09OIiwiUmVzcG9uc2VBUERVLnRvU3RyaW5nIiwiUmVzcG9uc2VBUERVLnRvU3RyaW5nLmhleDQiLCJSZXNwb25zZUFQRFUuTGEiLCJSZXNwb25zZUFQRFUuaW5pdCIsIlJlc3BvbnNlQVBEVS5zZXQiLCJSZXNwb25zZUFQRFUuc2V0U1ciLCJSZXNwb25zZUFQRFUuc2V0U1cxIiwiUmVzcG9uc2VBUERVLnNldFNXMiIsIlJlc3BvbnNlQVBEVS5zZXREYXRhIiwiUmVzcG9uc2VBUERVLnNldERlc2NyaXB0aW9uIiwiUmVzcG9uc2VBUERVLnNldERldGFpbHMiLCJSZXNwb25zZUFQRFUuZW5jb2RlQnl0ZXMiLCJSZXNwb25zZUFQRFUuZGVjb2RlQnl0ZXMiLCJTbG90UHJvdG9jb2wiLCJTbG90UHJvdG9jb2wuZ2V0SGFuZGxlciIsIlNsb3RQcm90b2NvbC5nZXRQcm94eSIsIlNsb3RQcm90b2NvbFByb3h5IiwiU2xvdFByb3RvY29sUHJveHkuY29uc3RydWN0b3IiLCJTbG90UHJvdG9jb2xQcm94eS5wb3dlckNvbW1hbmQiLCJTbG90UHJvdG9jb2xQcm94eS5wb3dlck9uIiwiU2xvdFByb3RvY29sUHJveHkucmVzZXQiLCJTbG90UHJvdG9jb2xQcm94eS5wb3dlck9mZiIsIlNsb3RQcm90b2NvbFByb3h5LmlzUHJlc2VudCIsIlNsb3RQcm90b2NvbFByb3h5LmlzUG93ZXJlZCIsIlNsb3RQcm90b2NvbFByb3h5LmV4ZWN1dGVBUERVIiwiU2xvdFByb3RvY29sSGFuZGxlciIsIlNsb3RQcm90b2NvbEhhbmRsZXIuY29uc3RydWN0b3IiLCJTbG90UHJvdG9jb2xIYW5kbGVyLmxpbmtTbG90IiwiU2xvdFByb3RvY29sSGFuZGxlci51bmxpbmtTbG90IiwiU2xvdFByb3RvY29sSGFuZGxlci5vbk1lc3NhZ2UiLCJKU1NpbXVsYXRlZFNsb3QiLCJKU1NpbXVsYXRlZFNsb3QuT25NZXNzYWdlIiwiSlNTaW11bGF0ZWRTbG90LmluaXQiLCJKU1NpbXVsYXRlZFNsb3Quc2VuZFRvV29ya2VyIiwiSlNTaW11bGF0ZWRTbG90LmV4ZWN1dGVBUERVQ29tbWFuZCIsIkpTSU1TY3JpcHRBcHBsZXQiLCJKU0lNU2NyaXB0QXBwbGV0LnNlbGVjdEFwcGxpY2F0aW9uIiwiSlNJTVNjcmlwdEFwcGxldC5kZXNlbGVjdEFwcGxpY2F0aW9uIiwiSlNJTVNjcmlwdEFwcGxldC5leGVjdXRlQVBEVSIsIkpTSU1TY3JpcHRDYXJkIiwiSlNJTVNjcmlwdENhcmQuY29uc3RydWN0b3IiLCJKU0lNU2NyaXB0Q2FyZC5sb2FkQXBwbGljYXRpb24iLCJKU0lNU2NyaXB0Q2FyZC5pc1Bvd2VyZWQiLCJKU0lNU2NyaXB0Q2FyZC5wb3dlck9uIiwiSlNJTVNjcmlwdENhcmQucG93ZXJPZmYiLCJKU0lNU2NyaXB0Q2FyZC5yZXNldCIsIkpTSU1TY3JpcHRDYXJkLmV4Y2hhbmdlQVBEVSIsIkpTSU1TbG90IiwiSlNJTVNsb3QuY29uc3RydWN0b3IiLCJKU0lNU2xvdC5pc1ByZXNlbnQiLCJKU0lNU2xvdC5pc1Bvd2VyZWQiLCJKU0lNU2xvdC5wb3dlck9uIiwiSlNJTVNsb3QucG93ZXJPZmYiLCJKU0lNU2xvdC5yZXNldCIsIkpTSU1TbG90LmV4ZWN1dGVBUERVIiwiSlNJTVNsb3QuaW5zZXJ0Q2FyZCIsIkpTSU1TbG90LmVqZWN0Q2FyZCIsImhleDIiLCJoZXg0IiwiTUVNRkxBR1MiLCJTZWdtZW50IiwiU2VnbWVudC5jb25zdHJ1Y3RvciIsIlNlZ21lbnQuZ2V0VHlwZSIsIlNlZ21lbnQuZ2V0TGVuZ3RoIiwiU2VnbWVudC5nZXRGbGFncyIsIlNlZ21lbnQuZ2V0RGVidWciLCJTZWdtZW50LmJlZ2luVHJhbnNhY3Rpb24iLCJTZWdtZW50LmVuZFRyYW5zYWN0aW9uIiwiU2VnbWVudC5yZWFkQnl0ZSIsIlNlZ21lbnQuemVyb0J5dGVzIiwiU2VnbWVudC5yZWFkQnl0ZXMiLCJTZWdtZW50LmNvcHlCeXRlcyIsIlNlZ21lbnQud3JpdGVCeXRlcyIsIlNlZ21lbnQubmV3QWNjZXNzb3IiLCJBY2Nlc3NvciIsIkFjY2Vzc29yLmNvbnN0cnVjdG9yIiwiQWNjZXNzb3IudHJhY2VNZW1vcnlPcCIsIkFjY2Vzc29yLnRyYWNlTWVtb3J5VmFsdWUiLCJBY2Nlc3Nvci56ZXJvQnl0ZXMiLCJBY2Nlc3Nvci5yZWFkQnl0ZSIsIkFjY2Vzc29yLnJlYWRCeXRlcyIsIkFjY2Vzc29yLmNvcHlCeXRlcyIsIkFjY2Vzc29yLndyaXRlQnl0ZSIsIkFjY2Vzc29yLndyaXRlQnl0ZXMiLCJBY2Nlc3Nvci5nZXRUeXBlIiwiQWNjZXNzb3IuZ2V0TGVuZ3RoIiwiQWNjZXNzb3IuZ2V0SUQiLCJBY2Nlc3Nvci5nZXREZWJ1ZyIsInNsaWNlRGF0YSIsIk1lbW9yeU1hbmFnZXIiLCJNZW1vcnlNYW5hZ2VyLmNvbnN0cnVjdG9yIiwiTWVtb3J5TWFuYWdlci5uZXdTZWdtZW50IiwiTWVtb3J5TWFuYWdlci5nZXRNZW1UcmFjZSIsIk1lbW9yeU1hbmFnZXIuaW5pdE1lbVRyYWNlIiwiTWVtb3J5TWFuYWdlci5nZXRTZWdtZW50IiwiTUVMSU5TVCIsIk1FTFRBR0FERFIiLCJNRUxUQUdDT05EIiwiTUVMVEFHU1lTVEVNIiwiTUVMVEFHU1RBQ0siLCJNRUxUQUdQUklNUkVUIiwiTUVMUEFSQU1ERUYiLCJNRUxQQVJBTTQiLCJPUFRBRzJNRUxJTlNUIiwiTUVMMk9QQ09ERSIsIk1FTDJJTlNUIiwiTUVMMlRBRyIsIk1FTFBBUkFNU0laRSIsIk1FTCIsInNldE1lbERlY29kZSIsInNldE1lbERlY29kZVN0ZE1vZGVzIiwic2V0TWVsRGVjb2RlU3RkTW9kZXNBbmRUT1MiLCJmaWxsTWVsRGVjb2RlIiwiaGV4IiwibGp1c3QiLCJyanVzdCIsIkJBMlciLCJXMkJBIiwiTUVMVmlydHVhbE1hY2hpbmUiLCJNRUxWaXJ0dWFsTWFjaGluZS5jb25zdHJ1Y3RvciIsIk1FTFZpcnR1YWxNYWNoaW5lLmluaXRNVk0iLCJNRUxWaXJ0dWFsTWFjaGluZS5kaXNhc3NlbWJsZUNvZGUiLCJNRUxWaXJ0dWFsTWFjaGluZS5kaXNhc3NlbWJsZUNvZGUucHJpbnQiLCJNRUxWaXJ0dWFsTWFjaGluZS5tYXBUb1NlZ21lbnRBZGRyIiwiTUVMVmlydHVhbE1hY2hpbmUubWFwRnJvbVNlZ21lbnRBZGRyIiwiTUVMVmlydHVhbE1hY2hpbmUuY2hlY2tEYXRhQWNjZXNzIiwiTUVMVmlydHVhbE1hY2hpbmUucmVhZFNlZ21lbnREYXRhIiwiTUVMVmlydHVhbE1hY2hpbmUud3JpdGVTZWdtZW50RGF0YSIsIk1FTFZpcnR1YWxNYWNoaW5lLnB1c2haZXJvc1RvU3RhY2siLCJNRUxWaXJ0dWFsTWFjaGluZS5wdXNoQ29uc3RUb1N0YWNrIiwiTUVMVmlydHVhbE1hY2hpbmUuY29weU9uU3RhY2siLCJNRUxWaXJ0dWFsTWFjaGluZS5wdXNoVG9TdGFjayIsIk1FTFZpcnR1YWxNYWNoaW5lLnBvcEZyb21TdGFja0FuZFN0b3JlIiwiTUVMVmlydHVhbE1hY2hpbmUucG9wRnJvbVN0YWNrIiwiTUVMVmlydHVhbE1hY2hpbmUuc2V0dXBBcHBsaWNhdGlvbiIsIk1FTFZpcnR1YWxNYWNoaW5lLmluaXRFeGVjdXRpb24iLCJNRUxWaXJ0dWFsTWFjaGluZS5jb25zdEJ5dGVCaW5hcnlPcGVyYXRpb24iLCJNRUxWaXJ0dWFsTWFjaGluZS5jb25zdFdvcmRCaW5hcnlPcGVyYXRpb24iLCJNRUxWaXJ0dWFsTWFjaGluZS5iaW5hcnlPcGVyYXRpb24iLCJNRUxWaXJ0dWFsTWFjaGluZS51bmFyeU9wZXJhdGlvbiIsIk1FTFZpcnR1YWxNYWNoaW5lLmhhbmRsZVJldHVybiIsIk1FTFZpcnR1YWxNYWNoaW5lLmlzQ29uZGl0aW9uIiwiTUVMVmlydHVhbE1hY2hpbmUuZXhlY3V0ZVN0ZXAiLCJNRUxWaXJ0dWFsTWFjaGluZS5zZXRDb21tYW5kQVBEVSIsIk1FTFZpcnR1YWxNYWNoaW5lLmdldFJlc3BvbnNlQVBEVSIsIk1FTFZpcnR1YWxNYWNoaW5lLmdldERlYnVnIiwiSlNJTU11bHRvc0FwcGxldCIsIkpTSU1NdWx0b3NBcHBsZXQuY29uc3RydWN0b3IiLCJKU0lNTXVsdG9zQ2FyZCIsIkpTSU1NdWx0b3NDYXJkLmNvbnN0cnVjdG9yIiwiSlNJTU11bHRvc0NhcmQubG9hZEFwcGxpY2F0aW9uIiwiSlNJTU11bHRvc0NhcmQuaXNQb3dlcmVkIiwiSlNJTU11bHRvc0NhcmQucG93ZXJPbiIsIkpTSU1NdWx0b3NDYXJkLnBvd2VyT2ZmIiwiSlNJTU11bHRvc0NhcmQucmVzZXQiLCJKU0lNTXVsdG9zQ2FyZC5leGNoYW5nZUFQRFUiLCJKU0lNTXVsdG9zQ2FyZC5pbml0aWFsaXplVk0iLCJKU0lNTXVsdG9zQ2FyZC5yZXNldFZNIiwiSlNJTU11bHRvc0NhcmQuc2h1dGRvd25WTSIsIkpTSU1NdWx0b3NDYXJkLnNlbGVjdEFwcGxpY2F0aW9uIiwiSlNJTU11bHRvc0NhcmQuZXhlY3V0ZVN0ZXAiLCJiaXRNYW5pcHVsYXRlIiwiY2FsbFByaW1pdGl2ZSIsIlNlY3VyaXR5TWFuYWdlciIsIlNlY3VyaXR5TWFuYWdlci5pbml0U2VjdXJpdHkiLCJTZWN1cml0eU1hbmFnZXIucHJvY2Vzc0FQRFUiLCJBREMiLCJBTEMiLCJBTFUiLCJBTFUuY29uc3RydWN0b3IiLCJBTFUudG9KU09OIiwiQUxVLmdldEFMVVNlZ21lbnQiLCJBTFUuZGVjb2RlQnl0ZXMiLCJBTFUuZW5jb2RlQnl0ZXMiXSwibWFwcGluZ3MiOiJBQUVBO0lBTUVBO1FBRUVDLElBQUlBLENBQUNBLEtBQUtBLEdBQUdBLENBQUNBLENBQUNBO1FBQ2ZBLElBQUlBLENBQUNBLEtBQUtBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBO1FBQ2hCQSxJQUFJQSxDQUFDQSxlQUFlQSxHQUFHQSxFQUFFQSxDQUFDQTtJQUM1QkEsQ0FBQ0E7SUFFREQsT0FBT0EsQ0FBRUEsT0FBZUE7UUFFdEJFLElBQUlBLENBQUNBLEtBQUtBLEdBQUdBLE9BQU9BLENBQUNBO0lBQ3ZCQSxDQUFDQTtJQUVERixPQUFPQTtRQUVMRyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQTtJQUNwQkEsQ0FBQ0E7SUFFREgsT0FBT0EsQ0FBRUEsSUFBWUE7UUFFbkJJLElBQUlBLENBQUNBLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBO0lBQ3BCQSxDQUFDQTtJQUVESixPQUFPQTtRQUVMSyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQTtJQUNwQkEsQ0FBQ0E7SUFFREwsWUFBWUEsQ0FBRUEsSUFBWUEsRUFBRUEsS0FBaUJBO1FBRTNDTSxJQUFJQSxDQUFDQSxlQUFlQSxDQUFFQSxJQUFJQSxDQUFFQSxHQUFHQSxLQUFLQSxDQUFDQTtJQUN2Q0EsQ0FBQ0E7SUFFRE4sWUFBWUEsQ0FBRUEsSUFBWUE7UUFFeEJPLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGVBQWVBLENBQUVBLElBQUlBLENBQUVBLENBQUNBO0lBQ3RDQSxDQUFDQTtBQWdCSFAsQ0FBQ0E7QUFiUSxVQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQ1gsV0FBTyxHQUFHLENBQUMsQ0FBQztBQUNa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QUFJQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxDQUFFQSxDQUFFQSxDQUFDQTtRQUk1RUEsSUFBSUEsVUFBVUEsR0FBR0EsSUFBSUEsU0FBU0EsQ0FBRUEsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBRUEsT0FBT0EsQ0FBQ0EsWUFBWUEsRUFBRUEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsWUFBWUEsRUFBRUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBRUEsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBRUEsQ0FBRUEsQ0FBQ0E7UUFFN0dBLE1BQU1BLENBQUNBLElBQUlBLFVBQVVBLENBQUVBLFVBQVVBLENBQUVBLENBQUNBLEtBQUtBLENBQUVBLENBQUNBLENBQUNBLENBQUVBLENBQUNBO0lBQ2xEQSxDQUFDQTtJQUtPSixHQUFHQSxDQUFFQSxHQUFlQSxFQUFFQSxPQUFtQkEsRUFBRUEsT0FBZUEsRUFBRUEsSUFBWUEsRUFBRUEsRUFBZUEsRUFBRUEsT0FBZ0JBO1FBS2pISyx3QkFBeUJBLEdBQUdBO1lBRTFCQyxFQUFFQSxDQUFDQSxDQUFFQSxNQUFNQSxDQUFDQSxLQUFLQSxJQUFJQSxTQUFVQSxDQUFDQSxDQUNoQ0EsQ0FBQ0E7Z0JBRUNBLE1BQU1BLENBQUNBLEtBQUtBLEdBQUdBO29CQUNiQSxTQUFTQSxFQUFHQSxJQUFJQSxXQUFXQSxDQUFFQSxDQUFFQSxDQUFDQSxFQUFDQSxHQUFHQSxFQUFDQSxVQUFVQSxFQUFDQSxVQUFVQSxFQUFDQSxPQUFPQSxFQUFDQSxPQUFPQSxFQUFDQSxVQUFVQSxFQUFDQSxVQUFVQSxFQUFDQSxLQUFLQSxFQUFDQSxLQUFLQSxFQUFDQSxVQUFVQSxFQUFDQSxVQUFVQSxFQUFDQSxPQUFPQSxFQUFDQSxPQUFPQSxFQUFDQSxVQUFVQSxFQUFDQSxVQUFVQSxDQUFFQSxDQUFFQTtvQkFDNUtBLFNBQVNBLEVBQUdBLElBQUlBLFdBQVdBLENBQUVBLENBQUVBLENBQUNBLEVBQUNBLEdBQUdBLEVBQUNBLFFBQVFBLEVBQUNBLFFBQVFBLEVBQUNBLFNBQVNBLEVBQUNBLFNBQVNBLEVBQUNBLFNBQVNBLEVBQUNBLFNBQVNBLEVBQUNBLEtBQUtBLEVBQUNBLEtBQUtBLEVBQUNBLFFBQVFBLEVBQUNBLFFBQVFBLEVBQUNBLFNBQVNBLEVBQUNBLFNBQVNBLEVBQUNBLFNBQVNBLEVBQUNBLFNBQVNBLENBQUNBLENBQUVBO29CQUN2S0EsU0FBU0EsRUFBR0EsSUFBSUEsV0FBV0EsQ0FBRUEsQ0FBRUEsQ0FBQ0EsRUFBQ0EsR0FBR0EsRUFBQ0EsS0FBS0EsRUFBQ0EsS0FBS0EsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsRUFBQ0EsQ0FBQ0EsRUFBQ0EsR0FBR0EsRUFBQ0EsS0FBS0EsRUFBQ0EsS0FBS0EsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsQ0FBQ0EsQ0FBRUE7b0JBQ3JKQSxTQUFTQSxFQUFHQSxJQUFJQSxXQUFXQSxDQUFFQSxDQUFFQSxDQUFDQSxFQUFDQSxRQUFRQSxFQUFDQSxTQUFTQSxFQUFDQSxTQUFTQSxFQUFDQSxNQUFNQSxFQUFDQSxRQUFRQSxFQUFDQSxTQUFTQSxFQUFDQSxTQUFTQSxFQUFDQSxPQUFPQSxFQUFDQSxRQUFRQSxFQUFDQSxTQUFTQSxFQUFDQSxTQUFTQSxFQUFDQSxPQUFPQSxFQUFDQSxRQUFRQSxFQUFDQSxTQUFTQSxFQUFDQSxTQUFTQSxDQUFDQSxDQUFFQTtvQkFDOUtBLFNBQVNBLEVBQUdBLElBQUlBLFdBQVdBLENBQUVBLENBQUVBLENBQUNBLEVBQUNBLE9BQU9BLEVBQUNBLElBQUlBLEVBQUNBLE9BQU9BLEVBQUNBLENBQUNBLEVBQUNBLE9BQU9BLEVBQUNBLElBQUlBLEVBQUNBLE9BQU9BLEVBQUNBLE1BQU1BLEVBQUNBLE9BQU9BLEVBQUNBLE1BQU1BLEVBQUNBLE9BQU9BLEVBQUNBLE1BQU1BLEVBQUNBLE9BQU9BLEVBQUNBLE1BQU1BLEVBQUNBLE9BQU9BLENBQUNBLENBQUVBO29CQUMzSUEsU0FBU0EsRUFBR0EsSUFBSUEsV0FBV0EsQ0FBRUEsQ0FBRUEsQ0FBQ0EsRUFBQ0EsS0FBS0EsRUFBQ0EsSUFBSUEsRUFBQ0EsS0FBS0EsRUFBQ0EsQ0FBQ0EsRUFBQ0EsS0FBS0EsRUFBQ0EsSUFBSUEsRUFBQ0EsS0FBS0EsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsQ0FBQ0EsQ0FBRUE7b0JBQ3ZKQSxTQUFTQSxFQUFHQSxJQUFJQSxXQUFXQSxDQUFFQSxDQUFFQSxDQUFDQSxFQUFDQSxVQUFVQSxFQUFDQSxPQUFPQSxFQUFDQSxVQUFVQSxFQUFDQSxHQUFHQSxFQUFDQSxVQUFVQSxFQUFDQSxPQUFPQSxFQUFDQSxVQUFVQSxFQUFDQSxDQUFDQSxFQUFDQSxVQUFVQSxFQUFDQSxPQUFPQSxFQUFDQSxVQUFVQSxFQUFDQSxHQUFHQSxFQUFDQSxVQUFVQSxFQUFDQSxPQUFPQSxFQUFDQSxVQUFVQSxDQUFDQSxDQUFFQTtvQkFDcktBLFNBQVNBLEVBQUdBLElBQUlBLFdBQVdBLENBQUVBLENBQUVBLENBQUNBLEVBQUNBLE9BQU9BLEVBQUNBLEtBQUtBLEVBQUNBLE9BQU9BLEVBQUNBLFVBQVVBLEVBQUNBLFVBQVVBLEVBQUNBLFVBQVVBLEVBQUNBLFVBQVVBLEVBQUNBLE9BQU9BLEVBQUNBLE9BQU9BLEVBQUNBLE9BQU9BLEVBQUNBLE9BQU9BLEVBQUNBLFVBQVVBLEVBQUNBLFVBQVVBLEVBQUNBLFVBQVVBLEVBQUNBLFVBQVVBLENBQUNBLENBQUVBO29CQUNqTEEsU0FBU0EsRUFBR0EsSUFBSUEsV0FBV0EsQ0FBRUEsQ0FBRUEsQ0FBQ0EsRUFBQ0EsT0FBT0EsRUFBQ0EsQ0FBQ0EsRUFBQ0EsT0FBT0EsRUFBQ0EsR0FBR0EsRUFBQ0EsT0FBT0EsRUFBQ0EsR0FBR0EsRUFBQ0EsT0FBT0EsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsQ0FBQ0EsQ0FBRUE7b0JBQzdKQSxTQUFTQSxFQUFHQSxJQUFJQSxXQUFXQSxDQUFFQSxDQUFFQSxDQUFDQSxFQUFDQSxVQUFVQSxFQUFDQSxHQUFHQSxFQUFDQSxVQUFVQSxFQUFDQSxDQUFDQSxFQUFDQSxVQUFVQSxFQUFDQSxHQUFHQSxFQUFDQSxVQUFVQSxFQUFDQSxLQUFLQSxFQUFDQSxVQUFVQSxFQUFDQSxLQUFLQSxFQUFDQSxVQUFVQSxFQUFDQSxLQUFLQSxFQUFDQSxVQUFVQSxFQUFDQSxLQUFLQSxFQUFDQSxVQUFVQSxDQUFDQSxDQUFFQTtvQkFDN0pBLFVBQVVBLEVBQUVBLElBQUlBLFdBQVdBLENBQUVBLENBQUVBLENBQUNBLEVBQUNBLElBQUlBLEVBQUNBLENBQUNBLEVBQUNBLElBQUlBLEVBQUNBLFFBQVFBLEVBQUNBLFFBQVFBLEVBQUNBLFFBQVFBLEVBQUNBLFFBQVFBLEVBQUNBLE1BQU1BLEVBQUNBLE1BQU1BLEVBQUNBLE1BQU1BLEVBQUNBLE1BQU1BLEVBQUNBLFFBQVFBLEVBQUNBLFFBQVFBLEVBQUNBLFFBQVFBLEVBQUNBLFFBQVFBLENBQUNBLENBQUVBO29CQUNuSkEsVUFBVUEsRUFBRUEsSUFBSUEsV0FBV0EsQ0FBRUEsQ0FBRUEsQ0FBQ0EsRUFBQ0EsU0FBU0EsRUFBQ0EsS0FBS0EsRUFBQ0EsU0FBU0EsRUFBQ0EsUUFBUUEsRUFBQ0EsU0FBU0EsRUFBQ0EsUUFBUUEsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsQ0FBQ0EsQ0FBRUE7b0JBQ25MQSxVQUFVQSxFQUFFQSxJQUFJQSxXQUFXQSxDQUFFQSxDQUFFQSxDQUFDQSxFQUFDQSxNQUFNQSxFQUFDQSxTQUFTQSxFQUFDQSxTQUFTQSxFQUFDQSxPQUFPQSxFQUFDQSxPQUFPQSxFQUFDQSxTQUFTQSxFQUFDQSxTQUFTQSxFQUFDQSxJQUFJQSxFQUFDQSxNQUFNQSxFQUFDQSxTQUFTQSxFQUFDQSxTQUFTQSxFQUFDQSxPQUFPQSxFQUFDQSxPQUFPQSxFQUFDQSxTQUFTQSxFQUFDQSxTQUFTQSxDQUFDQSxDQUFFQTtvQkFDdEtBLFVBQVVBLEVBQUVBLElBQUlBLFdBQVdBLENBQUVBLENBQUVBLENBQUNBLEVBQUNBLEdBQUdBLEVBQUNBLEtBQUtBLEVBQUNBLEtBQUtBLEVBQUNBLENBQUNBLEVBQUNBLEdBQUdBLEVBQUNBLEtBQUtBLEVBQUNBLEtBQUtBLEVBQUNBLEdBQUdBLEVBQUNBLEdBQUdBLEVBQUNBLEtBQUtBLEVBQUNBLEtBQUtBLEVBQUNBLEdBQUdBLEVBQUNBLEdBQUdBLEVBQUNBLEtBQUtBLEVBQUNBLEtBQUtBLENBQUNBLENBQUVBO2lCQUM5R0EsQ0FBQ0E7WUFDSkEsQ0FBQ0E7WUFHREEsSUFBSUEsVUFBVUEsR0FBR0EsR0FBR0EsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7WUFFeENBLElBQUlBLElBQUlBLEdBQUdBLElBQUlBLFdBQVdBLENBQUNBLEVBQUVBLEdBQUdBLFVBQVVBLENBQUNBLENBQUNBO1lBRTVDQSxJQUFJQSxNQUFNQSxHQUFHQSxDQUFFQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFFQSxDQUFDQTtZQUVoRUEsSUFBSUEsUUFBUUEsRUFBRUEsU0FBU0EsRUFBRUEsQ0FBQ0EsR0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBQ0EsQ0FBQ0EsRUFBRUEsSUFBSUEsQ0FBQ0E7WUFFeENBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLEdBQUNBLENBQUNBLEVBQUVBLENBQUNBLEdBQUNBLFVBQVVBLEVBQUVBLENBQUNBLEVBQUVBLEVBQy9CQSxDQUFDQTtnQkFDQ0EsSUFBSUEsR0FBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0E7Z0JBQ3pFQSxLQUFLQSxHQUFHQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQSxHQUFHQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQSxHQUFHQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQTtnQkFFekVBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLENBQUNBLENBQUNBLEdBQUdBLEtBQUtBLENBQUNBLEdBQUdBLFVBQVVBLENBQUNBO2dCQUFDQSxLQUFLQSxJQUFJQSxJQUFJQSxDQUFDQTtnQkFBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQy9FQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxLQUFLQSxLQUFLQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxHQUFHQSxVQUFVQSxDQUFDQTtnQkFBQ0EsSUFBSUEsSUFBSUEsSUFBSUEsQ0FBQ0E7Z0JBQUNBLEtBQUtBLElBQUlBLENBQUNBLElBQUlBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBO2dCQUNuRkEsSUFBSUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsS0FBS0EsQ0FBQ0EsR0FBR0EsVUFBVUEsQ0FBQ0E7Z0JBQUNBLEtBQUtBLElBQUlBLElBQUlBLENBQUNBO2dCQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDL0VBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLEtBQUtBLEtBQUtBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLEdBQUdBLFVBQVVBLENBQUNBO2dCQUFDQSxJQUFJQSxJQUFJQSxJQUFJQSxDQUFDQTtnQkFBQ0EsS0FBS0EsSUFBSUEsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0E7Z0JBQ25GQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxJQUFJQSxLQUFLQSxDQUFDQSxDQUFDQSxHQUFHQSxLQUFLQSxDQUFDQSxHQUFHQSxVQUFVQSxDQUFDQTtnQkFBQ0EsS0FBS0EsSUFBSUEsSUFBSUEsQ0FBQ0E7Z0JBQUNBLElBQUlBLElBQUlBLENBQUNBLElBQUlBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO2dCQUMvRUEsSUFBSUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsR0FBR0EsVUFBVUEsQ0FBQ0E7Z0JBQUNBLElBQUlBLElBQUlBLElBQUlBLENBQUNBO2dCQUFDQSxLQUFLQSxJQUFJQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDL0VBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLENBQUNBLENBQUNBLEdBQUdBLEtBQUtBLENBQUNBLEdBQUdBLFVBQVVBLENBQUNBO2dCQUFDQSxLQUFLQSxJQUFJQSxJQUFJQSxDQUFDQTtnQkFBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBRy9FQSxJQUFJQSxHQUFHQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxLQUFLQSxLQUFLQSxFQUFFQSxDQUFDQSxHQUFHQSxVQUFVQSxDQUFDQSxDQUFDQTtnQkFFbkRBLElBQUlBLEdBQUdBLENBQUNBLEtBQUtBLElBQUlBLEVBQUVBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLEtBQUtBLElBQUlBLENBQUNBLENBQUNBLEdBQUdBLFFBQVFBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLEtBQUtBLEtBQUtBLENBQUNBLENBQUNBLEdBQUdBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLEtBQUtBLEtBQUtBLEVBQUVBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLENBQUNBO2dCQUN0R0EsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0E7Z0JBR2JBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLEdBQUNBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLE1BQU1BLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBLEVBQUVBLEVBQ3BDQSxDQUFDQTtvQkFFQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FDZEEsQ0FBQ0E7d0JBQ0NBLElBQUlBLEdBQUdBLENBQUNBLElBQUlBLElBQUlBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLEtBQUtBLEVBQUVBLENBQUNBLENBQUNBO3dCQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxLQUFLQSxJQUFJQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxLQUFLQSxFQUFFQSxDQUFDQSxDQUFDQTtvQkFDNUVBLENBQUNBO29CQUNEQSxJQUFJQSxDQUNKQSxDQUFDQTt3QkFDQ0EsSUFBSUEsR0FBR0EsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsS0FBS0EsRUFBRUEsQ0FBQ0EsQ0FBQ0E7d0JBQUNBLEtBQUtBLEdBQUdBLENBQUNBLEtBQUtBLElBQUlBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLEtBQUtBLEtBQUtBLEVBQUVBLENBQUNBLENBQUNBO29CQUM1RUEsQ0FBQ0E7b0JBQ0RBLElBQUlBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBO29CQUFDQSxLQUFLQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQTtvQkFNNUJBLFFBQVFBLEdBQUdBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLEtBQUtBLEVBQUVBLENBQUNBLEdBQUdBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLEVBQUVBLENBQUNBLEdBQUdBLEdBQUdBLENBQUNBOzBCQUNqRkEsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsRUFBRUEsQ0FBQ0EsR0FBR0EsR0FBR0EsQ0FBQ0EsR0FBR0EsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsRUFBRUEsQ0FBQ0EsR0FBR0EsR0FBR0EsQ0FBQ0E7MEJBQ3pGQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxJQUFJQSxLQUFLQSxFQUFFQSxDQUFDQSxHQUFHQSxHQUFHQSxDQUFDQSxHQUFHQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxJQUFJQSxLQUFLQSxDQUFDQSxDQUFDQSxHQUFHQSxHQUFHQSxDQUFDQTswQkFDeEZBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLENBQUNBLENBQUNBLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBO29CQUN0REEsU0FBU0EsR0FBR0EsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsS0FBS0EsS0FBS0EsRUFBRUEsQ0FBQ0EsR0FBR0EsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsS0FBS0EsRUFBRUEsQ0FBQ0EsR0FBR0EsR0FBR0EsQ0FBQ0E7MEJBQ25GQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxLQUFLQSxLQUFLQSxFQUFFQSxDQUFDQSxHQUFHQSxHQUFHQSxDQUFDQSxHQUFHQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxLQUFLQSxLQUFLQSxFQUFFQSxDQUFDQSxHQUFHQSxHQUFHQSxDQUFDQTswQkFDNUZBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBLEtBQUtBLEtBQUtBLEVBQUVBLENBQUNBLEdBQUdBLEdBQUdBLENBQUNBLEdBQUdBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBLEtBQUtBLEtBQUtBLENBQUNBLENBQUNBLEdBQUdBLEdBQUdBLENBQUNBOzBCQUM1RkEsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7b0JBQ3pEQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxTQUFTQSxLQUFLQSxFQUFFQSxDQUFDQSxHQUFHQSxRQUFRQSxDQUFDQSxHQUFHQSxVQUFVQSxDQUFDQTtvQkFDcERBLElBQUlBLENBQUNBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLFFBQVFBLEdBQUdBLElBQUlBLENBQUNBO29CQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxTQUFTQSxHQUFHQSxDQUFDQSxJQUFJQSxJQUFJQSxFQUFFQSxDQUFDQSxDQUFDQTtnQkFDcEVBLENBQUNBO1lBQ0hBLENBQUNBO1lBRURBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1FBQ2RBLENBQUNBO1FBR0RELEVBQUVBLENBQUNBLENBQUVBLE1BQU1BLENBQUNBLEtBQUtBLElBQUlBLFNBQVVBLENBQUNBLENBQ2hDQSxDQUFDQTtZQUNDQSxNQUFNQSxDQUFDQSxLQUFLQSxHQUFHQTtnQkFDYkEsV0FBV0EsRUFBRUEsSUFBSUEsV0FBV0EsQ0FBRUEsQ0FBQ0EsU0FBU0EsRUFBQ0EsQ0FBQ0EsRUFBQ0EsT0FBT0EsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsRUFBQ0EsT0FBT0EsRUFBQ0EsR0FBR0EsRUFBQ0EsT0FBT0EsRUFBQ0EsS0FBS0EsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsRUFBQ0EsS0FBS0EsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsRUFBQ0EsR0FBR0EsRUFBQ0EsS0FBS0EsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsRUFBQ0EsT0FBT0EsRUFBQ0EsT0FBT0EsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsRUFBQ0EsT0FBT0EsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsRUFBQ0EsT0FBT0EsRUFBQ0EsQ0FBQ0EsRUFBQ0EsS0FBS0EsRUFBQ0EsT0FBT0EsRUFBQ0EsU0FBU0EsRUFBQ0EsT0FBT0EsRUFBQ0EsU0FBU0EsRUFBQ0EsR0FBR0EsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsRUFBQ0EsS0FBS0EsRUFBQ0EsU0FBU0EsRUFBQ0EsT0FBT0EsRUFBQ0EsT0FBT0EsRUFBQ0EsU0FBU0EsRUFBQ0EsS0FBS0EsRUFBQ0EsR0FBR0EsRUFBQ0EsU0FBU0EsRUFBQ0EsT0FBT0EsRUFBQ0EsU0FBU0EsRUFBQ0EsT0FBT0EsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsRUFBQ0EsS0FBS0EsRUFBQ0EsT0FBT0EsRUFBQ0EsU0FBU0EsRUFBQ0EsS0FBS0EsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsRUFBQ0EsQ0FBQ0EsRUFBQ0EsT0FBT0EsRUFBQ0EsT0FBT0EsRUFBQ0EsQ0FBQ0EsRUFBQ0EsU0FBU0EsQ0FBQ0EsQ0FBRUE7Z0JBQ3ppQkEsV0FBV0EsRUFBRUEsSUFBSUEsV0FBV0EsQ0FBRUEsQ0FBQ0EsQ0FBQ0EsVUFBVUEsRUFBQ0EsQ0FBQ0EsVUFBVUEsRUFBQ0EsTUFBTUEsRUFBQ0EsUUFBUUEsRUFBQ0EsUUFBUUEsRUFBQ0EsSUFBSUEsRUFBQ0EsQ0FBQ0EsVUFBVUEsRUFBQ0EsQ0FBQ0EsVUFBVUEsRUFBQ0EsQ0FBQ0EsVUFBVUEsRUFBQ0EsQ0FBQ0EsVUFBVUEsRUFBQ0EsQ0FBQ0EsVUFBVUEsRUFBQ0EsQ0FBQ0EsVUFBVUEsRUFBQ0EsQ0FBQ0EsVUFBVUEsRUFBQ0EsUUFBUUEsRUFBQ0EsSUFBSUEsRUFBQ0EsQ0FBQ0EsVUFBVUEsRUFBQ0EsUUFBUUEsRUFBQ0EsUUFBUUEsRUFBQ0EsQ0FBQ0EsVUFBVUEsRUFBQ0EsQ0FBQ0EsRUFBQ0EsQ0FBQ0EsVUFBVUEsRUFBQ0EsTUFBTUEsRUFBQ0EsUUFBUUEsRUFBQ0EsQ0FBQ0EsVUFBVUEsRUFBQ0EsUUFBUUEsRUFBQ0EsQ0FBQ0EsVUFBVUEsRUFBQ0EsQ0FBQ0EsRUFBQ0EsUUFBUUEsRUFBQ0EsTUFBTUEsRUFBQ0EsQ0FBQ0EsVUFBVUEsRUFBQ0EsQ0FBQ0EsVUFBVUEsRUFBQ0EsTUFBTUEsRUFBQ0EsQ0FBQ0EsRUFBQ0EsUUFBUUEsRUFBQ0EsQ0FBQ0EsVUFBVUEsRUFBQ0EsUUFBUUEsRUFBQ0EsQ0FBQ0EsVUFBVUEsRUFBQ0EsQ0FBQ0EsVUFBVUEsRUFBQ0EsQ0FBQ0EsVUFBVUEsRUFBQ0EsTUFBTUEsRUFBQ0EsQ0FBQ0EsVUFBVUEsRUFBQ0EsQ0FBQ0EsVUFBVUEsRUFBQ0EsSUFBSUEsRUFBQ0EsQ0FBQ0EsVUFBVUEsRUFBQ0EsUUFBUUEsRUFBQ0EsSUFBSUEsRUFBQ0EsTUFBTUEsRUFBQ0EsQ0FBQ0EsVUFBVUEsRUFBQ0EsTUFBTUEsRUFBQ0EsQ0FBQ0EsVUFBVUEsRUFBQ0EsUUFBUUEsRUFBQ0EsQ0FBQ0EsVUFBVUEsRUFBQ0EsUUFBUUEsRUFBQ0EsQ0FBQ0EsVUFBVUEsRUFBQ0EsQ0FBQ0EsVUFBVUEsRUFBQ0EsUUFBUUEsRUFBQ0EsUUFBUUEsRUFBQ0EsQ0FBQ0EsRUFBQ0EsQ0FBQ0EsVUFBVUEsRUFBQ0EsTUFBTUEsRUFBQ0EsQ0FBQ0EsVUFBVUEsRUFBQ0EsQ0FBQ0EsVUFBVUEsRUFBQ0EsQ0FBQ0EsVUFBVUEsRUFBQ0EsUUFBUUEsQ0FBQ0EsQ0FBRUE7Z0JBQ3JvQkEsV0FBV0EsRUFBRUEsSUFBSUEsV0FBV0EsQ0FBRUEsQ0FBQ0EsS0FBS0EsRUFBQ0EsU0FBU0EsRUFBQ0EsQ0FBQ0EsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsRUFBQ0EsQ0FBQ0EsRUFBQ0EsT0FBT0EsRUFBQ0EsU0FBU0EsRUFBQ0EsT0FBT0EsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsRUFBQ0EsT0FBT0EsRUFBQ0EsU0FBU0EsRUFBQ0EsT0FBT0EsRUFBQ0EsU0FBU0EsRUFBQ0EsS0FBS0EsRUFBQ0EsU0FBU0EsRUFBQ0EsR0FBR0EsRUFBQ0EsU0FBU0EsRUFBQ0EsS0FBS0EsRUFBQ0EsT0FBT0EsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsRUFBQ0EsT0FBT0EsRUFBQ0EsU0FBU0EsRUFBQ0EsT0FBT0EsRUFBQ0EsT0FBT0EsRUFBQ0EsU0FBU0EsRUFBQ0EsR0FBR0EsRUFBQ0EsU0FBU0EsRUFBQ0EsS0FBS0EsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsRUFBQ0EsT0FBT0EsRUFBQ0EsS0FBS0EsRUFBQ0EsT0FBT0EsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsRUFBQ0EsQ0FBQ0EsRUFBQ0EsS0FBS0EsRUFBQ0EsT0FBT0EsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsRUFBQ0EsS0FBS0EsRUFBQ0EsQ0FBQ0EsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsRUFBQ0EsT0FBT0EsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsRUFBQ0EsR0FBR0EsRUFBQ0EsT0FBT0EsRUFBQ0EsT0FBT0EsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsRUFBQ0EsU0FBU0EsRUFBQ0EsS0FBS0EsRUFBQ0EsU0FBU0EsRUFBQ0EsT0FBT0EsRUFBQ0EsR0FBR0EsRUFBQ0EsU0FBU0EsRUFBQ0EsT0FBT0EsQ0FBQ0EsQ0FBRUE7Z0JBQ3ppQkEsV0FBV0EsRUFBRUEsSUFBSUEsV0FBV0EsQ0FBRUEsQ0FBQ0EsUUFBUUEsRUFBQ0EsTUFBTUEsRUFBQ0EsTUFBTUEsRUFBQ0EsSUFBSUEsRUFBQ0EsUUFBUUEsRUFBQ0EsUUFBUUEsRUFBQ0EsUUFBUUEsRUFBQ0EsTUFBTUEsRUFBQ0EsQ0FBQ0EsRUFBQ0EsUUFBUUEsRUFBQ0EsUUFBUUEsRUFBQ0EsUUFBUUEsRUFBQ0EsSUFBSUEsRUFBQ0EsQ0FBQ0EsRUFBQ0EsUUFBUUEsRUFBQ0EsUUFBUUEsRUFBQ0EsR0FBR0EsRUFBQ0EsTUFBTUEsRUFBQ0EsUUFBUUEsRUFBQ0EsUUFBUUEsRUFBQ0EsSUFBSUEsRUFBQ0EsUUFBUUEsRUFBQ0EsTUFBTUEsRUFBQ0EsTUFBTUEsRUFBQ0EsUUFBUUEsRUFBQ0EsR0FBR0EsRUFBQ0EsTUFBTUEsRUFBQ0EsUUFBUUEsRUFBQ0EsTUFBTUEsRUFBQ0EsUUFBUUEsRUFBQ0EsUUFBUUEsRUFBQ0EsSUFBSUEsRUFBQ0EsUUFBUUEsRUFBQ0EsUUFBUUEsRUFBQ0EsUUFBUUEsRUFBQ0EsUUFBUUEsRUFBQ0EsSUFBSUEsRUFBQ0EsQ0FBQ0EsRUFBQ0EsQ0FBQ0EsRUFBQ0EsUUFBUUEsRUFBQ0EsTUFBTUEsRUFBQ0EsUUFBUUEsRUFBQ0EsUUFBUUEsRUFBQ0EsR0FBR0EsRUFBQ0EsUUFBUUEsRUFBQ0EsTUFBTUEsRUFBQ0EsTUFBTUEsRUFBQ0EsSUFBSUEsRUFBQ0EsUUFBUUEsRUFBQ0EsSUFBSUEsRUFBQ0EsR0FBR0EsRUFBQ0EsTUFBTUEsRUFBQ0EsUUFBUUEsRUFBQ0EsTUFBTUEsRUFBQ0EsUUFBUUEsRUFBQ0EsUUFBUUEsRUFBQ0EsTUFBTUEsRUFBQ0EsTUFBTUEsRUFBQ0EsUUFBUUEsRUFBQ0EsUUFBUUEsRUFBQ0EsSUFBSUEsRUFBQ0EsUUFBUUEsRUFBQ0EsTUFBTUEsRUFBQ0EsUUFBUUEsQ0FBQ0EsQ0FBRUE7Z0JBQ2pmQSxXQUFXQSxFQUFFQSxJQUFJQSxXQUFXQSxDQUFFQSxDQUFDQSxLQUFLQSxFQUFDQSxTQUFTQSxFQUFDQSxTQUFTQSxFQUFDQSxVQUFVQSxFQUFDQSxPQUFPQSxFQUFDQSxLQUFLQSxFQUFDQSxVQUFVQSxFQUFDQSxTQUFTQSxFQUFDQSxVQUFVQSxFQUFDQSxPQUFPQSxFQUFDQSxTQUFTQSxFQUFDQSxVQUFVQSxFQUFDQSxVQUFVQSxFQUFDQSxVQUFVQSxFQUFDQSxPQUFPQSxFQUFDQSxVQUFVQSxFQUFDQSxTQUFTQSxFQUFDQSxVQUFVQSxFQUFDQSxVQUFVQSxFQUFDQSxDQUFDQSxFQUFDQSxVQUFVQSxFQUFDQSxVQUFVQSxFQUFDQSxVQUFVQSxFQUFDQSxTQUFTQSxFQUFDQSxVQUFVQSxFQUFDQSxVQUFVQSxFQUFDQSxDQUFDQSxFQUFDQSxVQUFVQSxFQUFDQSxTQUFTQSxFQUFDQSxTQUFTQSxFQUFDQSxVQUFVQSxFQUFDQSxPQUFPQSxFQUFDQSxPQUFPQSxFQUFDQSxVQUFVQSxFQUFDQSxLQUFLQSxFQUFDQSxTQUFTQSxFQUFDQSxVQUFVQSxFQUFDQSxTQUFTQSxFQUFDQSxVQUFVQSxFQUFDQSxVQUFVQSxFQUFDQSxTQUFTQSxFQUFDQSxVQUFVQSxFQUFDQSxVQUFVQSxFQUFDQSxTQUFTQSxFQUFDQSxVQUFVQSxFQUFDQSxLQUFLQSxFQUFDQSxTQUFTQSxFQUFDQSxVQUFVQSxFQUFDQSxVQUFVQSxFQUFDQSxPQUFPQSxFQUFDQSxVQUFVQSxFQUFDQSxVQUFVQSxFQUFDQSxTQUFTQSxFQUFDQSxDQUFDQSxFQUFDQSxVQUFVQSxFQUFDQSxVQUFVQSxFQUFDQSxPQUFPQSxFQUFDQSxTQUFTQSxFQUFDQSxVQUFVQSxFQUFDQSxPQUFPQSxFQUFDQSxDQUFDQSxFQUFDQSxVQUFVQSxFQUFDQSxTQUFTQSxFQUFDQSxVQUFVQSxDQUFDQSxDQUFFQTtnQkFDam9CQSxXQUFXQSxFQUFFQSxJQUFJQSxXQUFXQSxDQUFFQSxDQUFDQSxVQUFVQSxFQUFDQSxVQUFVQSxFQUFDQSxNQUFNQSxFQUFDQSxVQUFVQSxFQUFDQSxVQUFVQSxFQUFDQSxJQUFJQSxFQUFDQSxVQUFVQSxFQUFDQSxRQUFRQSxFQUFDQSxVQUFVQSxFQUFDQSxRQUFRQSxFQUFDQSxRQUFRQSxFQUFDQSxVQUFVQSxFQUFDQSxRQUFRQSxFQUFDQSxVQUFVQSxFQUFDQSxVQUFVQSxFQUFDQSxNQUFNQSxFQUFDQSxDQUFDQSxFQUFDQSxRQUFRQSxFQUFDQSxVQUFVQSxFQUFDQSxNQUFNQSxFQUFDQSxRQUFRQSxFQUFDQSxVQUFVQSxFQUFDQSxJQUFJQSxFQUFDQSxVQUFVQSxFQUFDQSxVQUFVQSxFQUFDQSxDQUFDQSxFQUFDQSxRQUFRQSxFQUFDQSxVQUFVQSxFQUFDQSxNQUFNQSxFQUFDQSxRQUFRQSxFQUFDQSxVQUFVQSxFQUFDQSxVQUFVQSxFQUFDQSxVQUFVQSxFQUFDQSxJQUFJQSxFQUFDQSxVQUFVQSxFQUFDQSxRQUFRQSxFQUFDQSxVQUFVQSxFQUFDQSxRQUFRQSxFQUFDQSxNQUFNQSxFQUFDQSxVQUFVQSxFQUFDQSxRQUFRQSxFQUFDQSxVQUFVQSxFQUFDQSxVQUFVQSxFQUFDQSxNQUFNQSxFQUFDQSxVQUFVQSxFQUFDQSxVQUFVQSxFQUFDQSxRQUFRQSxFQUFDQSxVQUFVQSxFQUFDQSxRQUFRQSxFQUFDQSxVQUFVQSxFQUFDQSxDQUFDQSxFQUFDQSxVQUFVQSxFQUFDQSxJQUFJQSxFQUFDQSxNQUFNQSxFQUFDQSxVQUFVQSxFQUFDQSxRQUFRQSxFQUFDQSxNQUFNQSxFQUFDQSxRQUFRQSxFQUFDQSxVQUFVQSxFQUFDQSxDQUFDQSxFQUFDQSxVQUFVQSxFQUFDQSxVQUFVQSxFQUFDQSxRQUFRQSxFQUFDQSxVQUFVQSxDQUFDQSxDQUFFQTtnQkFDcm1CQSxXQUFXQSxFQUFFQSxJQUFJQSxXQUFXQSxDQUFFQSxDQUFDQSxRQUFRQSxFQUFDQSxTQUFTQSxFQUFDQSxTQUFTQSxFQUFDQSxDQUFDQSxFQUFDQSxLQUFLQSxFQUFDQSxTQUFTQSxFQUFDQSxRQUFRQSxFQUFDQSxTQUFTQSxFQUFDQSxTQUFTQSxFQUFDQSxRQUFRQSxFQUFDQSxDQUFDQSxFQUFDQSxTQUFTQSxFQUFDQSxHQUFHQSxFQUFDQSxTQUFTQSxFQUFDQSxTQUFTQSxFQUFDQSxLQUFLQSxFQUFDQSxTQUFTQSxFQUFDQSxRQUFRQSxFQUFDQSxRQUFRQSxFQUFDQSxTQUFTQSxFQUFDQSxTQUFTQSxFQUFDQSxTQUFTQSxFQUFDQSxTQUFTQSxFQUFDQSxRQUFRQSxFQUFDQSxTQUFTQSxFQUFDQSxLQUFLQSxFQUFDQSxLQUFLQSxFQUFDQSxTQUFTQSxFQUFDQSxRQUFRQSxFQUFDQSxHQUFHQSxFQUFDQSxTQUFTQSxFQUFDQSxRQUFRQSxFQUFDQSxTQUFTQSxFQUFDQSxRQUFRQSxFQUFDQSxRQUFRQSxFQUFDQSxTQUFTQSxFQUFDQSxTQUFTQSxFQUFDQSxTQUFTQSxFQUFDQSxTQUFTQSxFQUFDQSxHQUFHQSxFQUFDQSxRQUFRQSxFQUFDQSxTQUFTQSxFQUFDQSxTQUFTQSxFQUFDQSxRQUFRQSxFQUFDQSxTQUFTQSxFQUFDQSxLQUFLQSxFQUFDQSxRQUFRQSxFQUFDQSxTQUFTQSxFQUFDQSxLQUFLQSxFQUFDQSxTQUFTQSxFQUFDQSxTQUFTQSxFQUFDQSxTQUFTQSxFQUFDQSxRQUFRQSxFQUFDQSxDQUFDQSxFQUFDQSxHQUFHQSxFQUFDQSxTQUFTQSxFQUFDQSxDQUFDQSxFQUFDQSxRQUFRQSxFQUFDQSxTQUFTQSxFQUFDQSxLQUFLQSxFQUFDQSxTQUFTQSxFQUFDQSxTQUFTQSxFQUFDQSxLQUFLQSxFQUFDQSxRQUFRQSxDQUFDQSxDQUFFQTtnQkFDempCQSxXQUFXQSxFQUFFQSxJQUFJQSxXQUFXQSxDQUFFQSxDQUFDQSxVQUFVQSxFQUFDQSxNQUFNQSxFQUFDQSxPQUFPQSxFQUFDQSxVQUFVQSxFQUFDQSxVQUFVQSxFQUFDQSxVQUFVQSxFQUFDQSxJQUFJQSxFQUFDQSxVQUFVQSxFQUFDQSxPQUFPQSxFQUFDQSxVQUFVQSxFQUFDQSxVQUFVQSxFQUFDQSxPQUFPQSxFQUFDQSxVQUFVQSxFQUFDQSxPQUFPQSxFQUFDQSxNQUFNQSxFQUFDQSxJQUFJQSxFQUFDQSxVQUFVQSxFQUFDQSxVQUFVQSxFQUFDQSxVQUFVQSxFQUFDQSxNQUFNQSxFQUFDQSxPQUFPQSxFQUFDQSxPQUFPQSxFQUFDQSxVQUFVQSxFQUFDQSxVQUFVQSxFQUFDQSxNQUFNQSxFQUFDQSxDQUFDQSxFQUFDQSxDQUFDQSxFQUFDQSxVQUFVQSxFQUFDQSxVQUFVQSxFQUFDQSxVQUFVQSxFQUFDQSxPQUFPQSxFQUFDQSxPQUFPQSxFQUFDQSxPQUFPQSxFQUFDQSxPQUFPQSxFQUFDQSxVQUFVQSxFQUFDQSxNQUFNQSxFQUFDQSxJQUFJQSxFQUFDQSxVQUFVQSxFQUFDQSxNQUFNQSxFQUFDQSxPQUFPQSxFQUFDQSxVQUFVQSxFQUFDQSxJQUFJQSxFQUFDQSxVQUFVQSxFQUFDQSxVQUFVQSxFQUFDQSxVQUFVQSxFQUFDQSxVQUFVQSxFQUFDQSxPQUFPQSxFQUFDQSxVQUFVQSxFQUFDQSxDQUFDQSxFQUFDQSxVQUFVQSxFQUFDQSxPQUFPQSxFQUFDQSxVQUFVQSxFQUFDQSxVQUFVQSxFQUFDQSxVQUFVQSxFQUFDQSxVQUFVQSxFQUFDQSxDQUFDQSxFQUFDQSxVQUFVQSxFQUFDQSxPQUFPQSxFQUFDQSxPQUFPQSxFQUFDQSxNQUFNQSxFQUFDQSxNQUFNQSxFQUFDQSxPQUFPQSxFQUFDQSxVQUFVQSxFQUFDQSxVQUFVQSxDQUFDQSxDQUFFQTthQUN0bEJBLENBQUNBO1FBQ0pBLENBQUNBO1FBR0RBLElBQUlBLElBQUlBLEdBQUdBLGNBQWNBLENBQUVBLEdBQUdBLENBQUVBLENBQUNBO1FBRWpDQSxJQUFJQSxDQUFDQSxHQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxFQUFFQSxLQUFLQSxFQUFFQSxPQUFPQSxDQUFDQTtRQUMxQ0EsSUFBSUEsT0FBT0EsRUFBRUEsUUFBUUEsRUFBRUEsUUFBUUEsRUFBRUEsU0FBU0EsQ0FBQUE7UUFDMUNBLElBQUlBLEdBQUdBLEdBQUdBLE9BQU9BLENBQUNBLE1BQU1BLENBQUNBO1FBR3pCQSxJQUFJQSxVQUFVQSxHQUFHQSxJQUFJQSxDQUFDQSxNQUFNQSxJQUFJQSxFQUFFQSxHQUFHQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUUzQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsVUFBVUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FDcEJBLENBQUNBO1lBQ0NBLE9BQU9BLEdBQUdBLE9BQU9BLEdBQUdBLENBQUVBLENBQUNBLEVBQUVBLEVBQUVBLEVBQUVBLENBQUNBLENBQUVBLEdBQUdBLENBQUVBLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLENBQUVBLENBQUNBO1FBQ3BEQSxDQUFDQTtRQUNEQSxJQUFJQSxDQUNKQSxDQUFDQTtZQUNDQSxPQUFPQSxHQUFHQSxPQUFPQSxHQUFHQSxDQUFFQSxDQUFDQSxFQUFFQSxFQUFFQSxFQUFFQSxDQUFDQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFFQSxHQUFHQSxDQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxDQUFDQSxFQUFFQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFFQSxDQUFDQTtRQUNsR0EsQ0FBQ0E7UUFHREEsRUFBRUEsQ0FBQ0EsQ0FBRUEsQ0FBRUEsT0FBT0EsSUFBSUEsU0FBU0EsQ0FBRUEsSUFBSUEsQ0FBRUEsT0FBT0EsSUFBSUEsQ0FBQ0EsQ0FBR0EsQ0FBQ0EsQ0FDbkRBLENBQUNBO1lBQ0NBLElBQUlBLGVBQWVBLEdBQUdBLE9BQU9BLENBQUNBO1lBQzlCQSxJQUFJQSxHQUFHQSxHQUFHQSxDQUFDQSxHQUFDQSxDQUFDQSxHQUFHQSxHQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUVwQkEsT0FBT0EsR0FBR0EsSUFBSUEsVUFBVUEsQ0FBRUEsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBRUEsQ0FBQ0E7WUFDcENBLE9BQU9BLENBQUNBLEdBQUdBLENBQUVBLGVBQWVBLEVBQUVBLENBQUNBLENBQUVBLENBQUNBO1lBRWxDQSxNQUFNQSxDQUFBQSxDQUFFQSxPQUFRQSxDQUFDQSxDQUNqQkEsQ0FBQ0E7Z0JBQ0NBLEtBQUtBLENBQUNBO29CQUNKQSxPQUFPQSxDQUFDQSxHQUFHQSxDQUFFQSxJQUFJQSxVQUFVQSxDQUFFQSxDQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxDQUFFQSxDQUFFQSxFQUFFQSxHQUFHQSxDQUFFQSxDQUFDQTtvQkFDekZBLEtBQUtBLENBQUNBO2dCQUVSQSxLQUFLQSxDQUFDQTtvQkFDTkEsQ0FBQ0E7d0JBQ0NBLE9BQU9BLENBQUNBLEdBQUdBLENBQUVBLElBQUlBLFVBQVVBLENBQUVBLENBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLENBQUNBLENBQUVBLEVBQUVBLENBQUNBLENBQUVBLENBQUNBO3dCQUU5RUEsRUFBRUEsQ0FBQ0EsQ0FBRUEsR0FBR0EsSUFBRUEsQ0FBRUEsQ0FBQ0E7NEJBQ1hBLEdBQUdBLElBQUVBLENBQUNBLENBQUNBO3dCQUVUQSxLQUFLQSxDQUFDQTtvQkFDUkEsQ0FBQ0E7Z0JBRURBLEtBQUtBLENBQUNBO29CQUNKQSxPQUFPQSxDQUFDQSxHQUFHQSxDQUFFQSxJQUFJQSxVQUFVQSxDQUFFQSxDQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxDQUFFQSxDQUFFQSxFQUFFQSxDQUFDQSxDQUFFQSxDQUFDQTtvQkFDdkZBLEtBQUtBLENBQUNBO1lBRVZBLENBQUNBO1lBRURBLEdBQUdBLElBQUlBLENBQUNBLEdBQUNBLENBQUNBLEdBQUdBLEdBQUNBLENBQUNBLENBQUNBLENBQUFBO1FBQ2xCQSxDQUFDQTtRQUdEQSxJQUFJQSxNQUFNQSxHQUFHQSxJQUFJQSxVQUFVQSxDQUFFQSxHQUFHQSxDQUFFQSxDQUFDQTtRQUVuQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FDZEEsQ0FBQ0E7WUFDQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7WUFFVkEsT0FBT0EsR0FBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0E7WUFDeEVBLFFBQVFBLEdBQUdBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLEVBQUVBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBLEdBQUdBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLEVBQUVBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBLEdBQUdBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLEVBQUVBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLEdBQUdBLEVBQUVBLENBQUNBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBO1FBQzFFQSxDQUFDQTtRQUVEQSxJQUFJQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUdYQSxPQUFPQSxDQUFDQSxHQUFHQSxHQUFHQSxFQUNkQSxDQUFDQTtZQUNDQSxJQUFJQSxHQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQSxHQUFHQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQSxHQUFHQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxHQUFHQSxPQUFPQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQTtZQUN6RkEsS0FBS0EsR0FBR0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0E7WUFHekZBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLElBQUlBLENBQUNBLENBQUNBLENBQ2RBLENBQUNBO2dCQUNDQSxFQUFFQSxDQUFDQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUNaQSxDQUFDQTtvQkFDQ0EsSUFBSUEsSUFBSUEsT0FBT0EsQ0FBQ0E7b0JBQUNBLEtBQUtBLElBQUlBLFFBQVFBLENBQUNBO2dCQUNyQ0EsQ0FBQ0E7Z0JBQ0RBLElBQUlBLENBQ0pBLENBQUNBO29CQUNDQSxRQUFRQSxHQUFHQSxPQUFPQSxDQUFDQTtvQkFDbkJBLFNBQVNBLEdBQUdBLFFBQVFBLENBQUNBO29CQUNyQkEsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0E7b0JBQ2ZBLFFBQVFBLEdBQUdBLEtBQUtBLENBQUNBO2dCQUNuQkEsQ0FBQ0E7WUFDSEEsQ0FBQ0E7WUFHREEsSUFBSUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsS0FBS0EsQ0FBQ0EsR0FBR0EsVUFBVUEsQ0FBQ0E7WUFBQ0EsS0FBS0EsSUFBSUEsSUFBSUEsQ0FBQ0E7WUFBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDL0VBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLEVBQUVBLENBQUNBLEdBQUdBLEtBQUtBLENBQUNBLEdBQUdBLFVBQVVBLENBQUNBO1lBQUNBLEtBQUtBLElBQUlBLElBQUlBLENBQUNBO1lBQUNBLElBQUlBLElBQUlBLENBQUNBLElBQUlBLElBQUlBLEVBQUVBLENBQUNBLENBQUNBO1lBQ2pGQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxLQUFLQSxLQUFLQSxDQUFDQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxHQUFHQSxVQUFVQSxDQUFDQTtZQUFDQSxJQUFJQSxJQUFJQSxJQUFJQSxDQUFDQTtZQUFDQSxLQUFLQSxJQUFJQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUMvRUEsSUFBSUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsR0FBR0EsVUFBVUEsQ0FBQ0E7WUFBQ0EsSUFBSUEsSUFBSUEsSUFBSUEsQ0FBQ0E7WUFBQ0EsS0FBS0EsSUFBSUEsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDL0VBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLENBQUNBLENBQUNBLEdBQUdBLEtBQUtBLENBQUNBLEdBQUdBLFVBQVVBLENBQUNBO1lBQUNBLEtBQUtBLElBQUlBLElBQUlBLENBQUNBO1lBQUNBLElBQUlBLElBQUlBLENBQUNBLElBQUlBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1lBRS9FQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxLQUFLQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNyQ0EsS0FBS0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsS0FBS0EsS0FBS0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFHeENBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLEdBQUNBLENBQUNBLEVBQUVBLENBQUNBLEdBQUNBLFVBQVVBLEVBQUVBLENBQUNBLElBQUVBLENBQUNBLEVBQzVCQSxDQUFDQTtnQkFDQ0EsSUFBSUEsT0FBT0EsR0FBR0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsR0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzNCQSxJQUFJQSxPQUFPQSxHQUFHQSxPQUFPQSxDQUFDQSxDQUFDQSxHQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFHM0JBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLEdBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLEVBQUVBLENBQUNBLElBQUVBLE9BQU9BLEVBQUVBLENBQUNBLElBQUVBLE9BQU9BLEVBQ3pDQSxDQUFDQTtvQkFDQ0EsSUFBSUEsTUFBTUEsR0FBR0EsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQzdCQSxJQUFJQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQSxLQUFLQSxLQUFLQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxJQUFJQSxFQUFFQSxDQUFDQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxDQUFDQSxHQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFHekRBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBO29CQUNaQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQTtvQkFDYkEsS0FBS0EsR0FBR0EsSUFBSUEsR0FBR0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsS0FBS0EsRUFBRUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsR0FBR0EsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsS0FBS0EsRUFBRUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0E7MEJBQ25HQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxNQUFNQSxLQUFNQSxDQUFDQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxHQUFHQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxXQUFXQSxDQUFDQSxNQUFNQSxHQUFHQSxJQUFJQSxDQUFDQTswQkFDMUZBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLE1BQU1BLEtBQUtBLEVBQUVBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLEdBQUdBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLE1BQU1BLEtBQUtBLEVBQUVBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBOzBCQUNuR0EsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsS0FBTUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsR0FBR0EsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzlHQSxDQUFDQTtnQkFFREEsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0E7Z0JBQUNBLElBQUlBLEdBQUdBLEtBQUtBLENBQUNBO2dCQUFDQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUMxQ0EsQ0FBQ0E7WUFHREEsSUFBSUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsSUFBSUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDckNBLEtBQUtBLEdBQUdBLENBQUNBLENBQUNBLEtBQUtBLEtBQUtBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLEtBQUtBLElBQUlBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO1lBR3hDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxJQUFJQSxLQUFLQSxDQUFDQSxDQUFDQSxHQUFHQSxLQUFLQSxDQUFDQSxHQUFHQSxVQUFVQSxDQUFDQTtZQUFDQSxLQUFLQSxJQUFJQSxJQUFJQSxDQUFDQTtZQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUMvRUEsSUFBSUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsR0FBR0EsVUFBVUEsQ0FBQ0E7WUFBQ0EsSUFBSUEsSUFBSUEsSUFBSUEsQ0FBQ0E7WUFBQ0EsS0FBS0EsSUFBSUEsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDL0VBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLEtBQUtBLEtBQUtBLENBQUNBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLEdBQUdBLFVBQVVBLENBQUNBO1lBQUNBLElBQUlBLElBQUlBLElBQUlBLENBQUNBO1lBQUNBLEtBQUtBLElBQUlBLENBQUNBLElBQUlBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1lBQy9FQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxJQUFJQSxLQUFLQSxFQUFFQSxDQUFDQSxHQUFHQSxLQUFLQSxDQUFDQSxHQUFHQSxVQUFVQSxDQUFDQTtZQUFDQSxLQUFLQSxJQUFJQSxJQUFJQSxDQUFDQTtZQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxJQUFJQSxJQUFJQSxFQUFFQSxDQUFDQSxDQUFDQTtZQUNqRkEsSUFBSUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsS0FBS0EsQ0FBQ0EsR0FBR0EsVUFBVUEsQ0FBQ0E7WUFBQ0EsS0FBS0EsSUFBSUEsSUFBSUEsQ0FBQ0E7WUFBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFHL0VBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLElBQUlBLENBQUNBLENBQUNBLENBQ2RBLENBQUNBO2dCQUNDQSxFQUFFQSxDQUFDQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUNaQSxDQUFDQTtvQkFDQ0EsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0E7b0JBQ2ZBLFFBQVFBLEdBQUdBLEtBQUtBLENBQUNBO2dCQUNuQkEsQ0FBQ0E7Z0JB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QUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxLQUFLQSxFQUFFQSxDQUFDQSxHQUFHQSxFQUFFQSxDQUFFQSxDQUFDQTtJQUN4REEsQ0FBQ0E7SUFFRFQsR0FBR0EsQ0FBRUEsS0FBaUJBO1FBRXBCVSxNQUFNQSxDQUFDQSxJQUFJQSxVQUFVQSxDQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxLQUFLQSxFQUFFQSxDQUFDQSxHQUFHQSxDQUFFQSxLQUFLQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFFQSxDQUFDQTtJQUN4RUEsQ0FBQ0E7SUFFRFYsRUFBRUEsQ0FBRUEsS0FBaUJBO1FBRW5CVyxNQUFNQSxDQUFDQSxJQUFJQSxVQUFVQSxDQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxLQUFLQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFFQSxLQUFLQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFFQSxDQUFDQTtJQUN2RUEsQ0FBQ0E7SUFFRFgsR0FBR0EsQ0FBRUEsTUFBY0EsRUFBRUEsUUFBa0JBO1FBRXJDWSxJQUFJQSxFQUFFQSxHQUFHQSxJQUFJQSxVQUFVQSxDQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFFQSxDQUFDQTtRQUUxQ0EsRUFBRUEsQ0FBQ0EsQ0FBRUEsUUFBUUEsSUFBSUEsU0FBVUEsQ0FBQ0E7WUFDMUJBLFFBQVFBLEdBQUdBLEtBQUtBLENBQUNBO1FBRW5CQSxFQUFFQSxDQUFDQSxDQUFFQSxDQUFFQSxDQUFFQSxFQUFFQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFFQSxJQUFJQSxDQUFDQSxDQUFFQSxJQUFJQSxDQUFFQSxDQUFDQSxRQUFRQSxDQUFHQSxDQUFDQSxDQUNsREEsQ0FBQ0E7WUFDQ0EsSUFBSUEsTUFBTUEsR0FBR0EsQ0FBRUEsQ0FBRUEsRUFBRUEsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBRUEsQ0FBQ0E7WUFDeENBLEVBQUVBLENBQUNBLENBQUVBLE1BQU1BLElBQUlBLE1BQU1BLENBQUNBLGdCQUFpQkEsQ0FBQ0E7Z0JBQ3RDQSxFQUFFQSxDQUFDQSxNQUFNQSxDQUFFQSxJQUFJQSxDQUFFQSxDQUFDQTtZQUVwQkEsT0FBT0EsRUFBRUEsQ0FBQ0EsTUFBTUEsR0FBR0EsTUFBTUE7Z0JBQ3ZCQSxFQUFFQSxDQUFDQSxNQUFNQSxDQUFFQSxJQUFJQSxDQUFFQSxDQUFDQTtRQUN0QkEsQ0FBQ0E7UUFFREEsTUFBTUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsWUFBWUEsRUFBRUEsQ0FBQ0E7SUFDM0JBLENBQUNBO0lBRURaLFFBQVFBLENBQUVBLFFBQWlCQTtRQUd6QmEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsUUFBUUEsQ0FBRUEsU0FBU0EsQ0FBQ0EsR0FBR0EsQ0FBRUEsQ0FBQ0E7SUFDbERBLENBQUNBO0FBQ0hiLENBQUNBO0FBekdlLGNBQUcsR0FBRyxZQUFZLENBQUMsR0FBRyxDQUFDO0FBQ3ZCLGlCQUFNLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0F3RzNDO0FBRUQsYUFBYSxHQUFHLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQztBQUVsQyxhQUFhLE1BQU0sR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDO09DdEhqQyxFQUFFLFNBQVMsRUFBRSxNQUFNLHdCQUF3QjtPQUMzQyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWU7QUFFMUM7SUFJRWMsWUFBY0EsS0FBdUNBLEVBQUVBLFFBQVNBO1FBRTlEQyxFQUFFQSxDQUFDQSxDQUFFQSxLQUFLQSxZQUFZQSxTQUFVQSxDQUFDQSxDQUNqQ0EsQ0FBQ0E7WUFDQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsS0FBS0EsQ0FBQ0EsS0FBS0EsRUFBRUEsQ0FBQ0E7UUFDakNBLENBQUNBO1FBQ0RBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUVBLEtBQUtBLFlBQVlBLFVBQVdBLENBQUNBLENBQ3ZDQSxDQUFDQTtZQUNDQSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxLQUFLQSxDQUFDQSxTQUFTQSxDQUFDQSxLQUFLQSxFQUFFQSxDQUFDQTtRQUMzQ0EsQ0FBQ0E7UUFDREEsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBRUEsUUFBUUEsSUFBSUEsU0FBVUEsQ0FBQ0EsQ0FDakNBLENBQUNBO1lBQ0NBLElBQUlBLENBQUNBLFNBQVNBLEdBQUdBLElBQUlBLFVBQVVBLENBQUVBLEtBQUtBLEVBQUVBLFFBQVFBLENBQUVBLENBQUNBLFNBQVNBLENBQUNBLEtBQUtBLEVBQUVBLENBQUNBO1FBQ3ZFQSxDQUFDQTtRQUNEQSxJQUFJQTtZQUNGQSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxJQUFJQSxTQUFTQSxDQUFFQSxFQUFFQSxDQUFFQSxDQUFDQTtJQUN6Q0EsQ0FBQ0E7SUFFREQsSUFBSUEsTUFBTUE7UUFFUkUsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0E7SUFDL0JBLENBQUNBO0lBRURGLFlBQVlBO1FBRVZHLE1BQU1BLENBQUNBLElBQUlBLFVBQVVBLENBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUVBLENBQUNBO0lBQzFDQSxDQUFDQTtJQUVESCxLQUFLQTtRQUVISSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxJQUFJQSxTQUFTQSxDQUFFQSxFQUFFQSxDQUFFQSxDQUFDQTtJQUN2Q0EsQ0FBQ0E7SUFFREosTUFBTUEsQ0FBRUEsS0FBdUNBO1FBRTdDSyxJQUFJQSxVQUFxQkEsQ0FBQ0E7UUFFMUJBLEVBQUVBLENBQUNBLENBQUVBLENBQUVBLEtBQUtBLFlBQVlBLFVBQVVBLENBQUVBLElBQUlBLENBQUVBLEtBQUtBLFlBQVlBLFVBQVVBLENBQUdBLENBQUNBLENBQ3pFQSxDQUFDQTtZQUNDQSxVQUFVQSxHQUFHQSxLQUFLQSxDQUFDQSxTQUFTQSxDQUFDQTtRQUMvQkEsQ0FBQ0E7UUFDREEsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBRUEsT0FBT0EsS0FBS0EsSUFBSUEsUUFBU0EsQ0FBQ0EsQ0FDcENBLENBQUNBO1lBQ0NBLFVBQVVBLEdBQUdBLElBQUlBLFNBQVNBLENBQUVBLENBQUVBLENBQVVBLEtBQUtBLEdBQUdBLElBQUlBLENBQUVBLENBQUVBLENBQUVBLENBQUNBO1FBQzdEQSxDQUFDQTtRQVVEQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxDQUFFQSxVQUFVQSxDQUFFQSxDQUFDQTtRQUVwQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7SUFDZEEsQ0FBQ0E7QUFDSEwsQ0FBQ0E7QUFBQSxPQ2pFTSxFQUFFLFNBQVMsRUFBRSxNQUFNLHdCQUF3QjtBQUVsRDtJQThERU0sWUFBY0EsR0FBV0EsRUFBRUEsS0FBZ0JBLEVBQUVBLFFBQWlCQTtRQUU1REMsSUFBSUEsQ0FBQ0EsUUFBUUEsR0FBR0EsUUFBUUEsSUFBSUEsT0FBT0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsR0FBR0EsQ0FBQ0E7UUFFbERBLE1BQU1BLENBQUFBLENBQUVBLElBQUlBLENBQUNBLFFBQVNBLENBQUNBLENBQ3ZCQSxDQUFDQTtZQUNDQSxLQUFLQSxPQUFPQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQTtnQkFDMUJBLENBQUNBO29CQUNDQSxJQUFJQSxTQUFTQSxHQUFHQSxJQUFJQSxTQUFTQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQTtvQkFFbENBLEVBQUVBLENBQUNBLENBQUVBLEdBQUdBLElBQUtBLEtBQU1BLENBQUNBO3dCQUNsQkEsU0FBU0EsQ0FBQ0EsT0FBT0EsQ0FBRUEsQ0FBRUEsR0FBR0EsSUFBSUEsQ0FBQ0EsQ0FBRUEsR0FBR0EsSUFBSUEsQ0FBRUEsQ0FBQ0E7b0JBQzNDQSxTQUFTQSxDQUFDQSxPQUFPQSxDQUFFQSxHQUFHQSxHQUFHQSxJQUFJQSxDQUFFQSxDQUFDQTtvQkFFaENBLElBQUlBLEdBQUdBLEdBQUdBLEtBQUtBLENBQUNBLE1BQU1BLENBQUNBO29CQUN2QkEsRUFBRUEsQ0FBQ0EsQ0FBRUEsR0FBR0EsR0FBR0EsSUFBS0EsQ0FBQ0EsQ0FDakJBLENBQUNBO3dCQUNDQSxTQUFTQSxDQUFDQSxPQUFPQSxDQUFFQSxJQUFJQSxDQUFFQSxDQUFDQTt3QkFDMUJBLFNBQVNBLENBQUNBLE9BQU9BLENBQUVBLENBQUVBLEdBQUdBLElBQUlBLENBQUNBLENBQUVBLEdBQUdBLElBQUlBLENBQUVBLENBQUNBO29CQUMzQ0EsQ0FBQ0E7b0JBQ0RBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUVBLEdBQUdBLEdBQUdBLElBQUtBLENBQUNBO3dCQUNwQkEsU0FBU0EsQ0FBQ0EsT0FBT0EsQ0FBRUEsSUFBSUEsQ0FBRUEsQ0FBQ0E7b0JBRTVCQSxTQUFTQSxDQUFDQSxPQUFPQSxDQUFFQSxHQUFHQSxHQUFHQSxJQUFJQSxDQUFFQSxDQUFDQTtvQkFFaENBLFNBQVNBLENBQUNBLE1BQU1BLENBQUVBLEtBQUtBLENBQUVBLENBQUNBO29CQUUxQkEsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsU0FBU0EsQ0FBQ0E7b0JBRTNCQSxLQUFLQSxDQUFDQTtnQkFDUkEsQ0FBQ0E7UUFDSEEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUF2RkRELE9BQU9BLFFBQVFBLENBQUVBLE1BQWlCQSxFQUFFQSxRQUFnQkE7UUFFbERFLElBQUlBLEdBQUdBLEdBQUdBLEVBQUVBLEdBQUdBLEVBQUVBLENBQUNBLEVBQUVBLEdBQUdBLEVBQUVBLENBQUNBLEVBQUVBLEtBQUtBLEVBQUVBLFNBQVNBLEVBQUVBLFNBQVNBLEVBQUVBLENBQUNBLEVBQUVBLFdBQVdBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBO1FBQzdFQSxJQUFJQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUNaQSxJQUFJQSxLQUFLQSxHQUFHQSxNQUFNQSxDQUFDQSxZQUFZQSxDQUFDQTtRQUVoQ0EsTUFBTUEsQ0FBQUEsQ0FBRUEsUUFBU0EsQ0FBQ0EsQ0FDbEJBLENBQUNBO1lBQ0NBLEtBQUtBLE9BQU9BLENBQUNBLFNBQVNBLENBQUNBLEdBQUdBO2dCQUMxQkEsQ0FBQ0E7b0JBQ0NBLE9BQU9BLENBQUVBLEdBQUdBLEdBQUdBLEtBQUtBLENBQUNBLE1BQU1BLENBQUVBLElBQUlBLENBQUVBLENBQUVBLEtBQUtBLENBQUVBLEdBQUdBLENBQUVBLElBQUlBLElBQUlBLENBQUVBLElBQUlBLENBQUVBLEtBQUtBLENBQUVBLEdBQUdBLENBQUVBLElBQUlBLElBQUlBLENBQUVBLENBQUVBO3dCQUN2RkEsRUFBRUEsR0FBR0EsQ0FBQ0E7b0JBRVJBLEVBQUVBLENBQUNBLENBQUVBLEdBQUdBLElBQUlBLEtBQUtBLENBQUNBLE1BQU9BLENBQUNBO3dCQUN4QkEsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0E7b0JBRWJBLEVBQUVBLENBQUNBLENBQUVBLENBQUVBLEtBQUtBLENBQUVBLEdBQUdBLENBQUVBLEdBQUdBLElBQUlBLENBQUVBLElBQUlBLElBQUtBLENBQUNBLENBQ3RDQSxDQUFDQTt3QkFDQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsR0FBR0EsS0FBS0EsQ0FBRUEsR0FBR0EsRUFBRUEsQ0FBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0E7d0JBQzlCQSxFQUFFQSxDQUFDQSxDQUFFQSxHQUFHQSxJQUFJQSxLQUFLQSxDQUFDQSxNQUFPQSxDQUFDQSxDQUMxQkEsQ0FBQ0E7NEJBQWdCQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTt3QkFBQ0EsQ0FBQ0E7b0JBQ2pDQSxDQUFDQTtvQkFFREEsR0FBR0EsQ0FBQ0EsR0FBR0EsSUFBSUEsS0FBS0EsQ0FBRUEsR0FBR0EsRUFBRUEsQ0FBRUEsQ0FBQ0E7b0JBRTFCQSxHQUFHQSxDQUFDQSxTQUFTQSxHQUFHQSxHQUFHQSxDQUFDQTtvQkFFcEJBLEVBQUVBLENBQUNBLENBQUVBLEdBQUdBLElBQUlBLEtBQUtBLENBQUNBLE1BQU9BLENBQUNBLENBQzFCQSxDQUFDQTt3QkFBZ0JBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO29CQUFDQSxDQUFDQTtvQkFFL0JBLElBQUlBLEVBQUVBLEdBQUdBLENBQUVBLEtBQUtBLENBQUVBLEdBQUdBLENBQUVBLEdBQUdBLElBQUlBLENBQUVBLEdBQUdBLENBQUVBLEtBQUtBLENBQUVBLEdBQUdBLEVBQUVBLENBQUVBLEdBQUdBLElBQUlBLENBQUVBLEdBQUdBLENBQUNBLENBQUNBO29CQUNqRUEsT0FBT0EsRUFBRUEsRUFBRUEsR0FBR0EsQ0FBQ0EsRUFDZkEsQ0FBQ0E7d0JBQ0NBLEVBQUVBLENBQUNBLENBQUVBLEdBQUdBLElBQUlBLEtBQUtBLENBQUNBLE1BQU9BLENBQUNBLENBQzFCQSxDQUFDQTs0QkFBNENBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO3dCQUFDQSxDQUFDQTt3QkFFM0RBLEdBQUdBLENBQUNBLEdBQUdBLEdBQUdBLENBQUVBLEdBQUdBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLENBQUVBLEdBQUdBLEtBQUtBLENBQUVBLEdBQUdBLEVBQUVBLENBQUVBLENBQUNBO29CQUM5Q0EsQ0FBQ0E7b0JBRURBLEdBQUdBLENBQUNBLFdBQVdBLEdBQUdBLEdBQUdBLENBQUNBO29CQUN0QkEsRUFBRUEsQ0FBQ0EsQ0FBRUEsR0FBR0EsR0FBR0EsR0FBR0EsQ0FBQ0EsR0FBR0EsR0FBR0EsS0FBS0EsQ0FBQ0EsTUFBT0EsQ0FBQ0EsQ0FDckNBLENBQUNBO3dCQUFnQkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7b0JBQUNBLENBQUNBO29CQUM3QkEsR0FBR0EsQ0FBQ0EsS0FBS0EsR0FBR0EsS0FBS0EsQ0FBQ0EsS0FBS0EsQ0FBRUEsR0FBR0EsQ0FBQ0EsV0FBV0EsRUFBRUEsR0FBR0EsQ0FBQ0EsV0FBV0EsR0FBR0EsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBRUEsQ0FBQ0E7b0JBR3RFQSxLQUFLQSxDQUFDQTtnQkFDUkEsQ0FBQ0E7UUFDSEEsQ0FBQ0E7UUFFREEsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0E7SUFDYkEsQ0FBQ0E7SUF1Q0RGLElBQUlBLEdBQUdBO1FBRUxHLE1BQU1BLENBQUNBLE9BQU9BLENBQUNBLFFBQVFBLENBQUVBLElBQUlBLENBQUNBLFNBQVNBLEVBQUVBLElBQUlBLENBQUNBLFFBQVFBLENBQUVBLENBQUNBLEdBQUdBLENBQUNBO0lBQy9EQSxDQUFDQTtJQUVESCxJQUFJQSxLQUFLQTtRQUVQSSxNQUFNQSxDQUFDQSxPQUFPQSxDQUFDQSxRQUFRQSxDQUFF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LEdBQUdBLENBQUNBO1lBQzNDQSxDQUFDQTtRQUNIQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUVERCxLQUFLQSxDQUFFQSxLQUFhQTtRQUVsQkUsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBRUEsS0FBS0EsQ0FBRUEsQ0FBQ0E7SUFDN0JBLENBQUNBO0FBQ0hGLENBQUNBO0FBQUE7QUN0Q0Q7QUFDQTtBQ0RBO0FBQ0E7QUNEQTtBQUNBO0FDREE7QUFDQTtBQ0RBO0FBQ0E7T0NETyxFQUFHLFNBQVMsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFZLE1BQU0sd0JBQXdCO0FBS2hGO0lBZ0JFRyxZQUFhQSxVQUFlQTtRQUUxQkMsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBRUEsSUFBSUEsRUFBRUEsVUFBVUEsQ0FBRUEsQ0FBQ0E7SUFDdENBLENBQUNBO0lBS01ELE1BQU1BO1FBRVhFLE1BQU1BLENBQUNBO1lBQ0xBLEdBQUdBLEVBQUVBLElBQUlBLENBQUNBLEdBQUdBO1lBQ2JBLEdBQUdBLEVBQUVBLElBQUlBLENBQUNBLEdBQUdBO1lBQ2JBLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLEVBQUVBO1lBQ1hBLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLEVBQUVBO1lBQ1hBLElBQUlBLEVBQUVBLElBQUlBLENBQUNBLElBQUlBLElBQUlBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFlBQVlBO1lBQ3pDQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxFQUFFQTtZQUNYQSxXQUFXQSxFQUFFQSxJQUFJQSxDQUFDQSxXQUFXQTtZQUM3QkEsT0FBT0EsRUFBRUEsSUFBSUEsQ0FBQ0EsT0FBT0E7U0FDdEJBLENBQUNBO0lBQ0pBLENBQUNBO0lBRU1GLFFBQVFBO1FBQ2JHLGNBQWVBLEdBQUdBLElBQUtDLE1BQU1BLENBQUNBLENBQUVBLElBQUlBLEdBQUdBLEdBQUdBLENBQUNBLFFBQVFBLENBQUVBLEVBQUVBLENBQUVBLENBQUNBLFdBQVdBLEVBQUVBLENBQUVBLENBQUNBLE1BQU1BLENBQUVBLENBQUNBLENB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LENBQUNBO0lBQ3RDQSxDQUFDQTtJQU1NaEIsV0FBV0EsQ0FBRUEsT0FBWUE7UUFFOUJpQixJQUFJQSxJQUFJQSxHQUFHQSxDQUFFQSxDQUFFQSxJQUFJQSxDQUFDQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFFQSxHQUFHQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFFQSxDQUFDQTtRQUNqREEsSUFBSUEsR0FBR0EsR0FBR0EsQ0FBQ0EsR0FBR0EsSUFBSUEsR0FBR0EsQ0FBRUEsQ0FBRUEsSUFBSUEsQ0FBQ0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBRUEsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBRUEsQ0FBQ0E7UUFDakRBLElBQUlBLEVBQUVBLEdBQUdBLElBQUlBLFNBQVNBLEVBQUVBLENBQUNBLFNBQVNBLENBQUVBLEdBQUdBLENBQUVBLENBQUNBO1FBRzFDQSxFQUFFQSxDQUFDQSxVQUFVQSxDQUFFQSxDQUFDQSxFQUFFQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFFQSxDQUFDQTtRQUNoQ0EsRUFBRUEsQ0FBQ0EsQ0FBRUEsSUFBSUEsQ0FBQ0EsRUFBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDZEEsRUFBRUEsQ0FBQ0EsU0FBU0EsQ0FBRUEsQ0FBQ0EsRUFBRUEsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBRUEsQ0FBQ0E7WUFDM0JBLEVBQUVBLENBQUNBLFVBQVVBLENBQUVBLENBQUNBLEVBQUVBLElBQUlBLENBQUNBLElBQUlBLENBQUVBLENBQUNBO1FBQ2hDQSxDQUFDQTtRQUVEQSxFQUFFQSxDQUFDQSxDQUFFQSxJQUFJQSxDQUFDQSxFQUFFQSxHQUFHQSxDQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNsQkEsRUFBRUEsQ0FBQ0EsU0FBU0EsQ0FBRUEsQ0FBQ0EsR0FBR0EsSUFBSUEsRUFBRUEsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBRUEsQ0FBQ0E7UUFDcENBLENBQUNBO1FBRURBLE1BQU1BLENBQUNBLEVBQUVBLENBQUNBO0lBQ1pBLENBQUNBO0lBS01q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OEJBQStCLE9BQWdCLEVBQUUsUUFBZ0IsRUFBRSxTQUFzQjtJQUV2RkMsWUFBWUEsQ0FBRUEsYUFBYUEsQ0FBRUEsT0FBT0EsRUFBRUEsVUFBVUEsQ0FBQ0EsU0FBU0EsQ0FBRUEsRUFBRUEsUUFBUUEsRUFBRUEsU0FBU0EsRUFBRUEsV0FBV0EsQ0FBQ0EsdUJBQXVCQSxDQUFFQSxDQUFDQTtJQUN6SEEsWUFBWUEsQ0FBRUEsYUFBYUEsQ0FBRUEsT0FBT0EsRUFBRUEsVUFBVUEsQ0FBQ0EsU0FBU0EsQ0FBRUEsRUFBRUEsUUFBUUEsRUFBRUEsU0FBU0EsRUFBRUEsV0FBV0EsQ0FBQ0EsdUJBQXVCQSxDQUFFQSxDQUFDQTtJQUN6SEEsWUFBWUEsQ0FBRUEsYUFBYUEsQ0FBRUEsT0FBT0EsRUFBRUEsVUFBVUEsQ0FBQ0EsU0FBU0EsQ0FBRUEsRUFBRUEsUUFBUUEsRUFBRUEsU0FBU0EsRUFBRUEsV0FBV0EsQ0FBQ0EsdUJBQXVCQSxDQUFFQSxDQUFDQTtJQUN6SEEsWUFBWUEsQ0FBRUEsYUFBYUEsQ0FBRUEsT0FBT0EsRUFBRUEsVUFBVUEsQ0FBQ0EsU0FBU0EsQ0FBRUEsRUFBRUEsUUFBUUEsRUFBRUEsU0FBU0EsRUFBRUEsV0FBV0EsQ0FBQ0EsdUJBQXVCQSxDQUFFQSxDQUFDQTtJQUN6SEEsWUFBWUEsQ0FBRUEsYUFBYUEsQ0FBRUEsT0FBT0EsRUFBRUEsVUFBVUEsQ0FBQ0EsU0FBU0EsQ0FBRUEsRUFBRUEsUUFBUUEsRUFBRUEsU0FBU0EsRUFBRUEsV0FBV0EsQ0FBQ0EsdUJBQXVCQSxDQUFFQSxDQUFDQTtJQUN6SEEsWUFBWUEsQ0FBRUEsYUFBYUEsQ0FBRUEsT0FBT0EsRUFBRUEsVUFBVUEsQ0FBQ0EsU0FBU0EsQ0FBRUEsRUFBRUEsUUFBUUEsRUFBRUEsU0FBU0EsRUFBRUEsV0FBV0EsQ0FBQ0EsdUJBQXVCQSxDQUFFQSxDQUFDQTtJQUN6SEEsWUFBWUEsQ0FBRUEsYUFBYUEsQ0FBRUEsT0FBT0EsRUFBRUEsVUFBVUEsQ0FBQ0EsU0FBU0EsQ0FBRUEsRUFBRUEsUUFBUUEsRUFBRUEsU0FBU0EsRUFBRUEsV0FBV0EsQ0FBQ0EsdUJBQXVCQSxDQUFFQSxDQUFDQTtBQUMzSEEsQ0FBQ0E7QUFFRCxvQ0FBcUMsT0FBZ0IsRUFBRSxRQUFnQixFQUFFLFNBQXNCO0lBRTdGQyxZQUFZQSxDQUFFQSxhQUFhQSxDQUFFQSxPQUFPQSxFQUFFQSxVQUFVQSxDQUFDQSxVQUFVQSxDQUFFQSxFQUFFQSxRQUFRQSxFQUFFQSxTQUFTQSxFQUFFQSxXQUFXQSxDQUFDQSxxQkFBcUJBLENBQUVBLENBQUNBO0lBQ3hIQSxvQkFBb0JBLENBQUVBLE9BQU9BLEVBQUVBLFFBQVFBLEVBQUVBLFNBQVNBLENBQUVBLENBQUNBO0FBQ3ZEQSxDQUFDQTtBQUVEO0lBRUVDLDBCQUEwQkEsQ0FBRUEsT0FBT0EsQ0FBQ0EsT0FBT0EsRUFBSUEsTUFBTUEsRUFBSUEsV0FBV0EsQ0FBQ0Esc0JBQXNCQSxDQUFFQSxDQUFDQTtJQUM5RkEsMEJBQTBCQSxDQUFFQSxPQUFPQSxDQUFDQSxRQUFRQSxFQUFHQSxPQUFPQSxFQUFHQSxXQUFXQSxDQUFDQSxzQkFBc0JBLENBQUVBLENBQUNBO0lBQzlGQSwwQkFBMEJBLENBQUVBLE9BQU9BLENBQUNBLFFBQVFBLEVBQUdBLE9BQU9BLEVBQUdBLFdBQVdBLENBQUNBLHNCQUFzQkEsQ0FBRUEsQ0FBQ0E7SUFDOUZBLDBCQUEwQkEsQ0FBRUEsT0FBT0EsQ0FBQ0EsU0FBU0EsRUFBRUEsUUFBUUEsRUFBRUEsV0FBV0EsQ0FBQ0Esc0JBQXNCQSxDQUFFQSxDQUFDQTtJQUU5RkEsWUFBWUEsQ0FBRUEsYUFBYUEsQ0FBRUEsT0FBT0EsQ0FBQ0EsUUFBUUEsRUFBRUEsVUFBVUEsQ0FBQ0EsU0FBU0EsQ0FBRUEsRUFBRUEsT0FBT0EsRUFBRUEsV0FBV0EsQ0FBQ0EsdUJBQXVCQSxDQUFFQSxDQUFDQTtJQUN0SEEsWUFBWUEsQ0FBRUEsYUFBYUEsQ0FBRUEsT0FBT0EsQ0FBQ0EsUUFBUUEsRUFBRUEsVUFBVUEsQ0FBQ0EsU0FBU0EsQ0FBRUEsRUFBRUEsT0FBT0EsRUFBRUEsV0FBV0EsQ0FBQ0EsdUJBQXVCQSxDQUFFQSxDQUFDQTtJQUN0SEEsWUFBWUEsQ0FBRUEsYUFBYUEsQ0FBRUEsT0FBT0EsQ0FBQ0EsUUFBUUEsRUFBRUEsVUFBVUEsQ0FBQ0EsU0FBU0EsQ0FBRUEsRUFBRUEsT0FBT0EsRUFBRUEsV0FBV0EsQ0FBQ0EsdUJBQXVCQSxDQUFFQSxDQUFDQTtJQUN0SEEsWUFBWUEsQ0FBRUEsYUFBYUEsQ0FBRUEsT0FBT0EsQ0FBQ0EsUUFBUUEsRUFBRUEsVUFBVUEsQ0FBQ0EsU0FBU0EsQ0FBRUEsRUFBRUEsT0FBT0EsRUFBRUEsV0FBV0EsQ0FBQ0EsdUJBQXVCQSxDQUFFQSxDQUFDQTtJQUN0SEEsWUFBWUEsQ0FBRUEsYUFBYUEsQ0FBRUEsT0FBT0EsQ0FBQ0EsUUFBUUEsRUFBRUEsVUFBVUEsQ0FBQ0EsU0FBU0EsQ0FBRUEsRUFBRUEsT0FBT0EsRUFBRUEsV0FBV0EsQ0FBQ0EsdUJBQXVCQSxDQUFFQSxDQUFDQTtJQUN0SEEsWUFBWUEsQ0FBRUEsYUFBYUEsQ0FBRUEsT0FBT0EsQ0FBQ0EsUUFBUUEsRUFBRUEsVUFBVUEsQ0FBQ0EsU0FBU0EsQ0FBRUEsRUFBRUEsT0FBT0EsRUFBRUEsV0FBV0EsQ0FBQ0EsdUJBQXVCQSxDQUFFQSxDQUFDQTtJQUN0SEEsWUFBWUEsQ0FBRUEsYUFBYUEsQ0FBRUEsT0FBT0EsQ0FBQ0EsUUFBUUEsRUFBRUEsVUFBVUEsQ0FBQ0EsU0FBU0EsQ0FBRUEsRUFBRUEsT0FBT0EsRUFBRUEsV0FBV0EsQ0FBQ0EsdUJBQXVCQSxDQUFFQSxDQUFDQTtJQUV0SEEsb0JBQW9CQSxDQUFFQSxPQUFPQSxDQUFDQSxRQUFRQSxFQUFHQSxPQUFPQSxFQUFFQSxXQUFXQSxDQUFDQSx3QkFBd0JBLENBQUVBLENBQUNBO0lBRXpGQSwwQkFBMEJBLENBQUVBLE9BQU9BLENBQUNBLE9BQU9BLEVBQUlBLE1BQU1BLEVBQUVBLFdBQVdBLENBQUNBLHdCQUF3QkEsQ0FBRUEsQ0FBQ0E7SUFDOUZBLDBCQUEwQkEsQ0FBRUEsT0FBT0EsQ0FBQ0EsT0FBT0EsRUFBSUEsTUFBTUEsRUFBRUEsV0FBV0EsQ0FBQ0Esd0JBQXdCQSxDQUFFQSxDQUFDQTtJQUM5RkEsMEJBQTBCQSxDQUFFQSxPQUFPQSxDQUFDQSxPQUFPQSxFQUFJQSxNQUFNQSxFQUFFQSxXQUFXQSxDQUFDQSx3QkFBd0JBLENBQUVBLENBQUNBO0lBQzlGQSwwQkFBMEJBLENBQUVBLE9BQU9BLENBQUNBLE9BQU9BLEVBQUlBLE1BQU1BLEVBQUVBLFdBQVdBLENBQUNBLHdCQUF3QkEsQ0FBRUEsQ0FBQ0E7SUFDOUZBLDBCQUEwQkEsQ0FBRUEsT0FBT0EsQ0FBQ0EsT0FBT0EsRUFBSUEsTUFBTUEsRUFBRUEsV0FBV0EsQ0FBQ0Esd0JBQXdCQSxDQUFFQSxDQUFDQTtJQUM5RkEsMEJBQTBCQSxDQUFFQSxPQUFPQSxDQUFDQSxPQUFPQSxFQUFJQSxNQUFNQSxFQUFFQSxXQUFXQSxDQUFDQSx3QkFBd0JBLENBQUVBLENBQUNBO0lBQzlGQSwwQkFBMEJBLENBQUVBLE9BQU9BLENBQUNBLE9BQU9BLEVBQUlBLE1BQU1BLEVBQUVBLFdBQVdBLENBQUNBLHdCQUF3QkEsQ0FBRUEsQ0FBQ0E7SUFDOUZBLDBCQUEwQkEsQ0FBRUEsT0FBT0EsQ0FBQ0EsT0FBT0EsRUFBSUEsTUFBTUEsRUFBRUEsV0FBV0EsQ0FBQ0Esd0JBQXdCQSxDQUFFQSxDQUFDQTtJQUU5RkEsMEJBQTBCQSxDQUFFQSxPQUFPQSxDQUFDQSxTQUFTQSxFQUFFQSxRQUFRQSxFQUFFQSxXQUFXQSxDQUFDQSxzQkFBc0JBLENBQUVBLENBQUNBO0lBQzlGQSwwQkFBMEJBLENBQUVBLE9BQU9BLENBQUNBLFFBQVFBLEVBQUdBLE9BQU9BLEVBQUdBLFdBQVdBLENBQUNBLHNCQUFzQkEsQ0FBRUEsQ0FBQ0E7SUFDOUZBLDBCQUEwQkEsQ0FBRUEsT0FBT0EsQ0FBQ0EsT0FBT0EsRUFBSUEsTUFBTUEsRUFBSUEsV0FBV0EsQ0FBQ0Esc0JBQXNCQSxDQUFFQSxDQUFDQTtJQUM5RkEsMEJBQTBCQSxDQUFFQSxPQUFPQSxDQUFDQSxPQUFPQSxFQUFJQSxNQUFNQSxFQUFJQSxXQUFXQSxDQUFDQSxzQkFB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QUNBO0lBQ3pIQSxZQUFZQSxDQUFFQSxhQUFhQSxDQUFFQSxPQUFPQSxDQUFDQSxTQUFTQSxFQUFFQSxVQUFVQSxDQUFDQSxTQUFTQSxDQUFFQSxFQUFFQSxLQUFLQSxFQUFFQSxXQUFXQSxDQUFDQSwyQkFBMkJBLENBQUVBLENBQUNBO0lBQ3pIQSxZQUFZQSxDQUFFQSxhQUFhQSxDQUFFQSxPQUFPQSxDQUFDQSxTQUFTQSxFQUFFQSxVQUFVQSxDQUFDQSxTQUFTQSxDQUFFQSxFQUFFQSxLQUFLQSxFQUFFQSxXQUFXQSxDQUFDQSwyQkFBMkJBLENBQUVBLENBQUNBO0lBQ3pIQSxZQUFZQSxDQUFFQSxhQUFhQSxDQUFFQSxPQUFPQSxDQUFDQSxTQUFTQSxFQUFFQSxVQUFVQSxDQUFDQSxTQUFTQSxDQUFFQSxFQUFFQSxLQUFLQSxFQUFFQSxXQUFXQSxDQUFDQSwyQkFBMkJBLENBQUVBLENBQUNBO0lBQ3pIQSxZQUFZQSxDQUFFQSxhQUFhQSxDQUFFQSxPQUFPQSxDQUFDQSxTQUFTQSxFQUFFQSxVQUFVQSxDQUFDQSxTQUFTQSxDQUFFQSxFQUFFQSxLQUFLQSxFQUFFQSxXQUFXQSxDQUFDQSwyQkFBMkJBLENBQUVBLENBQUNBO0lBQ3pIQSxZQUFZQSxDQUFFQSxhQUFhQSxDQUFFQSxPQUFPQSxDQUFDQSxTQUFTQSxFQUFFQSxVQUFVQSxDQUFDQSxTQUFTQSxDQUFFQSxFQUFFQSxLQUFLQSxFQUFFQSxXQUFXQSxDQUFDQSwyQkFBMkJBLENBQUVBLENBQUNBO0lBQ3pIQSxZQUFZQSxDQUFFQSxhQUFhQSxDQUFFQSxPQUFPQSxDQUFDQSxTQUFTQSxFQUFFQSxVQUFVQSxDQUFDQSxVQUFVQSxDQUFFQSxFQUFFQSxJQUFJQSxFQUFFQSxXQUFXQSxDQUFDQSwyQkFBMkJBLENBQUVBLENBQUNBO0lBRXpIQSxZQUFZQSxDQUFFQSxhQUFhQSxDQUFFQSxPQUFPQSxDQUFDQSxPQUFPQSxFQUFFQSxVQUFVQSxDQUFDQSxXQUFXQSxDQUFFQSxFQUFFQSxJQUFJQSxFQUFFQSxXQUFXQSxDQUFDQSxlQUFlQSxDQUFFQSxDQUFDQTtJQUM1R0EsWUFBWUEsQ0FBRUEsYUFBYUEsQ0FBRUEsT0FBT0EsQ0FBQ0EsT0FBT0EsRUFBRUEsVUFBVUEsQ0FBQ0EsU0FBU0EsQ0FBRUEsRUFBRUEsS0FBS0EsRUFBRUEsV0FBV0EsQ0FBQ0EsMEJBQTBCQSxDQUFFQSxDQUFDQTtJQUN0SEEsWUFBWUEsQ0FBRUEsYUFBYUEsQ0FBRUEsT0FBT0EsQ0FBQ0EsT0FBT0EsRUFBRUEsVUFBVUEsQ0FBQ0EsU0FBU0EsQ0FBRUEsRUFBRUEsS0FBS0EsRUFBRUEsV0FBV0EsQ0FBQ0EsMEJBQTBCQSxDQUFFQSxDQUFDQTtJQUN0SEEsWUFBWUEsQ0FBRUEsYUFBYUEsQ0FBRUEsT0FBT0EsQ0FBQ0EsT0FBT0EsRUFBRUEsVUFBVUEsQ0FBQ0EsU0FBU0EsQ0FBRUEsRUFBRUEsS0FBS0EsRUFBRUEsV0FBV0EsQ0FBQ0EsMEJBQTBCQSxDQUFFQSxDQUFDQTtJQUN0SEEsWUFBWUEsQ0FBRUEsYUFBYUEsQ0FBRUEsT0FBT0EsQ0FBQ0EsT0FBT0EsRUFBRUEsVUFBVUEsQ0FBQ0EsU0FBU0EsQ0FBRUEsRUFBRUEsS0FBS0EsRUFBRUEsV0FBV0EsQ0FBQ0EsMEJBQTBCQSxDQUFFQSxDQUFDQTtJQUN0SEEsWUFBWUEsQ0FBRUEsYUFBYUEsQ0FBRUEsT0FBT0EsQ0FBQ0EsT0FBT0EsRUFBRUEsVUFBVUEsQ0FBQ0EsU0FBU0EsQ0FBRUEsRUFBRUEsS0FBS0EsRUFBRUEsV0FBV0EsQ0FBQ0EsMEJBQTBCQSxDQUFFQSxDQUFDQTtJQUN0SEEsWUFBWUEsQ0FBRUEsYUFBYUEsQ0FBRUEsT0FBT0EsQ0FBQ0EsT0FBT0EsRUFBRUEsVUFBVUEsQ0FBQ0EsU0FBU0EsQ0FBRUEsRUFBRUEsS0FBS0EsRUFBRUEsV0FBV0EsQ0FBQ0EsMEJBQTBCQSxDQUFFQSxDQUFDQTtJQUN0SEEsWUFBWUEsQ0FBRUEsYUFBYUEsQ0FBRUEsT0FBT0EsQ0FBQ0EsT0FBT0EsRUFBRUEsVUFBVUEsQ0FBQ0EsVUFBVUEsQ0FBRUEsRUFBRUEsSUFBSUEsRUFBRUEsV0FBV0EsQ0FBQ0EsMEJBQTBCQSxDQUFFQSxDQUFDQTtJQUV0SEEsWUFBWUEsQ0FBRUEsYUFBYUEsQ0FBRUEsT0FBT0EsQ0FBQ0EsT0FBT0EsRUFBRUEsVUFBVUEsQ0FBQ0EsV0FBV0EsQ0FBRUEsRUFBRUEsSUFBSUEsRUFBRUEsV0FBV0EsQ0FBQ0EsZUFBZUEsQ0FBRUEsQ0FBQ0E7SUFDNUdBLFlBQVlBLENBQUVBLGFBQWFBLENBQUVBLE9BQU9BLENBQUNBLE9BQU9BLEVBQUVBLFVBQVVBLENBQUNBLFNBQVNBLENBQUVBLEVBQUVBLEtBQUtBLEVBQUVBLFdBQVdBLENBQUNBLDBCQUEwQkEsQ0FBRUEsQ0FBQ0E7SUFDdEhBLFlBQVlBLENBQUVBLGFBQWFBLENBQUVBLE9BQU9BLENBQUNBLE9BQU9BLEVBQUVBLFVBQVVBLENBQUNBLFNBQVNBLENBQUVBLEVBQUVBLEtBQUtBLEVBQUVBLFdBQVdBLENBQUNBLDBCQUEwQkEsQ0FBRUEsQ0FBQ0E7SUFDdEhBLFlBQVlBLENBQUVBLGFBQWFBLENBQUVBLE9BQU9BLENBQUNBLE9BQU9BLEVBQUVBLFVBQVVBLENBQUNBLFNBQVNBLENBQUVBLEVBQUVBLEtBQUtBLEVBQUVBLFdBQVdBLENBQUNBLDBCQUEwQkEsQ0FBRUEsQ0FBQ0E7SUFDdEhBLFlBQVlBLENBQUVBLGFBQWFBLENBQUVBLE9BQU9BLENBQUNBLE9BQU9BLEVBQUVBLFVBQVVBLENBQUNBLFNBQVNBLENBQUVBLEVBQUVBLEtBQUtBLEVBQUVBLFdBQVdBLENBQUNBLDBCQUEwQkEsQ0FBRUEsQ0FBQ0E7SUFDdEhBLFlBQVlBLENBQUVBLGFBQWFBLENBQUVBLE9BQU9BLENBQUNBLE9BQU9BLEVBQUVBLFVBQVVBLENBQUNBLFNBQVNBLENBQUVBLEVBQUVBLEtBQUtBLEVBQUVBLFdBQVdBLENBQUNBLDBCQUEwQkEsQ0FBRUEsQ0FBQ0E7SUFDdEhBLFlBQVlBLENBQUVBLGFBQWFBLENBQUVBLE9BQU9BLENBQUNBLE9BQU9BLEVBQUVBLFVBQVVBLENBQUNBLFNBQVNBLENBQUVBLEVBQUVBLEtBQUtBLEVBQUVBLFdBQVdBLENBQUNBLDBCQUEwQkEsQ0FBRUEsQ0FBQ0E7SUFDdEhBLFlBQVlBLENBQUVBLGFBQWFBLENBQUVBLE9BQU9BLENBQUNBLE9BQU9BLEVBQUVBLFVBQVVBLENBQUNBLFVBQVVBLENBQUVBLEVBQUVBLElBQUlBLEVBQUVBLFdBQVdBLENBQUNBLDBCQUEwQkEsQ0FBRUEsQ0FBQ0E7SUFFdEhBLFlBQVlBLENBQUVBLGFBQWFBLENBQUVBLE9BQU9BLENBQUNBLFFBQVFBLEVBQUVBLFdBQVdBLENBQUNBLGFBQWFBLENBQUVBLEVBQUVBLE9BQU9BLEVBQUVBLFdBQVdBLENBQUNBLHNCQUFzQkEsQ0FBRUEsQ0FBQ0E7SUFDMUhBLFlBQVlBLENBQUVBLGFBQWFBLENBQUVBLE9BQU9BLENBQUNBLFFBQVFBLEVBQUVBLFdBQVdBLENBQUNBLGFBQWFBLENBQUVBLEVBQUVBLE9BQU9BLEVBQUVBLFdBQVdBLENBQUNBLHdCQUF3QkEsQ0FBRUEsQ0FBQ0E7SUFDNUhBLFlBQVlBLENBQUVBLGFBQWFBLENBQUVBLE9BQU9BLENBQUNBLFFBQVFBLEVBQUVBLFdBQVdBLENBQUNBLGFBQWFBLENBQUVBLEVBQUVBLE9BQU9BLEVBQUVBLFdBQVdBLENBQUNBLHdCQUF3QkEsQ0FBRUEsQ0FBQ0E7SUFFNUhBLFlBQVlBLENBQUVBLGFBQWFBLENBQUVBLE9BQU9BLENBQUNBLFFBQVFBLEVBQUVBLFdBQVdBLENBQUNBLFlBQVlBLENBQUVBLEVBQUVBLE1BQU1BLEVBQUVBLFdBQVdBLENBQUNBLHNCQUFzQkEsQ0FBRUEsQ0FBQ0E7SUFDeEhBLFlBQVlBLENBQUVBLGFBQWFBLENBQUVBLE9BQU9BLENBQUNBLFFBQVFBLEVBQUVBLFdBQVdBLENBQUNBLFlBQVlBLENBQUVBLEVBQUVBLE1BQU1BLENBQUVBLENBQUNBO0lBQ3BGQSxZQUFZQSxDQUFFQSxhQUFhQSxDQUFFQSxPQUFPQSxDQUFDQSxRQUFRQSxFQUFFQSxXQUFXQSxDQUFDQSxZQUFZQSxDQUFFQSxFQUFFQSxNQUFNQSxDQUFFQSxDQUFDQTtJQUdwRkEsWUFBWUEsQ0FBRUEsYUFBYUEsQ0FBRUEsT0FBT0EsQ0FBQ0EsVUFBVUEsRUFBRUEsYUFBYUEsQ0FBQ0EsZUFBZUEsQ0FBRUEsRUFBRUEsTUFBTUEsRUFBRUEsV0FBV0EsQ0FBQ0Esd0JBQXdCQSxDQUFFQSxDQUFDQTtJQUNqSUEsWUFBWUEsQ0FBRUEsYUFBYUEsQ0FBRUEsT0FBT0EsQ0FBQ0EsVUFBVUEsRUFBRUEsYUFBYUEsQ0FBQ0EsZUFBZUEsQ0FBRUEsRUFBRUEsTUFBTUEsRUFBRUEsV0FBV0EsQ0FBQ0Esd0JBQXdCQSxFQUFFQSxXQUFXQSxDQUFDQSx3QkFBd0JBLENBQUVBLENBQUNBO0lBQ3ZLQSxZQUFZQSxDQUFFQSxhQUFhQSxDQUFFQSxPQUFPQSxDQUFDQSxVQUFVQSxFQUFFQSxhQUFhQSxDQUFDQSxlQUFlQSxDQUFFQSxFQUFFQSxNQUFNQSxFQUFFQSxXQUFXQSxDQUFDQSx3QkFBd0JBLEVBQUVBLFdBQVdBLENBQUNBLHdCQUF3QkEsRUFBRUEsV0FBV0EsQ0FBQ0Esd0JBQXdCQSxDQUFFQSxDQUFDQTtJQUM3TUEsWUFBWUEsQ0FBRUEsYUFBYUEsQ0FBRUEsT0FBT0EsQ0FBQ0EsVUFBVUEsRUFBRUEsYUFBYUEsQ0FBQ0EsZUFBZUEsQ0FBRUEsRUFBRUEsTUFBTUEsRUFBRUEsV0FBV0EsQ0FBQ0Esd0JBQXdCQSxFQUFFQSxXQUFXQSxDQUFDQSx3QkFBd0JBLEVBQUVBLFdBQVdBLENBQUNBLHdCQUF3QkEsRUFBRUEsV0FBV0EsQ0FBQ0Esd0JBQXdCQSxDQUFFQSxDQUFDQTtJQUNuUEEsWUFBWUEsQ0FBRUEsYUFBYUEsQ0FBRUEsT0FBT0EsQ0FBQ0EsVUFBVUEsRUFBRUEsYUFBYUEsQ0FBQ0EsYUFBYUEsQ0FBRUEsRUFBRUEsS0FBS0EsQ0FBRUEsQ0FBQ0E7SUFDeEZBLFlBQVlBLENBQUVBLGFBQWFBLENBQUVBLE9BQU9BLENBQUNBLFVBQVVBLEVBQUVBLGFBQWFBLENBQUNBLGNBQWNBLENBQUVBLEVBQUVBLEtBQUtBLEVBQUVBLFdBQVdBLENBQUNBLHNCQUFzQkEsQ0FBRUEsQ0FBQ0E7SUFDN0hBLFlBQVlBLENBQUVBLGFBQWFBLENBQUVBLE9BQU9BLENBQUNBLFVBQVVBLEVBQUVBLGFBQWFBLENBQUNBLGNBQWNBLENBQUVBLEVBQUVBLEtBQUtBLEVBQUVBLFdBQVdBLENBQUNBLHNCQUFzQkEsQ0FBRUEsQ0FBQ0E7SUFDN0hBLFlBQVlBLENBQUVBLGFBQWFBLENBQUVBLE9BQU9BLENBQUNBLFVBQVVBLEVBQUVBLGFBQWFBLENBQUNBLGVBQWVBLENBQUVBLEVBQUVBLEtBQUtBLEVBQUVBLFdBQVdBLENBQUNBLHNCQUFzQkEsRUFBRUEsV0FBV0EsQ0FBQ0Esc0JBQXNCQSxDQUFFQSxDQUFDQTtBQUNwS0EsQ0FBQ0E7QUFHRCxhQUFhLEVBQUUsQ0FBQztBQUVoQixXQUFXLFNBQVMsR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDO0FBQ3JDLGFBQWEsU0FBUyxHQUFHLElBQUksQ0FBQztBQUM5QixhQUFhLFNBQVMsR0FBRyxJQUFJLENBQUM7O09DclF2QixLQUFLLEdBQUcsTUFBTSxlQUFlO09BQzdCLEVBQUUsU0FBUyxFQUFFLE1BQU0sd0JBQXdCO09BRzNDLEVBQUUsWUFBWSxFQUFFLE1BQU0sMEJBQTBCO0FBRXZELGFBQWMsR0FBRyxJQUFLQyxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxRQUFRQSxDQUFFQSxFQUFFQSxDQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtBQUNsRCxjQUFlLEdBQUcsSUFBS3hELE1BQU1BLENBQUNBLENBQUVBLElBQUlBLEdBQUdBLEdBQUdBLENBQUNBLFFBQVFBLENBQUVBLEVBQUVBLENBQUVBLENBQUVBLENBQUNBLE1BQU1BLENBQUVBLENBQUNBLENBQUNBLENBQUVBLENBQUNBLENBQUNBLENBQUNBO0FBQzNFLGNBQWUsR0FBRyxJQUFLQyxNQUFNQSxDQUFDQSxDQUFFQSxNQUFNQSxHQUFHQSxHQUFHQSxDQUFDQSxRQUFRQSxDQUFFQSxFQUFFQSxDQUFFQSxDQUFFQSxDQUFDQSxNQUFNQSxDQUFFQSxDQUFDQSxDQUFDQSxDQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtBQUM3RSxlQUFnQixHQUFHLEVBQUUsQ0FBQyxJQUFLd0QsTUFBTUEsQ0FBQ0EsQ0FBRUEsR0FBR0EsR0FBR0EsS0FBS0EsQ0FBRUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBRUEsQ0FBQ0EsSUFBSUEsQ0FBRUEsR0FBR0EsQ0FBRUEsQ0FBRUEsQ0FBQ0EsTUFBTUEsQ0FBRUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDeEYsZUFBZ0IsR0FBRyxFQUFFLENBQUMsSUFBS0MsTUFBTUEsQ0FBQ0EsQ0FBRUEsS0FBS0EsQ0FBRUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBRUEsQ0FBQ0EsSUFBSUEsQ0FBRUEsR0FBR0EsQ0FBRUEsR0FBR0EsR0FBR0EsQ0FBRUEsQ0FBQ0EsTUFBTUEsQ0FBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFFdEYsY0FBaUIsR0FBRztJQUVsQkMsTUFBTUEsQ0FBQ0EsQ0FBRUEsR0FBR0EsQ0FBRUEsQ0FBQ0EsQ0FBRUEsSUFBSUEsQ0FBQ0EsQ0FBRUEsR0FBR0EsR0FBR0EsQ0FBRUEsQ0FBQ0EsQ0FBRUEsQ0FBQ0E7QUFDdENBLENBQUNBO0FBRUQsY0FBaUIsR0FBRztJQUdsQkMsTUFBTUEsQ0FBQ0EsSUFBSUEsU0FBU0EsQ0FBRUEsQ0FBRUEsR0FBR0EsSUFBSUEsQ0FBQ0EsRUFBRUEsR0FBR0EsR0FBR0EsSUFBSUEsQ0FBRUEsQ0FBRUEsQ0FBQ0E7QUFDbkRBLENBQUNBO0FBRUQ7SUFBQUM7UUFtWEVDLFNBQUlBLEdBQUdBLENBQUVBLEVBQUVBLEVBQUVBLElBQUlBLEVBQUVBLElBQUlBLEVBQUVBLElBQUlBLEVBQUVBLElBQUlBLEVBQUVBLElBQUlBLEVBQUVBLElBQUlBLEVBQUVBLElBQUlBLENBQUVBLENBQUNBO0lBZ2QxREEsQ0FBQ0E7SUFoekJDRCxPQUFPQSxDQUFFQSxNQUFNQTtRQUViRSxJQUFJQSxDQUFDQSxVQUFVQSxHQUFHQSxNQUFNQSxDQUFDQSxVQUFVQSxDQUFDQTtRQUNwQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsR0FBR0EsTUFBTUEsQ0FBQ0EsVUFBVUEsQ0FBQ0E7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RUEsQ0FBQ0E7NEJBQ3pCQSxLQUFLQSxDQUFDQTt3QkFFUkEsS0FBS0EsR0FBR0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsMEJBQTBCQTs0QkFDN0NBLEtBQUtBLENBQUVBLElBQUlBLENBQUVBLENBQUNBLENBQUVBLENBQUVBLENBQUNBOzRCQUNuQkEsS0FBS0EsQ0FBQ0E7d0JBRVJBLEtBQUtBLEdBQUdBLENBQUNBLFdBQVdBLENBQUNBLDJCQUEyQkE7NEJBQzlDQSxLQUFLQSxDQUFFQSxJQUFJQSxDQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFFQSxDQUFFQSxDQUFDQTs0QkFDeENBLEtBQUtBLENBQUNBO3dCQUVSQSxLQUFLQSxHQUFHQSxDQUFDQSxXQUFXQSxDQUFDQSx1QkFBdUJBLENBQUNBO3dCQUM3Q0EsS0FBS0EsR0FBR0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsdUJBQXVCQSxDQUFDQTt3QkFDN0NBLEtBQUtBLEdBQUdBLENBQUNBLFdBQVdBLENBQUNBLHVCQUF1QkEsQ0FBQ0E7d0JBQzdDQSxLQUFLQSxHQUFHQSxDQUFDQSxXQUFXQSxDQUFDQSx1QkFBdUJBLENBQUNBO3dCQUM3Q0EsS0FBS0EsR0FBR0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsdUJBQXVCQSxDQUFDQTt3QkFDN0NBLEtBQUtBLEdBQUdBLENBQUNBLFdBQVdBLENBQUNBLHVCQUF1QkEsQ0FBQ0E7d0JBQzdDQSxLQUFLQSxHQUFHQSxDQUFDQSxXQUFXQSxDQUFDQSx1QkFBdUJBOzRCQUM1Q0EsQ0FBQ0E7Z0NBQ0NBLElBQUlBLEdBQUdBLEdBQUdBLENBQUVBLEVBQUVBLEVBQUVBLElBQUlBLEVBQUVBLElBQUlBLEVBQUVBLElBQUlBLEVBQUVBLElBQUlBLEVBQUVBLElBQUlBLEVBQUVBLElBQUlBLEVBQUVBLElBQUlBLENBQUVBLENBQUNBO2dDQUMzREEsS0FBS0EsQ0FBRUEsR0FBR0EsQ0FBRUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBRUEsQ0FBRUEsQ0FBQ0E7Z0NBQ3pCQSxFQUFFQSxDQUFDQSxD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U0E7Z0JBQzNCQSxRQUFRQSxHQUFHQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQTtnQkFDNUJBLFNBQVNBLEdBQUdBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBO2dCQUN6Q0EsVUFBVUEsSUFBSUEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0E7Z0JBQzdCQSxLQUFLQSxDQUFDQTtZQUVSQSxLQUFLQSxHQUFHQSxDQUFDQSxVQUFVQSxDQUFDQSxTQUFTQTtnQkFDM0JBLFFBQVFBLEdBQUdBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBO2dCQUM1QkEsU0FBU0EsR0FBR0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0E7Z0JBQ3pDQSxVQUFVQSxJQUFJQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQTtnQkFDOUJBLEtBQUtBLENBQUNBO1lBRVJBLEtBQUtBLEdBQUdBLENBQUNBLFVBQVVBLENBQUNBLFNBQVNBO2dCQUMzQkEsUUFBUUEsR0FBR0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0E7Z0JBQzNCQSxTQUFTQSxHQUFHQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQTtnQkFDeENBLEtBQUtBLENBQUNBO1lBRVJBLEtBQUtBLEdBQUdBLENBQUNBLFVBQVVBLENBQUNBLFNBQVNBO2dCQUMzQkEsUUFBUUEsR0FBR0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0E7Z0JBQzNCQSxTQUFTQSxHQUFHQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQTtnQkFDeENBLFVBQVVBLElBQUlBLFNBQVNBLENBQUNBO2dCQUN4QkEsS0FBS0EsQ0FBQ0E7WUFFUkEsS0FBS0EsR0FBR0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsU0FBU0E7Z0JBQzNCQSxRQUFRQSxHQUFHQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQTtnQkFDM0JBLFNBQVNBLEdBQUdBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNB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U0FBU0EsQ0FBRUEsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBRUEsQ0FBRUEsQ0FBQ0E7UUFFN0VBLElBQUlBLENBQUNBLFVBQVVBLEdBQUdBLElBQUlBLENBQUNBLFNBQVNBLEdBQUdBLFFBQVFBLENBQUNBO1FBQzVDQSxFQUFFQSxDQUFDQSxDQUFFQSxRQUFTQSxDQUFDQTtZQUNiQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFFQSxZQUFZQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxFQUFFQSxRQUFRQSxDQUFFQSxDQUFDQTtRQUU3REEsTUFBTUEsQ0FBQ0EsUUFBUUEsQ0FBQ0E7SUFDbEJBLENBQUNBO0lBRU90QixXQUFXQSxDQUFFQSxHQUFHQTtRQUV0QnVCLE1BQU1BLENBQUFBLENBQUVBLEdBQUlBLENBQUNBLENBQ2JBLENBQUNBO1lBQ0NBLEtBQUtBLEdBQUdBLENBQUNBLFVBQVVBLENBQUNBLFNBQVNBO2dCQUMzQkEsTUFBTUEsQ0FBQ0EsQ0FBRUEsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxHQUFHQSxHQUFHQSxDQUFDQSxTQUFTQSxDQUFFQSxDQUFDQTtZQUNuREEsS0FBS0EsR0FBR0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsU0FBU0E7Z0JBQzNCQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFFQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLEdBQUdBLEdBQUdBLENBQUNBLFNBQVNBLENBQUVBLENBQUNBO1lBQ3BEQSxLQUFLQSxHQUFHQSxDQUFDQSxVQUFVQSxDQUFDQSxTQUFTQTtnQkFDM0JBLE1BQU1BLENBQUNBLENBQUVBLElBQUlBLENBQUNBLGdCQUFnQkEsR0FBR0EsR0FBR0EsQ0FBQ0EsU0FBU0EsQ0FBRUEsSUFBSUEsQ0FBQ0EsQ0FBRUEsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxHQUFHQSxHQUFHQSxDQUFDQSxTQUFTQSxDQUFFQSxDQUFDQTtZQUNqR0EsS0FBS0EsR0FBR0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsU0FBU0E7Z0JBQzNCQSxNQUFNQSxDQUFDQSxDQUFFQSxJQUFJ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QSxDQUFDQTtnQkFDekJBLEtBQUtBLEdBQUdBLENBQUNBLE9BQU9BLENBQUNBLE9BQU9BO29CQUN0QkEsRUFBRUEsQ0FBQ0EsQ0FBRUEsR0FBR0EsSUFBSUEsR0FBR0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsVUFBV0EsQ0FBQ0E7d0JBQ3JDQSxJQUFJQSxDQUFDQSx3QkFBd0JBLENBQUVBLE1BQU1BLEVBQUVBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBLEVBQUVBLEdBQUdBLENBQUNBLFVBQVVBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLENBQUVBLENBQUNBO29CQUNyRkEsSUFBSUE7d0JBQ0ZBLElBQUlBLENBQUNBLHdCQUF3QkEsQ0FBRUEsTUFBTUEsRUFBRUEsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsR0FBR0EsRUFBRUEsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBRUEsQ0FBQ0E7b0JBQ3pFQSxLQUFLQSxDQUFDQTtnQkFFUkEsS0FBS0EsR0FBR0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsT0FBT0EsQ0FBQ0E7Z0JBQ3pCQSxLQUFLQSxHQUFHQSxDQUFDQSxPQUFPQSxDQUFDQSxPQUFPQSxDQUFDQTtnQkFDekJBLEtBQUtBLEdBQUdBLENBQUNBLE9BQU9BLENBQUNBLE9BQU9BLENBQUNBO2dCQUN6QkEsS0FBS0EsR0FBR0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsT0FBT0E7b0JBQ3RCQSxFQUFFQSxDQUFDQSxDQUFFQSxHQUFHQSxJQUFJQSxHQUFHQSxDQUFDQSxVQUFVQSxDQUFDQSxVQUFXQSxDQUFDQTt3QkFDckNBLElBQUlBLENBQUNBLHdCQUF3QkEsQ0FBRUEsTUFBTUEsRUFBRUEsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsR0FBR0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBRUEsQ0FBQ0E7b0JBQ3JGQSxJQUFJQTt3QkFDRkEsSUFBSUEsQ0FBQ0Esd0JBQXdCQSxDQUFFQSxNQUFNQSxFQUFFQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxHQUFHQSxFQUFFQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFFQSxDQUFDQTtvQkFDekVBLEtBQUtBLENBQUNBO2dCQUVSQSxLQUFLQSxHQUFHQSxDQUFDQSxPQUFPQSxDQUFDQSxTQUFTQSxDQUFDQTtnQkFDM0JBLEtBQUtBLEdBQUdBLENBQUNBLE9BQU9BLENBQUNBLFFBQVFBLENBQUNBO2dCQUMxQkEsS0FBS0EsR0FBR0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsT0FBT0EsQ0FBQ0E7Z0JBQ3pCQSxLQUFLQSxHQUFHQSxDQUFDQSxPQUFPQSxDQUFDQSxPQUFPQSxDQUFDQTtnQkFDekJBLEtBQUtBLEdBQUdBLENBQUNBLE9BQU9BLENBQUNBLE9BQU9BO29CQUN0QkEsRUFBRUEsQ0FBQ0EsQ0FBRUEsR0FBR0EsSUFBSUEsR0FBR0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsVUFBV0EsQ0FBQ0E7d0JBQ3JDQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFFQSxNQUFNQSxFQUFFQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxHQUFHQSxDQUFDQSxVQUFVQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQSxDQUFDQSxHQUFHQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFFQSxDQUFDQTtvQkFDekZBLElBQUlBO3dCQUNGQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFFQSxNQUFNQSxFQUFFQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxHQUFHQSxFQUFFQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFFQSxDQUFDQTtvQkFDL0RBLEtBQUtBLENBQUNBO2dCQUVSQSxLQUFLQSxHQUFHQSxDQUFDQSxPQUFPQSxDQUFDQSxPQUFPQSxDQUFDQTtnQkFDekJBLEtBQUtBLEdBQUdBLENBQUNBLE9BQU9BLENBQUNBLE9BQU9BLENBQUNBO2dCQUN6QkEsS0FBS0EsR0FBR0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsT0FBT0EsQ0FBQ0E7Z0JBQ3pCQSxLQUFLQSxHQUFHQSxDQUFDQSxPQUFPQSxDQUFDQSxPQUFPQSxDQUFDQTtnQkFDekJBLEtBQUtBLEdBQUdBLENBQUNBLE9BQU9BLENBQUNBLE1BQU1BLENBQUNBO2dCQUN4QkEsS0FBS0EsR0FBR0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsT0FBT0E7b0JBQ3RCQSxFQUFFQSxDQUFDQSxDQUFFQSxHQUFHQSxJQUFJQSxHQUFHQSxDQUFDQSxVQUFVQSxDQUFDQSxVQUFXQSxDQUFDQTt3QkFDckNBLElBQUlBLENBQUNBLGVBQWVBLENBQUVBLE1BQU1BLEVBQUVBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBLEVBQUVBLEdBQUdBLENBQUNBLFVBQVVBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLEdBQUdBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBLENBQUVBLENBQUNBO29CQUMxRkEsSUFBSUE7d0JBQ0ZBLElBQUlBLENBQUNBLGVBQWVBLENBQUVBLE1BQU1BLEVBQUVBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBLEVBQUVBLEdBQUdBLEVBQUVBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBLENBQUVBLENBQUNBO29CQUNoRUEsS0FBS0EsQ0FBQ0E7WUFDVkEsQ0FBQ0E7WUFFREEsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsTUFBTUEsQ0FBQ0E7UUFDMUJBLENBQ0FBO1FBQUFBLEtBQUtBLENBQUFBLENBQUVBLENBQUVBLENBQUNBLENBQ1ZBLENBQUNBO1FBRURBLENBQUNBO0lBQ0hBLENBQUNBO0lBRUR4QixjQUFjQSxDQUFFQSxXQUF3QkE7UUFFdEN5QixJQUFJQSxTQUFTQSxHQUFHQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQTtRQUc1Q0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsVUFBVUEsQ0FBRUEsU0FBU0EsR0FBR0EsQ0FBQ0EsRUFBRUEsSUFBSUEsQ0FBRUEsTUFBTUEsQ0FBRUEsQ0FBRUEsQ0FBQ0E7UUFHNURBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLFVBQVVBLENBQUVBLFNBQVNBLEdBQUdBLENBQUNBLEVBQUVBLElBQUlBLENBQUVBLE1BQU1BLENBQUVBLENBQUVBLENBQUNBO1FBRzVEQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxVQUFVQSxDQUFFQSxTQUFTQSxHQUFHQSxDQUFDQSxFQUFFQSxJQUFJQSxDQUFFQSxXQUFXQSxDQUFDQSxFQUFFQSxDQUFFQSxDQUFFQSxDQUFDQTtRQUdwRUEsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsVUFBVUEsQ0FBRUEsU0FBU0EsR0FBR0EsQ0FBQ0EsRUFBRUEsSUFBSUEsQ0FBRUEsV0FBV0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBRUEsQ0FBRUEsQ0FBQ0E7UUFDN0VBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLFVBQVVBLENBQUVBLFNBQVNBLEdBQUdBLEVBQUVBLEVBQUVBLFdBQVdBLENBQUNBLE1BQU1BLENBQUVBLENBQUNBO1FBRWpFQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxVQUFVQSxDQUFFQSxDQUFDQSxFQUFFQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFFQSxDQUFDQTtRQUVsREEsSUFBSUEsQ0FBQ0EsYUFBYUEsRUFBRUEsQ0FBQ0E7SUFDdkJBLENBQUNBO0lBRUR6QixlQUFlQTtRQUViMEIsSUFBSUEsU0FBU0EsR0FBR0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0E7UUFFNUNBLElBQUlBLEVBQUVBLEdBQUdBLElBQUlBLENBQUVBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLFNBQVNBLENBQUVBLFNBQVNBLEdBQUdBLENBQUNBLEVBQUVBLENBQUNBLENBQUVBLENBQUVBLENBQUNBO1FBRS9EQSxNQUFNQSxDQUFDQSxJQUFJQSxZQUFZQSxDQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFFQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxTQUFTQSxDQUFFQSxTQUFTQSxHQUFHQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFFQSxDQUFFQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxTQUFTQSxDQUFFQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFFQSxFQUFHQSxDQUFFQSxDQUFBQTtJQUVySUEsQ0FBQ0E7SUFFRDFCLElBQUlBLFFBQVFBO1FBRVYyQixNQUFNQSxDQUFDQTtZQUNMQSxVQUFVQSxFQUFFQSxJQUFJQSxDQUFDQSxVQUFVQTtZQUMzQkEsV0FBV0EsRUFBRUEsSUFBSUEsQ0FBQ0EsV0FBV0E7WUFDN0JBLFVBQVVBLEVBQUVBLElBQUlBLENBQUNBLFVBQVVBO1lBQzNCQSxVQUFVQSxFQUFFQSxJQUFJQSxDQUFDQSxVQUFVQTtZQUMzQkEsU0FBU0EsRUFBRUEsSUFBSUEsQ0FBQ0EsU0FBU0E7WUFDekJBLFVBQVVBLEVBQUVBLElBQUlBLENBQUNBLFVBQVVBO1lBQzNCQSxTQUFTQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQTtTQUMxQkEsQ0FBQ0E7SUFDSkEsQ0FBQ0E7QUFFSDNCLENBQUNBO0FBQUEsT0MxMUJNLEVBQUUsU0FBUyxFQUFFLE1BQU0sd0JBQXdCO09BQzNDLEVBQUUsYUFBYSxFQUFFLFFBQVEsRUFBRSxNQUFNLGtCQUFrQjtPQUNuRCxFQUFFLGlCQUFpQixFQUFFLE1BQU0sbUJBQW1CO09BSTlDLEVBQUUsWUFBWSxFQUFFLE1BQU0sMEJBQTBCO0FBSXZELGNBQWdCLEdBQUc7SUFFakJGLE1BQU1BLENBQUNBLENBQUVBLEdBQUdBLENBQUVBLENBQUNBLENBQUVBLElBQUlBLENBQUNBLENBQUVBLEdBQUdBLEdBQUdBLENBQUVBLENBQUNBLENBQUVBLENBQUNBO0FBQ3RDQSxDQUFDQTtBQUVEO0lBTUU4QixZQUFhQSxRQUFRQSxFQUFFQSxVQUFVQSxFQUFFQSxXQUFXQTtRQUU1Q0MsSUFBSUEsQ0FBQ0EsUUFBUUEsR0FBR0EsUUFBUUEsQ0FBQ0E7UUFDekJBLElBQUlBLENBQUNBLFVBQVVBLEdBQUdBLFVBQVVBLENBQUNBO1FBQzdCQSxJQUFJQSxDQUFDQSxXQUFXQSxHQUFHQSxXQUFXQSxDQUFDQTtJQUNqQ0EsQ0FBQ0E7QUFDSEQsQ0FBQ0E7QUFFRDtJQWtCRUUsWUFBYUEsTUFBT0E7UUFFbEJDLEVBQUVBLENBQUNBLENBQUVBLE1BQU9BLENBQUNBO1lBQ1hBLElBQUlBLENBQUNBLFVBQVVBLEdBQUdBLE1BQU1BLENBQUNBO1FBQzNCQSxJQUFJQTtZQUNGQSxJQUFJQSxDQUFDQSxVQUFVQSxHQUFHQSxjQUFjQSxDQUFDQSxhQUFhQSxDQUFDQTtRQUVqREEsSUFBSUEsQ0FBQ0EsR0FBR0EsR0FBR0EsSUFBSUEsU0FBU0EsQ0FBRUEsRUFBRUEsQ0FBRUEsQ0FBQ0E7UUFFL0JBLElBQUlBLENBQUNBLE9BQU9BLEdBQUdBLEVBQUVBLENBQUNBO0lBQ3BCQSxDQUFDQTtJQUVERCxlQUFlQSxDQUFFQSxHQUFjQSxFQUFFQSxHQUFjQTtRQUU3Q0UsSUFBSUEsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFFWkEsSUFBSUEsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFHWkEsR0FBR0EsR0FBR0EsR0FBR0EsQ0FBQ0EsTUFBTUEsQ0FBRUEsR0FBR0EsQ0FBRUEsQ0FBQ0E7UUFDeEJBLEdBQUdBLElBQUlBLENBQUNBLENBQUNBO1FBRVRBLElBQUlBLFFBQVFBLEdBQUdBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLFdBQVdBLENBQUVBLENBQUNBLEVBQUVBLEdBQUdBLEVBQUVBLE1BQU1BLENBQUVBLENBQUNBO1FBQy9EQSxRQUFRQSxDQUFDQSxVQUFVQSxDQUFFQSxDQUFDQSxFQUFFQSxHQUFHQSxDQUFDQSxNQUFNQSxDQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxDQUFFQSxDQUFFQSxDQUFDQTtRQUNqREEsR0FBR0EsSUFBSUEsR0FBR0EsQ0FBQ0E7UUFHWEEsR0FBR0EsR0FBR0EsR0FBR0EsQ0FBQ0EsTUFBTUEsQ0FBRUEsR0FBR0EsQ0FBRUEsQ0FBQ0E7UUFDeEJBLEdBQUdBLElBQUlBLENBQUNBLENBQUNBO1FBRVRBLElBQUlBLFVBQVVBLEdBQUdBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLFdBQVdBLENBQUVBLFFBQVFBLENBQUNBLFNBQVNBLEVBQUVBLEVBQUVBLEdB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LENBQUNBLE1BQU1BLENBQUVBLE1BQU1BLENBQUVBLENBQUVBLENBQUNBO0lBQzVEQSxDQUFDQTtJQUtNSCxXQUFXQSxDQUFFQSxLQUFnQkEsRUFBRUEsT0FBZ0JBO1FBRXBESSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFFQSxLQUFLQSxFQUFFQSxDQUFDQSxDQUFFQSxDQUFDQTtRQUMzQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBRUEsS0FBS0EsRUFBRUEsQ0FBQ0EsQ0FBRUEsQ0FBQ0E7UUFDM0NBLElBQUlBLENBQUNBLEdBQUdBLEdBQUdBLElBQUlBLENBQUNBLGFBQWFBLENBQUVBLEtBQUtBLEVBQUVBLENBQUNBLENBQUVBLENBQUNBO1FBQzFDQSxJQUFJQSxDQUFDQSxHQUFHQSxHQUFHQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFFQSxLQUFLQSxFQUFFQSxDQUFDQSxDQUFFQSxDQUFDQTtRQUUxQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7SUFDZEEsQ0FBQ0E7SUFLTUosV0FBV0EsQ0FBRUEsT0FBWUE7UUFHOUJLLE1BQU1BLENBQUNBLElBQUlBLFNBQVNBLENBQUVBLEVBQUVBLENBQUVBLENBQUNBO0lBQzdCQSxDQUFDQTtBQUNITCxDQUFDQTtBQUVELFdBQVcsQ0FBQyxJQUFJLENBQUUsR0FBRyxFQUFFLDhCQUE4QixDQUFFO0tBQ3BELEtBQUssQ0FBRSxNQUFNLEVBQUUsY0FBYyxFQUFFLFNBQVMsQ0FBRTtLQUMxQyxLQUFLLENBQUUsTUFBTSxFQUFFLGNBQWMsRUFBRSxTQUFTLENBQUU7S0FDMUMsS0FBSyxDQUFFLEtBQUssRUFBRSxhQUFhLEVBQUUsU0FBUyxDQUFFO0tBQ3hDLEtBQUssQ0FBRSxLQUFLLEVBQUUsYUFBYSxFQUFFLFNBQVMsQ0FBRSxDQUN4QyIsImZpbGUiOiJjcnlwdG9ncmFwaGl4LXNlLWNvcmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBCeXRlU3RyaW5nIH0gZnJvbSAnLi9ieXRlLXN0cmluZyc7XHJcblxyXG5leHBvcnQgY2xhc3MgS2V5XHJcbntcclxuICBfdHlwZTogbnVtYmVyO1xyXG4gIF9zaXplOiBudW1iZXI7XHJcbiAgX2NvbXBvbmVudEFycmF5OiBCeXRlU3RyaW5nW107XHJcblxyXG4gIGNvbnN0cnVjdG9yKClcclxuICB7XHJcbiAgICB0aGlzLl90eXBlID0gMDtcclxuICAgIHRoaXMuX3NpemUgPSAtMTtcclxuICAgIHRoaXMuX2NvbXBvbmVudEFycmF5ID0gW107XHJcbiAgfVxyXG5cclxuICBzZXRUeXBlKCBrZXlUeXBlOiBudW1iZXIgKVxyXG4gIHtcclxuICAgIHRoaXMuX3R5cGUgPSBrZXlUeXBlO1xyXG4gIH1cclxuXHJcbiAgZ2V0VHlwZSgpOiBudW1iZXJcclxuICB7XHJcbiAgICByZXR1cm4gdGhpcy5fdHlwZTtcclxuICB9XHJcblxyXG4gIHNldFNpemUoIHNpemU6IG51bWJlciApXHJcbiAge1xyXG4gICAgdGhpcy5fc2l6ZSA9IHNpemU7XHJcbiAgfVxyXG5cclxuICBnZXRTaXplKCk6IG51bWJlclxyXG4gIHtcclxuICAgIHJldHVybiB0aGlzLl9zaXplO1xyXG4gIH1cclxuXHJcbiAgc2V0Q29tcG9uZW50KCBjb21wOiBudW1iZXIsIHZhbHVlOiBCeXRlU3RyaW5nIClcclxuICB7XHJcbiAgICB0aGlzLl9jb21wb25lbnRBcnJheVsgY29tcCBdID0gdmFsdWU7XHJcbiAgfVxyXG5cclxuICBnZXRDb21wb25lbnQoIGNvbXA6IG51bWJlciApOiBCeXRlU3RyaW5nXHJcbiAge1xyXG4gICAgcmV0dXJuIHRoaXMuX2NvbXBvbmVudEFycmF5WyBjb21wIF07XHJcbiAgfVxyXG5cclxuXHJcbiAgc3RhdGljIFNFQ1JFVCA9IDE7XHJcbiAgc3RhdGljIFBSSVZBVEUgPSAyO1xyXG4gIHN0YXRpYyBQVUJMSUMgPSAzO1xyXG5cclxuICBzdGF0aWMgREVTID0gMTtcclxuICBzdGF0aWMgQUVTID0gMjtcclxuICBzdGF0aWMgTU9EVUxVUyA9IDM7XHJcbiAgc3RhdGljIEVYUE9ORU5UID0gNDtcclxuICBzdGF0aWMgQ1JUX1AgPSA1O1xyXG4gIHN0YXRpYyBDUlRfUSA9IDY7XHJcbiAgc3RhdGljIENSVF9EUDEgPSA3O1xyXG4gIHN0YXRpYyBDUlRfRFExID0gODtcclxuICBzdGF0aWMgQ1JUX1BRID0gOTtcclxufVxyXG4iLCJpbXBvcnQgeyBCeXRlQXJyYXkgfSBmcm9tICdjcnlwdG9ncmFwaGl4LXNpbS1jb3JlJztcbmltcG9ydCB7IEJ5dGVTdHJpbmcgfSBmcm9tICcuL2J5dGUtc3RyaW5nJztcbmltcG9ydCB7IEJ5dGVCdWZmZXIgfSBmcm9tICcuL2J5dGUtYnVmZmVyJztcbmltcG9ydCB7IEtleSB9IGZyb20gJy4va2V5JztcblxuZXhwb3J0IGNsYXNzIENyeXB0b1xue1xuICBjb25zdHJ1Y3RvcigpXG4gIHtcbiAgfVxuXG4gIGVuY3J5cHQoIGtleTogS2V5LCBtZWNoLCBkYXRhOiBCeXRlU3RyaW5nICk6IEJ5dGVTdHJpbmdcbiAge1xuICAgIHZhciBrOiBCeXRlQXJyYXkgPSBrZXkuZ2V0Q29tcG9uZW50KCBLZXkuU0VDUkVUICkuYnl0ZUFycmF5O1xuXG4gICAgaWYgKCBrLmxlbmd0aCA9PSAxNiApICAvLyAzREVTIERvdWJsZSAtPiBUcmlwbGVcbiAgICB7XG4gICAgICB2YXIgb3JpZyA9IGs7XG5cbiAgICAgIGsgPSBuZXcgQnl0ZUFycmF5KCBbXSApLnNldExlbmd0aCggMjQgKTtcblxuICAgICAgay5zZXRCeXRlc0F0KCAwLCBvcmlnICk7XG4gICAgICBrLnNldEJ5dGVzQXQoIDE2LCBvcmlnLnZpZXdBdCggMCwgOCApICk7XG4gICAgfVxuXG4gICAgdmFyIGNyeXB0b1RleHQgPSBuZXcgQnl0ZUFycmF5KCB0aGlzLmRlcyggay5iYWNraW5nQXJyYXksIGRhdGEuYnl0ZUFycmF5LmJhY2tpbmdBcnJheSwgMSwgMCApICk7XG5cbiAgICByZXR1cm4gbmV3IEJ5dGVTdHJpbmcoIGNyeXB0b1RleHQgKTtcbiAgfVxuXG4gIGRlY3J5cHQoIGtleSwgbWVjaCwgZGF0YSApXG4gIHtcbiAgICByZXR1cm4gZGF0YTtcbiAgfVxuXG4gIHNpZ24oIGtleTogS2V5LCBtZWNoLCBkYXRhOiBCeXRlU3RyaW5nLCBpdj8gKTogQnl0ZVN0cmluZ1xuICB7XG4gICAgdmFyIGsgPSBrZXkuZ2V0Q29tcG9uZW50KCBLZXkuU0VDUkVUICkuYnl0ZUFycmF5O1xuXG4gICAgdmFyIGtleURhdGEgPSBrO1xuXG4gICAgaWYgKCBrLmxlbmd0aCA9PSAxNiApICAvLyAzREVTIERvdWJsZSAtPiBUcmlwbGVcbiAgICB7XG4gICAgICBrZXlEYXRhID0gbmV3IEJ5dGVBcnJheSgpO1xuXG4gICAgICBrZXlEYXRhXG4gICAgICAgIC5zZXRMZW5ndGgoIDI0IClcbiAgICAgICAgLnNldEJ5dGVzQXQoIDAsIGsgKVxuICAgICAgICAuc2V0Qnl0ZXNBdCggMTYsIGsuYnl0ZXNBdCggMCwgOCApICk7XG4gICAgfVxuXG4gICAgaWYgKCBpdiA9PSB1bmRlZmluZWQgKVxuICAgICAgaXYgPSBuZXcgVWludDhBcnJheSggWyAweDAwLCAweDAwLCAweDAwLCAweDAwLCAweDAwLCAweDAwLCAweDAwLCAweDAwIF0gKTtcblxuICAgIC8vIGZ1bmN0aW9uKCBrZXksIG1lc3NhZ2UsIGVuY3J5cHQsIG1vZGUsIGl2LCBwYWRkaW5nIClcbiAgICAvLyBtb2RlPTEgQ0JDLCBwYWRkaW5nPTQgbm8tcGFkXG4gICAgdmFyIGNyeXB0b1RleHQgPSBuZXcgQnl0ZUFycmF5KCB0aGlzLmRlcygga2V5RGF0YS5iYWNraW5nQXJyYXksIGRhdGEuYnl0ZUFycmF5LmJhY2tpbmdBcnJheSwgMSwgMSwgaXYsIDQgKSApO1xuXG4gICAgcmV0dXJuIG5ldyBCeXRlU3RyaW5nKCBjcnlwdG9UZXh0ICkuYnl0ZXMoIC04ICk7XG4gIH1cblxuICBzdGF0aWMgZGVzUEM7XG4gIHN0YXRpYyBkZXNTUDtcblxuICBwcml2YXRlIGRlcygga2V5OiBVaW50OEFycmF5LCBtZXNzYWdlOiBVaW50OEFycmF5LCBlbmNyeXB0OiBudW1iZXIsIG1vZGU6IG51bWJlciwgaXY/OiBVaW50OEFycmF5LCBwYWRkaW5nPzogbnVtYmVyICk6IFVpbnQ4QXJyYXlcbiAge1xuICAgIC8vZGVzX2NyZWF0ZUtleXNcbiAgICAvL3RoaXMgdGFrZXMgYXMgaW5wdXQgYSA2NCBiaXQga2V5IChldmVuIHRob3VnaCBvbmx5IDU2IGJpdHMgYXJlIHVzZWQpXG4gICAgLy9hcyBhbiBhcnJheSBvZiAyIGludGVnZXJzLCBhbmQgcmV0dXJucyAxNiA0OCBiaXQga2V5c1xuICAgIGZ1bmN0aW9uIGRlc19jcmVhdGVLZXlzIChrZXkpXG4gICAge1xuICAgICAgaWYgKCBDcnlwdG8uZGVzUEMgPT0gdW5kZWZpbmVkIClcbiAgICAgIHtcbiAgICAgICAgLy9kZWNsYXJpbmcgdGhpcyBsb2NhbGx5IHNwZWVkcyB0aGluZ3MgdXAgYSBiaXRcbiAgICAgICAgQ3J5cHRvLmRlc1BDID0ge1xuICAgICAgICAgIHBjMmJ5dGVzMCA6IG5ldyBVaW50MzJBcnJheSggWyAwLDB4NCwweDIwMDAwMDAwLDB4MjAwMDAwMDQsMHgxMDAwMCwweDEwMDA0LDB4MjAwMTAwMDAsMHgyMDAxMDAwNCwweDIwMCwweDIwNCwweDIwMDAwMjAwLDB4MjAwMDAyMDQsMHgxMDIwMCwweDEwMjA0LDB4MjAwMTAyMDAsMHgyMDAxMDIwNCBdICksXG4gICAgICAgICAgcGMyYnl0ZXMxIDogbmV3IFVpbnQzMkFycmF5KCBbIDAsMHgxLDB4MTAwMDAwLDB4MTAwMDAxLDB4NDAwMDAwMCwweDQwMDAwMDEsMHg0MTAwMDAwLDB4NDEwMDAwMSwweDEwMCwweDEwMSwweDEwMDEwMCwweDEwMDEwMSwweDQwMDAxMDAsMHg0MDAwMTAxLDB4NDEwMDEwMCwweDQxMDAxMDFdICksXG4gICAgICAgICAgcGMyYnl0ZXMyIDogbmV3IFVpbnQzMkFycmF5KCBbIDAsMHg4LDB4ODAwLDB4ODA4LDB4MTAwMDAwMCwweDEwMDAwMDgsMHgxMDAwODAwLDB4MTAwMDgwOCwwLDB4OCwweDgwMCwweDgwOCwweDEwMDAwMDAsMHgxMDAwMDA4LDB4MTAwMDgwMCwweDEwMDA4MDhdICksXG4gICAgICAgICAgcGMyYnl0ZXMzIDogbmV3IFVpbnQzMkFycmF5KCBbIDAsMHgyMDAwMDAsMHg4MDAwMDAwLDB4ODIwMDAwMCwweDIwMDAsMHgyMDIwMDAsMHg4MDAyMDAwLDB4ODIwMjAwMCwweDIwMDAwLDB4MjIwMDAwLDB4ODAyMDAwMCwweDgyMjAwMDAsMHgyMjAwMCwweDIyMjAwMCwweDgwMjIwMDAsMHg4MjIyMDAwXSApLFxuICAgICAgICAgIHBjMmJ5dGVzNCA6IG5ldyBVaW50MzJBcnJheSggWyAwLDB4NDAwMDAsMHgxMCwweDQwMDEwLDAsMHg0MDAwMCwweDEwLDB4NDAwMTAsMHgxMDAwLDB4NDEwMDAsMHgxMDEwLDB4NDEwMTAsMHgxMDAwLDB4NDEwMDAsMHgxMDEwLDB4NDEwMTBdICksXG4gICAgICAgICAgcGMyYnl0ZXM1IDogbmV3IFVpbnQzMkFycmF5KCBbIDAsMHg0MDAsMHgyMCwweDQyMCwwLDB4NDAwLDB4MjAsMHg0MjAsMHgyMDAwMDAwLDB4MjAwMDQwMCwweDIwMDAwMjAsMHgyMDAwNDIwLDB4MjAwMDAwMCwweDIwMDA0MDAsMHgyMDAwMDIwLDB4MjAwMDQyMF0gKSxcbiAgICAgICAgICBwYzJieXRlczYgOiBuZXcgVWludDMyQXJyYXkoIFsgMCwweDEwMDAwMDAwLDB4ODAwMDAsMHgxMDA4MDAwMCwweDIsMHgxMDAwMDAwMiwweDgwMDAyLDB4MTAwODAwMDIsMCwweDEwMDAwMDAwLDB4ODAwMDAsMHgxMDA4MDAwMCwweDIsMHgxMDAwMDAwMiwweDgwMDAyLDB4MTAwODAwMDJdICksXG4gICAgICAgICAgcGMyYnl0ZXM3IDogbmV3IFVpbnQzMkFycmF5KCBbIDAsMHgxMDAwMCwweDgwMCwweDEwODAwLDB4MjAwMDAwMDAsMHgyMDAxMDAwMCwweDIwMDAwODAwLDB4MjAwMTA4MDAsMHgyMDAwMCwweDMwMDAwLDB4MjA4MDAsMHgzMDgwMCwweDIwMDIwMDAwLDB4MjAwMzAwMDAsMHgyMDAyMDgwMCwweDIwMDMwODAwXSApLFxuICAgICAgICAgIHBjMmJ5dGVzOCA6IG5ldyBVaW50MzJBcnJheSggWyAwLDB4NDAwMDAsMCwweDQwMDAwLDB4MiwweDQwMDAyLDB4MiwweDQwMDAyLDB4MjAwMDAwMCwweDIwNDAwMDAsMHgyMDAwMDAwLDB4MjA0MDAwMCwweDIwMDAwMDIsMHgyMDQwMDAyLDB4MjAwMDAwMiwweDIwNDAwMDJdICksXG4gICAgICAgICAgcGMyYnl0ZXM5IDogbmV3IFVpbnQzMkFycmF5KCBbIDAsMHgxMDAwMDAwMCwweDgsMHgxMDAwMDAwOCwwLDB4MTAwMDAwMDAsMHg4LDB4MTAwMDAwMDgsMHg0MDAsMHgxMDAwMDQwMCwweDQwOCwweDEwMDAwNDA4LDB4NDAwLDB4MTAwMDA0MDAsMHg0MDgsMHgxMDAwMDQwOF0gKSxcbiAgICAgICAgICBwYzJieXRlczEwOiBuZXcgVWludDMyQXJyYXkoIFsgMCwweDIwLDAsMHgyMCwweDEwMDAwMCwweDEwMDAyMCwweDEwMDAwMCwweDEwMDAyMCwweDIwMDAsMHgyMDIwLDB4MjAwMCwweDIwMjAsMHgxMDIwMDAsMHgxMDIwMjAsMHgxMDIwMDAsMHgxMDIwMjBdICksXG4gICAgICAgICAgcGMyYnl0ZXMxMTogbmV3IFVpbnQzMkFycmF5KCBbIDAsMHgxMDAwMDAwLDB4MjAwLDB4MTAwMDIwMCwweDIwMDAwMCwweDEyMDAwMDAsMHgyMDAyMDAsMHgxMjAwMjAwLDB4NDAwMDAwMCwweDUwMDAwMDAsMHg0MDAwMjAwLDB4NTAwMDIwMCwweDQyMDAwMDAsMHg1MjAwMDAwLDB4NDIwMDIwMCwweDUyMDAyMDBdICksXG4gICAgICAgICAgcGMyYnl0ZXMxMjogbmV3IFVpbnQzMkFycmF5KCBbIDAsMHgxMDAwLDB4ODAwMDAwMCwweDgwMDEwMDAsMHg4MDAwMCwweDgxMDAwLDB4ODA4MDAwMCwweDgwODEwMDAsMHgxMCwweDEwMTAsMHg4MDAwMDEwLDB4ODAwMTAxMCwweDgwMDEwLDB4ODEwMTAsMHg4MDgwMDEwLDB4ODA4MTAxMF0gKSxcbiAgICAgICAgICBwYzJieXRlczEzOiBuZXcgVWludDMyQXJyYXkoIFsgMCwweDQsMHgxMDAsMHgxMDQsMCwweDQsMHgxMDAsMHgxMDQsMHgxLDB4NSwweDEwMSwweDEwNSwweDEsMHg1LDB4MTAxLDB4MTA1XSApXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIC8vaG93IG1hbnkgaXRlcmF0aW9ucyAoMSBmb3IgZGVzLCAzIGZvciB0cmlwbGUgZGVzKVxuICAgICAgdmFyIGl0ZXJhdGlvbnMgPSBrZXkubGVuZ3RoID4gOCA/IDMgOiAxOyAvL2NoYW5nZWQgYnkgUGF1bCAxNi82LzIwMDcgdG8gdXNlIFRyaXBsZSBERVMgZm9yIDkrIGJ5dGUga2V5c1xuICAgICAgLy9zdG9yZXMgdGhlIHJldHVybiBrZXlzXG4gICAgICB2YXIga2V5cyA9IG5ldyBVaW50MzJBcnJheSgzMiAqIGl0ZXJhdGlvbnMpO1xuICAgICAgLy9ub3cgZGVmaW5lIHRoZSBsZWZ0IHNoaWZ0cyB3aGljaCBuZWVkIHRvIGJlIGRvbmVcbiAgICAgIHZhciBzaGlmdHMgPSBbIDAsIDAsIDEsIDEsIDEsIDEsIDEsIDEsIDAsIDEsIDEsIDEsIDEsIDEsIDEsIDAgXTtcbiAgICAgIC8vb3RoZXIgdmFyaWFibGVzXG4gICAgICB2YXIgbGVmdHRlbXAsIHJpZ2h0dGVtcCwgbT0wLCBuPTAsIHRlbXA7XG5cbiAgICAgIGZvciAodmFyIGo9MDsgajxpdGVyYXRpb25zOyBqKyspXG4gICAgICB7IC8vZWl0aGVyIDEgb3IgMyBpdGVyYXRpb25zXG4gICAgICAgIGxlZnQgPSAgKGtleVttKytdIDw8IDI0KSB8IChrZXlbbSsrXSA8PCAxNikgfCAoa2V5W20rK10gPDwgOCkgfCBrZXlbbSsrXTtcbiAgICAgICAgcmlnaHQgPSAoa2V5W20rK10gPDwgMjQpIHwgKGtleVttKytdIDw8IDE2KSB8IChrZXlbbSsrXSA8PCA4KSB8IGtleVttKytdO1xuXG4gICAgICAgIHRlbXAgPSAoKGxlZnQgPj4+IDQpIF4gcmlnaHQpICYgMHgwZjBmMGYwZjsgcmlnaHQgXj0gdGVtcDsgbGVmdCBePSAodGVtcCA8PCA0KTtcbiAgICAgICAgdGVtcCA9ICgocmlnaHQgPj4+IC0xNikgXiBsZWZ0KSAmIDB4MDAwMGZmZmY7IGxlZnQgXj0gdGVtcDsgcmlnaHQgXj0gKHRlbXAgPDwgLTE2KTtcbiAgICAgICAgdGVtcCA9ICgobGVmdCA+Pj4gMikgXiByaWdodCkgJiAweDMzMzMzMzMzOyByaWdodCBePSB0ZW1wOyBsZWZ0IF49ICh0ZW1wIDw8IDIpO1xuICAgICAgICB0ZW1wID0gKChyaWdodCA+Pj4gLTE2KSBeIGxlZnQpICYgMHgwMDAwZmZmZjsgbGVmdCBePSB0ZW1wOyByaWdodCBePSAodGVtcCA8PCAtMTYpO1xuICAgICAgICB0ZW1wID0gKChsZWZ0ID4+PiAxKSBeIHJpZ2h0KSAmIDB4NTU1NTU1NTU7IHJpZ2h0IF49IHRlbXA7IGxlZnQgXj0gKHRlbXAgPDwgMSk7XG4gICAgICAgIHRlbXAgPSAoKHJpZ2h0ID4+PiA4KSBeIGxlZnQpICYgMHgwMGZmMDBmZjsgbGVmdCBePSB0ZW1wOyByaWdodCBePSAodGVtcCA8PCA4KTtcbiAgICAgICAgdGVtcCA9ICgobGVmdCA+Pj4gMSkgXiByaWdodCkgJiAweDU1NTU1NTU1OyByaWdodCBePSB0ZW1wOyBsZWZ0IF49ICh0ZW1wIDw8IDEpO1xuXG4gICAgICAgIC8vdGhlIHJpZ2h0IHNpZGUgbmVlZHMgdG8gYmUgc2hpZnRlZCBhbmQgdG8gZ2V0IHRoZSBsYXN0IGZvdXIgYml0cyBvZiB0aGUgbGVmdCBzaWRlXG4gICAgICAgIHRlbXAgPSAobGVmdCA8PCA4KSB8ICgocmlnaHQgPj4+IDIwKSAmIDB4MDAwMDAwZjApO1xuICAgICAgICAvL2xlZnQgbmVlZHMgdG8gYmUgcHV0IHVwc2lkZSBkb3duXG4gICAgICAgIGxlZnQgPSAocmlnaHQgPDwgMjQpIHwgKChyaWdodCA8PCA4KSAmIDB4ZmYwMDAwKSB8ICgocmlnaHQgPj4+IDgpICYgMHhmZjAwKSB8ICgocmlnaHQgPj4+IDI0KSAmIDB4ZjApO1xuICAgICAgICByaWdodCA9IHRlbXA7XG5cbiAgICAgICAgLy9ub3cgZ28gdGhyb3VnaCBhbmQgcGVyZm9ybSB0aGVzZSBzaGlmdHMgb24gdGhlIGxlZnQgYW5kIHJpZ2h0IGtleXNcbiAgICAgICAgZm9yICh2YXIgaT0wOyBpIDwgc2hpZnRzLmxlbmd0aDsgaSsrKVxuICAgICAgICB7XG4gICAgICAgICAgLy9zaGlmdCB0aGUga2V5cyBlaXRoZXIgb25lIG9yIHR3byBiaXRzIHRvIHRoZSBsZWZ0XG4gICAgICAgICAgaWYgKHNoaWZ0c1tpXSlcbiAgICAgICAgICB7XG4gICAgICAgICAgICBsZWZ0ID0gKGxlZnQgPDwgMikgfCAobGVmdCA+Pj4gMjYpOyByaWdodCA9IChyaWdodCA8PCAyKSB8IChyaWdodCA+Pj4gMjYpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlXG4gICAgICAgICAge1xuICAgICAgICAgICAgbGVmdCA9IChsZWZ0IDw8IDEpIHwgKGxlZnQgPj4+IDI3KTsgcmlnaHQgPSAocmlnaHQgPDwgMSkgfCAocmlnaHQgPj4+IDI3KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgbGVmdCAmPSAtMHhmOyByaWdodCAmPSAtMHhmO1xuXG4gICAgICAgICAgLy9ub3cgYXBwbHkgUEMtMiwgaW4gc3VjaCBhIHdheSB0aGF0IEUgaXMgZWFzaWVyIHdoZW4gZW5jcnlwdGluZyBvciBkZWNyeXB0aW5nXG4gICAgICAgICAgLy90aGlzIGNvbnZlcnNpb24gd2lsbCBsb29rIGxpa2UgUEMtMiBleGNlcHQgb25seSB0aGUgbGFzdCA2IGJpdHMgb2YgZWFjaCBieXRlIGFyZSB1c2VkXG4gICAgICAgICAgLy9yYXRoZXIgdGhhbiA0OCBjb25zZWN1dGl2ZSBiaXRzIGFuZCB0aGUgb3JkZXIgb2YgbGluZXMgd2lsbCBiZSBhY2NvcmRpbmcgdG9cbiAgICAgICAgICAvL2hvdyB0aGUgUyBzZWxlY3Rpb24gZnVuY3Rpb25zIHdpbGwgYmUgYXBwbGllZDogUzIsIFM0LCBTNiwgUzgsIFMxLCBTMywgUzUsIFM3XG4gICAgICAgICAgbGVmdHRlbXAgPSBDcnlwdG8uZGVzUEMucGMyYnl0ZXMwW2xlZnQgPj4+IDI4XSB8IENyeXB0by5kZXNQQy5wYzJieXRlczFbKGxlZnQgPj4+IDI0KSAmIDB4Zl1cbiAgICAgICAgICAgICAgICAgICB8IENyeXB0by5kZXNQQy5wYzJieXRlczJbKGxlZnQgPj4+IDIwKSAmIDB4Zl0gfCBDcnlwdG8uZGVzUEMucGMyYnl0ZXMzWyhsZWZ0ID4+PiAxNikgJiAweGZdXG4gICAgICAgICAgICAgICAgICAgfCBDcnlwdG8uZGVzUEMucGMyYnl0ZXM0WyhsZWZ0ID4+PiAxMikgJiAweGZdIHwgQ3J5cHRvLmRlc1BDLnBjMmJ5dGVzNVsobGVmdCA+Pj4gOCkgJiAweGZdXG4gICAgICAgICAgICAgICAgICAgfCBDcnlwdG8uZGVzUEMucGMyYnl0ZXM2WyhsZWZ0ID4+PiA0KSAmIDB4Zl07XG4gICAgICAgICAgcmlnaHR0ZW1wID0gQ3J5cHRvLmRlc1BDLnBjMmJ5dGVzN1tyaWdodCA+Pj4gMjhdIHwgQ3J5cHRvLmRlc1BDLnBjMmJ5dGVzOFsocmlnaHQgPj4+IDI0KSAmIDB4Zl1cbiAgICAgICAgICAgICAgICAgICAgfCBDcnlwdG8uZGVzUEMucGMyYnl0ZXM5WyhyaWdodCA+Pj4gMjApICYgMHhmXSB8IENyeXB0by5kZXNQQy5wYzJieXRlczEwWyhyaWdodCA+Pj4gMTYpICYgMHhmXVxuICAgICAgICAgICAgICAgICAgICB8IENyeXB0by5kZXNQQy5wYzJieXRlczExWyhyaWdodCA+Pj4gMTIpICYgMHhmXSB8IENyeXB0by5kZXNQQy5wYzJieXRlczEyWyhyaWdodCA+Pj4gOCkgJiAweGZdXG4gICAgICAgICAgICAgICAgICAgIHwgQ3J5cHRvLmRlc1BDLnBjMmJ5dGVzMTNbKHJpZ2h0ID4+PiA0KSAmIDB4Zl07XG4gICAgICAgICAgdGVtcCA9ICgocmlnaHR0ZW1wID4+PiAxNikgXiBsZWZ0dGVtcCkgJiAweDAwMDBmZmZmO1xuICAgICAgICAgIGtleXNbbisrXSA9IGxlZnR0ZW1wIF4gdGVtcDsga2V5c1tuKytdID0gcmlnaHR0ZW1wIF4gKHRlbXAgPDwgMTYpO1xuICAgICAgICB9XG4gICAgICB9IC8vZm9yIGVhY2ggaXRlcmF0aW9uc1xuXG4gICAgICByZXR1cm4ga2V5cztcbiAgICB9IC8vZW5kIG9mIGRlc19jcmVhdGVLZXlzXG5cbiAgICAvL2RlY2xhcmluZyB0aGlzIGxvY2FsbHkgc3BlZWRzIHRoaW5ncyB1cCBhIGJpdFxuICAgIGlmICggQ3J5cHRvLmRlc1NQID09IHVuZGVmaW5lZCApXG4gICAge1xuICAgICAgQ3J5cHRvLmRlc1NQID0ge1xuICAgICAgICBzcGZ1bmN0aW9uMTogbmV3IFVpbnQzMkFycmF5KCBbMHgxMDEwNDAwLDAsMHgxMDAwMCwweDEwMTA0MDQsMHgxMDEwMDA0LDB4MTA0MDQsMHg0LDB4MTAwMDAsMHg0MDAsMHgxMDEwNDAwLDB4MTAxMDQwNCwweDQwMCwweDEwMDA0MDQsMHgxMDEwMDA0LDB4MTAwMDAwMCwweDQsMHg0MDQsMHgxMDAwNDAwLDB4MTAwMDQwMCwweDEwNDAwLDB4MTA0MDAsMHgxMDEwMDAwLDB4MTAxMDAwMCwweDEwMDA0MDQsMHgxMDAwNCwweDEwMDAwMDQsMHgxMDAwMDA0LDB4MTAwMDQsMCwweDQwNCwweDEwNDA0LDB4MTAwMDAwMCwweDEwMDAwLDB4MTAxMDQwNCwweDQsMHgxMDEwMDAwLDB4MTAxMDQwMCwweDEwMDAwMDAsMHgxMDAwMDAwLDB4NDAwLDB4MTAxMDAwNCwweDEwMDAwLDB4MTA0MDAsMHgxMDAwMDA0LDB4NDAwLDB4NCwweDEwMDA0MDQsMHgxMDQwNCwweDEwMTA0MDQsMHgxMDAwNCwweDEwMTAwMDAsMHgxMDAwNDA0LDB4MTAwMDAwNCwweDQwNCwweDEwNDA0LDB4MTAxMDQwMCwweDQwNCwweDEwMDA0MDAsMHgxMDAwNDAwLDAsMHgxMDAwNCwweDEwNDAwLDAsMHgxMDEwMDA0XSApLFxuICAgICAgICBzcGZ1bmN0aW9uMjogbmV3IFVpbnQzMkFycmF5KCBbLTB4N2ZlZjdmZTAsLTB4N2ZmZjgwMDAsMHg4MDAwLDB4MTA4MDIwLDB4MTAwMDAwLDB4MjAsLTB4N2ZlZmZmZTAsLTB4N2ZmZjdmZTAsLTB4N2ZmZmZmZTAsLTB4N2ZlZjdmZTAsLTB4N2ZlZjgwMDAsLTB4ODAwMDAwMDAsLTB4N2ZmZjgwMDAsMHgxMDAwMDAsMHgyMCwtMHg3ZmVmZmZlMCwweDEwODAwMCwweDEwMDAyMCwtMHg3ZmZmN2ZlMCwwLC0weDgwMDAwMDAwLDB4ODAwMCwweDEwODAyMCwtMHg3ZmYwMDAwMCwweDEwMDAyMCwtMHg3ZmZmZmZlMCwwLDB4MTA4MDAwLDB4ODAyMCwtMHg3ZmVmODAwMCwtMHg3ZmYwMDAwMCwweDgwMjAsMCwweDEwODAyMCwtMHg3ZmVmZmZlMCwweDEwMDAwMCwtMHg3ZmZmN2ZlMCwtMHg3ZmYwMDAwMCwtMHg3ZmVmODAwMCwweDgwMDAsLTB4N2ZmMDAwMDAsLTB4N2ZmZjgwMDAsMHgyMCwtMHg3ZmVmN2ZlMCwweDEwODAyMCwweDIwLDB4ODAwMCwtMHg4MDAwMDAwMCwweDgwMjAsLTB4N2ZlZjgwMDAsMHgxMDAwMDAsLTB4N2ZmZmZmZTAsMHgxMDAwMjAsLTB4N2ZmZjdmZTAsLTB4N2ZmZmZmZTAsMHgxMDAwMjAsMHgxMDgwMDAsMCwtMHg3ZmZmODAwMCwweDgwMjAsLTB4ODAwMDAwMDAsLTB4N2ZlZmZmZTAsLTB4N2ZlZjdmZTAsMHgxMDgwMDBdICksXG4gICAgICAgIHNwZnVuY3Rpb24zOiBuZXcgVWludDMyQXJyYXkoIFsweDIwOCwweDgwMjAyMDAsMCwweDgwMjAwMDgsMHg4MDAwMjAwLDAsMHgyMDIwOCwweDgwMDAyMDAsMHgyMDAwOCwweDgwMDAwMDgsMHg4MDAwMDA4LDB4MjAwMDAsMHg4MDIwMjA4LDB4MjAwMDgsMHg4MDIwMDAwLDB4MjA4LDB4ODAwMDAwMCwweDgsMHg4MDIwMjAwLDB4MjAwLDB4MjAyMDAsMHg4MDIwMDAwLDB4ODAyMDAwOCwweDIwMjA4LDB4ODAwMDIwOCwweDIwMjAwLDB4MjAwMDAsMHg4MDAwMjA4LDB4OCwweDgwMjAyMDgsMHgyMDAsMHg4MDAwMDAwLDB4ODAyMDIwMCwweDgwMDAwMDAsMHgyMDAwOCwweDIwOCwweDIwMDAwLDB4ODAyMDIwMCwweDgwMDAyMDAsMCwweDIwMCwweDIwMDA4LDB4ODAyMDIwOCwweDgwMDAyMDAsMHg4MDAwMDA4LDB4MjAwLDAsMHg4MDIwMDA4LDB4ODAwMDIwOCwweDIwMDAwLDB4ODAwMDAwMCwweDgwMjAyMDgsMHg4LDB4MjAyMDgsMHgyMDIwMCwweDgwMDAwMDgsMHg4MDIwMDAwLDB4ODAwMDIwOCwweDIwOCwweDgwMjAwMDAsMHgyMDIwOCwweDgsMHg4MDIwMDA4LDB4MjAyMDBdICksXG4gICAgICAgIHNwZnVuY3Rpb240OiBuZXcgVWludDMyQXJyYXkoIFsweDgwMjAwMSwweDIwODEsMHgyMDgxLDB4ODAsMHg4MDIwODAsMHg4MDAwODEsMHg4MDAwMDEsMHgyMDAxLDAsMHg4MDIwMDAsMHg4MDIwMDAsMHg4MDIwODEsMHg4MSwwLDB4ODAwMDgwLDB4ODAwMDAxLDB4MSwweDIwMDAsMHg4MDAwMDAsMHg4MDIwMDEsMHg4MCwweDgwMDAwMCwweDIwMDEsMHgyMDgwLDB4ODAwMDgxLDB4MSwweDIwODAsMHg4MDAwODAsMHgyMDAwLDB4ODAyMDgwLDB4ODAyMDgxLDB4ODEsMHg4MDAwODAsMHg4MDAwMDEsMHg4MDIwMDAsMHg4MDIwODEsMHg4MSwwLDAsMHg4MDIwMDAsMHgyMDgwLDB4ODAwMDgwLDB4ODAwMDgxLDB4MSwweDgwMjAwMSwweDIwODEsMHgyMDgxLDB4ODAsMHg4MDIwODEsMHg4MSwweDEsMHgyMDAwLDB4ODAwMDAxLDB4MjAwMSwweDgwMjA4MCwweDgwMDA4MSwweDIwMDEsMHgyMDgwLDB4ODAwMDAwLDB4ODAyMDAxLDB4ODAsMHg4MDAwMDAsMHgyMDAwLDB4ODAyMDgwXSApLFxuICAgICAgICBzcGZ1bmN0aW9uNTogbmV3IFVpbnQzMkFycmF5KCBbMHgxMDAsMHgyMDgwMTAwLDB4MjA4MDAwMCwweDQyMDAwMTAwLDB4ODAwMDAsMHgxMDAsMHg0MDAwMDAwMCwweDIwODAwMDAsMHg0MDA4MDEwMCwweDgwMDAwLDB4MjAwMDEwMCwweDQwMDgwMTAwLDB4NDIwMDAxMDAsMHg0MjA4MDAwMCwweDgwMTAwLDB4NDAwMDAwMDAsMHgyMDAwMDAwLDB4NDAwODAwMDAsMHg0MDA4MDAwMCwwLDB4NDAwMDAxMDAsMHg0MjA4MDEwMCwweDQyMDgwMTAwLDB4MjAwMDEwMCwweDQyMDgwMDAwLDB4NDAwMDAxMDAsMCwweDQyMDAwMDAwLDB4MjA4MDEwMCwweDIwMDAwMDAsMHg0MjAwMDAwMCwweDgwMTAwLDB4ODAwMDAsMHg0MjAwMDEwMCwweDEwMCwweDIwMDAwMDAsMHg0MDAwMDAwMCwweDIwODAwMDAsMHg0MjAwMDEwMCwweDQwMDgwMTAwLDB4MjAwMDEwMCwweDQwMDAwMDAwLDB4NDIwODAwMDAsMHgyMDgwMTAwLDB4NDAwODAxMDAsMHgxMDAsMHgyMDAwMDAwLDB4NDIwODAwMDAsMHg0MjA4MDEwMCwweDgwMTAwLDB4NDIwMDAwMDAsMHg0MjA4MDEwMCwweDIwODAwMDAsMCwweDQwMDgwMDAwLDB4NDIwMDAwMDAsMHg4MDEwMCwweDIwMDAxMDAsMHg0MDAwMDEwMCwweDgwMDAwLDAsMHg0MDA4MDAwMCwweDIwODAxMDAsMHg0MDAwMDEwMF0gKSxcbiAgICAgICAgc3BmdW5jdGlvbjY6IG5ldyBVaW50MzJBcnJheSggWzB4MjAwMDAwMTAsMHgyMDQwMDAwMCwweDQwMDAsMHgyMDQwNDAxMCwweDIwNDAwMDAwLDB4MTAsMHgyMDQwNDAxMCwweDQwMDAwMCwweDIwMDA0MDAwLDB4NDA0MDEwLDB4NDAwMDAwLDB4MjAwMDAwMTAsMHg0MDAwMTAsMHgyMDAwNDAwMCwweDIwMDAwMDAwLDB4NDAxMCwwLDB4NDAwMDEwLDB4MjAwMDQwMTAsMHg0MDAwLDB4NDA0MDAwLDB4MjAwMDQwMTAsMHgxMCwweDIwNDAwMDEwLDB4MjA0MDAwMTAsMCwweDQwNDAxMCwweDIwNDA0MDAwLDB4NDAxMCwweDQwNDAwMCwweDIwNDA0MDAwLDB4MjAwMDAwMDAsMHgyMDAwNDAwMCwweDEwLDB4MjA0MDAwMTAsMHg0MDQwMDAsMHgyMDQwNDAxMCwweDQwMDAwMCwweDQwMTAsMHgyMDAwMDAxMCwweDQwMDAwMCwweDIwMDA0MDAwLDB4MjAwMDAwMDAsMHg0MDEwLDB4MjAwMDAwMTAsMHgyMDQwNDAxMCwweDQwNDAwMCwweDIwNDAwMDAwLDB4NDA0MDEwLDB4MjA0MDQwMDAsMCwweDIwNDAwMDEwLDB4MTAsMHg0MDAwLDB4MjA0MDAwMDAsMHg0MDQwMTAsMHg0MDAwLDB4NDAwMDEwLDB4MjAwMDQwMTAsMCwweDIwNDA0MDAwLDB4MjAwMDAwMDAsMHg0MDAwMTAsMHgyMDAwNDAxMF0gKSxcbiAgICAgICAgc3BmdW5jdGlvbjc6IG5ldyBVaW50MzJBcnJheSggWzB4MjAwMDAwLDB4NDIwMDAwMiwweDQwMDA4MDIsMCwweDgwMCwweDQwMDA4MDIsMHgyMDA4MDIsMHg0MjAwODAwLDB4NDIwMDgwMiwweDIwMDAwMCwwLDB4NDAwMDAwMiwweDIsMHg0MDAwMDAwLDB4NDIwMDAwMiwweDgwMiwweDQwMDA4MDAsMHgyMDA4MDIsMHgyMDAwMDIsMHg0MDAwODAwLDB4NDAwMDAwMiwweDQyMDAwMDAsMHg0MjAwODAwLDB4MjAwMDAyLDB4NDIwMDAwMCwweDgwMCwweDgwMiwweDQyMDA4MDIsMHgyMDA4MDAsMHgyLDB4NDAwMDAwMCwweDIwMDgwMCwweDQwMDAwMDAsMHgyMDA4MDAsMHgyMDAwMDAsMHg0MDAwODAyLDB4NDAwMDgwMiwweDQyMDAwMDIsMHg0MjAwMDAyLDB4MiwweDIwMDAwMiwweDQwMDAwMDAsMHg0MDAwODAwLDB4MjAwMDAwLDB4NDIwMDgwMCwweDgwMiwweDIwMDgwMiwweDQyMDA4MDAsMHg4MDIsMHg0MDAwMDAyLDB4NDIwMDgwMiwweDQyMDAwMDAsMHgyMDA4MDAsMCwweDIsMHg0MjAwODAyLDAsMHgyMDA4MDIsMHg0MjAwMDAwLDB4ODAwLDB4NDAwMDAwMiwweDQwMDA4MDAsMHg4MDAsMHgyMDAwMDJdICksXG4gICAgICAgIHNwZnVuY3Rpb244OiBuZXcgVWludDMyQXJyYXkoIFsweDEwMDAxMDQwLDB4MTAwMCwweDQwMDAwLDB4MTAwNDEwNDAsMHgxMDAwMDAwMCwweDEwMDAxMDQwLDB4NDAsMHgxMDAwMDAwMCwweDQwMDQwLDB4MTAwNDAwMDAsMHgxMDA0MTA0MCwweDQxMDAwLDB4MTAwNDEwMDAsMHg0MTA0MCwweDEwMDAsMHg0MCwweDEwMDQwMDAwLDB4MTAwMDAwNDAsMHgxMDAwMTAwMCwweDEwNDAsMHg0MTAwMCwweDQwMDQwLDB4MTAwNDAwNDAsMHgxMDA0MTAwMCwweDEwNDAsMCwwLDB4MTAwNDAwNDAsMHgxMDAwMDA0MCwweDEwMDAxMDAwLDB4NDEwNDAsMHg0MDAwMCwweDQxMDQwLDB4NDAwMDAsMHgxMDA0MTAwMCwweDEwMDAsMHg0MCwweDEwMDQwMDQwLDB4MTAwMCwweDQxMDQwLDB4MTAwMDEwMDAsMHg0MCwweDEwMDAwMDQwLDB4MTAwNDAwMDAsMHgxMDA0MDA0MCwweDEwMDAwMDAwLDB4NDAwMDAsMHgxMDAwMTA0MCwwLDB4MTAwNDEwNDAsMHg0MDA0MCwweDEwMDAwMDQwLDB4MTAwNDAwMDAsMHgxMDAwMTAwMCwweDEwMDAxMDQwLDAsMHgxMDA0MTA0MCwweDQxMDAwLDB4NDEwMDAsMHgxMDQwLDB4MTA0MCwweDQwMDQwLDB4MTAwMDAwMDAsMHgxMDA0MTAwMF0gKSxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLy9jcmVhdGUgdGhlIDE2IG9yIDQ4IHN1YmtleXMgd2Ugd2lsbCBuZWVkXG4gICAgdmFyIGtleXMgPSBkZXNfY3JlYXRlS2V5cygga2V5ICk7XG5cbiAgICB2YXIgbT0wLCBpLCBqLCB0ZW1wLCBsZWZ0LCByaWdodCwgbG9vcGluZztcbiAgICB2YXIgY2JjbGVmdCwgY2JjbGVmdDIsIGNiY3JpZ2h0LCBjYmNyaWdodDJcbiAgICB2YXIgbGVuID0gbWVzc2FnZS5sZW5ndGg7XG5cbiAgICAvL3NldCB1cCB0aGUgbG9vcHMgZm9yIHNpbmdsZSBhbmQgdHJpcGxlIGRlc1xuICAgIHZhciBpdGVyYXRpb25zID0ga2V5cy5sZW5ndGggPT0gMzIgPyAzIDogOTsgLy9zaW5nbGUgb3IgdHJpcGxlIGRlc1xuXG4gICAgaWYgKGl0ZXJhdGlvbnMgPT0gMylcbiAgICB7XG4gICAgICBsb29waW5nID0gZW5jcnlwdCA/IFsgMCwgMzIsIDIgXSA6IFsgMzAsIC0yLCAtMiBdO1xuICAgIH1cbiAgICBlbHNlXG4gICAge1xuICAgICAgbG9vcGluZyA9IGVuY3J5cHQgPyBbIDAsIDMyLCAyLCA2MiwgMzAsIC0yLCA2NCwgOTYsIDIgXSA6IFsgOTQsIDYyLCAtMiwgMzIsIDY0LCAyLCAzMCwgLTIsIC0yIF07XG4gICAgfVxuXG4gICAgLy8gcGFkIHRoZSBtZXNzYWdlIGRlcGVuZGluZyBvbiB0aGUgcGFkZGluZyBwYXJhbWV0ZXJcbiAgICBpZiAoICggcGFkZGluZyAhPSB1bmRlZmluZWQgKSAmJiAoIHBhZGRpbmcgIT0gNCApIClcbiAgICB7XG4gICAgICB2YXIgdW5wYWRkZWRNZXNzYWdlID0gbWVzc2FnZTtcbiAgICAgIHZhciBwYWQgPSA4LShsZW4lOCk7XG5cbiAgICAgIG1lc3NhZ2UgPSBuZXcgVWludDhBcnJheSggbGVuICsgOCApO1xuICAgICAgbWVzc2FnZS5zZXQoIHVucGFkZGVkTWVzc2FnZSwgMCApO1xuXG4gICAgICBzd2l0Y2goIHBhZGRpbmcgKVxuICAgICAge1xuICAgICAgICBjYXNlIDA6IC8vIHplcm8tcGFkXG4gICAgICAgICAgbWVzc2FnZS5zZXQoIG5ldyBVaW50OEFycmF5KCBbIDB4MDAsIDB4MDAsIDB4MDAsIDB4MDAsIDB4MDAsIDB4MDAsIDB4MDAsIDB4MDAgXSApLCBsZW4gKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIDE6IC8vIFBLQ1M3IHBhZGRpbmdcbiAgICAgICAge1xuICAgICAgICAgIG1lc3NhZ2Uuc2V0KCBuZXcgVWludDhBcnJheSggWyBwYWQsIHBhZCwgcGFkLCBwYWQsIHBhZCwgcGFkLCBwYWQsIHBhZF0gKSwgOCApO1xuXG4gICAgICAgICAgaWYgKCBwYWQ9PTggKVxuICAgICAgICAgICAgbGVuKz04O1xuXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBjYXNlIDI6ICAvLyBwYWQgdGhlIG1lc3NhZ2Ugd2l0aCBzcGFjZXNcbiAgICAgICAgICBtZXNzYWdlLnNldCggbmV3IFVpbnQ4QXJyYXkoIFsgMHgyMCwgMHgyMCwgMHgyMCwgMHgyMCwgMHgyMCwgMHgyMCwgMHgyMCwgMHgyMCBdICksIDggKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgfVxuXG4gICAgICBsZW4gKz0gOC0obGVuJTgpXG4gICAgfVxuXG4gICAgLy8gc3RvcmUgdGhlIHJlc3VsdCBoZXJlXG4gICAgdmFyIHJlc3VsdCA9IG5ldyBVaW50OEFycmF5KCBsZW4gKTtcblxuICAgIGlmIChtb2RlID09IDEpXG4gICAgeyAvL0NCQyBtb2RlXG4gICAgICB2YXIgbSA9IDA7XG5cbiAgICAgIGNiY2xlZnQgPSAgKGl2W20rK10gPDwgMjQpIHwgKGl2W20rK10gPDwgMTYpIHwgKGl2W20rK10gPDwgOCkgfCBpdlttKytdO1xuICAgICAgY2JjcmlnaHQgPSAoaXZbbSsrXSA8PCAyNCkgfCAoaXZbbSsrXSA8PCAxNikgfCAoaXZbbSsrXSA8PCA4KSB8IGl2W20rK107XG4gICAgfVxuXG4gICAgdmFyIHJtID0gMDtcblxuICAgIC8vbG9vcCB0aHJvdWdoIGVhY2ggNjQgYml0IGNodW5rIG9mIHRoZSBtZXNzYWdlXG4gICAgd2hpbGUgKG0gPCBsZW4pXG4gICAge1xuICAgICAgbGVmdCA9ICAobWVzc2FnZVttKytdIDw8IDI0KSB8IChtZXNzYWdlW20rK10gPDwgMTYpIHwgKG1lc3NhZ2VbbSsrXSA8PCA4KSB8IG1lc3NhZ2VbbSsrXTtcbiAgICAgIHJpZ2h0ID0gKG1lc3NhZ2VbbSsrXSA8PCAyNCkgfCAobWVzc2FnZVttKytdIDw8IDE2KSB8IChtZXNzYWdlW20rK10gPDwgOCkgfCBtZXNzYWdlW20rK107XG5cbiAgICAgIC8vZm9yIENpcGhlciBCbG9jayBDaGFpbmluZyBtb2RlLCB4b3IgdGhlIG1lc3NhZ2Ugd2l0aCB0aGUgcHJldmlvdXMgcmVzdWx0XG4gICAgICBpZiAobW9kZSA9PSAxKVxuICAgICAge1xuICAgICAgICBpZiAoZW5jcnlwdClcbiAgICAgICAge1xuICAgICAgICAgIGxlZnQgXj0gY2JjbGVmdDsgcmlnaHQgXj0gY2JjcmlnaHQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICB7XG4gICAgICAgICAgY2JjbGVmdDIgPSBjYmNsZWZ0O1xuICAgICAgICAgIGNiY3JpZ2h0MiA9IGNiY3JpZ2h0O1xuICAgICAgICAgIGNiY2xlZnQgPSBsZWZ0O1xuICAgICAgICAgIGNiY3JpZ2h0ID0gcmlnaHQ7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy9maXJzdCBlYWNoIDY0IGJ1dCBjaHVuayBvZiB0aGUgbWVzc2FnZSBtdXN0IGJlIHBlcm11dGVkIGFjY29yZGluZyB0byBJUFxuICAgICAgdGVtcCA9ICgobGVmdCA+Pj4gNCkgXiByaWdodCkgJiAweDBmMGYwZjBmOyByaWdodCBePSB0ZW1wOyBsZWZ0IF49ICh0ZW1wIDw8IDQpO1xuICAgICAgdGVtcCA9ICgobGVmdCA+Pj4gMTYpIF4gcmlnaHQpICYgMHgwMDAwZmZmZjsgcmlnaHQgXj0gdGVtcDsgbGVmdCBePSAodGVtcCA8PCAxNik7XG4gICAgICB0ZW1wID0gKChyaWdodCA+Pj4gMikgXiBsZWZ0KSAmIDB4MzMzMzMzMzM7IGxlZnQgXj0gdGVtcDsgcmlnaHQgXj0gKHRlbXAgPDwgMik7XG4gICAgICB0ZW1wID0gKChyaWdodCA+Pj4gOCkgXiBsZWZ0KSAmIDB4MDBmZjAwZmY7IGxlZnQgXj0gdGVtcDsgcmlnaHQgXj0gKHRlbXAgPDwgOCk7XG4gICAgICB0ZW1wID0gKChsZWZ0ID4+PiAxKSBeIHJpZ2h0KSAmIDB4NTU1NTU1NTU7IHJpZ2h0IF49IHRlbXA7IGxlZnQgXj0gKHRlbXAgPDwgMSk7XG5cbiAgICAgIGxlZnQgPSAoKGxlZnQgPDwgMSkgfCAobGVmdCA+Pj4gMzEpKTtcbiAgICAgIHJpZ2h0ID0gKChyaWdodCA8PCAxKSB8IChyaWdodCA+Pj4gMzEpKTtcblxuICAgICAgLy9kbyB0aGlzIGVpdGhlciAxIG9yIDMgdGltZXMgZm9yIGVhY2ggY2h1bmsgb2YgdGhlIG1lc3NhZ2VcbiAgICAgIGZvciAoaj0wOyBqPGl0ZXJhdGlvbnM7IGorPTMpXG4gICAgICB7XG4gICAgICAgIHZhciBlbmRsb29wID0gbG9vcGluZ1tqKzFdO1xuICAgICAgICB2YXIgbG9vcGluYyA9IGxvb3BpbmdbaisyXTtcblxuICAgICAgICAvL25vdyBnbyB0aHJvdWdoIGFuZCBwZXJmb3JtIHRoZSBlbmNyeXB0aW9uIG9yIGRlY3J5cHRpb25cbiAgICAgICAgZm9yIChpPWxvb3Bpbmdbal07IGkhPWVuZGxvb3A7IGkrPWxvb3BpbmMpXG4gICAgICAgIHsgLy9mb3IgZWZmaWNpZW5jeVxuICAgICAgICAgIHZhciByaWdodDEgPSByaWdodCBeIGtleXNbaV07XG4gICAgICAgICAgdmFyIHJpZ2h0MiA9ICgocmlnaHQgPj4+IDQpIHwgKHJpZ2h0IDw8IDI4KSkgXiBrZXlzW2krMV07XG5cbiAgICAgICAgICAvL3RoZSByZXN1bHQgaXMgYXR0YWluZWQgYnkgcGFzc2luZyB0aGVzZSBieXRlcyB0aHJvdWdoIHRoZSBTIHNlbGVjdGlvbiBmdW5jdGlvbnNcbiAgICAgICAgICB0ZW1wID0gbGVmdDtcbiAgICAgICAgICBsZWZ0ID0gcmlnaHQ7XG4gICAgICAgICAgcmlnaHQgPSB0ZW1wIF4gKENyeXB0by5kZXNTUC5zcGZ1bmN0aW9uMlsocmlnaHQxID4+PiAyNCkgJiAweDNmXSB8IENyeXB0by5kZXNTUC5zcGZ1bmN0aW9uNFsocmlnaHQxID4+PiAxNikgJiAweDNmXVxuICAgICAgICAgICAgICAgICAgICAgICAgfCBDcnlwdG8uZGVzU1Auc3BmdW5jdGlvbjZbKHJpZ2h0MSA+Pj4gIDgpICYgMHgzZl0gfCBDcnlwdG8uZGVzU1Auc3BmdW5jdGlvbjhbcmlnaHQxICYgMHgzZl1cbiAgICAgICAgICAgICAgICAgICAgICAgIHwgQ3J5cHRvLmRlc1NQLnNwZnVuY3Rpb24xWyhyaWdodDIgPj4+IDI0KSAmIDB4M2ZdIHwgQ3J5cHRvLmRlc1NQLnNwZnVuY3Rpb24zWyhyaWdodDIgPj4+IDE2KSAmIDB4M2ZdXG4gICAgICAgICAgICAgICAgICAgICAgICB8IENyeXB0by5kZXNTUC5zcGZ1bmN0aW9uNVsocmlnaHQyID4+PiAgOCkgJiAweDNmXSB8IENyeXB0by5kZXNTUC5zcGZ1bmN0aW9uN1tyaWdodDIgJiAweDNmXSk7XG4gICAgICAgIH1cblxuICAgICAgICB0ZW1wID0gbGVmdDsgbGVmdCA9IHJpZ2h0OyByaWdodCA9IHRlbXA7IC8vdW5yZXZlcnNlIGxlZnQgYW5kIHJpZ2h0XG4gICAgICB9IC8vZm9yIGVpdGhlciAxIG9yIDMgaXRlcmF0aW9uc1xuXG4gICAgICAvL21vdmUgdGhlbiBlYWNoIG9uZSBiaXQgdG8gdGhlIHJpZ2h0XG4gICAgICBsZWZ0ID0gKChsZWZ0ID4+PiAxKSB8IChsZWZ0IDw8IDMxKSk7XG4gICAgICByaWdodCA9ICgocmlnaHQgPj4+IDEpIHwgKHJpZ2h0IDw8IDMxKSk7XG5cbiAgICAgIC8vbm93IHBlcmZvcm0gSVAtMSwgd2hpY2ggaXMgSVAgaW4gdGhlIG9wcG9zaXRlIGRpcmVjdGlvblxuICAgICAgdGVtcCA9ICgobGVmdCA+Pj4gMSkgXiByaWdodCkgJiAweDU1NTU1NTU1OyByaWdodCBePSB0ZW1wOyBsZWZ0IF49ICh0ZW1wIDw8IDEpO1xuICAgICAgdGVtcCA9ICgocmlnaHQgPj4+IDgpIF4gbGVmdCkgJiAweDAwZmYwMGZmOyBsZWZ0IF49IHRlbXA7IHJpZ2h0IF49ICh0ZW1wIDw8IDgpO1xuICAgICAgdGVtcCA9ICgocmlnaHQgPj4+IDIpIF4gbGVmdCkgJiAweDMzMzMzMzMzOyBsZWZ0IF49IHRlbXA7IHJpZ2h0IF49ICh0ZW1wIDw8IDIpO1xuICAgICAgdGVtcCA9ICgobGVmdCA+Pj4gMTYpIF4gcmlnaHQpICYgMHgwMDAwZmZmZjsgcmlnaHQgXj0gdGVtcDsgbGVmdCBePSAodGVtcCA8PCAxNik7XG4gICAgICB0ZW1wID0gKChsZWZ0ID4+PiA0KSBeIHJpZ2h0KSAmIDB4MGYwZjBmMGY7IHJpZ2h0IF49IHRlbXA7IGxlZnQgXj0gKHRlbXAgPDwgNCk7XG5cbiAgICAgIC8vZm9yIENpcGhlciBCbG9jayBDaGFpbmluZyBtb2RlLCB4b3IgdGhlIG1lc3NhZ2Ugd2l0aCB0aGUgcHJldmlvdXMgcmVzdWx0XG4gICAgICBpZiAobW9kZSA9PSAxKVxuICAgICAge1xuICAgICAgICBpZiAoZW5jcnlwdClcbiAgICAgICAge1xuICAgICAgICAgIGNiY2xlZnQgPSBsZWZ0O1xuICAgICAgICAgIGNiY3JpZ2h0ID0gcmlnaHQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICB7XG4gICAgICAgICAgbGVmdCBePSBjYmNsZWZ0MjtcbiAgICAgICAgICByaWdodCBePSBjYmNyaWdodDI7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmVzdWx0LnNldCggbmV3IFVpbnQ4QXJyYXkgKCBbIChsZWZ0Pj4+MjQpICYgMHhmZiwgKGxlZnQ+Pj4xNikgJiAweGZmLCAobGVmdD4+PjgpICYgMHhmZiwgKGxlZnQpICYgMHhmZiwgKHJpZ2h0Pj4+MjQpICYgMHhmZiwgKHJpZ2h0Pj4+MTYpICYgMHhmZiwgKHJpZ2h0Pj4+OCkgJiAweGZmLCAocmlnaHQpICYgMHhmZiBdICksIHJtICk7XG5cbiAgICAgIHJtICs9IDg7XG4gICAgfSAvL2ZvciBldmVyeSA4IGNoYXJhY3RlcnMsIG9yIDY0IGJpdHMgaW4gdGhlIG1lc3NhZ2VcblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH0gLy9lbmQgb2YgZGVzXG5cbiAgdmVyaWZ5KCBrZXksIG1lY2gsIGRhdGEsIHNpZ25hdHVyZSwgaXYgKVxuICB7XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1cblxuICBkaWdlc3QoIG1lY2gsIGRhdGEgKVxuICB7XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1cblxuICBzdGF0aWMgREVTX0NCQzogTnVtYmVyID0gMjtcbiAgc3RhdGljIERFU19FQ0IgPSA1O1xuICBzdGF0aWMgREVTX01BQyA9IDg7XG4gIHN0YXRpYyBERVNfTUFDX0VNViA9IDk7XG4gIHN0YXRpYyBJU085Nzk3X01FVEhPRF8xID0gMTE7XG4gIHN0YXRpYyBJU085Nzk3X01FVEhPRF8yID0gMTI7XG5cbiAgc3RhdGljIE1ENSA9IDEzO1xuICBzdGF0aWMgUlNBID0gMTQ7XG4gIHN0YXRpYyBTSEFfMSA9IDE1O1xuICBzdGF0aWMgU0hBXzUxMiA9IDI1O1xufVxuIiwiaW1wb3J0IHsgQnl0ZUFycmF5LCBCeXRlRW5jb2RpbmcgfSBmcm9tICdjcnlwdG9ncmFwaGl4LXNpbS1jb3JlJztcclxuXHJcbmltcG9ydCB7IEJ5dGVCdWZmZXIgfSBmcm9tICcuL2J5dGUtYnVmZmVyJztcclxuaW1wb3J0IHsgQ3J5cHRvIH0gZnJvbSAnLi9jcnlwdG8nO1xyXG5cclxuZXhwb3J0IGNsYXNzIEJ5dGVTdHJpbmdcclxue1xyXG4gIHB1YmxpYyBieXRlQXJyYXk6IEJ5dGVBcnJheTtcclxuXHJcbiAgcHVibGljIHN0YXRpYyBIRVggPSBCeXRlRW5jb2RpbmcuSEVYO1xyXG4gIHB1YmxpYyBzdGF0aWMgQkFTRTY0ID0gQnl0ZUVuY29kaW5nLkJBU0U2NDtcclxuXHJcbiAgY29uc3RydWN0b3IoIHZhbHVlOiBzdHJpbmcgfCBCeXRlU3RyaW5nIHwgQnl0ZUFycmF5LCBlbmNvZGluZz86IG51bWJlciApXHJcbiAge1xyXG4gICAgaWYgKCAhZW5jb2RpbmcgKVxyXG4gICAge1xyXG4gICAgICBpZiAoIHZhbHVlIGluc3RhbmNlb2YgQnl0ZVN0cmluZyApXHJcbiAgICAgICAgdGhpcy5ieXRlQXJyYXkgPSB2YWx1ZS5ieXRlQXJyYXkuY2xvbmUoKTtcclxuICAgICAgZWxzZSBpZiAoIHZhbHVlIGluc3RhbmNlb2YgQnl0ZUFycmF5IClcclxuICAgICAgICB0aGlzLmJ5dGVBcnJheSA9IHZhbHVlLmNsb25lKCk7XHJcbi8vICAgICAgZWxzZVxyXG4vLyAgICAgICAgc3VwZXIoIFVpbnQ4QXJyYXkoIHZhbHVlICkgKTtcclxuICAgIH1cclxuICAgIGVsc2VcclxuICAgIHtcclxuICAgICAgc3dpdGNoKCBlbmNvZGluZyApXHJcbiAgICAgIHtcclxuICAgICAgICBjYXNlIEJ5dGVTdHJpbmcuSEVYOlxyXG4gICAgICAgICAgdGhpcy5ieXRlQXJyYXkgPSBuZXcgQnl0ZUFycmF5KCA8c3RyaW5nPnZhbHVlLCBCeXRlQXJyYXkuSEVYICk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgIHRocm93IFwiQnl0ZVN0cmluZyB1bnN1cHBvcnRlZCBlbmNvZGluZ1wiO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBnZXQgbGVuZ3RoKCk6IG51bWJlclxyXG4gIHtcclxuICAgIHJldHVybiB0aGlzLmJ5dGVBcnJheS5sZW5ndGg7XHJcbiAgfVxyXG5cclxuICBieXRlcyggb2Zmc2V0OiBudW1iZXIsIGNvdW50PzogbnVtYmVyICk6IEJ5dGVTdHJpbmdcclxuICB7XHJcbiAgICByZXR1cm4gbmV3IEJ5dGVTdHJpbmcoIHRoaXMuYnl0ZUFycmF5LnZpZXdBdCggb2Zmc2V0LCBjb3VudCApICk7XHJcbiAgfVxyXG5cclxuICBieXRlQXQoIG9mZnNldDogbnVtYmVyICk6IG51bWJlclxyXG4gIHtcclxuICAgIHJldHVybiB0aGlzLmJ5dGVBcnJheS5ieXRlQXQoIG9mZnNldCApO1xyXG4gIH1cclxuXHJcbiAgZXF1YWxzKCBvdGhlckJ5dGVTdHJpbmc6IEJ5dGVTdHJpbmcgKVxyXG4gIHtcclxuLy8gICAgcmV0dXJuICEoIHRoaXMuX2J5dGVzIDwgb3RoZXJCeXRlU3RyaW5nLl9ieXRlcyApICYmICEoIHRoaXMuX2J5dGVzID4gb3RoZXJCeXRlU3RyaW5nLl9ieXRlcyApO1xyXG4gIH1cclxuXHJcbiAgY29uY2F0KCB2YWx1ZTogQnl0ZVN0cmluZyApOiBCeXRlU3RyaW5nXHJcbiAge1xyXG4gICAgdGhpcy5ieXRlQXJyYXkuY29uY2F0KCB2YWx1ZS5ieXRlQXJyYXkgKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIGxlZnQoIGNvdW50OiBudW1iZXIgKVxyXG4gIHtcclxuICAgIHJldHVybiBuZXcgQnl0ZVN0cmluZyggdGhpcy5ieXRlQXJyYXkudmlld0F0KCAwICkgKTtcclxuICB9XHJcblxyXG4gIHJpZ2h0KCBjb3VudDogbnVtYmVyICk6IEJ5dGVTdHJpbmdcclxuICB7XHJcbiAgICByZXR1cm4gbmV3IEJ5dGVTdHJpbmcoIHRoaXMuYnl0ZUFycmF5LnZpZXdBdCggLWNvdW50ICkgKTtcclxuICB9XHJcblxyXG4gIG5vdCggKTogQnl0ZVN0cmluZ1xyXG4gIHtcclxuICAgIHJldHVybiBuZXcgQnl0ZVN0cmluZyggdGhpcy5ieXRlQXJyYXkuY2xvbmUoKS5ub3QoKSApO1xyXG4gIH1cclxuXHJcbiAgYW5kKCB2YWx1ZTogQnl0ZVN0cmluZyApOiBCeXRlU3RyaW5nXHJcbiAge1xyXG4gICAgcmV0dXJuIG5ldyBCeXRlU3RyaW5nKCB0aGlzLmJ5dGVBcnJheS5jbG9uZSgpLmFuZCggdmFsdWUuYnl0ZUFycmF5KSApO1xyXG4gIH1cclxuXHJcbiAgb3IoIHZhbHVlOiBCeXRlU3RyaW5nICk6IEJ5dGVTdHJpbmdcclxuICB7XHJcbiAgICByZXR1cm4gbmV3IEJ5dGVTdHJpbmcoIHRoaXMuYnl0ZUFycmF5LmNsb25lKCkub3IoIHZhbHVlLmJ5dGVBcnJheSkgKTtcclxuICB9XHJcblxyXG4gIHBhZCggbWV0aG9kOiBudW1iZXIsIG9wdGlvbmFsPzogYm9vbGVhbiApXHJcbiAge1xyXG4gICAgdmFyIGJzID0gbmV3IEJ5dGVCdWZmZXIoIHRoaXMuYnl0ZUFycmF5ICk7XHJcblxyXG4gICAgaWYgKCBvcHRpb25hbCA9PSB1bmRlZmluZWQgKVxyXG4gICAgICBvcHRpb25hbCA9IGZhbHNlO1xyXG5cclxuICAgIGlmICggKCAoIGJzLmxlbmd0aCAmIDcgKSAhPSAwICkgfHwgKCAhb3B0aW9uYWwgKSApXHJcbiAgICB7XHJcbiAgICAgIHZhciBuZXdsZW4gPSAoICggYnMubGVuZ3RoICsgOCApICYgfjcgKTtcclxuICAgICAgaWYgKCBtZXRob2QgPT0gQ3J5cHRvLklTTzk3OTdfTUVUSE9EXzEgKVxyXG4gICAgICAgIGJzLmFwcGVuZCggMHg4MCApO1xyXG5cclxuICAgICAgd2hpbGUoIGJzLmxlbmd0aCA8IG5ld2xlbiApXHJcbiAgICAgICAgYnMuYXBwZW5kKCAweDAwICk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGJzLnRvQnl0ZVN0cmluZygpO1xyXG4gIH1cclxuXHJcbiAgdG9TdHJpbmcoIGVuY29kaW5nPzogbnVtYmVyICk6IHN0cmluZ1xyXG4gIHtcclxuICAgIC8vVE9ETzogZW5jb2RpbmcgLi4uXHJcbiAgICByZXR1cm4gdGhpcy5ieXRlQXJyYXkudG9TdHJpbmcoIEJ5dGVBcnJheS5IRVggKTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBIRVggPSBCeXRlU3RyaW5nLkhFWDtcclxuLy9leHBvcnQgY29uc3QgQVNDSUkgPSBCeXRlU3RyaW5nLkFTQ0lJO1xyXG5leHBvcnQgY29uc3QgQkFTRTY0ID0gQnl0ZVN0cmluZy5CQVNFNjQ7XHJcbi8vZXhwb3J0IGNvbnN0IFVURjggPSBCeXRlU3RyaW5nLlVURjg7XHJcbiIsImltcG9ydCB7IEJ5dGVBcnJheSB9IGZyb20gJ2NyeXB0b2dyYXBoaXgtc2ltLWNvcmUnO1xyXG5pbXBvcnQgeyBCeXRlU3RyaW5nIH0gZnJvbSAnLi9ieXRlLXN0cmluZyc7XHJcblxyXG5leHBvcnQgY2xhc3MgQnl0ZUJ1ZmZlclxyXG57XHJcbiAgYnl0ZUFycmF5OiBCeXRlQXJyYXk7XHJcblxyXG4gIGNvbnN0cnVjdG9yICggdmFsdWU/OiBCeXRlQXJyYXkgfCBCeXRlU3RyaW5nIHwgc3RyaW5nLCBlbmNvZGluZz8gKVxyXG4gIHtcclxuICAgIGlmICggdmFsdWUgaW5zdGFuY2VvZiBCeXRlQXJyYXkgKVxyXG4gICAge1xyXG4gICAgICB0aGlzLmJ5dGVBcnJheSA9IHZhbHVlLmNsb25lKCk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggdmFsdWUgaW5zdGFuY2VvZiBCeXRlU3RyaW5nIClcclxuICAgIHtcclxuICAgICAgdGhpcy5ieXRlQXJyYXkgPSB2YWx1ZS5ieXRlQXJyYXkuY2xvbmUoKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBlbmNvZGluZyAhPSB1bmRlZmluZWQgKVxyXG4gICAge1xyXG4gICAgICB0aGlzLmJ5dGVBcnJheSA9IG5ldyBCeXRlU3RyaW5nKCB2YWx1ZSwgZW5jb2RpbmcgKS5ieXRlQXJyYXkuY2xvbmUoKTtcclxuICAgIH1cclxuICAgIGVsc2VcclxuICAgICAgdGhpcy5ieXRlQXJyYXkgPSBuZXcgQnl0ZUFycmF5KCBbXSApO1xyXG4gIH1cclxuXHJcbiAgZ2V0IGxlbmd0aCgpXHJcbiAge1xyXG4gICAgcmV0dXJuIHRoaXMuYnl0ZUFycmF5Lmxlbmd0aDtcclxuICB9XHJcblxyXG4gIHRvQnl0ZVN0cmluZygpOiBCeXRlU3RyaW5nXHJcbiAge1xyXG4gICAgcmV0dXJuIG5ldyBCeXRlU3RyaW5nKCB0aGlzLmJ5dGVBcnJheSApO1xyXG4gIH1cclxuXHJcbiAgY2xlYXIoKVxyXG4gIHtcclxuICAgIHRoaXMuYnl0ZUFycmF5ID0gbmV3IEJ5dGVBcnJheSggW10gKTtcclxuICB9XHJcblxyXG4gIGFwcGVuZCggdmFsdWU6IEJ5dGVTdHJpbmcgfCBCeXRlQnVmZmVyIHwgbnVtYmVyICk6IEJ5dGVCdWZmZXJcclxuICB7XHJcbiAgICBsZXQgdmFsdWVBcnJheTogQnl0ZUFycmF5O1xyXG5cclxuICAgIGlmICggKCB2YWx1ZSBpbnN0YW5jZW9mIEJ5dGVTdHJpbmcgKSB8fCAoIHZhbHVlIGluc3RhbmNlb2YgQnl0ZUJ1ZmZlciApIClcclxuICAgIHtcclxuICAgICAgdmFsdWVBcnJheSA9IHZhbHVlLmJ5dGVBcnJheTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCB0eXBlb2YgdmFsdWUgPT0gXCJudW1iZXJcIiApXHJcbiAgICB7XHJcbiAgICAgIHZhbHVlQXJyYXkgPSBuZXcgQnl0ZUFycmF5KCBbICggPG51bWJlcj52YWx1ZSAmIDB4ZmYgKSBdICk7XHJcbiAgICB9XHJcbi8qICAgIGVsc2UgaWYgKCB0eXBlb2YgdmFsdWUgPT0gXCJzdHJpbmdcIiApXHJcbiAgICB7XHJcbiAgICAgIHZhbHVlQXJyYXkgPSBuZXcgVWludDhBcnJheSggdmFsdWUubGVuZ3RoICk7XHJcbiAgICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdmFsdWUubGVuZ3RoOyArK2kgKVxyXG4gICAgICAgIHZhbHVlQXJyYXlbaV0gPSB2YWx1ZS5jaGFyQXQoIGkgKTtcclxuICAgIH0qL1xyXG4vLyAgICBlbHNlXHJcbi8vICAgICAgdmFsdWVBcnJheSA9IG5ldyBCeXRlQXJyYXkoIHZhbHVlICk7XHJcblxyXG4gICAgdGhpcy5ieXRlQXJyYXkuY29uY2F0KCB2YWx1ZUFycmF5ICk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCB7IEJ5dGVBcnJheSB9IGZyb20gJ2NyeXB0b2dyYXBoaXgtc2ltLWNvcmUnO1xuXG5leHBvcnQgY2xhc3MgQmFzZVRMVlxue1xuICBwdWJsaWMgc3RhdGljIEVuY29kaW5ncyA9IHtcbiAgICBFTVY6IDEsXG4gICAgREdJOiAyXG4gIH07XG5cbiAgc3RhdGljIHBhcnNlVExWKCBidWZmZXI6IEJ5dGVBcnJheSwgZW5jb2Rpbmc6IG51bWJlciApOiB7IHRhZzogbnVtYmVyLCBsZW46IG51bWJlciwgdmFsdWU6IEJ5dGVBcnJheSwgbGVuT2Zmc2V0OiBudW1iZXIsIHZhbHVlT2Zmc2V0OiBudW1iZXIgfVxuICB7XG4gICAgdmFyIHJlcyA9IHsgdGFnOiAwLCBsZW46IDAsIHZhbHVlOiB1bmRlZmluZWQsIGxlbk9mZnNldDogMCwgdmFsdWVPZmZzZXQ6IDAgfTtcbiAgICB2YXIgb2ZmID0gMDtcbiAgICB2YXIgYnl0ZXMgPSBidWZmZXIuYmFja2luZ0FycmF5OyAgLy8gVE9ETzogVXNlIGJ5dGVBdCggLi4gKVxuXG4gICAgc3dpdGNoKCBlbmNvZGluZyApXG4gICAge1xuICAgICAgY2FzZSBCYXNlVExWLkVuY29kaW5ncy5FTVY6XG4gICAgICB7XG4gICAgICAgIHdoaWxlKCAoIG9mZiA8IGJ5dGVzLmxlbmd0aCApICYmICggKCBieXRlc1sgb2ZmIF0gPT0gMHgwMCApIHx8ICggYnl0ZXNbIG9mZiBdID09IDB4RkYgKSApIClcbiAgICAgICAgICArK29mZjtcblxuICAgICAgICBpZiAoIG9mZiA+PSBieXRlcy5sZW5ndGggKVxuICAgICAgICAgIHJldHVybiByZXM7XG5cbiAgICAgICAgaWYgKCAoIGJ5dGVzWyBvZmYgXSAmIDB4MUYgKSA9PSAweDFGIClcbiAgICAgICAge1xuICAgICAgICAgIHJlcy50YWcgPSBieXRlc1sgb2ZmKysgXSA8PCA4O1xuICAgICAgICAgIGlmICggb2ZmID49IGJ5dGVzLmxlbmd0aCApXG4gICAgICAgICAgeyAvKmxvZyhcIjFcIik7Ki8gIHJldHVybiBudWxsOyB9XG4gICAgICAgIH1cblxuICAgICAgICByZXMudGFnIHw9IGJ5dGVzWyBvZmYrKyBdO1xuXG4gICAgICAgIHJlcy5sZW5PZmZzZXQgPSBvZmY7XG5cbiAgICAgICAgaWYgKCBvZmYgPj0gYnl0ZXMubGVuZ3RoIClcbiAgICAgICAgeyAvKmxvZyhcIjJcIik7Ki8gIHJldHVybiBudWxsOyB9XG5cbiAgICAgICAgdmFyIGxsID0gKCBieXRlc1sgb2ZmIF0gJiAweDgwICkgPyAoIGJ5dGVzWyBvZmYrKyBdICYgMHg3RiApIDogMTtcbiAgICAgICAgd2hpbGUoIGxsLS0gPiAwIClcbiAgICAgICAge1xuICAgICAgICAgIGlmICggb2ZmID49IGJ5dGVzLmxlbmd0aCApXG4gICAgICAgICAgeyAvKmxvZyhcIjM6XCIgKyBvZmYgKyBcIjpcIiArIGJ5dGVzLmxlbmd0aCk7ICAqL3JldHVybiBudWxsOyB9XG5cbiAgICAgICAgICByZXMubGVuID0gKCByZXMubGVuIDw8IDggKSB8IGJ5dGVzWyBvZmYrKyBdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVzLnZhbHVlT2Zmc2V0ID0gb2ZmO1xuICAgICAgICBpZiAoIG9mZiArIHJlcy5sZW4gPiBieXRlcy5sZW5ndGggKVxuICAgICAgeyAvKmxvZyhcIjRcIik7Ki8gIHJldHVybiBudWxsOyB9XG4gICAgICAgIHJlcy52YWx1ZSA9IGJ5dGVzLnNsaWNlKCByZXMudmFsdWVPZmZzZXQsIHJlcy52YWx1ZU9mZnNldCArIHJlcy5sZW4gKTtcblxuICAvLyAgICAgIGxvZyggcmVzLnZhbHVlT2Zmc2V0ICsgXCIrXCIgKyByZXMubGVuICsgXCI9XCIgKyBieXRlcyApO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbiAgcHVibGljIGJ5dGVBcnJheTogQnl0ZUFycmF5O1xuICBlbmNvZGluZzogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yICggdGFnOiBudW1iZXIsIHZhbHVlOiBCeXRlQXJyYXksIGVuY29kaW5nPzogbnVtYmVyIClcbiAge1xuICAgIHRoaXMuZW5jb2RpbmcgPSBlbmNvZGluZyB8fCBCYXNlVExWLkVuY29kaW5ncy5FTVY7XG5cbiAgICBzd2l0Y2goIHRoaXMuZW5jb2RpbmcgKVxuICAgIHtcbiAgICAgIGNhc2UgQmFzZVRMVi5FbmNvZGluZ3MuRU1WOlxuICAgICAge1xuICAgICAgICB2YXIgdGx2QnVmZmVyID0gbmV3IEJ5dGVBcnJheShbXSk7XG5cbiAgICAgICAgaWYgKCB0YWcgPj0gIDB4MTAwIClcbiAgICAgICAgICB0bHZCdWZmZXIuYWRkQnl0ZSggKCB0YWcgPj4gOCApICYgMHhGRiApO1xuICAgICAgICB0bHZCdWZmZXIuYWRkQnl0ZSggdGFnICYgMHhGRiApO1xuXG4gICAgICAgIHZhciBsZW4gPSB2YWx1ZS5sZW5ndGg7XG4gICAgICAgIGlmICggbGVuID4gMHhGRiApXG4gICAgICAgIHtcbiAgICAgICAgICB0bHZCdWZmZXIuYWRkQnl0ZSggMHg4MiApO1xuICAgICAgICAgIHRsdkJ1ZmZlci5hZGRCeXRlKCAoIGxlbiA+PiA4ICkgJiAweEZGICk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoIGxlbiA+IDB4N0YgKVxuICAgICAgICAgIHRsdkJ1ZmZlci5hZGRCeXRlKCAweDgxICk7XG5cbiAgICAgICAgdGx2QnVmZmVyLmFkZEJ5dGUoIGxlbiAmIDB4RkYgKTtcblxuICAgICAgICB0bHZCdWZmZXIuY29uY2F0KCB2YWx1ZSApO1xuXG4gICAgICAgIHRoaXMuYnl0ZUFycmF5ID0gdGx2QnVmZmVyO1xuXG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGdldCB0YWcoKTogbnVtYmVyXG4gIHtcbiAgICByZXR1cm4gQmFzZVRMVi5wYXJzZVRMViggdGhpcy5ieXRlQXJyYXksIHRoaXMuZW5jb2RpbmcgKS50YWc7XG4gIH1cblxuICBnZXQgdmFsdWUoKTogQnl0ZUFycmF5XG4gIHtcbiAgICByZXR1cm4gQmFzZVRMVi5wYXJzZVRMViggdGhpcy5ieXRlQXJyYXksIHRoaXMuZW5jb2RpbmcgKS52YWx1ZTtcbiAgfVxuXG4gIGdldCBsZW4oKTogbnVtYmVyXG4gIHtcbiAgICByZXR1cm4gQmFzZVRMVi5wYXJzZVRMViggdGhpcy5ieXRlQXJyYXksIHRoaXMuZW5jb2RpbmcgKS5sZW47XG4gIH1cbn1cblxuQmFzZVRMVi5FbmNvZGluZ3NbIFwiQ1RWXCIgXSA9IDQ7Ly8geyBwYXJzZTogMCwgYnVpbGQ6IDEgfTtcbiIsImltcG9ydCB7IEJhc2VUTFYgYXMgQmFzZVRMViB9IGZyb20gJy4uL2lzbzc4MTYvYmFzZS10bHYnO1xyXG5pbXBvcnQgeyBCeXRlU3RyaW5nIH0gZnJvbSAnLi9ieXRlLXN0cmluZyc7XHJcbmltcG9ydCB7IEJ5dGVCdWZmZXIgfSBmcm9tICcuL2J5dGUtYnVmZmVyJztcclxuXHJcbmV4cG9ydCBjbGFzcyBUTFZcclxue1xyXG4gIHRsdjogQmFzZVRMVjtcclxuICBlbmNvZGluZzogbnVtYmVyO1xyXG5cclxuICBjb25zdHJ1Y3RvciAoIHRhZzogbnVtYmVyLCB2YWx1ZTogQnl0ZVN0cmluZywgZW5jb2Rpbmc6IG51bWJlciApXHJcbiAge1xyXG4gICAgdGhpcy50bHYgPSBuZXcgQmFzZVRMViggdGFnLCB2YWx1ZS5ieXRlQXJyYXksIGVuY29kaW5nICk7XHJcblxyXG4gICAgdGhpcy5lbmNvZGluZyA9IGVuY29kaW5nO1xyXG4gIH1cclxuXHJcbiAgZ2V0VExWKCk6IEJ5dGVTdHJpbmdcclxuICB7XHJcbiAgICByZXR1cm4gbmV3IEJ5dGVTdHJpbmcoIHRoaXMudGx2LmJ5dGVBcnJheSApO1xyXG4gIH1cclxuXHJcbiAgZ2V0VGFnKCk6IG51bWJlclxyXG4gIHtcclxuICAgIHJldHVybiB0aGlzLnRsdi50YWc7XHJcbiAgfVxyXG5cclxuICBnZXRWYWx1ZSgpOiBCeXRlU3RyaW5nXHJcbiAge1xyXG4gICAgcmV0dXJuIG5ldyBCeXRlU3RyaW5nKCB0aGlzLnRsdi52YWx1ZSApO1xyXG4gIH1cclxuXHJcbiAgZ2V0TCgpOiBCeXRlU3RyaW5nXHJcbiAge1xyXG4gICAgdmFyIGluZm8gPSBCYXNlVExWLnBhcnNlVExWKCB0aGlzLnRsdi5ieXRlQXJyYXksIHRoaXMuZW5jb2RpbmcgKTtcclxuXHJcbiAgICByZXR1cm4gbmV3IEJ5dGVTdHJpbmcoIHRoaXMudGx2LmJ5dGVBcnJheS52aWV3QXQoIGluZm8ubGVuT2Zmc2V0LCBpbmZvLnZhbHVlT2Zmc2V0ICkgKTtcclxuICB9XHJcblxyXG4gIGdldExWKClcclxuICB7XHJcbiAgICB2YXIgaW5mbyA9IEJhc2VUTFYucGFyc2VUTFYoIHRoaXMudGx2LmJ5dGVBcnJheSwgdGhpcy5lbmNvZGluZyApO1xyXG5cclxuICAgIHJldHVybiBuZXcgQnl0ZVN0cmluZyggdGhpcy50bHYuYnl0ZUFycmF5LnZpZXdBdCggaW5mby5sZW5PZmZzZXQsIGluZm8udmFsdWVPZmZzZXQgKyBpbmZvLmxlbiApICk7XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgcGFyc2VUTFYoIGJ1ZmZlcjogQnl0ZVN0cmluZywgZW5jb2Rpbmc6IG51bWJlciApOiB7IHRhZzogbnVtYmVyLCBsZW46IG51bWJlciwgdmFsdWU6IEJ5dGVTdHJpbmcsIGxlbk9mZnNldDogbnVtYmVyLCB2YWx1ZU9mZnNldDogbnVtYmVyIH1cclxuICB7XHJcbiAgICBsZXQgaW5mbyA9IEJhc2VUTFYucGFyc2VUTFYoIGJ1ZmZlci5ieXRlQXJyYXksIGVuY29kaW5nICk7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgdGFnOiBpbmZvLnRhZyxcclxuICAgICAgbGVuOiBpbmZvLmxlbixcclxuICAgICAgdmFsdWU6IG5ldyBCeXRlU3RyaW5nKCBpbmZvLnZhbHVlICksXHJcbiAgICAgIGxlbk9mZnNldDogaW5mby5sZW5PZmZzZXQsXHJcbiAgICAgIHZhbHVlT2Zmc2V0OiBpbmZvLnZhbHVlT2Zmc2V0XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgc3RhdGljIEVNViA9IEJhc2VUTFYuRW5jb2RpbmdzLkVNVjtcclxuICBzdGF0aWMgREdJID0gQmFzZVRMVi5FbmNvZGluZ3MuREdJO1xyXG4vLyAgc3RhdGljIEwxNiA9IEJhc2VUTFYuTDE2O1xyXG59XHJcbiIsImltcG9ydCB7IEJ5dGVTdHJpbmcgfSBmcm9tICcuL2J5dGUtc3RyaW5nJztcclxuaW1wb3J0IHsgVExWIH0gZnJvbSAnLi90bHYnO1xyXG5cclxuZXhwb3J0IGNsYXNzIFRMVkxpc3Rcclxue1xyXG4gIF90bHZzOiBUTFZbXTtcclxuXHJcbiAgY29uc3RydWN0b3IoIHRsdlN0cmVhbTogQnl0ZVN0cmluZywgZW5jb2Rpbmc/OiBudW1iZXIgKVxyXG4gIHtcclxuICAgIHRoaXMuX3RsdnMgPSBbXTtcclxuXHJcbiAgICB2YXIgb2ZmID0gMDtcclxuXHJcbiAgICB3aGlsZSggb2ZmIDwgdGx2U3RyZWFtLmxlbmd0aCApXHJcbiAgICB7XHJcbiAgICAgIHZhciB0bHZJbmZvID0gVExWLnBhcnNlVExWKCB0bHZTdHJlYW0uYnl0ZXMoIG9mZiApLCBlbmNvZGluZyApXHJcblxyXG4gICAgICBpZiAoIHRsdkluZm8gPT0gbnVsbCApXHJcbiAgICAgIHtcclxuICAgICAgICAvLyBlcnJvciAuLi5cclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBlbHNlXHJcbiAgICAgIHtcclxuICAgICAgICAvLyBubyBtb3JlIC4uLiA/XHJcbiAgICAgICAgaWYgKCB0bHZJbmZvLnZhbHVlT2Zmc2V0ID09IDAgKVxyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIHRoaXMuX3RsdnMucHVzaCggbmV3IFRMViggdGx2SW5mby50YWcsIHRsdkluZm8udmFsdWUsIGVuY29kaW5nICkgKTtcclxuICAgICAgICBvZmYgKz0gdGx2SW5mby52YWx1ZU9mZnNldCArIHRsdkluZm8ubGVuO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBpbmRleCggaW5kZXg6IG51bWJlciApOiBUTFZcclxuICB7XHJcbiAgICByZXR1cm4gdGhpcy5fdGx2c1sgaW5kZXggXTtcclxuICB9XHJcbn1cclxuIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsImltcG9ydCB7ICBCeXRlQXJyYXksIEtpbmQsIEtpbmRCdWlsZGVyLCBLaW5kSW5mbyB9IGZyb20gJ2NyeXB0b2dyYXBoaXgtc2ltLWNvcmUnO1xuXG4vKipcbiAqIEVuY29kZXIvRGVjb2RvciBLaW5kIGZvciBhIEFQRFUgQ29tbWFuZFxuICovXG5leHBvcnQgY2xhc3MgQ29tbWFuZEFQRFUgaW1wbGVtZW50cyBLaW5kXG57XG4gIENMQTogbnVtYmVyOyAvLyA9IDA7XG4gIElOUzogbnVtYmVyO1xuICBQMTogbnVtYmVyO1xuICBQMjogbnVtYmVyO1xuICBkYXRhOiBCeXRlQXJyYXk7XG4gIExlOiBudW1iZXI7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gIGRldGFpbHM6IHN0cmluZztcblxuICAvKipcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqXG4gICAqIERlc2VyaWFsaXplIGZyb20gYSBKU09OIG9iamVjdFxuICAgKi9cbiAgY29uc3RydWN0b3IoIGF0dHJpYnV0ZXM/OiB7fSApXG4gIHtcbiAgICBLaW5kLmluaXRGaWVsZHMoIHRoaXMsIGF0dHJpYnV0ZXMgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXJpYWxpemF0aW9uLCByZXR1cm5zIGEgSlNPTiBvYmplY3RcbiAgICovXG4gIHB1YmxpYyB0b0pTT04oKToge31cbiAge1xuICAgIHJldHVybiB7XG4gICAgICBDTEE6IHRoaXMuQ0xBLFxuICAgICAgSU5TOiB0aGlzLklOUyxcbiAgICAgIFAxOiB0aGlzLlAxLFxuICAgICAgUDI6IHRoaXMuUDIsXG4gICAgICBkYXRhOiB0aGlzLmRhdGEgJiYgdGhpcy5kYXRhLmJhY2tpbmdBcnJheSxcbiAgICAgIExlOiB0aGlzLkxlLFxuICAgICAgZGVzY3JpcHRpb246IHRoaXMuZGVzY3JpcHRpb24sXG4gICAgICBkZXRhaWxzOiB0aGlzLmRldGFpbHNcbiAgICB9O1xuICB9XG5cbiAgcHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgZnVuY3Rpb24gaGV4MiggdmFsICkgeyByZXR1cm4gKCBcIjAwXCIgKyB2YWwudG9TdHJpbmcoIDE2ICkudG9VcHBlckNhc2UoKSApLnN1YnN0ciggLTIgKTsgfVxuXG4gICAgbGV0IHMgPSAnQ29tbWFuZEFQRFUgJztcbiAgICBzICs9ICAgICAnQ0xBPTB4JyArIGhleDIodGhpcy5DTEEpO1xuICAgIHMgKz0gJywnKydJTlM9MHgnICsgaGV4Mih0aGlzLklOUyk7XG4gICAgcyArPSAnLCcrJ1AxPTB4JyArIGhleDIodGhpcy5QMSk7XG4gICAgcyArPSAnLCcrJ1AyPTB4JyArIGhleDIodGhpcy5QMik7XG4gICAgaWYgKCB0aGlzLmRhdGEgJiYgdGhpcy5kYXRhLmxlbmd0aCApIHtcbiAgICAgIHMgKz0gJywnKydMYz0nICsgdGhpcy5MYztcbiAgICAgIHMgKz0gJywnKydEYXRhPScgKyB0aGlzLmRhdGEudG9TdHJpbmcoQnl0ZUFycmF5LkhFWCk7XG4gICAgfVxuICAgIGlmICggdGhpcy5MZSApXG4gICAgICBzICs9ICcsJysnTGU9JyArIHRoaXMuTGU7XG5cbiAgICBpZiAoIHRoaXMuZGVzY3JpcHRpb24gKVxuICAgICAgcyArPSAnICgnK3RoaXMuZGVzY3JpcHRpb24rJyknO1xuXG4gICAgcmV0dXJuIHM7XG4gIH1cblxuICBwdWJsaWMgZ2V0IExjKCk6bnVtYmVyICAgICAgICAgIHsgcmV0dXJuIHRoaXMuZGF0YS5sZW5ndGg7IH1cbiAgcHVibGljIGdldCBoZWFkZXIoKTogQnl0ZUFycmF5ICB7IHJldHVybiBuZXcgQnl0ZUFycmF5KCBbIHRoaXMuQ0xBLCB0aGlzLklOUywgdGhpcy5QMSwgdGhpcy5QMiBdICk7IH1cblxuICAvKipcbiAgICogRmx1ZW50IEJ1aWxkZXJcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgaW5pdCggQ0xBPzogbnVtYmVyLCBJTlM/OiBudW1iZXIsIFAxPzogbnVtYmVyLCBQMj86IG51bWJlciwgZGF0YT86IEJ5dGVBcnJheSApOiBDb21tYW5kQVBEVVxuICB7XG4gICAgcmV0dXJuICggbmV3IENvbW1hbmRBUERVKCkgKS5zZXQoIENMQSwgSU5TLCBQMSwgUDIsIGRhdGEgKTtcbiAgfVxuXG4gIHB1YmxpYyBzZXQoIENMQTogbnVtYmVyLCBJTlM6IG51bWJlciwgUDE6IG51bWJlciwgUDI6IG51bWJlciwgZGF0YT86IEJ5dGVBcnJheSApOiB0aGlzXG4gIHtcbiAgICB0aGlzLkNMQSA9IENMQTtcbiAgICB0aGlzLklOUyA9IElOUztcbiAgICB0aGlzLlAxID0gUDE7XG4gICAgdGhpcy5QMiA9IFAyO1xuICAgIHRoaXMuZGF0YSA9IGRhdGEgfHwgbmV3IEJ5dGVBcnJheSgpO1xuICAgIHRoaXMuTGUgPSB1bmRlZmluZWQ7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHB1YmxpYyBzZXRDTEEoIENMQTogbnVtYmVyICk6IHRoaXMgICAgICB7IHRoaXMuQ0xBID0gQ0xBOyByZXR1cm4gdGhpczsgfVxuICBwdWJsaWMgc2V0SU5TKCBJTlM6IG51bWJlciApOiB0aGlzICAgICAgeyB0aGlzLklOUyA9IElOUzsgcmV0dXJuIHRoaXM7IH1cbiAgcHVibGljIHNldFAxKCBQMTogbnVtYmVyICk6IHRoaXMgICAgICAgIHsgdGhpcy5QMSA9IFAxOyByZXR1cm4gdGhpczsgfVxuICBwdWJsaWMgc2V0UDIoIFAyOiBudW1iZXIgKTogdGhpcyAgICAgICAgeyB0aGlzLlAyID0gUDI7IHJldHVybiB0aGlzOyB9XG4gIHB1YmxpYyBzZXREYXRhKCBkYXRhOiBCeXRlQXJyYXkgKTogdGhpcyB7IHRoaXMuZGF0YSA9IGRhdGE7IHJldHVybiB0aGlzOyB9XG4gIHB1YmxpYyBzZXRMZSggTGU6IG51bWJlciApOiB0aGlzICAgICAgICB7IHRoaXMuTGUgPSBMZTsgcmV0dXJuIHRoaXM7IH1cbiAgcHVibGljIHNldERlc2NyaXB0aW9uKCBkZXNjcmlwdGlvbjogc3RyaW5nICk6IHRoaXMge1xuICAgIHRoaXMuZGVzY3JpcHRpb24gPSBkZXNjcmlwdGlvbjsgcmV0dXJuIHRoaXM7XG4gIH1cbiAgcHVibGljIHNldERldGFpbHMoIGRldGFpbHM6IHN0cmluZyApOiB0aGlzIHtcbiAgICB0aGlzLmRldGFpbHMgPSBkZXRhaWxzOyByZXR1cm4gdGhpcztcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEVuY29kZXJcbiAgICovXG4gIHB1YmxpYyBlbmNvZGVCeXRlcyggb3B0aW9ucz86IHt9ICk6IEJ5dGVBcnJheVxuICB7XG4gICAgbGV0IGRsZW4gPSAoICggdGhpcy5MYyA+IDAgKSA/IDEgKyB0aGlzLkxjIDogMCApO1xuICAgIGxldCBsZW4gPSA0ICsgZGxlbiArICggKCB0aGlzLkxlID4gMCApID8gMSA6IDAgKTtcbiAgICBsZXQgYmEgPSBuZXcgQnl0ZUFycmF5KCkuc2V0TGVuZ3RoKCBsZW4gKTtcblxuICAgIC8vIHJlYnVpbGQgYmluYXJ5IEFQRFVDb21tYW5kXG4gICAgYmEuc2V0Qnl0ZXNBdCggMCwgdGhpcy5oZWFkZXIgKTtcbiAgICBpZiAoIHRoaXMuTGMgKSB7XG4gICAgICBiYS5zZXRCeXRlQXQoIDQsIHRoaXMuTGMgKTtcbiAgICAgIGJhLnNldEJ5dGVzQXQoIDUsIHRoaXMuZGF0YSApO1xuICAgIH1cblxuICAgIGlmICggdGhpcy5MZSA+IDAgKSB7XG4gICAgICBiYS5zZXRCeXRlQXQoIDQgKyBkbGVuLCB0aGlzLkxlICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGJhO1xuICB9XG5cbiAgLyoqXG4gICogRGVjb2RlclxuICAqL1xuICBwdWJsaWMgZGVjb2RlQnl0ZXMoIGJ5dGVBcnJheTogQnl0ZUFycmF5LCBvcHRpb25zPzoge30gKTogdGhpc1xuICB7XG4gICAgaWYgKCBieXRlQXJyYXkubGVuZ3RoIDwgNCApXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoICdDb21tYW5kQVBEVTogSW52YWxpZCBidWZmZXInICk7XG5cbiAgICBsZXQgb2Zmc2V0ID0gMDtcblxuICAgIHRoaXMuQ0xBID0gYnl0ZUFycmF5LmJ5dGVBdCggb2Zmc2V0KysgKTtcbiAgICB0aGlzLklOUyA9IGJ5dGVBcnJheS5ieXRlQXQoIG9mZnNldCsrICk7XG4gICAgdGhpcy5QMSA9IGJ5dGVBcnJheS5ieXRlQXQoIG9mZnNldCsrICk7XG4gICAgdGhpcy5QMiA9IGJ5dGVBcnJheS5ieXRlQXQoIG9mZnNldCsrICk7XG5cbiAgICBpZiAoIGJ5dGVBcnJheS5sZW5ndGggPiBvZmZzZXQgKyAxIClcbiAgICB7XG4gICAgICB2YXIgTGMgPSBieXRlQXJyYXkuYnl0ZUF0KCBvZmZzZXQrKyApO1xuICAgICAgdGhpcy5kYXRhID0gYnl0ZUFycmF5LmJ5dGVzQXQoIG9mZnNldCwgTGMgKTtcbiAgICAgIG9mZnNldCArPSBMYztcbiAgICB9XG5cbiAgICBpZiAoIGJ5dGVBcnJheS5sZW5ndGggPiBvZmZzZXQgKVxuICAgICAgdGhpcy5MZSA9IGJ5dGVBcnJheS5ieXRlQXQoIG9mZnNldCsrICk7XG5cbiAgICBpZiAoIGJ5dGVBcnJheS5sZW5ndGggIT0gb2Zmc2V0IClcbiAgICAgIHRocm93IG5ldyBFcnJvciggJ0NvbW1hbmRBUERVOiBJbnZhbGlkIGJ1ZmZlcicgKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbktpbmRCdWlsZGVyLmluaXQoIENvbW1hbmRBUERVLCAnSVNPNzgxNiBDb21tYW5kIEFQRFUnIClcbiAgLmJ5dGVGaWVsZCggJ0NMQScsICdDbGFzcycgKVxuICAuYnl0ZUZpZWxkKCAnSU5TJywgJ0luc3RydWN0aW9uJyApXG4gIC5ieXRlRmllbGQoICdQMScsICdQMSBQYXJhbScgKVxuICAuYnl0ZUZpZWxkKCAnUDInLCAnUDIgUGFyYW0nIClcbiAgLnVpbnQzMkZpZWxkKCAnTGMnLCAnQ29tbWFuZCBMZW5ndGgnLCB7IGNhbGN1bGF0ZWQ6IHRydWUgfSApXG4gIC5maWVsZCggJ2RhdGEnLCAnQ29tbWFuZCBEYXRhJywgQnl0ZUFycmF5IClcbiAgLnVpbnQzMkZpZWxkKCAnTGUnLCAnRXhwZWN0ZWQgTGVuZ3RoJyApXG4gIC5zdHJpbmdGaWVsZCggJ2Rlc2NyaXB0aW9uJywgJ0Rlc2NyaXB0aW9uJywgeyAvKm9wdGlvbmFsOiB0cnVlKi8gfSApXG4gIC5zdHJpbmdGaWVsZCggJ2RldGFpbHMnLCAnRGV0YWlscycsIHsgLypvcHRpb25hbDogdHJ1ZSovIH0gKVxuICA7XG4iLCJleHBvcnQgZW51bSBJU083ODE2XHJcbntcclxuICAvLyBJU08gY2xhc3MgY29kZVxyXG4gIENMQV9JU08gPSAweDAwLFxyXG5cclxuICAvLyBFeHRlcm5hbCBleHRlcm5hbCBhdXRoZW50aWNhdGUgaW5zdHJ1Y3Rpb24gY29kZVxyXG4gIElOU19FWFRFUk5BTF9BVVRIRU5USUNBVEUgPSAweDgyLFxyXG5cclxuICAvLyBHZXQgY2hhbGxlbmdlIGluc3RydWN0aW9uIGNvZGVcclxuICBJTlNfR0VUX0NIQUxMRU5HRSA9IDB4ODQsXHJcblxyXG4gIC8vIEludGVybmFsIGF1dGhlbnRpY2F0ZSBpbnN0cnVjdGlvbiBjb2RlXHJcbiAgSU5TX0lOVEVSTkFMX0FVVEhFTlRJQ0FURSA9IDB4ODgsXHJcblxyXG4gIC8vIFNlbGVjdCBmaWxlIGluc3RydWN0aW9uIGNvZGVcclxuICBJTlNfU0VMRUNUX0ZJTEUgPSAweEE0LFxyXG5cclxuICAvLyBSZWFkIHJlY29yZCBpbnN0cnVjdGlvbiBjb2RlXHJcbiAgSU5TX1JFQURfUkVDT1JEID0gMHhCMixcclxuXHJcbiAgLy8gVXBkYXRlIHJlY29yZCBpbnN0cnVjdGlvbiBjb2RlXHJcbiAgSU5TX1VQREFURV9SRUNPUkQgPSAweERDLFxyXG5cclxuICAvLyBWZXJpZnkgaW5zdHJ1Y3Rpb24gY29kZVxyXG4gIElOU19WRVJJRlkgPSAweDIwLFxyXG5cclxuICAvLyBCbG9jayBBcHBsaWNhdGlvbiBpbnN0cnVjdGlvbiBjb2RlXHJcbiAgSU5TX0JMT0NLX0FQUExJQ0FUSU9OID0gMHgxRSxcclxuXHJcbiAgLy8gVW5ibG9jayBhcHBsaWNhdGlvbiBpbnN0cnVjdGlvbiBjb2RlXHJcbiAgSU5TX1VOQkxPQ0tfQVBQTElDQVRJT04gPSAweDE4LFxyXG5cclxuICAvLyBVbmJsb2NrIGNoYW5nZSBQSU4gaW5zdHJ1Y3Rpb24gY29kZVxyXG4gIElOU19VTkJMT0NLX0NIQU5HRV9QSU4gPSAweDI0LFxyXG5cclxuICAvLyBHZXQgZGF0YSBpbnN0cnVjdGlvbiBjb2RlXHJcbiAgSU5TX0dFVF9EQVRBID0gMHhDQSxcclxuXHJcbiAgLy8gQXBwbGljYXRpb24gVGVtcGxhdGVcclxuICBUQUdfQVBQTElDQVRJT05fVEVNUExBVEUgPSAweDYxLFxyXG5cclxuICAvLyBGQ0kgUHJvcHJpZXRhcnkgVGVtcGxhdGVcclxuICBUQUdfRkNJX1BST1BSSUVUQVJZX1RFTVBMQVRFID0gMHhBNSxcclxuXHJcbiAgLy8gRkNJIFRlbXBsYXRlXHJcbiAgVEFHX0ZDSV9URU1QTEFURSA9IDB4NkYsXHJcblxyXG4gIC8vIEFwcGxpY2F0aW9uIElkZW50aWZpZXIgKEFJRCkgLSBjYXJkXHJcbiAgVEFHX0FJRCA9IDB4NEYsXHJcblxyXG4gIC8vIEFwcGxpY2F0aW9uIExhYmVsXHJcbiAgVEFHX0FQUExJQ0FUSU9OX0xBQkVMID0gMHg1MCxcclxuXHJcbiAgLy8gTGFuZ3VhZ2UgUHJlZmVyZW5jZVxyXG4gIFRBR19MQU5HVUFHRV9QUkVGRVJFTkNFUyA9IDB4NUYyRCxcclxuXHJcbiAgLy8gQXBwbGljYXRpb24gRWZmZWN0aXZlIERhdGFcclxuICBUQUdfQVBQTElDQVRJT05fRUZGRUNUSVZFX0RBVEUgPSAweDVGMjUsXHJcblxyXG4gIC8vIEFwcGxpY2F0aW9uIEV4cGlyYXRpb24gRGF0ZVxyXG4gIFRBR19BUFBMSUNBVElPTl9FWFBJUllfREFURSA9IDB4NUYyNCxcclxuXHJcbiAgLy8gQ2FyZCBIb2xkZXIgTmFtZVxyXG4gIFRBR19DQVJESE9MREVSX05BTUUgPSAweDVGMjAsXHJcblxyXG4gIC8vIElzc3VlciBDb3VudHJ5IENvZGVcclxuICBUQUdfSVNTVUVSX0NPVU5UUllfQ09ERSA9IDB4NUYyOCxcclxuXHJcbiAgLy8gSXNzdWVyIFVSTFxyXG4gIFRBR19JU1NVRVJfVVJMID0gMHg1RjUwLFxyXG5cclxuICAvLyBBcHBsaWNhdGlvbiBQcmltYXJ5IEFjY291bnQgTnVtYmVyIChQQU4pXHJcbiAgVEFHX1BBTiA9IDB4NWEsXHJcblxyXG4gIC8vIEFwcGxpY2F0aW9uIFByaW1hcnkgQWNjb3VudCBOdW1iZXIgKFBBTikgU2VxdWVuY2UgTnVtYmVyXHJcbiAgVEFHX1BBTl9TRVFVRU5DRV9OVU1CRVIgPSAweDVGMzQsXHJcblxyXG4gIC8vIFNlcnZpY2UgQ29kZVxyXG4gIFRBR19TRVJWSUNFX0NPREUgPSAweDVGMzAsXHJcblxyXG4gIElTT19QSU5CTE9DS19TSVpFID0gOCwgICAvLzwgU2l6ZSBvZiBhbiBJU08gUElOIGJsb2NrXHJcblxyXG4gIEFQRFVfTEVOX0xFX01BWCA9IDI1NiwgICAvLzwgTWF4aW11bSBzaXplIGZvciBMZVxyXG5cclxuICBTV19TVUNDRVNTID0gMHg5MDAwLFxyXG4gIC8vICBTV19CWVRFU19SRU1BSU5JTkcoU1cyKSA9IDB4NjEjI1NXMixcclxuICBTV19XQVJOSU5HX05WX01FTU9SWV9VTkNIQU5HRUQgPSAweDYyMDAgLFxyXG4gIFNXX1BBUlRfT0ZfUkVUVVJOX0RBVEFfQ09SUlVQVEVEID0gMHg2MjgxLFxyXG4gIFNXX0VORF9GSUxFX1JFQUNIRURfQkVGT1JFX0xFX0JZVEUgPSAweDYyODIsXHJcbiAgU1dfU0VMRUNURURfRklMRV9JTlZBTElEID0gMHg2MjgzLFxyXG4gIFNXX0ZDSV9OT1RfRk9STUFUVEVEX1RPX0lTTyA9IDB4NjI4NCxcclxuICBTV19XQVJOSU5HX05WX01FTU9SWV9DSEFOR0VEID0gMHg2MzAwLFxyXG4gIFNXX0ZJTEVfRklMTEVEX0JZX0xBU1RfV1JJVEUgPSAweDYzODEsXHJcbiAgLy8gIFNXX0NPVU5URVJfUFJPVklERURfQllfWChYKSA9IDB4NjNDIyNYLFxyXG4gIC8vICBTV19FUlJPUl9OVl9NRU1PUllfVU5DSEFOR0VEKFNXMikgPSAweDY0IyNTVzIsXHJcbiAgLy8gIFNXX0VSUk9SX05WX01FTU9SWV9DSEFOR0VEKFNXMikgPSAweDY1IyNTVzIgLFxyXG4gIC8vICBTV19SRVNFUlZFRChTVzIpID0gMHg2NiMjU1cyLFxyXG4gIFNXX1dST05HX0xFTkdUSCA9IDB4NjcwMCAsXHJcbiAgU1dfRlVOQ1RJT05TX0lOX0NMQV9OT1RfU1VQUE9SVEVEID0gMHg2ODAwLFxyXG4gIFNXX0xPR0lDQUxfQ0hBTk5FTF9OT1RfU1VQUE9SVEVEID0gMHg2ODgxLFxyXG4gIFNXX1NFQ1VSRV9NRVNTQUdJTkdfTk9UX1NVUFBPUlRFRCA9IDB4Njg4MixcclxuICBTV19DT01NQU5EX05PVF9BTExPV0VEID0gMHg2OTAwLFxyXG4gIFNXX0NPTU1BTkRfSU5DT01QQVRJQkxFX1dJVEhfRklMRV9TVFJVQ1RVUkUgPSAweDY5ODEsXHJcbiAgU1dfU0VDVVJJVFlfU1RBVFVTX05PVF9TQVRJU0ZJRUQgPSAweDY5ODIsXHJcbiAgU1dfRklMRV9JTlZBTElEID0gMHg2OTgzLFxyXG4gIFNXX0RBVEFfSU5WQUxJRCA9IDB4Njk4NCxcclxuICBTV19DT05ESVRJT05TX05PVF9TQVRJU0ZJRUQgPSAweDY5ODUsXHJcbiAgU1dfQ09NTUFORF9OT1RfQUxMT1dFRF9BR0FJTiA9IDB4Njk4NixcclxuICBTV19FWFBFQ1RFRF9TTV9EQVRBX09CSkVDVFNfTUlTU0lORyA9IDB4Njk4NyAsXHJcbiAgU1dfU01fREFUQV9PQkpFQ1RTX0lOQ09SUkVDVCA9IDB4Njk4OCxcclxuICBTV19XUk9OR19QQVJBTVMgPSAweDZBMDAgICAsXHJcbiAgU1dfV1JPTkdfREFUQSA9IDB4NkE4MCxcclxuICBTV19GVU5DX05PVF9TVVBQT1JURUQgPSAweDZBODEsXHJcbiAgU1dfRklMRV9OT1RfRk9VTkQgPSAweDZBODIsXHJcbiAgU1dfUkVDT1JEX05PVF9GT1VORCA9IDB4NkE4MyxcclxuICBTV19OT1RfRU5PVUdIX1NQQUNFX0lOX0ZJTEUgPSAweDZBODQsXHJcbiAgU1dfTENfSU5DT05TSVNURU5UX1dJVEhfVExWID0gMHg2QTg1LFxyXG4gIFNXX0lOQ09SUkVDVF9QMVAyID0gMHg2QTg2LFxyXG4gIFNXX0xDX0lOQ09OU0lTVEVOVF9XSVRIX1AxUDIgPSAweDZBODcsXHJcbiAgU1dfUkVGRVJFTkNFRF9EQVRBX05PVF9GT1VORCA9IDB4NkE4OCxcclxuICBTV19XUk9OR19QMVAyID0gMHg2QjAwLFxyXG4gIC8vU1dfQ09SUkVDVF9MRU5HVEgoU1cyKSA9IDB4NkMjI1NXMixcclxuICBTV19JTlNfTk9UX1NVUFBPUlRFRCA9IDB4NkQwMCxcclxuICBTV19DTEFfTk9UX1NVUFBPUlRFRCA9IDB4NkUwMCxcclxuICBTV19VTktOT1dOID0gMHg2RjAwLFxyXG59XHJcbiIsImltcG9ydCB7IEJ5dGVBcnJheSwgS2luZCwgS2luZEluZm8sIEtpbmRCdWlsZGVyIH0gZnJvbSAnY3J5cHRvZ3JhcGhpeC1zaW0tY29yZSc7XG5pbXBvcnQgeyBJU083ODE2IH0gZnJvbSAnLi9pc283ODE2JztcblxuLyoqXG4gKiBFbmNvZGVyL0RlY29kb3IgZm9yIGEgQVBEVSBSZXNwb25zZVxuICovXG5leHBvcnQgY2xhc3MgUmVzcG9uc2VBUERVIGltcGxlbWVudHMgS2luZFxue1xuICBTVzogbnVtYmVyO1xuICBkYXRhOiBCeXRlQXJyYXk7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gIGRldGFpbHM6IHN0cmluZztcblxuICAvKipcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqXG4gICAqIERlc2VyaWFsaXplIGZyb20gYSBKU09OIG9iamVjdFxuICAgKi9cbiAgY29uc3RydWN0b3IoIGF0dHJpYnV0ZXM/OiB7fSApXG4gIHtcbiAgICBLaW5kLmluaXRGaWVsZHMoIHRoaXMsIGF0dHJpYnV0ZXMgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXJpYWxpemF0aW9uLCByZXR1cm5zIGEgSlNPTiBvYmplY3RcbiAgICovXG4gIHB1YmxpYyB0b0pTT04oKToge31cbiAge1xuICAgIHJldHVybiB7XG4gICAgICBkYXRhOiB0aGlzLmRhdGEgJiYgdGhpcy5kYXRhLmJhY2tpbmdBcnJheSxcbiAgICAgIFNXOiB0aGlzLlNXLFxuICAgICAgZGVzY3JpcHRpb246IHRoaXMuZGVzY3JpcHRpb24sXG4gICAgICBkZXRhaWxzOiB0aGlzLmRldGFpbHNcbiAgICB9O1xuICB9XG5cbiAgcHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgZnVuY3Rpb24gaGV4NCggdmFsICkgeyByZXR1cm4gKCBcIjAwMDBcIiArIHZhbC50b1N0cmluZyggMTYgKS50b1VwcGVyQ2FzZSgpICkuc3Vic3RyKCAtNCApOyB9XG5cbiAgICBsZXQgcyA9ICdSZXNwb25zZUFQRFUgJztcbiAgICBzICs9ICAgICAnU1c9MHgnICsgaGV4NCh0aGlzLlNXKTtcbiAgICBpZiAoIHRoaXMuZGF0YSAmJiB0aGlzLmRhdGEubGVuZ3RoICkge1xuICAgICAgcyArPSAnLCcrJ0xhPScgKyB0aGlzLkxhO1xuICAgICAgcyArPSAnLCcrJ0RhdGE9JyArIHRoaXMuZGF0YS50b1N0cmluZyhCeXRlQXJyYXkuSEVYKTtcbiAgICB9XG4gICAgaWYgKCB0aGlzLmRlc2NyaXB0aW9uIClcbiAgICAgIHMgKz0gJyAoJyt0aGlzLmRlc2NyaXB0aW9uKycpJztcblxuICAgIHJldHVybiBzO1xuICB9XG5cblxuICBwdWJsaWMgZ2V0IExhKCkgeyByZXR1cm4gdGhpcy5kYXRhLmxlbmd0aDsgfVxuXG4gIHB1YmxpYyBzdGF0aWMgaW5pdCggc3c6IG51bWJlciwgZGF0YT86IEJ5dGVBcnJheSApOiBSZXNwb25zZUFQRFVcbiAge1xuICAgIHJldHVybiAoIG5ldyBSZXNwb25zZUFQRFUoKSApLnNldCggc3csIGRhdGEgKTtcbiAgfVxuXG4gIHB1YmxpYyBzZXQoIHN3OiBudW1iZXIsIGRhdGE/OiBCeXRlQXJyYXkgKTogdGhpc1xuICB7XG4gICAgdGhpcy5TVyA9IHN3O1xuICAgIHRoaXMuZGF0YSA9IGRhdGEgfHwgbmV3IEJ5dGVBcnJheSgpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBwdWJsaWMgc2V0U1coIFNXOiBudW1iZXIgKTogdGhpcyAgICAgICAgeyB0aGlzLlNXID0gU1c7IHJldHVybiB0aGlzOyB9XG4gIHB1YmxpYyBzZXRTVzEoIFNXMTogbnVtYmVyICk6IHRoaXMgICAgICB7IHRoaXMuU1cgPSAoIHRoaXMuU1cgJiAweEZGICkgfCAoIFNXMSA8PCA4ICk7IHJldHVybiB0aGlzOyB9XG4gIHB1YmxpYyBzZXRTVzIoIFNXMjogbnVtYmVyICk6IHRoaXMgICAgICB7IHRoaXMuU1cgPSAoIHRoaXMuU1cgJiAweEZGMDAgKSB8IFNXMjsgcmV0dXJuIHRoaXM7IH1cbiAgcHVibGljIHNldERhdGEoIGRhdGE6IEJ5dGVBcnJheSApOiB0aGlzIHsgdGhpcy5kYXRhID0gZGF0YTsgcmV0dXJuIHRoaXM7IH1cbiAgcHVibGljIHNldERlc2NyaXB0aW9uKCBkZXNjcmlwdGlvbjogc3RyaW5nICk6IHRoaXMge1xuICAgIHRoaXMuZGVzY3JpcHRpb24gPSBkZXNjcmlwdGlvbjsgcmV0dXJuIHRoaXM7XG4gIH1cbiAgcHVibGljIHNldERldGFpbHMoIGRldGFpbHM6IHN0cmluZyApOiB0aGlzIHtcbiAgICB0aGlzLmRldGFpbHMgPSBkZXRhaWxzOyByZXR1cm4gdGhpcztcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEVuY29kZXIgZnVuY3Rpb24sIHJldHVybnMgYSBibG9iIGZyb20gYW4gQVBEVVJlc3BvbnNlIG9iamVjdFxuICAgKi9cbiAgcHVibGljIGVuY29kZUJ5dGVzKCBvcHRpb25zPzoge30gKTogQnl0ZUFycmF5XG4gIHtcbiAgICBsZXQgYmEgPSBuZXcgQnl0ZUFycmF5KCkuc2V0TGVuZ3RoKCB0aGlzLkxhICsgMiApO1xuXG4gICAgYmEuc2V0Qnl0ZXNBdCggMCwgdGhpcy5kYXRhICk7XG4gICAgYmEuc2V0Qnl0ZUF0KCB0aGlzLkxhICAgICwgKCB0aGlzLlNXID4+IDggKSAmIDB4ZmYgKTtcbiAgICBiYS5zZXRCeXRlQXQoIHRoaXMuTGEgKyAxLCAoIHRoaXMuU1cgPj4gMCApICYgMHhmZiApO1xuXG4gICAgcmV0dXJuIGJhO1xuICB9XG5cbiAgcHVibGljIGRlY29kZUJ5dGVzKCBieXRlQXJyYXk6IEJ5dGVBcnJheSwgb3B0aW9ucz86IHt9ICk6IHRoaXNcbiAge1xuICAgIGlmICggYnl0ZUFycmF5Lmxlbmd0aCA8IDIgKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCAnUmVzcG9uc2VBUERVIEJ1ZmZlciBpbnZhbGlkJyApO1xuXG4gICAgbGV0IGxhID0gYnl0ZUFycmF5Lmxlbmd0aCAtIDI7XG5cbiAgICB0aGlzLlNXID0gYnl0ZUFycmF5LndvcmRBdCggbGEgKTtcbiAgICB0aGlzLmRhdGEgPSAoIGxhICkgPyBieXRlQXJyYXkuYnl0ZXNBdCggMCwgbGEgKSA6IG5ldyBCeXRlQXJyYXkoKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbktpbmRCdWlsZGVyLmluaXQoIFJlc3BvbnNlQVBEVSwgJ0lTTzc4MTYgUmVzcG9uc2UgQVBEVScgKVxuICAudWludDMyRmllbGQoICdTVycsICdTdGF0dXMgV29yZCcgKVxuICAudWludDMyRmllbGQoICdMYScsICdBY3R1YWwgTGVuZ3RoJywgIHsgY2FsY3VsYXRlZDogdHJ1ZSB9IClcbiAgLmZpZWxkKCAnZGF0YScsICdSZXNwb25zZSBEYXRhJywgQnl0ZUFycmF5IClcbiAgLnN0cmluZ0ZpZWxkKCAnZGVzY3JpcHRpb24nLCAnRGVzY3JpcHRpb24nLCB7IC8qb3B0aW9uYWw6IHRydWUqLyB9IClcbiAgLnN0cmluZ0ZpZWxkKCAnZGV0YWlscycsICdEZXRhaWxzJywgeyAvKm9wdGlvbmFsOiB0cnVlKi8gfSApXG4gIDtcbiIsbnVsbCwiaW1wb3J0IHsgQnl0ZUFycmF5LCBFbmRQb2ludCwgTWVzc2FnZSwgTWVzc2FnZUhlYWRlciwgRGlyZWN0aW9uLCBDaGFubmVsLCBQcm90b2NvbCB9IGZyb20gJ2NyeXB0b2dyYXBoaXgtc2ltLWNvcmUnO1xuXG5pbXBvcnQgeyBTbG90IH0gZnJvbSAnLi4vaXNvNzgxNi9zbG90JztcbmltcG9ydCB7IENvbW1hbmRBUERVIH0gZnJvbSAnLi4vaXNvNzgxNi9jb21tYW5kLWFwZHUnO1xuaW1wb3J0IHsgUmVzcG9uc2VBUERVIH0gZnJvbSAnLi4vaXNvNzgxNi9yZXNwb25zZS1hcGR1JztcblxuZXhwb3J0IGNsYXNzIFNsb3RQcm90b2NvbCBpbXBsZW1lbnRzIFByb3RvY29sPFNsb3Q+IHtcbiAgc3RhdGljIGdldEhhbmRsZXIoKTogU2xvdFByb3RvY29sSGFuZGxlciB7XG4gICAgcmV0dXJuIG5ldyBTbG90UHJvdG9jb2xIYW5kbGVyKCk7XG4gIH1cblxuICBzdGF0aWMgZ2V0UHJveHkoIGVuZFBvaW50OiBFbmRQb2ludCApOiBTbG90UHJvdG9jb2xQcm94eSB7XG4gICAgcmV0dXJuIG5ldyBTbG90UHJvdG9jb2xQcm94eSggZW5kUG9pbnQgKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgU2xvdFByb3RvY29sUHJveHkgaW1wbGVtZW50cyBTbG90IHtcbiAgZW5kUG9pbnQ6IEVuZFBvaW50O1xuICBwZW5kaW5nOiBhbnk7XG5cbiAgcHJpdmF0ZSBwb3dlckNvbW1hbmQoIG1ldGhvZDogc3RyaW5nICk6IFByb21pc2U8Qnl0ZUFycmF5PiB7XG4gICAgbGV0IG1lID0gdGhpcztcbiAgICByZXR1cm4gbmV3IFByb21pc2U8Qnl0ZUFycmF5PiggKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgbWUucGVuZGluZyA9IHtcbiAgICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICAgIHJlc29sdmU6IHJlc29sdmUsXG4gICAgICAgIHJlamVjdDogcmVqZWN0XG4gICAgICB9O1xuXG4gICAgICBtZS5lbmRQb2ludC5zZW5kTWVzc2FnZSggbmV3IE1lc3NhZ2U8dm9pZD4oIHsgbWV0aG9kOiBtZXRob2QgfSwgbnVsbCApICk7XG4gICAgfSk7XG4gIH1cblxuICBjb25zdHJ1Y3RvciggZW5kUG9pbnQ6IEVuZFBvaW50ICkge1xuICAgIHRoaXMuZW5kUG9pbnQgPSBlbmRQb2ludDtcblxuICAgIC8vIE5hc3R5IHBsdW1iaW5nIC4uIGVhY2ggcHJveHktY29tbWFuZCB3aWxsIHNldCBwZW5kaW5nIHRvIGNvbnRhaW5lclxuICAgIC8vICAgLSBtZXRob2QgY2FsbGVkIChwb3dlck9uLCBwb3dlck9mZiwgcmVzZXQsIGV4ZWN1dGVBUERVIClcbiAgICAvLyAgIC0gcmVzb2x2ZSBjYWxsYmFjayAoZnJvbSBwcm9taXNlKSAtIHJlY2VpdmVzIHRoZSBwYXlsb2FkXG4gICAgLy8gICAtIHJlamVjdCBjYWxsYmFjayAoZnJvbSBwcm9taXNlKVxuICAgIC8vIFdoZW4gdGhlIGVuZC1wb2ludCByZWNlaXZlcyBhIG1lc3NhZ2UgKHJlc3BvbnNlKSwgY2hlY2sgbWV0aG9kXG4gICAgLy8gYW5kIGlmIGl0IG1hdGNoZXMgdGhlIHBlbmRpbmctb3AsIHJlc29sdmUgdGhlIHByb21pc2VcbiAgICAvLyBvdGhlcndpc2UgcmVqZWN0IGl0XG4gICAgbGV0IG1lID0gdGhpcztcbiAgICBlbmRQb2ludC5vbk1lc3NhZ2UoICggbXNnICkgPT4ge1xuICAgICAgbGV0IHBlbmRpbmdPcCA9IG1lLnBlbmRpbmc7XG5cbiAgICAgIGlmICggcGVuZGluZ09wICkge1xuICAgICAgICBpZiAoIG1zZy5oZWFkZXIuaXNSZXNwb25zZSAmJiAoIG1zZy5oZWFkZXIubWV0aG9kID09IHBlbmRpbmdPcC5tZXRob2QgKSApIHtcbiAgICAgICAgICBwZW5kaW5nT3AucmVzb2x2ZSggbXNnLnBheWxvYWQgKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgcGVuZGluZ09wLnJlamVjdCggbXNnLnBheWxvYWQgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcG93ZXJPbigpOiBQcm9taXNlPEJ5dGVBcnJheT4ge1xuICAgIHJldHVybiB0aGlzLnBvd2VyQ29tbWFuZCggJ3Bvd2VyT24nICk7XG4gIH1cbiAgcmVzZXQoKTogUHJvbWlzZTxCeXRlQXJyYXk+IHtcbiAgICByZXR1cm4gdGhpcy5wb3dlckNvbW1hbmQoICdyZXNldCcgKTtcbiAgfVxuICBwb3dlck9mZigpOiBQcm9taXNlPEJ5dGVBcnJheT4ge1xuICAgIHJldHVybiB0aGlzLnBvd2VyQ29tbWFuZCggJ3Bvd2VyT2ZmJyApO1xuICB9XG4gIGdldCBpc1ByZXNlbnQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGdldCBpc1Bvd2VyZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZXhlY3V0ZUFQRFUoIGNtZDogQ29tbWFuZEFQRFUgKTogUHJvbWlzZTxSZXNwb25zZUFQRFU+IHtcbiAgICBsZXQgbWUgPSB0aGlzO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxSZXNwb25zZUFQRFU+KCAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBtZS5wZW5kaW5nID0ge1xuICAgICAgICBtZXRob2Q6ICdleGVjdXRlQVBEVScsXG4gICAgICAgIHJlc29sdmU6IHJlc29sdmUsXG4gICAgICAgIHJlamVjdDogcmVqZWN0XG4gICAgICB9O1xuXG4gICAgICBtZS5lbmRQb2ludC5zZW5kTWVzc2FnZSggbmV3IE1lc3NhZ2U8Q29tbWFuZEFQRFU+KCB7IG1ldGhvZDogJ2V4ZWN1dGVBUERVJyB9LCBjbWQgKSApO1xuICAgIH0pO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTbG90UHJvdG9jb2xIYW5kbGVyIHtcblxuICBlbmRQb2ludDogRW5kUG9pbnQ7XG4gIHNsb3Q6IFNsb3Q7XG5cbiAgY29uc3RydWN0b3IoKVxuICB7XG4gIH1cblxuICBsaW5rU2xvdCggc2xvdDogU2xvdCwgZW5kUG9pbnQ6IEVuZFBvaW50IClcbiAge1xuICAgIGxldCBtZSA9IHRoaXM7XG5cbiAgICB0aGlzLmVuZFBvaW50ID0gZW5kUG9pbnQ7XG4gICAgdGhpcy5zbG90ID0gc2xvdDtcblxuICAgIGVuZFBvaW50Lm9uTWVzc2FnZSggKCBtc2csIGVwICkgPT4ge1xuICAgICAgbWUub25NZXNzYWdlKCBtc2csZXAgKTtcbiAgICB9ICk7XG4gIH1cblxuICB1bmxpbmtTbG90KClcbiAge1xuICAgIHRoaXMuZW5kUG9pbnQub25NZXNzYWdlKCBudWxsICk7XG4gICAgdGhpcy5lbmRQb2ludCA9IG51bGw7XG4gICAgdGhpcy5zbG90ID0gbnVsbDtcbiAgfVxuXG4gIG9uTWVzc2FnZSggcGFja2V0OiBNZXNzYWdlPGFueT4sIHJlY2VpdmluZ0VuZFBvaW50OiBFbmRQb2ludCApXG4gIHtcbiAgICBsZXQgaGRyOiBhbnkgPSBwYWNrZXQuaGVhZGVyO1xuICAgIGxldCBwYXlsb2FkID0gcGFja2V0LnBheWxvYWQ7XG5cbiAgICBsZXQgcmVzcG9uc2U6IFByb21pc2U8YW55PjtcbiAgICBsZXQgcmVwbHlIZWFkZXIgPSB7IG1ldGhvZDogaGRyLm1ldGhvZCwgaXNSZXNwb25zZTogdHJ1ZSB9O1xuXG4gICAgc3dpdGNoKCBoZHIubWV0aG9kIClcbiAgICB7XG4gICAgICBjYXNlIFwiZXhlY3V0ZUFQRFVcIjpcbiAgICAgICAgaWYgKCAhKCBwYXlsb2FkIGluc3RhbmNlb2YgQ29tbWFuZEFQRFUgKSApXG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgcmVzcG9uc2UgPSB0aGlzLnNsb3QuZXhlY3V0ZUFQRFUoIDxDb21tYW5kQVBEVT5wYXlsb2FkICk7XG5cbiAgICAgICAgcmVzcG9uc2UudGhlbiggKCByZXNwb25zZUFQRFU6IFJlc3BvbnNlQVBEVSApID0+IHtcbiAgICAgICAgICBsZXQgcmVwbHlQYWNrZXQgPSBuZXcgTWVzc2FnZTxSZXNwb25zZUFQRFU+KCByZXBseUhlYWRlciwgcmVzcG9uc2VBUERVICk7XG5cbiAgICAgICAgICByZWNlaXZpbmdFbmRQb2ludC5zZW5kTWVzc2FnZSggcmVwbHlQYWNrZXQgKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFwicG93ZXJPZmZcIjpcbiAgICAgICAgcmVzcG9uc2UgPSB0aGlzLnNsb3QucG93ZXJPZmYoKVxuICAgICAgICAgIC50aGVuKCAoIHJlc3BEYXRhOiBCeXRlQXJyYXkgKT0+IHtcbiAgICAgICAgICAgIHJlY2VpdmluZ0VuZFBvaW50LnNlbmRNZXNzYWdlKCBuZXcgTWVzc2FnZTxCeXRlQXJyYXk+KCByZXBseUhlYWRlciwgbmV3IEJ5dGVBcnJheSgpICkgKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgXCJwb3dlck9uXCI6XG4gICAgICAgIHJlc3BvbnNlID0gdGhpcy5zbG90LnBvd2VyT24oKVxuICAgICAgICAgIC50aGVuKCAoIHJlc3BEYXRhOiBCeXRlQXJyYXkgKT0+IHtcbiAgICAgICAgICAgIHJlY2VpdmluZ0VuZFBvaW50LnNlbmRNZXNzYWdlKCBuZXcgTWVzc2FnZTxCeXRlQXJyYXk+KCByZXBseUhlYWRlciwgcmVzcERhdGEgKSApO1xuICAgICAgICAgIH0pO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBcInJlc2V0XCI6XG4gICAgICAgIHJlc3BvbnNlID0gdGhpcy5zbG90LnJlc2V0KClcbiAgICAgICAgICAudGhlbiggKCByZXNwRGF0YTogQnl0ZUFycmF5ICk9PiB7XG4gICAgICAgICAgICByZWNlaXZpbmdFbmRQb2ludC5zZW5kTWVzc2FnZSggbmV3IE1lc3NhZ2U8Qnl0ZUFycmF5PiggcmVwbHlIZWFkZXIsIHJlc3BEYXRhICkgKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJlc3BvbnNlID0gUHJvbWlzZS5yZWplY3Q8RXJyb3I+KCBuZXcgRXJyb3IoIFwiSW52YWxpZCBtZXRob2RcIiArIGhkci5tZXRob2QgKSApO1xuICAgICAgICBicmVhaztcbiAgICB9IC8vIHN3aXRjaFxuXG4gICAgLy8gdHJhcCBhbmQgcmV0dXJuIGFueSBlcnJvcnNcbiAgICByZXNwb25zZS5jYXRjaCggKCBlOiBhbnkgKSA9PiB7XG4gICAgICBsZXQgZXJyb3JQYWNrZXQgPSBuZXcgTWVzc2FnZTxFcnJvcj4oIHsgbWV0aG9kOiBcImVycm9yXCIgfSwgZSApO1xuXG4gICAgICByZWNlaXZpbmdFbmRQb2ludC5zZW5kTWVzc2FnZSggZXJyb3JQYWNrZXQgKTtcbiAgICB9KTtcbiAgfVxufVxuIiwiaW1wb3J0IHsgQnl0ZUFycmF5IH0gZnJvbSAnY3J5cHRvZ3JhcGhpeC1zaW0tY29yZSc7XHJcblxyXG5jbGFzcyBKU1NpbXVsYXRlZFNsb3Rcclxue1xyXG4gIGNhcmRXb3JrZXI7XHJcbiAgb25BUERVUmVzcG9uc2U7XHJcbiAgc3RvcDtcclxuXHJcbiAgT25NZXNzYWdlKGUpXHJcbiAge1xyXG4gICAgaWYgKHRoaXMuc3RvcCkgcmV0dXJuO1xyXG5cclxuICAgIGlmIChlLmRhdGEuY29tbWFuZCA9PSBcImRlYnVnXCIpXHJcbiAgICB7XHJcbiAgICAgIGNvbnNvbGUubG9nKGUuZGF0YS5kYXRhKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKGUuZGF0YS5jb21tYW5kID09IFwiZXhlY3V0ZUFQRFVcIilcclxuICAgIHtcclxuICAgICAgLy8gY29uc29sZS5sb2coIG5ldyBCeXRlU3RyaW5nKCBlLmRhdGEuZGF0YSApLnRvU3RyaW5nKCkgKTtcclxuXHJcbiAgICAgIGlmICggdGhpcy5vbkFQRFVSZXNwb25zZSApXHJcbiAgICAgIHtcclxuICAgICAgICB2YXIgYnMgPSA8VWludDhBcnJheT5lLmRhdGEuZGF0YSwgbGVuID0gYnMubGVuZ3RoO1xyXG5cclxuICAgICAgICB0aGlzLm9uQVBEVVJlc3BvbnNlKCAoIGJzWyBsZW4gLSAyIF0gPDwgOCApIHwgYnNbIGxlbiAtIDEgXSwgKCBsZW4gPiAyICkgPyBuZXcgQnl0ZUFycmF5KCBicy5zdWJhcnJheSggMCwgbGVuLTIgKSApIDogbnVsbCApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlXHJcbiAgICB7XHJcbiAgICAgIGNvbnNvbGUubG9nKCBcImNtZDogXCIgKyBlLmRhdGEuY29tbWFuZCArIFwiIGRhdGE6IFwiICsgZS5kYXRhLmRhdGEgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGluaXQoKVxyXG4gIHtcclxuICAgIHRoaXMuY2FyZFdvcmtlciA9IG5ldyBXb3JrZXIoIFwianMvU21hcnRDYXJkU2xvdFNpbXVsYXRvci9TbWFydENhcmRTbG90V29ya2VyLmpzXCIgKTtcclxuICAgIHRoaXMuY2FyZFdvcmtlci5vbm1lc3NhZ2UgPSB0aGlzLk9uTWVzc2FnZS5iaW5kKCB0aGlzICk7XHJcblxyXG4gICAgdGhpcy5jYXJkV29ya2VyLm9uZXJyb3IgPSBmdW5jdGlvbihlOiBFdmVudClcclxuICAgIHtcclxuICAgICAgLy9hbGVydCggXCJFcnJvciBhdCBcIiArIGUuZmlsZW5hbWUgKyBcIjpcIiArIGUubGluZW5vICsgXCI6IFwiICsgZS5tZXNzYWdlICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBzZW5kVG9Xb3JrZXIoIGNvbW1hbmQsIGRhdGEgKVxyXG4gIHtcclxuICAgIHRoaXMuY2FyZFdvcmtlci5wb3N0TWVzc2FnZShcclxuICAgICAge1xyXG4gICAgICAgIFwiY29tbWFuZFwiOiBjb21tYW5kLFxyXG4gICAgICAgIFwiZGF0YVwiOiBkYXRhXHJcbiAgICAgIH1cclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBleGVjdXRlQVBEVUNvbW1hbmQoIGJDTEEsIGJJTlMsIGJQMSwgYlAyLCBjb21tYW5kRGF0YSwgd0xlLCBvbkFQRFVSZXNwb25zZSApXHJcbiAge1xyXG4gICAgdmFyIGNtZCA9IFsgYkNMQSwgYklOUywgYlAxLCBiUDIgXTtcclxuICAgIHZhciBsZW4gPSA0O1xyXG4gICAgdmFyIGJzQ29tbWFuZERhdGEgPSAoIGNvbW1hbmREYXRhIGluc3RhbmNlb2YgQnl0ZUFycmF5ICkgPyBjb21tYW5kRGF0YSA6IG5ldyBCeXRlQXJyYXkoIGNvbW1hbmREYXRhLCBCeXRlQXJyYXkuSEVYICk7XHJcbiAgICBpZiAoIGJzQ29tbWFuZERhdGEubGVuZ3RoID4gMCApXHJcbiAgICB7XHJcbiAgICAgIGNtZFtsZW4rK10gPSBic0NvbW1hbmREYXRhLmxlbmd0aDtcclxuICAgICAgZm9yKCB2YXIgaSA9IDA7IGkgPCBic0NvbW1hbmREYXRhLmxlbmd0aDsgKytpIClcclxuICAgICAgICBjbWRbbGVuKytdID0gYnNDb21tYW5kRGF0YS5ieXRlQXQoIGkgKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCB3TGUgIT0gdW5kZWZpbmVkIClcclxuICAgICAgICBjbWRbbGVuKytdID0gd0xlICYgMHhGRjtcclxuXHJcbiAgICB0aGlzLnNlbmRUb1dvcmtlciggXCJleGVjdXRlQVBEVVwiLCBjbWQgKTtcclxuXHJcbiAgICB0aGlzLm9uQVBEVVJlc3BvbnNlID0gb25BUERVUmVzcG9uc2U7XHJcblxyXG4gICAgLy8gb24gc3VjY2Vzcy9mYWlsdXJlLCB3aWxsIGNhbGxiYWNrXHJcbiAgICAvLyBpZiAoIHJlc3AgPT0gbnVsbCApXHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG59XHJcbiIsbnVsbCwiaW1wb3J0IHsgSVNPNzgxNiB9IGZyb20gJy4uL2lzbzc4MTYvSVNPNzgxNic7XHJcbmltcG9ydCB7IENvbW1hbmRBUERVIH0gZnJvbSAnLi4vaXNvNzgxNi9jb21tYW5kLWFwZHUnO1xyXG5pbXBvcnQgeyBSZXNwb25zZUFQRFUgfSBmcm9tICcuLi9pc283ODE2L3Jlc3BvbnNlLWFwZHUnO1xyXG5cclxuZXhwb3J0IGNsYXNzIEpTSU1TY3JpcHRBcHBsZXRcclxue1xyXG4gIHNlbGVjdEFwcGxpY2F0aW9uKCBjb21tYW5kQVBEVTogQ29tbWFuZEFQRFUgKTogUHJvbWlzZTxSZXNwb25zZUFQRFU+XHJcbiAge1xyXG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZTxSZXNwb25zZUFQRFU+KCBuZXcgUmVzcG9uc2VBUERVKCB7IHN3OiAweDkwMDAgfSApICk7XHJcbiAgfVxyXG5cclxuICBkZXNlbGVjdEFwcGxpY2F0aW9uKClcclxuICB7XHJcbiAgfVxyXG5cclxuICBleGVjdXRlQVBEVSggY29tbWFuZEFQRFU6IENvbW1hbmRBUERVICk6IFByb21pc2U8UmVzcG9uc2VBUERVPlxyXG4gIHtcclxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmU8UmVzcG9uc2VBUERVPiggbmV3IFJlc3BvbnNlQVBEVSggeyBzdzogMHg2RDAwIH0gKSApO1xyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgeyBCeXRlQXJyYXkgfSBmcm9tICdjcnlwdG9ncmFwaGl4LXNpbS1jb3JlJztcblxuaW1wb3J0IHsgSVNPNzgxNiB9IGZyb20gJy4uL2lzbzc4MTYvSVNPNzgxNic7XG5pbXBvcnQgeyBDb21tYW5kQVBEVSB9IGZyb20gJy4uL2lzbzc4MTYvY29tbWFuZC1hcGR1JztcbmltcG9ydCB7IFJlc3BvbnNlQVBEVSB9IGZyb20gJy4uL2lzbzc4MTYvcmVzcG9uc2UtYXBkdSc7XG5cbmltcG9ydCB7IEpTSU1DYXJkIH0gZnJvbSAnLi9qc2ltLWNhcmQnO1xuaW1wb3J0IHsgSlNJTVNjcmlwdEFwcGxldCB9IGZyb20gJy4vanNpbS1zY3JpcHQtYXBwbGV0JztcblxuZXhwb3J0IGNsYXNzIEpTSU1TY3JpcHRDYXJkIGltcGxlbWVudHMgSlNJTUNhcmRcbntcbiAgcHJpdmF0ZSBfcG93ZXJJc09uOiBib29sZWFuO1xuICBwcml2YXRlIF9hdHI6IEJ5dGVBcnJheTtcblxuICBhcHBsZXRzOiB7IGFpZDogQnl0ZUFycmF5LCBhcHBsZXQ6IEpTSU1TY3JpcHRBcHBsZXQgfVtdID0gW107XG5cbiAgc2VsZWN0ZWRBcHBsZXQ6IEpTSU1TY3JpcHRBcHBsZXQ7XG5cbiAgY29uc3RydWN0b3IoKVxuICB7XG4gICAgdGhpcy5fYXRyID0gbmV3IEJ5dGVBcnJheSggW10gKTtcbiAgfVxuXG4gIGxvYWRBcHBsaWNhdGlvbiggYWlkOiBCeXRlQXJyYXksIGFwcGxldDogSlNJTVNjcmlwdEFwcGxldCApXG4gIHtcbiAgICB0aGlzLmFwcGxldHMucHVzaCggeyBhaWQ6IGFpZCwgYXBwbGV0OiBhcHBsZXQgfSApO1xuICB9XG5cbiAgZ2V0IGlzUG93ZXJlZCgpOiBib29sZWFuXG4gIHtcbiAgICByZXR1cm4gdGhpcy5fcG93ZXJJc09uO1xuICB9XG5cbiAgcG93ZXJPbigpOiBQcm9taXNlPEJ5dGVBcnJheT5cbiAge1xuICAgIHRoaXMuX3Bvd2VySXNPbiA9IHRydWU7XG5cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlPEJ5dGVBcnJheT4oIHRoaXMuX2F0ciApO1xuICB9XG5cbiAgcG93ZXJPZmYoKTogUHJvbWlzZTxhbnk+XG4gIHtcbiAgICB0aGlzLl9wb3dlcklzT24gPSBmYWxzZTtcblxuICAgIHRoaXMuc2VsZWN0ZWRBcHBsZXQgPSB1bmRlZmluZWQ7XG5cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gIH1cblxuICByZXNldCgpOiBQcm9taXNlPEJ5dGVBcnJheT5cbiAge1xuICAgIHRoaXMuX3Bvd2VySXNPbiA9IHRydWU7XG5cbiAgICB0aGlzLnNlbGVjdGVkQXBwbGV0ID0gdW5kZWZpbmVkO1xuXG4gICAgLy8gVE9ETzogUmVzZXRcblxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmU8Qnl0ZUFycmF5PiggdGhpcy5fYXRyICk7XG4gIH1cblxuICBleGNoYW5nZUFQRFUoIGNvbW1hbmRBUERVOiBDb21tYW5kQVBEVSApOiBQcm9taXNlPFJlc3BvbnNlQVBEVT5cbiAge1xuICAgIGlmICggY29tbWFuZEFQRFUuSU5TID09IDB4QTQgKVxuICAgIHtcbiAgICAgIGlmICggdGhpcy5zZWxlY3RlZEFwcGxldCApXG4gICAgICB7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWRBcHBsZXQuZGVzZWxlY3RBcHBsaWNhdGlvbigpO1xuXG4gICAgICAgIHRoaXMuc2VsZWN0ZWRBcHBsZXQgPSB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICAgIC8vVE9ETzogTG9va3VwIEFwcGxpY2F0aW9uXG4gICAgICB0aGlzLnNlbGVjdGVkQXBwbGV0ID0gdGhpcy5hcHBsZXRzWyAwIF0uYXBwbGV0O1xuXG4gICAgICByZXR1cm4gdGhpcy5zZWxlY3RlZEFwcGxldC5zZWxlY3RBcHBsaWNhdGlvbiggY29tbWFuZEFQRFUgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5zZWxlY3RlZEFwcGxldC5leGVjdXRlQVBEVSggY29tbWFuZEFQRFUgKTtcbiAgfVxufVxuIiwiaW1wb3J0IHsgQnl0ZUFycmF5IH0gZnJvbSAnY3J5cHRvZ3JhcGhpeC1zaW0tY29yZSc7XG5cbmltcG9ydCB7IFNsb3QgfSBmcm9tICcuLi9pc283ODE2L3Nsb3QnO1xuaW1wb3J0IHsgQ29tbWFuZEFQRFUgfSBmcm9tICcuLi9pc283ODE2L2NvbW1hbmQtYXBkdSc7XG5pbXBvcnQgeyBSZXNwb25zZUFQRFUgfSBmcm9tICcuLi9pc283ODE2L3Jlc3BvbnNlLWFwZHUnO1xuaW1wb3J0IHsgSlNJTUNhcmQgfSBmcm9tICcuL2pzaW0tY2FyZCc7XG5cbmV4cG9ydCBjbGFzcyBKU0lNU2xvdCBpbXBsZW1lbnRzIFNsb3RcbntcbiAgcHVibGljIGNhcmQ6IEpTSU1DYXJkO1xuXG4gIGNvbnN0cnVjdG9yKCBjYXJkPzogSlNJTUNhcmQgKVxuICB7XG4gICAgdGhpcy5jYXJkID0gY2FyZDtcbiAgfVxuXG4gIGdldCBpc1ByZXNlbnQoKTogYm9vbGVhblxuICB7XG4gICAgcmV0dXJuICEhdGhpcy5jYXJkO1xuICB9XG5cbiAgZ2V0IGlzUG93ZXJlZCgpOiBib29sZWFuXG4gIHtcbiAgICByZXR1cm4gdGhpcy5pc1ByZXNlbnQgJiYgdGhpcy5jYXJkLmlzUG93ZXJlZDtcbiAgfVxuXG4gIHBvd2VyT24oKTogUHJvbWlzZTxCeXRlQXJyYXk+XG4gIHtcbiAgICBpZiAoICF0aGlzLmlzUHJlc2VudCApXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3Q8Qnl0ZUFycmF5PiggbmV3IEVycm9yKCBcIkpTSU06IENhcmQgbm90IHByZXNlbnRcIiApICk7XG5cbiAgICByZXR1cm4gdGhpcy5jYXJkLnBvd2VyT24oKTtcbiAgfVxuXG4gIHBvd2VyT2ZmKCk6IFByb21pc2U8Qnl0ZUFycmF5PlxuICB7XG4gICAgaWYgKCAhdGhpcy5pc1ByZXNlbnQgKVxuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0PEJ5dGVBcnJheT4oIG5ldyBFcnJvciggXCJKU0lNOiBDYXJkIG5vdCBwcmVzZW50XCIgKSApO1xuXG4gICAgcmV0dXJuIHRoaXMuY2FyZC5wb3dlck9mZigpO1xuICB9XG5cbiAgcmVzZXQoKTogUHJvbWlzZTxCeXRlQXJyYXk+XG4gIHtcbiAgICBpZiAoICF0aGlzLmlzUHJlc2VudCApXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3Q8Qnl0ZUFycmF5PiggbmV3IEVycm9yKCBcIkpTSU06IENhcmQgbm90IHByZXNlbnRcIiApICk7XG5cbiAgICByZXR1cm4gdGhpcy5jYXJkLnJlc2V0KCk7XG4gIH1cblxuICBleGVjdXRlQVBEVSggY29tbWFuZEFQRFU6IENvbW1hbmRBUERVICk6IFByb21pc2U8UmVzcG9uc2VBUERVPlxuICB7XG4gICAgaWYgKCAhdGhpcy5pc1ByZXNlbnQgKVxuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0PFJlc3BvbnNlQVBEVT4oIG5ldyBFcnJvciggXCJKU0lNOiBDYXJkIG5vdCBwcmVzZW50XCIgKSApO1xuXG4gICAgaWYgKCAhdGhpcy5pc1Bvd2VyZWQgKVxuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0PFJlc3BvbnNlQVBEVT4oIG5ldyBFcnJvciggXCJKU0lNOiBDYXJkIHVucG93ZXJlZFwiICkgKTtcblxuICAgIHJldHVybiB0aGlzLmNhcmQuZXhjaGFuZ2VBUERVKCBjb21tYW5kQVBEVSApO1xuICB9XG5cbiAgaW5zZXJ0Q2FyZCggY2FyZDogSlNJTUNhcmQgKVxuICB7XG4gICAgaWYgKCB0aGlzLmNhcmQgKVxuICAgICAgdGhpcy5lamVjdENhcmQoKTtcblxuICAgIHRoaXMuY2FyZCA9IGNhcmQ7XG4gIH1cblxuICBlamVjdENhcmQoKVxuICB7XG4gICAgaWYgKCB0aGlzLmNhcmQgKVxuICAgIHtcbiAgICAgIGlmICggdGhpcy5jYXJkLmlzUG93ZXJlZCApXG4gICAgICAgIHRoaXMuY2FyZC5wb3dlck9mZigpO1xuXG4gICAgICB0aGlzLmNhcmQgPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgeyBCeXRlQXJyYXkgfSBmcm9tICdjcnlwdG9ncmFwaGl4LXNpbS1jb3JlJztcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBoZXgyKCB2YWwgKSB7IHJldHVybiAoIFwiMDBcIiArIHZhbC50b1N0cmluZyggMTYgKS50b1VwcGVyQ2FzZSgpICkuc3Vic3RyKCAtMiApOyB9XHJcbmV4cG9ydCBmdW5jdGlvbiBoZXg0KCB2YWwgKSB7IHJldHVybiAoIFwiMDAwMFwiICsgdmFsLnRvU3RyaW5nKCAxNiApLnRvVXBwZXJDYXNlKCkgKS5zdWJzdHIoIC00ICk7IH1cclxuXHJcbmV4cG9ydCBlbnVtIE1FTUZMQUdTIHtcclxuICBSRUFEX09OTFkgPSAxIDw8IDAsXHJcbiAgVFJBTlNBQ1RJT05BQkxFID0gMSA8PCAxLFxyXG4gIFRSQUNFID0gMSA8PCAyXHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBTZWdtZW50XHJcbntcclxuICBwcml2YXRlIG1lbURhdGE6IEJ5dGVBcnJheTtcclxuICBwcml2YXRlIG1lbVR5cGU7XHJcbiAgcHJpdmF0ZSByZWFkT25seTtcclxuICBwcml2YXRlIGZsYWdzO1xyXG4gIHByaXZhdGUgaW5UcmFuc2FjdGlvbiA9IGZhbHNlO1xyXG4gIHByaXZhdGUgdHJhbnNCbG9ja3MgPSBbXTtcclxuICBtZW1UcmFjZXM7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCBzZWdUeXBlLCBzaXplLCBmbGFncz8sIGJhc2U/OiBCeXRlQXJyYXkgKVxyXG4gIHtcclxuICAgIHRoaXMubWVtVHlwZSA9IHNlZ1R5cGU7XHJcbiAgICB0aGlzLnJlYWRPbmx5ID0gKCBmbGFncyAmIE1FTUZMQUdTLlJFQURfT05MWSApID8gdHJ1ZSA6IGZhbHNlO1xyXG5cclxuICAgIGlmICggYmFzZSApXHJcbiAgICB7XHJcbiAgICAgIHRoaXMubWVtRGF0YSA9IG5ldyBCeXRlQXJyYXkoIGJhc2UgKVxyXG4gICAgfVxyXG4gICAgZWxzZVxyXG4gICAge1xyXG4gICAgICB0aGlzLm1lbURhdGEgPSBuZXcgQnl0ZUFycmF5KCBbXSApLnNldExlbmd0aCggc2l6ZSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZ2V0VHlwZSgpIHsgcmV0dXJuIHRoaXMubWVtVHlwZTsgfVxyXG4gIGdldExlbmd0aCgpIHsgcmV0dXJuIHRoaXMubWVtRGF0YS5sZW5ndGg7IH1cclxuICBnZXRGbGFncygpIHsgcmV0dXJuIHRoaXMuZmxhZ3M7IH1cclxuICBnZXREZWJ1ZygpIHsgcmV0dXJuIHsgbWVtRGF0YTogdGhpcy5tZW1EYXRhLCBtZW1UeXBlOiB0aGlzLm1lbVR5cGUsIHJlYWRPbmx5OiB0aGlzLnJlYWRPbmx5LCBpblRyYW5zYWN0aW9uOiB0aGlzLmluVHJhbnNhY3Rpb24sIHRyYW5zQmxvY2tzOiB0aGlzLnRyYW5zQmxvY2tzIH07IH1cclxuXHJcbiAgYmVnaW5UcmFuc2FjdGlvbigpXHJcbiAge1xyXG4gICAgdGhpcy5pblRyYW5zYWN0aW9uID0gdHJ1ZTtcclxuICAgIHRoaXMudHJhbnNCbG9ja3MgPSBbXTtcclxuICB9XHJcblxyXG4gIGVuZFRyYW5zYWN0aW9uKCBjb21taXQgKVxyXG4gIHtcclxuICAgIGlmICggIWNvbW1pdCAmJiB0aGlzLmluVHJhbnNhY3Rpb24gKVxyXG4gICAge1xyXG4gICAgICB0aGlzLmluVHJhbnNhY3Rpb24gPSBmYWxzZTtcclxuXHJcbiAgICAgIC8vIHJvbGxiYWNrIHRyYW5zYWN0aW9uc1xyXG4gICAgICBmb3IoIHZhciBpPTA7IGkgPCB0aGlzLnRyYW5zQmxvY2tzLmxlbmd0aDsgaSsrIClcclxuICAgICAge1xyXG4gICAgICAgIHZhciBibG9jayA9IHRoaXMudHJhbnNCbG9ja3NbIGkgXTtcclxuXHJcbiAgICAgICAgdGhpcy53cml0ZUJ5dGVzKCBibG9jay5hZGRyLCBibG9jay5kYXRhICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnRyYW5zQmxvY2tzID0gW107XHJcbiAgfVxyXG5cclxuICByZWFkQnl0ZSggYWRkciApXHJcbiAge1xyXG4gICAgcmV0dXJuIHRoaXMubWVtRGF0YVsgYWRkciBdO1xyXG4gIH1cclxuXHJcbiAgemVyb0J5dGVzKCBhZGRyLCBsZW4gKVxyXG4gIHtcclxuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgbGVuOyArK2kgKVxyXG4gICAgICB0aGlzLm1lbURhdGFbIGFkZHIgKyBpIF0gPSAwO1xyXG4gIH1cclxuXHJcbiAgcmVhZEJ5dGVzKCBhZGRyLCBsZW4gKTogQnl0ZUFycmF5XHJcbiAge1xyXG4gICAgcmV0dXJuIHRoaXMubWVtRGF0YS52aWV3QXQoIGFkZHIsIGxlbiApO1xyXG4gIH1cclxuXHJcbiAgY29weUJ5dGVzKCBmcm9tQWRkciwgdG9BZGRyLCBsZW4gKVxyXG4gIHtcclxuICAgIHRoaXMud3JpdGVCeXRlcyggdG9BZGRyLCB0aGlzLnJlYWRCeXRlcyggZnJvbUFkZHIsIGxlbiApICk7XHJcbiAgfVxyXG5cclxuICB3cml0ZUJ5dGVzKCBhZGRyOiBudW1iZXIsIHZhbDogQnl0ZUFycmF5IClcclxuICB7XHJcbiAgICBpZiAoIHRoaXMuaW5UcmFuc2FjdGlvbiAmJiAoIHRoaXMuZmxhZ3MgJiBNRU1GTEFHUy5UUkFOU0FDVElPTkFCTEUgKSApXHJcbiAgICB7XHJcbiAgICAgIC8vIHNhdmUgcHJldmlvdXMgRUVQUk9NIGNvbnRlbnRzXHJcbiAgICAgIHRoaXMudHJhbnNCbG9ja3MucHVzaCggeyBhZGRyOiBhZGRyLCBkYXRhOiB0aGlzLnJlYWRCeXRlcyggYWRkciwgdmFsLmxlbmd0aCApIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLm1lbURhdGEuc2V0Qnl0ZXNBdCggYWRkciwgdmFsICk7XHJcbiAgfVxyXG5cclxuICBuZXdBY2Nlc3NvciggYWRkciwgbGVuLCBuYW1lICk6IEFjY2Vzc29yXHJcbiAge1xyXG4gICAgcmV0dXJuIG5ldyBBY2Nlc3NvciggdGhpcywgYWRkciwgbGVuLCBuYW1lICk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgQWNjZXNzb3Jcclxue1xyXG4gIG9mZnNldDogbnVtYmVyO1xyXG4gIGxlbmd0aDogbnVtYmVyO1xyXG4gIGlkOiBzdHJpbmc7XHJcbiAgc2VnOiBTZWdtZW50O1xyXG5cclxuICBjb25zdHJ1Y3Rvciggc2VnLCBhZGRyLCBsZW4sIG5hbWUgKVxyXG4gIHtcclxuICAgIHRoaXMuc2VnID0gc2VnO1xyXG5cclxuICAgIHRoaXMub2Zmc2V0ID0gYWRkcjtcclxuICAgIHRoaXMubGVuZ3RoID0gbGVuO1xyXG4gICAgdGhpcy5pZCA9IG5hbWU7XHJcbiAgfVxyXG5cclxuICB0cmFjZU1lbW9yeU9wKCBvcCwgYWRkciwgbGVuLCBhZGRyMj8gKVxyXG4gIHtcclxuICAgIGlmICggdGhpcy5pZCAhPSBcImNvZGVcIiApXHJcbiAgICAgIHRoaXMuc2VnLm1lbVRyYWNlcy5wdXNoKCB7IG9wOiBvcCwgbmFtZTogdGhpcy5pZCwgYWRkcjogYWRkciwgbGVuOiBsZW4sIGFkZHIyOiBhZGRyMiB9ICk7XHJcbiAgfVxyXG5cclxuICB0cmFjZU1lbW9yeVZhbHVlKCB2YWwgKVxyXG4gIHtcclxuICAgIGlmICggdGhpcy5pZCAhPSBcImNvZGVcIiApXHJcbiAgICB7XHJcbiAgICAgIHZhciBtZW1UcmFjZSA9IHRoaXMuc2VnLm1lbVRyYWNlc1sgdGhpcy5zZWcubWVtVHJhY2VzLmxlbmd0aCAtIDEgXTtcclxuXHJcbiAgICAgIG1lbVRyYWNlLnZhbCA9IHZhbDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHplcm9CeXRlcyggYWRkcjogbnVtYmVyLCBsZW46IG51bWJlciApXHJcbiAge1xyXG4gICAgaWYgKCBhZGRyICsgbGVuID4gdGhpcy5sZW5ndGggKVxyXG4gICAge1xyXG4gICAgICB0aGlzLnRyYWNlTWVtb3J5T3AoIFwiWlItZXJyb3JcIiwgYWRkciwgdGhpcy5sZW5ndGggKTtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCBcIk1NOiBJbnZhbGlkIFplcm9cIiApO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudHJhY2VNZW1vcnlPcCggXCJaUlwiLCBhZGRyLCBsZW4gKTtcclxuICAgIHRoaXMuc2VnLnplcm9CeXRlcyggdGhpcy5vZmZzZXQgKyBhZGRyLCBsZW4gKTtcclxuICAgIHRoaXMudHJhY2VNZW1vcnlWYWx1ZSggWyAwIF0gKTtcclxuICB9XHJcblxyXG4gIHJlYWRCeXRlKCBhZGRyOiBudW1iZXIgKTogbnVtYmVyXHJcbiAge1xyXG4gICAgaWYgKCBhZGRyICsgMSA+IHRoaXMubGVuZ3RoIClcclxuICAgIHtcclxuICAgICAgdGhpcy50cmFjZU1lbW9yeU9wKCBcIlJELWVycm9yXCIsIGFkZHIsIDEgKTtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCBcIk1NOiBJbnZhbGlkIFJlYWRcIiApO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudHJhY2VNZW1vcnlPcCggXCJSRFwiLCBhZGRyLCAxICk7XHJcblxyXG4gICAgdmFyIHZhbCA9IHRoaXMuc2VnLnJlYWRCeXRlKCB0aGlzLm9mZnNldCArIGFkZHIgKTtcclxuXHJcbiAgICB0aGlzLnRyYWNlTWVtb3J5VmFsdWUoIFsgdmFsIF0pO1xyXG5cclxuICAgIHJldHVybiB2YWw7XHJcbiAgfVxyXG5cclxuICByZWFkQnl0ZXMoIGFkZHIsIGxlbiApOiBCeXRlQXJyYXlcclxuICB7XHJcbiAgICBpZiAoIGFkZHIgKyBsZW4gPiB0aGlzLmxlbmd0aCApXHJcbiAgICB7XHJcbiAgICAgIHRoaXMudHJhY2VNZW1vcnlPcCggXCJSRC1lcnJvclwiLCBhZGRyLCBsZW4gKTtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCBcIk1NOiBJbnZhbGlkIFJlYWRcIiApO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudHJhY2VNZW1vcnlPcCggXCJSRFwiLCBhZGRyLCBsZW4gKTtcclxuICAgIHZhciB2YWwgPSB0aGlzLnNlZy5yZWFkQnl0ZXMoIHRoaXMub2Zmc2V0ICsgYWRkciwgbGVuICk7XHJcbiAgICB0aGlzLnRyYWNlTWVtb3J5VmFsdWUoIHZhbCApO1xyXG5cclxuICAgIHJldHVybiB2YWw7XHJcbiAgfVxyXG5cclxuICBjb3B5Qnl0ZXMoIGZyb21BZGRyOiBudW1iZXIsIHRvQWRkcjogbnVtYmVyLCBsZW46IG51bWJlciApOiBCeXRlQXJyYXlcclxuICB7XHJcbiAgICBpZiAoICggZnJvbUFkZHIgKyBsZW4gPiB0aGlzLmxlbmd0aCApIHx8ICggdG9BZGRyICsgbGVuID4gdGhpcy5sZW5ndGggKSApXHJcbiAgICB7XHJcbiAgICAgIHRoaXMudHJhY2VNZW1vcnlPcCggXCJDUC1lcnJvclwiLCBmcm9tQWRkciwgbGVuLCB0b0FkZHIgKTtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCBcIk1NOiBJbnZhbGlkIFJlYWRcIiApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vaWYgKCBtZW1UcmFjaW5nIClcclxuICAgIHtcclxuICAgICAgdGhpcy50cmFjZU1lbW9yeU9wKCBcIkNQXCIsIGZyb21BZGRyLCBsZW4sIHRvQWRkciApO1xyXG4gICAgICB2YXIgdmFsID0gdGhpcy5zZWcucmVhZEJ5dGVzKCB0aGlzLm9mZnNldCArIGZyb21BZGRyLCBsZW4gKTtcclxuICAgICAgdGhpcy50cmFjZU1lbW9yeVZhbHVlKCB2YWwgKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnNlZy5jb3B5Qnl0ZXMoIHRoaXMub2Zmc2V0ICsgZnJvbUFkZHIsIHRoaXMub2Zmc2V0ICsgdG9BZGRyLCBsZW4gKTtcclxuICAgIHJldHVybiB2YWw7XHJcbiAgfVxyXG5cclxuICB3cml0ZUJ5dGUoIGFkZHI6IG51bWJlciwgdmFsOiBudW1iZXIgKVxyXG4gIHtcclxuICAgIGlmICggYWRkciArIDEgPiB0aGlzLmxlbmd0aCApXHJcbiAgICB7XHJcbiAgICAgIHRoaXMudHJhY2VNZW1vcnlPcCggXCJXUi1lcnJvclwiLCBhZGRyLCAxICk7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvciggXCJNTTogSW52YWxpZCBXcml0ZVwiICk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy50cmFjZU1lbW9yeU9wKCBcIldSXCIsIGFkZHIsIDEgKTtcclxuICAgIHRoaXMuc2VnLndyaXRlQnl0ZXMoIHRoaXMub2Zmc2V0ICsgYWRkciwgbmV3IEJ5dGVBcnJheSggWyB2YWwgXSApICk7XHJcbiAgICB0aGlzLnRyYWNlTWVtb3J5VmFsdWUoIFsgdmFsIF0gKTtcclxuICB9XHJcblxyXG4gIHdyaXRlQnl0ZXMoIGFkZHI6IG51bWJlciwgdmFsOiBCeXRlQXJyYXkgKVxyXG4gIHtcclxuICAgIGlmICggYWRkciArIHZhbC5sZW5ndGggPiB0aGlzLmxlbmd0aCApXHJcbiAgICB7XHJcbiAgICAgIHRoaXMudHJhY2VNZW1vcnlPcCggXCJXUi1lcnJvclwiLCBhZGRyLCB2YWwubGVuZ3RoICk7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvciggXCJNTTogSW52YWxpZCBXcml0ZVwiICk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy50cmFjZU1lbW9yeU9wKCBcIldSXCIsIGFkZHIsIHZhbC5sZW5ndGggKTtcclxuICAgIHRoaXMuc2VnLndyaXRlQnl0ZXMoIHRoaXMub2Zmc2V0ICsgYWRkciwgdmFsICk7XHJcbiAgICB0aGlzLnRyYWNlTWVtb3J5VmFsdWUoIHZhbCApO1xyXG4gIH1cclxuXHJcbiAgZ2V0VHlwZSgpIHsgcmV0dXJuIHRoaXMuc2VnLmdldFR5cGUoKTsgfVxyXG4gIGdldExlbmd0aCgpIHsgcmV0dXJuIHRoaXMubGVuZ3RoOyB9XHJcbiAgZ2V0SUQoKSB7IHJldHVybiB0aGlzLmlkOyB9XHJcbi8vICAgICAgICBiZWdpblRyYW5zYWN0aW9uOiBiZWdpblRyYW5zYWN0aW9uLFxyXG4vLyAgICAgICAgaW5UcmFuc2FjdGlvbjogZnVuY3Rpb24oKSB7IHJldHVybiBpblRyYW5zYWN0aW9uOyB9LFxyXG4vLyAgICAgICAgZW5kVHJhbnNhY3Rpb246IGVuZFRyYW5zYWN0aW9uLFxyXG4gIGdldERlYnVnKCkgeyByZXR1cm4geyBvZmZzZXQ6IHRoaXMub2Zmc2V0LCBsZW5ndGg6IHRoaXMubGVuZ3RoLCBzZWc6IHRoaXMuc2VnIH07IH1cclxufVxyXG5cclxuZnVuY3Rpb24gc2xpY2VEYXRhKCBiYXNlLCBvZmZzZXQsIHNpemUgKTogVWludDhBcnJheVxyXG57XHJcbiAgcmV0dXJuIGJhc2Uuc3ViYXJyYXkoIG9mZnNldCwgb2Zmc2V0ICsgc2l6ZSApO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgTWVtb3J5TWFuYWdlclxyXG57XHJcbiAgcHJpdmF0ZSBtZW1vcnlTZWdtZW50cyA9IFtdO1xyXG5cclxuICBwcml2YXRlIG1lbVRyYWNlcyA9IFtdO1xyXG5cclxuICBuZXdTZWdtZW50KCBtZW1UeXBlLCBzaXplLCBmbGFncz8gICk6IFNlZ21lbnRcclxuICB7XHJcbiAgICBsZXQgbmV3U2VnID0gbmV3IFNlZ21lbnQoIG1lbVR5cGUsIHNpemUsIGZsYWdzICk7XHJcblxyXG4gICAgdGhpcy5tZW1vcnlTZWdtZW50c1sgbWVtVHlwZSBdID0gbmV3U2VnO1xyXG5cclxuICAgIG5ld1NlZy5tZW1UcmFjZXMgPSB0aGlzLm1lbVRyYWNlcztcclxuXHJcbiAgICByZXR1cm4gbmV3U2VnO1xyXG4gIH1cclxuXHJcbiAgZ2V0TWVtVHJhY2UoKSB7IHJldHVybiB0aGlzLm1lbVRyYWNlczsgfVxyXG5cclxuICBpbml0TWVtVHJhY2UoKSB7IHRoaXMubWVtVHJhY2VzID0gW107IH1cclxuXHJcbiAgZ2V0U2VnbWVudCggdHlwZSApIHsgcmV0dXJuIHRoaXMubWVtb3J5U2VnbWVudHNbIHR5cGUgXTsgfVxyXG59XHJcbiIsImV4cG9ydCBlbnVtIE1FTElOU1Qge1xyXG4gIG1lbFNZU1RFTSA9ICAweDAwLFxyXG4gIG1lbEJSQU5DSCA9ICAweDAxLFxyXG4gIG1lbEpVTVAgPSAgICAweDAyLFxyXG4gIG1lbENBTEwgPSAgICAweDAzLFxyXG4gIG1lbFNUQUNLID0gICAweDA0LFxyXG4gIG1lbFBSSU1SRVQgPSAweDA1LFxyXG4gIG1lbElOVkFMSUQgPSAweDA2LFxyXG4gIG1lbExPQUQgPSAgICAweDA3LFxyXG4gIG1lbFNUT1JFID0gICAweDA4LFxyXG4gIG1lbExPQURJID0gICAweDA5LFxyXG4gIG1lbFNUT1JFSSA9ICAweDBBLFxyXG4gIG1lbExPQURBID0gICAweDBCLFxyXG4gIG1lbElOREVYID0gICAweDBDLFxyXG4gIG1lbFNFVEIgPSAgICAweDBELFxyXG4gIG1lbENNUEIgPSAgICAweDBFLFxyXG4gIG1lbEFEREIgPSAgICAweDBGLFxyXG4gIG1lbFNVQkIgPSAgICAweDEwLFxyXG4gIG1lbFNFVFcgPSAgICAweDExLFxyXG4gIG1lbENNUFcgPSAgICAweDEyLFxyXG4gIG1lbEFERFcgPSAgICAweDEzLFxyXG4gIG1lbFNVQlcgPSAgICAweDE0LFxyXG4gIG1lbENMRUFSTiA9ICAweDE1LFxyXG4gIG1lbFRFU1ROID0gICAweDE2LFxyXG4gIG1lbElOQ04gPSAgICAweDE3LFxyXG4gIG1lbERFQ04gPSAgICAweDE4LFxyXG4gIG1lbE5PVE4gPSAgICAweDE5LFxyXG4gIG1lbENNUE4gPSAgICAweDFBLFxyXG4gIG1lbEFERE4gPSAgICAweDFCLFxyXG4gIG1lbFNVQk4gPSAgICAweDFDLFxyXG4gIG1lbEFORE4gPSAgICAweDFELFxyXG4gIG1lbE9STiA9ICAgICAweDFFLFxyXG4gIG1lbFhPUk4gPSAgICAweDFGXHJcbn07XHJcblxyXG5leHBvcnQgZW51bSBNRUxUQUdBRERSIHtcclxuICBtZWxBZGRyVE9TID0gMHgwMCxcclxuICBtZWxBZGRyU0IgPSAgMHgwMSxcclxuICBtZWxBZGRyU1QgPSAgMHgwMixcclxuICBtZWxBZGRyREIgPSAgMHgwMyxcclxuICBtZWxBZGRyTEIgPSAgMHgwNCxcclxuICBtZWxBZGRyRFQgPSAgMHgwNSxcclxuICBtZWxBZGRyUEIgPSAgMHgwNixcclxuICBtZWxBZGRyUFQgPSAgMHgwN1xyXG59O1xyXG5cclxuZXhwb3J0IGVudW0gTUVMVEFHQ09ORCB7XHJcbiAgbWVsQ29uZFNQRUMgPSAgMHgwMCwgLy8gU3BlY2lhbFxyXG4gIG1lbENvbmRFUSA9ICAgIDB4MDEsIC8vIEVxdWFsXHJcbiAgbWVsQ29uZExUID0gICAgMHgwMiwgLy8gTGVzcyB0aGFuXHJcbiAgbWVsQ29uZExFID0gICAgMHgwMywgLy8gTGVzcyB0aGFuLCBlcXVhbCB0b1xyXG4gIG1lbENvbmRHVCA9ICAgIDB4MDQsIC8vIEdyZWF0ZXIgdGhhblxyXG4gIG1lbENvbmRHRSA9ICAgIDB4MDUsIC8vIEdyZWF0ZXIgdGhhbiwgZXF1YWwgdG9cclxuICBtZWxDb25kTkUgPSAgICAweDA2LCAvLyBOb3QgZXF1YWwgdG9cclxuICBtZWxDb25kQUxMID0gICAweDA3ICAvLyBBbHdheXNcclxufTtcclxuXHJcbmV4cG9ydCBlbnVtIE1FTFRBR1NZU1RFTSB7XHJcbiAgbWVsU3lzdGVtTk9QID0gICAgICAgMHgwMCwgLy8gTk9QXHJcbiAgbWVsU3lzdGVtU2V0U1cgPSAgICAgMHgwMSwgLy8gU0VUU1dcclxuICBtZWxTeXN0ZW1TZXRMYSA9ICAgICAweDAyLCAvLyBTRVRMQVxyXG4gIG1lbFN5c3RlbVNldFNXTGEgPSAgIDB4MDMsIC8vIFNFVFNXTEFcclxuICBtZWxTeXN0ZW1FeGl0ID0gICAgICAweDA0LCAvLyBFWElUXHJcbiAgbWVsU3lzdGVtRXhpdFNXID0gICAgMHgwNSwgLy8gRVhJVFNXXHJcbiAgbWVsU3lzdGVtRXhpdExhID0gICAgMHgwNiwgLy8gRVhJVExBXHJcbiAgbWVsU3lzdGVtRXhpdFNXTGEgPSAgMHgwNyAgLy8gRVhJVFNXTEFcclxufTtcclxuXHJcbmV4cG9ydCBlbnVtIE1FTFRBR1NUQUNLIHtcclxuICBtZWxTdGFja1BVU0haID0gIDB4MDAsIC8vIFBVU0haXHJcbiAgbWVsU3RhY2tQVVNIQiA9ICAweDAxLCAvLyBQVVNIQlxyXG4gIG1lbFN0YWNrUFVTSFcgPSAgMHgwMiwgLy8gUFVTSFdcclxuICBtZWxTdGFja1hYNCA9ICAgIDB4MDMsIC8vIElsbGVnYWxcclxuICBtZWxTdGFja1BPUE4gPSAgIDB4MDQsIC8vIFBPUE5cclxuICBtZWxTdGFja1BPUEIgPSAgIDB4MDUsIC8vIFBPUEJcclxuICBtZWxTdGFja1BPUFcgPSAgIDB4MDYsIC8vIFBPUFdcclxuICBtZWxTdGFja1hYNyA9ICAgIDB4MDcgIC8vIElsbGVnYWxcclxufTtcclxuXHJcbmV4cG9ydCBlbnVtIE1FTFRBR1BSSU1SRVQge1xyXG4gIG1lbFByaW1SZXRQUklNMCA9ICAweDAwLCAvLyBQUklNIDBcclxuICBtZWxQcmltUmV0UFJJTTEgPSAgMHgwMSwgLy8gUFJJTSAxXHJcbiAgbWVsUHJpbVJldFBSSU0yID0gIDB4MDIsIC8vIFBSSU0gMlxyXG4gIG1lbFByaW1SZXRQUklNMyA9ICAweDAzLCAvLyBQUklNIDNcclxuICBtZWxQcmltUmV0UkVUID0gICAgMHgwNCwgLy8gUkVUXHJcbiAgbWVsUHJpbVJldFJFVEkgPSAgIDB4MDUsIC8vIFJFVCBJblxyXG4gIG1lbFByaW1SZXRSRVRPID0gICAweDA2LCAvLyBSRVQgT3V0XHJcbiAgbWVsUHJpbVJldFJFVElPID0gIDB4MDcgIC8vIFJFVCBJbk91dFxyXG59O1xyXG5cclxuZXhwb3J0IGVudW0gTUVMUEFSQU1ERUYge1xyXG4gIG1lbFBhcmFtRGVmTm9uZSA9ICAgICAgICAgICAgICAweDAwLFxyXG4gIG1lbFBhcmFtRGVmVG9wT2ZTdGFjayA9ICAgICAgICAweDAxLFxyXG4gIG1lbFBhcmFtRGVmQnl0ZU9wZXJMZW4gPSAgICAgICAweDExLFxyXG4gIG1lbFBhcmFtRGVmQnl0ZUltbWVkaWF0ZSA9ICAgICAweDEyLFxyXG4gIG1lbFBhcmFtRGVmQnl0ZUNvZGVSZWxhdGl2ZSA9ICAweDE4LFxyXG4gIG1lbFBhcmFtRGVmV29yZEltbWVkaWF0ZSA9ICAgICAweDIwLFxyXG4gIG1lbFBhcmFtRGVmV29yZE9mZnNldFNCID0gICAgICAweDIxLFxyXG4gIG1lbFBhcmFtRGVmV29yZE9mZnNldFNUID0gICAgICAweDIyLFxyXG4gIG1lbFBhcmFtRGVmV29yZE9mZnNldERCID0gICAgICAweDIzLFxyXG4gIG1lbFBhcmFtRGVmV29yZE9mZnNldExCID0gICAgICAweDI0LFxyXG4gIG1lbFBhcmFtRGVmV29yZE9mZnNldERUID0gICAgICAweDI1LFxyXG4gIG1lbFBhcmFtRGVmV29yZE9mZnNldFBCID0gICAgICAweDI2LFxyXG4gIG1lbFBhcmFtRGVmV29yZE9mZnNldFBUID0gICAgICAweDI3LFxyXG4gIG1lbFBhcmFtRGVmV29yZENvZGVBZGRyZXNzID0gICAweDI4XHJcbn07XHJcblxyXG5mdW5jdGlvbiBNRUxQQVJBTTQoIGEsIGIsIGMsIGQgKSAgICAgICAgeyByZXR1cm4gKCAoZDw8MjQpIHwgKGM8PDE2KSB8IChiPDw4KSB8IChhPDwwKSApOyB9XHJcbmZ1bmN0aW9uIE9QVEFHMk1FTElOU1QoIG9wQ29kZSwgdGFnICkgICB7IHJldHVybiAoICggKCBvcENvZGUgJiAweDFmICkgPDwgMyApIHwgdGFnICk7IH1cclxuZXhwb3J0IGZ1bmN0aW9uIE1FTDJPUENPREUoIGJ5dGVDb2RlICkgICAgICAgICB7IHJldHVybiAoICggYnl0ZUNvZGUgPj4gMyApICYgMHgxZiApOyB9XHJcbmV4cG9ydCBmdW5jdGlvbiBNRUwySU5TVCggYnl0ZUNvZGUgKSAgICAgICAgICAgeyByZXR1cm4gTUVMMk9QQ09ERSggYnl0ZUNvZGUgKTsgfVxyXG5leHBvcnQgZnVuY3Rpb24gTUVMMlRBRyggYnl0ZUNvZGUgKSAgICAgICAgICAgIHsgcmV0dXJuICggKGJ5dGVDb2RlKSAmIDcgKSB9O1xyXG5cclxuZnVuY3Rpb24gTUVMUEFSQU1TSVpFKCBwYXJhbVR5cGUgKVxyXG57XHJcbiAgcmV0dXJuICggcGFyYW1UeXBlID09IE1FTFBBUkFNREVGLm1lbFBhcmFtRGVmTm9uZSApXHJcbiAgICAgICAgID8gMFxyXG4gICAgICAgICA6ICggcGFyYW1UeXBlIDwgTUVMUEFSQU1ERUYubWVsUGFyYW1EZWZXb3JkSW1tZWRpYXRlKSA/IDEgOiAyO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgTUVMXHJcbntcclxuICBwdWJsaWMgc3RhdGljIG1lbERlY29kZSA9IFtdO1xyXG5cclxuICBwdWJsaWMgc3RhdGljIE1FTElOU1Q6IE1FTElOU1Q7XHJcbiAgcHVibGljIHN0YXRpYyBNRUxUQUdTVEFDSzogTUVMVEFHU1RBQ0s7XHJcbiAgcHVibGljIHN0YXRpYyBNRUxQQVJBTURFRjogTUVMUEFSQU1ERUY7XHJcbiAgcHVibGljIHN0YXRpYyBNRUxUQUdBRERSOiBNRUxUQUdBRERSO1xyXG5cclxufVxyXG5cclxuZnVuY3Rpb24gc2V0TWVsRGVjb2RlKCBieXRlQ29kZTogbnVtYmVyLCBpbnN0TmFtZTogc3RyaW5nLCBwYXJhbTE/LCBwYXJhbTI/LCBwYXJhbTM/LCBwYXJhbTQ/IClcclxue1xyXG4gIHBhcmFtMSA9IHBhcmFtMSB8fCBNRUxQQVJBTURFRi5tZWxQYXJhbURlZk5vbmU7XHJcbiAgcGFyYW0yID0gcGFyYW0yIHx8IE1FTFBBUkFNREVGLm1lbFBhcmFtRGVmTm9uZTtcclxuICBwYXJhbTMgPSBwYXJhbTMgfHwgTUVMUEFSQU1ERUYubWVsUGFyYW1EZWZOb25lO1xyXG4gIHBhcmFtNCA9IHBhcmFtNCB8fCBNRUxQQVJBTURFRi5tZWxQYXJhbURlZk5vbmU7XHJcblxyXG4gIE1FTC5tZWxEZWNvZGVbIGJ5dGVDb2RlIF0gPSB7XHJcbiAgICBieXRlQ29kZTogYnl0ZUNvZGUsXHJcbiAgICBpbnN0TGVuOiAxICsgTUVMUEFSQU1TSVpFKCBwYXJhbTEgKSArIE1FTFBBUkFNU0laRSggcGFyYW0yICkgKyBNRUxQQVJBTVNJWkUoIHBhcmFtMyApICsgTUVMUEFSQU1TSVpFKCBwYXJhbTQgKSxcclxuICAgIGluc3ROYW1lOiBpbnN0TmFtZSxcclxuICAgIHBhcmFtRGVmczogTUVMUEFSQU00KCBwYXJhbTEsIHBhcmFtMiwgcGFyYW0zLCBwYXJhbTQgKVxyXG4gIH07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNldE1lbERlY29kZVN0ZE1vZGVzKCBtZWxJbnN0OiBNRUxJTlNULCBpbnN0TmFtZTogc3RyaW5nLCBwYXJhbTFEZWY6IE1FTFBBUkFNREVGIClcclxue1xyXG4gIHNldE1lbERlY29kZSggT1BUQUcyTUVMSU5TVCggbWVsSW5zdCwgTUVMVEFHQUREUi5tZWxBZGRyU0IgKSwgaW5zdE5hbWUsIHBhcmFtMURlZiwgTUVMUEFSQU1ERUYubWVsUGFyYW1EZWZXb3JkT2Zmc2V0U0IgKTtcclxuICBzZXRNZWxEZWNvZGUoIE9QVEFHMk1FTElOU1QoIG1lbEluc3QsIE1FTFRBR0FERFIubWVsQWRkclNUICksIGluc3ROYW1lLCBwYXJhbTFEZWYsIE1FTFBBUkFNREVGLm1lbFBhcmFtRGVmV29yZE9mZnNldFNUICk7XHJcbiAgc2V0TWVsRGVjb2RlKCBPUFRBRzJNRUxJTlNUKCBtZWxJbnN0LCBNRUxUQUdBRERSLm1lbEFkZHJEQiApLCBpbnN0TmFtZSwgcGFyYW0xRGVmLCBNRUxQQVJBTURFRi5tZWxQYXJhbURlZldvcmRPZmZzZXREQiApO1xyXG4gIHNldE1lbERlY29kZSggT1BUQUcyTUVMSU5TVCggbWVsSW5zdCwgTUVMVEFHQUREUi5tZWxBZGRyTEIgKSwgaW5zdE5hbWUsIHBhcmFtMURlZiwgTUVMUEFSQU1ERUYubWVsUGFyYW1EZWZXb3JkT2Zmc2V0TEIgKTtcclxuICBzZXRNZWxEZWNvZGUoIE9QVEFHMk1FTElOU1QoIG1lbEluc3QsIE1FTFRBR0FERFIubWVsQWRkckRUICksIGluc3ROYW1lLCBwYXJhbTFEZWYsIE1FTFBBUkFNREVGLm1lbFBhcmFtRGVmV29yZE9mZnNldERUICk7XHJcbiAgc2V0TWVsRGVjb2RlKCBPUFRBRzJNRUxJTlNUKCBtZWxJbnN0LCBNRUxUQUdBRERSLm1lbEFkZHJQQiApLCBpbnN0TmFtZSwgcGFyYW0xRGVmLCBNRUxQQVJBTURFRi5tZWxQYXJhbURlZldvcmRPZmZzZXRQQiApO1xyXG4gIHNldE1lbERlY29kZSggT1BUQUcyTUVMSU5TVCggbWVsSW5zdCwgTUVMVEFHQUREUi5tZWxBZGRyUFQgKSwgaW5zdE5hbWUsIHBhcmFtMURlZiwgTUVMUEFSQU1ERUYubWVsUGFyYW1EZWZXb3JkT2Zmc2V0UFQgKTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2V0TWVsRGVjb2RlU3RkTW9kZXNBbmRUT1MoIG1lbEluc3Q6IE1FTElOU1QsIGluc3ROYW1lOiBzdHJpbmcsIHBhcmFtMURlZjogTUVMUEFSQU1ERUYgKVxyXG57XHJcbiAgc2V0TWVsRGVjb2RlKCBPUFRBRzJNRUxJTlNUKCBtZWxJbnN0LCBNRUxUQUdBRERSLm1lbEFkZHJUT1MgKSwgaW5zdE5hbWUsIHBhcmFtMURlZiwgTUVMUEFSQU1ERUYubWVsUGFyYW1EZWZUb3BPZlN0YWNrICk7XHJcbiAgc2V0TWVsRGVjb2RlU3RkTW9kZXMoIG1lbEluc3QsIGluc3ROYW1lLCBwYXJhbTFEZWYgKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZmlsbE1lbERlY29kZSgpXHJcbntcclxuICBzZXRNZWxEZWNvZGVTdGRNb2Rlc0FuZFRPUyggTUVMSU5TVC5tZWxMT0FELCAgIFwiTE9BRFwiLCAgIE1FTFBBUkFNREVGLm1lbFBhcmFtRGVmQnl0ZU9wZXJMZW4gKTtcclxuICBzZXRNZWxEZWNvZGVTdGRNb2Rlc0FuZFRPUyggTUVMSU5TVC5tZWxTVE9SRSwgIFwiU1RPUkVcIiwgIE1FTFBBUkFNREVGLm1lbFBhcmFtRGVmQnl0ZU9wZXJMZW4gKTtcclxuICBzZXRNZWxEZWNvZGVTdGRNb2Rlc0FuZFRPUyggTUVMSU5TVC5tZWxMT0FESSwgIFwiTE9BRElcIiwgIE1FTFBBUkFNREVGLm1lbFBhcmFtRGVmQnl0ZU9wZXJMZW4gKTtcclxuICBzZXRNZWxEZWNvZGVTdGRNb2Rlc0FuZFRPUyggTUVMSU5TVC5tZWxTVE9SRUksIFwiU1RPUkVJXCIsIE1FTFBBUkFNREVGLm1lbFBhcmFtRGVmQnl0ZU9wZXJMZW4gKTtcclxuXHJcbiAgc2V0TWVsRGVjb2RlKCBPUFRBRzJNRUxJTlNUKCBNRUxJTlNULm1lbExPQURBLCBNRUxUQUdBRERSLm1lbEFkZHJTQiApLCBcIkxPQURBXCIsIE1FTFBBUkFNREVGLm1lbFBhcmFtRGVmV29yZE9mZnNldFNCICk7XHJcbiAgc2V0TWVsRGVjb2RlKCBPUFRBRzJNRUxJTlNUKCBNRUxJTlNULm1lbExPQURBLCBNRUxUQUdBRERSLm1lbEFkZHJTVCApLCBcIkxPQURBXCIsIE1FTFBBUkFNREVGLm1lbFBhcmFtRGVmV29yZE9mZnNldFNUICk7XHJcbiAgc2V0TWVsRGVjb2RlKCBPUFRBRzJNRUxJTlNUKCBNRUxJTlNULm1lbExPQURBLCBNRUxUQUdBRERSLm1lbEFkZHJEQiApLCBcIkxPQURBXCIsIE1FTFBBUkFNREVGLm1lbFBhcmFtRGVmV29yZE9mZnNldERCICk7XHJcbiAgc2V0TWVsRGVjb2RlKCBPUFRBRzJNRUxJTlNUKCBNRUxJTlNULm1lbExPQURBLCBNRUxUQUdBRERSLm1lbEFkZHJMQiApLCBcIkxPQURBXCIsIE1FTFBBUkFNREVGLm1lbFBhcmFtRGVmV29yZE9mZnNldExCICk7XHJcbiAgc2V0TWVsRGVjb2RlKCBPUFRBRzJNRUxJTlNUKCBNRUxJTlNULm1lbExPQURBLCBNRUxUQUdBRERSLm1lbEFkZHJEVCApLCBcIkxPQURBXCIsIE1FTFBBUkFNREVGLm1lbFBhcmFtRGVmV29yZE9mZnNldERUICk7XHJcbiAgc2V0TWVsRGVjb2RlKCBPUFRBRzJNRUxJTlNUKCBNRUxJTlNULm1lbExPQURBLCBNRUxUQUdBRERSLm1lbEFkZHJQQiApLCBcIkxPQURBXCIsIE1FTFBBUkFNREVGLm1lbFBhcmFtRGVmV29yZE9mZnNldFBCICk7XHJcbiAgc2V0TWVsRGVjb2RlKCBPUFRBRzJNRUxJTlNUKCBNRUxJTlNULm1lbExPQURBLCBNRUxUQUdBRERSLm1lbEFkZHJQVCApLCBcIkxPQURBXCIsIE1FTFBBUkFNREVGLm1lbFBhcmFtRGVmV29yZE9mZnNldFBUICk7XHJcblxyXG4gIHNldE1lbERlY29kZVN0ZE1vZGVzKCBNRUxJTlNULm1lbElOREVYLCAgXCJJTkRFWFwiLCBNRUxQQVJBTURFRi5tZWxQYXJhbURlZkJ5dGVJbW1lZGlhdGUgKTtcclxuXHJcbiAgc2V0TWVsRGVjb2RlU3RkTW9kZXNBbmRUT1MoIE1FTElOU1QubWVsU0VUQiwgICBcIlNFVEJcIiwgTUVMUEFSQU1ERUYubWVsUGFyYW1EZWZCeXRlSW1tZWRpYXRlICk7XHJcbiAgc2V0TWVsRGVjb2RlU3RkTW9kZXNBbmRUT1MoIE1FTElOU1QubWVsQ01QQiwgICBcIkNNUEJcIiwgTUVMUEFSQU1ERUYubWVsUGFyYW1EZWZCeXRlSW1tZWRpYXRlICk7XHJcbiAgc2V0TWVsRGVjb2RlU3RkTW9kZXNBbmRUT1MoIE1FTElOU1QubWVsQUREQiwgICBcIkFEREJcIiwgTUVMUEFSQU1ERUYubWVsUGFyYW1EZWZCeXRlSW1tZWRpYXRlICk7XHJcbiAgc2V0TWVsRGVjb2RlU3RkTW9kZXNBbmRUT1MoIE1FTElOU1QubWVsU1VCQiwgICBcIlNVQkJcIiwgTUVMUEFSQU1ERUYubWVsUGFyYW1EZWZCeXRlSW1tZWRpYXRlICk7XHJcbiAgc2V0TWVsRGVjb2RlU3RkTW9kZXNBbmRUT1MoIE1FTElOU1QubWVsU0VUVywgICBcIlNFVFdcIiwgTUVMUEFSQU1ERUYubWVsUGFyYW1EZWZXb3JkSW1tZWRpYXRlICk7XHJcbiAgc2V0TWVsRGVjb2RlU3RkTW9kZXNBbmRUT1MoIE1FTElOU1QubWVsQ01QVywgICBcIkNNUFdcIiwgTUVMUEFSQU1ERUYubWVsUGFyYW1EZWZXb3JkSW1tZWRpYXRlICk7XHJcbiAgc2V0TWVsRGVjb2RlU3RkTW9kZXNBbmRUT1MoIE1FTElOU1QubWVsQUREVywgICBcIkFERFdcIiwgTUVMUEFSQU1ERUYubWVsUGFyYW1EZWZXb3JkSW1tZWRpYXRlICk7XHJcbiAgc2V0TWVsRGVjb2RlU3RkTW9kZXNBbmRUT1MoIE1FTElOU1QubWVsU1VCVywgICBcIlNVQldcIiwgTUVMUEFSQU1ERUYubWVsUGFyYW1EZWZXb3JkSW1tZWRpYXRlICk7XHJcblxyXG4gIHNldE1lbERlY29kZVN0ZE1vZGVzQW5kVE9TKCBNRUxJTlNULm1lbENMRUFSTiwgXCJDTEVBUk5cIiwgTUVMUEFSQU1ERUYubWVsUGFyYW1EZWZCeXRlT3BlckxlbiApO1xyXG4gIHNldE1lbERlY29kZVN0ZE1vZGVzQW5kVE9TKCBNRUxJTlNULm1lbFRFU1ROLCAgXCJURVNUTlwiLCAgTUVMUEFSQU1ERUYubWVsUGFyYW1EZWZCeXRlT3BlckxlbiApO1xyXG4gIHNldE1lbERlY29kZVN0ZE1vZGVzQW5kVE9TKCBNRUxJTlNULm1lbElOQ04sICAgXCJJTkNOXCIsICAgTUVMUEFSQU1ERUYubWVsUGFyYW1EZWZCeXRlT3BlckxlbiApO1xyXG4gIHNldE1lbERlY29kZVN0ZE1vZGVzQW5kVE9TKCBNRUxJTlNULm1lbERFQ04sICAgXCJERUNOXCIsICAgTUVMUEFSQU1ERUYubWVsUGFyYW1EZWZCeXRlT3BlckxlbiApO1xyXG4gIHNldE1lbERlY29kZVN0ZE1vZGVzQW5kVE9TKCBNRUxJTlNULm1lbE5PVE4sICAgXCJOT1ROXCIsICAgTUVMUEFSQU1ERUYubWVsUGFyYW1EZWZCeXRlT3BlckxlbiApO1xyXG4gIHNldE1lbERlY29kZVN0ZE1vZGVzQW5kVE9TKCBNRUxJTlNULm1lbENNUE4sICAgXCJDTVBOXCIsICAgTUVMUEFSQU1ERUYubWVsUGFyYW1EZWZCeXRlT3BlckxlbiApO1xyXG4gIHNldE1lbERlY29kZVN0ZE1vZGVzQW5kVE9TKCBNRUxJTlNULm1lbEFERE4sICAgXCJBREROXCIsICAgTUVMUEFSQU1ERUYubWVsUGFyYW1EZWZCeXRlT3BlckxlbiApO1xyXG4gIHNldE1lbERlY29kZVN0ZE1vZGVzQW5kVE9TKCBNRUxJTlNULm1lbFNVQk4sICAgXCJTVUJOXCIsICAgTUVMUEFSQU1ERUYubWVsUGFyYW1EZWZCeXRlT3BlckxlbiApO1xyXG4gIHNldE1lbERlY29kZVN0ZE1vZGVzQW5kVE9TKCBNRUxJTlNULm1lbEFORE4sICAgXCJBTkROXCIsICAgTUVMUEFSQU1ERUYubWVsUGFyYW1EZWZCeXRlT3BlckxlbiApO1xyXG4gIHNldE1lbERlY29kZVN0ZE1vZGVzQW5kVE9TKCBNRUxJTlNULm1lbE9STiwgICAgXCJPUk5cIiwgICAgTUVMUEFSQU1ERUYubWVsUGFyYW1EZWZCeXRlT3BlckxlbiApO1xyXG4gIHNldE1lbERlY29kZVN0ZE1vZGVzQW5kVE9TKCBNRUxJTlNULm1lbFhPUk4sICAgXCJYT1JOXCIsICAgTUVMUEFSQU1ERUYubWVsUGFyYW1EZWZCeXRlT3BlckxlbiApO1xyXG5cclxuICBzZXRNZWxEZWNvZGUoIE9QVEFHMk1FTElOU1QoIE1FTElOU1QubWVsU1lTVEVNLCBNRUxUQUdTWVNURU0ubWVsU3lzdGVtTk9QICksIFwiTk9QXCIgKTtcclxuICBzZXRNZWxEZWNvZGUoIE9QVEFHMk1FTElOU1QoIE1FTElOU1QubWVsU1lTVEVNLCBNRUxUQUdTWVNURU0ubWVsU3lzdGVtU2V0U1cgKSwgXCJTRVRTV1wiLCBNRUxQQVJBTURFRi5tZWxQYXJhbURlZldvcmRJbW1lZGlhdGUgKTtcclxuICBzZXRNZWxEZWNvZGUoIE9QVEFHMk1FTElOU1QoIE1FTElOU1QubWVsU1lTVEVNLCBNRUxUQUdTWVNURU0ubWVsU3lzdGVtU2V0TGEgKSwgXCJTRVRMQVwiLCBNRUxQQVJBTURFRi5tZWxQYXJhbURlZldvcmRJbW1lZGlhdGUgKTtcclxuICBzZXRNZWxEZWNvZGUoIE9QVEFHMk1FTElOU1QoIE1FTElOU1QubWVsU1lTVEVNLCBNRUxUQUdTWVNURU0ubWVsU3lzdGVtU2V0U1dMYSApLCBcIlNFVFNXTEFcIiwgTUVMUEFSQU1ERUYubWVsUGFyYW1EZWZXb3JkSW1tZWRpYXRlLCBNRUxQQVJBTURFRi5tZWxQYXJhbURlZldvcmRJbW1lZGlhdGUgKTtcclxuICBzZXRNZWxEZWNvZGUoIE9QVEFHMk1FTElOU1QoIE1FTElOU1QubWVsU1lTVEVNLCBNRUxUQUdTWVNURU0ubWVsU3lzdGVtRXhpdCApLCBcIkVYSVRcIiApO1xyXG4gIHNldE1lbERlY29kZSggT1BUQUcyTUVMSU5TVCggTUVMSU5TVC5tZWxTWVNURU0sIE1FTFRBR1NZU1RFTS5tZWxTeXN0ZW1FeGl0U1cgKSwgXCJFWElUU1dcIiwgTUVMUEFSQU1ERUYubWVsUGFyYW1EZWZXb3JkSW1tZWRpYXRlICk7XHJcbiAgc2V0TWVsRGVjb2RlKCBPUFRBRzJNRUxJTlNUKCBNRUxJTlNULm1lbFNZU1RFTSwgTUVMVEFHU1lTVEVNLm1lbFN5c3RlbUV4aXRMYSApLCBcIkVYSVRBXCIsIE1FTFBBUkFNREVGLm1lbFBhcmFtRGVmV29yZEltbWVkaWF0ZSApO1xyXG4gIHNldE1lbERlY29kZSggT1BUQUcyTUVMSU5TVCggTUVMSU5TVC5tZWxTWVNURU0sIE1FTFRBR1NZU1RFTS5tZWxTeXN0ZW1FeGl0U1dMYSApLCBcIkVYSVRTV0xBXCIsIE1FTFBBUkFNREVGLm1lbFBhcmFtRGVmV29yZEltbWVkaWF0ZSwgTUVMUEFSQU1ERUYubWVsUGFyYW1EZWZXb3JkSW1tZWRpYXRlICk7XHJcblxyXG4gIC8vIHNldE1lbERlY29kZSggT1BUQUcyTUVMSU5TVCggbWVsQlJBTkNILCBtZWxDb25kU1BFQyApLCBcIi0tLVwiLCAwLCBtZWxBZGRyVE9TICk7XHJcbiAgc2V0TWVsRGVjb2RlKCBPUFRBRzJNRUxJTlNUKCBNRUxJTlNULm1lbEJSQU5DSCwgTUVMVEFHQ09ORC5tZWxDb25kRVEgKSwgXCJCRVFcIiwgTUVMUEFSQU1ERUYubWVsUGFyYW1EZWZCeXRlQ29kZVJlbGF0aXZlICk7XHJcbiAgc2V0TWVsRGVjb2RlKCBPUFRBRzJNRUxJTlNUKCBNRUxJTlNULm1lbEJSQU5DSCwgTUVMVEFHQ09ORC5tZWxDb25kTFQgKSwgXCJCTFRcIiwgTUVMUEFSQU1ERUYubWVsUGFyYW1EZWZCeXRlQ29kZVJlbGF0aXZlICk7XHJcbiAgc2V0TWVsRGVjb2RlKCBPUFRBRzJNRUxJTlNUKCBNRUxJTlNULm1lbEJSQU5DSCwgTUVMVEFHQ09ORC5tZWxDb25kTEUgKSwgXCJCTEVcIiwgTUVMUEFSQU1ERUYubWVsUGFyYW1EZWZCeXRlQ29kZVJlbGF0aXZlICk7XHJcbiAgc2V0TWVsRGVjb2RlKCBPUFRBRzJNRUxJTlNUKCBNRUxJTlNULm1lbEJSQU5DSCwgTUVMVEFHQ09ORC5tZWxDb25kR1QgKSwgXCJCR1RcIiwgTUVMUEFSQU1ERUYubWVsUGFyYW1EZWZCeXRlQ29kZVJlbGF0aXZlICk7XHJcbiAgc2V0TWVsRGVjb2RlKCBPUFRBRzJNRUxJTlNUKCBNRUxJTlNULm1lbEJSQU5DSCwgTUVMVEFHQ09ORC5tZWxDb25kR0UgKSwgXCJCR0VcIiwgTUVMUEFSQU1ERUYubWVsUGFyYW1EZWZCeXRlQ29kZVJlbGF0aXZlICk7XHJcbiAgc2V0TWVsRGVjb2RlKCBPUFRBRzJNRUxJTlNUKCBNRUxJTlNULm1lbEJSQU5DSCwgTUVMVEFHQ09ORC5tZWxDb25kTkUgKSwgXCJCTkVcIiwgTUVMUEFSQU1ERUYubWVsUGFyYW1EZWZCeXRlQ29kZVJlbGF0aXZlICk7XHJcbiAgc2V0TWVsRGVjb2RlKCBPUFRBRzJNRUxJTlNUKCBNRUxJTlNULm1lbEJSQU5DSCwgTUVMVEFHQ09ORC5tZWxDb25kQUxMICksIFwiQkFcIiwgTUVMUEFSQU1ERUYubWVsUGFyYW1EZWZCeXRlQ29kZVJlbGF0aXZlICk7XHJcblxyXG4gIHNldE1lbERlY29kZSggT1BUQUcyTUVMSU5TVCggTUVMSU5TVC5tZWxKVU1QLCBNRUxUQUdDT05ELm1lbENvbmRTUEVDICksIFwiSkFcIiwgTUVMUEFSQU1ERUYubWVsUGFyYW1EZWZOb25lICk7XHJcbiAgc2V0TWVsRGVjb2RlKCBPUFRBRzJNRUxJTlNUKCBNRUxJTlNULm1lbEpVTVAsIE1FTFRBR0NPTkQubWVsQ29uZEVRICksIFwiSkVRXCIsIE1FTFBBUkFNREVGLm1lbFBhcmFtRGVmV29yZENvZGVBZGRyZXNzICk7XHJcbiAgc2V0TWVsRGVjb2RlKCBPUFRBRzJNRUxJTlNUKCBNRUxJTlNULm1lbEpVTVAsIE1FTFRBR0NPTkQubWVsQ29uZExUICksIFwiSkxUXCIsIE1FTFBBUkFNREVGLm1lbFBhcmFtRGVmV29yZENvZGVBZGRyZXNzICk7XHJcbiAgc2V0TWVsRGVjb2RlKCBPUFRBRzJNRUxJTlNUKCBNRUxJTlNULm1lbEpVTVAsIE1FTFRBR0NPTkQubWVsQ29uZExFICksIFwiSkxFXCIsIE1FTFBBUkFNREVGLm1lbFBhcmFtRGVmV29yZENvZGVBZGRyZXNzICk7XHJcbiAgc2V0TWVsRGVjb2RlKCBPUFRBRzJNRUxJTlNUKCBNRUxJTlNULm1lbEpVTVAsIE1FTFRBR0NPTkQubWVsQ29uZEdUICksIFwiSkdUXCIsIE1FTFBBUkFNREVGLm1lbFBhcmFtRGVmV29yZENvZGVBZGRyZXNzICk7XHJcbiAgc2V0TWVsRGVjb2RlKCBPUFRBRzJNRUxJTlNUKCBNRUxJTlNULm1lbEpVTVAsIE1FTFRBR0NPTkQubWVsQ29uZEdFICksIFwiSkdFXCIsIE1FTFBBUkFNREVGLm1lbFBhcmFtRGVmV29yZENvZGVBZGRyZXNzICk7XHJcbiAgc2V0TWVsRGVjb2RlKCBPUFRBRzJNRUxJTlNUKCBNRUxJTlNULm1lbEpVTVAsIE1FTFRBR0NPTkQubWVsQ29uZE5FICksIFwiSk5FXCIsIE1FTFBBUkFNREVGLm1lbFBhcmFtRGVmV29yZENvZGVBZGRyZXNzICk7XHJcbiAgc2V0TWVsRGVjb2RlKCBPUFRBRzJNRUxJTlNUKCBNRUxJTlNULm1lbEpVTVAsIE1FTFRBR0NPTkQubWVsQ29uZEFMTCApLCBcIkpBXCIsIE1FTFBBUkFNREVGLm1lbFBhcmFtRGVmV29yZENvZGVBZGRyZXNzICk7XHJcblxyXG4gIHNldE1lbERlY29kZSggT1BUQUcyTUVMSU5TVCggTUVMSU5TVC5tZWxDQUxMLCBNRUxUQUdDT05ELm1lbENvbmRTUEVDICksIFwiQ0FcIiwgTUVMUEFSQU1ERUYubWVsUGFyYW1EZWZOb25lICk7XHJcbiAgc2V0TWVsRGVjb2RlKCBPUFRBRzJNRUxJTlNUKCBNRUxJTlNULm1lbENBTEwsIE1FTFRBR0NPTkQubWVsQ29uZEVRICksIFwiQ0VRXCIsIE1FTFBBUkFNREVGLm1lbFBhcmFtRGVmV29yZENvZGVBZGRyZXNzICk7XHJcbiAgc2V0TWVsRGVjb2RlKCBPUFRBRzJNRUxJTlNUKCBNRUxJTlNULm1lbENBTEwsIE1FTFRBR0NPTkQubWVsQ29uZExUICksIFwiQ0xUXCIsIE1FTFBBUkFNREVGLm1lbFBhcmFtRGVmV29yZENvZGVBZGRyZXNzICk7XHJcbiAgc2V0TWVsRGVjb2RlKCBPUFRBRzJNRUxJTlNUKCBNRUxJTlNULm1lbENBTEwsIE1FTFRBR0NPTkQubWVsQ29uZExFICksIFwiQ0xFXCIsIE1FTFBBUkFNREVGLm1lbFBhcmFtRGVmV29yZENvZGVBZGRyZXNzICk7XHJcbiAgc2V0TWVsRGVjb2RlKCBPUFRBRzJNRUxJTlNUKCBNRUxJTlNULm1lbENBTEwsIE1FTFRBR0NPTkQubWVsQ29uZEdUICksIFwiQ0dUXCIsIE1FTFBBUkFNREVGLm1lbFBhcmFtRGVmV29yZENvZGVBZGRyZXNzICk7XHJcbiAgc2V0TWVsRGVjb2RlKCBPUFRBRzJNRUxJTlNUKCBNRUxJTlNULm1lbENBTEwsIE1FTFRBR0NPTkQubWVsQ29uZEdFICksIFwiQ0dFXCIsIE1FTFBBUkFNREVGLm1lbFBhcmFtRGVmV29yZENvZGVBZGRyZXNzICk7XHJcbiAgc2V0TWVsRGVjb2RlKCBPUFRBRzJNRUxJTlNUKCBNRUxJTlNULm1lbENBTEwsIE1FTFRBR0NPTkQubWVsQ29uZE5FICksIFwiQ05FXCIsIE1FTFBBUkFNREVGLm1lbFBhcmFtRGVmV29yZENvZGVBZGRyZXNzICk7XHJcbiAgc2V0TWVsRGVjb2RlKCBPUFRBRzJNRUxJTlNUKCBNRUxJTlNULm1lbENBTEwsIE1FTFRBR0NPTkQubWVsQ29uZEFMTCApLCBcIkNBXCIsIE1FTFBBUkFNREVGLm1lbFBhcmFtRGVmV29yZENvZGVBZGRyZXNzICk7XHJcblxyXG4gIHNldE1lbERlY29kZSggT1BUQUcyTUVMSU5TVCggTUVMSU5TVC5tZWxTVEFDSywgTUVMVEFHU1RBQ0subWVsU3RhY2tQVVNIWiApLCBcIlBVU0haXCIsIE1FTFBBUkFNREVGLm1lbFBhcmFtRGVmQnl0ZU9wZXJMZW4gKTtcclxuICBzZXRNZWxEZWNvZGUoIE9QVEFHMk1FTElOU1QoIE1FTElOU1QubWVsU1RBQ0ssIE1FTFRBR1NUQUNLLm1lbFN0YWNrUFVTSEIgKSwgXCJQVVNIQlwiLCBNRUxQQVJBTURFRi5tZWxQYXJhbURlZkJ5dGVJbW1lZGlhdGUgKTtcclxuICBzZXRNZWxEZWNvZGUoIE9QVEFHMk1FTElOU1QoIE1FTElOU1QubWVsU1RBQ0ssIE1FTFRBR1NUQUNLLm1lbFN0YWNrUFVTSFcgKSwgXCJQVVNIV1wiLCBNRUxQQVJBTURFRi5tZWxQYXJhbURlZldvcmRJbW1lZGlhdGUgKTtcclxuICAvLyBzZXRNZWxEZWNvZGUoIE9QVEFHMk1FTElOU1QoIG1lbFNUQUNLLCBtZWxTdGFja1hYNCApLCBcIi0tXCIgKTtcclxuICBzZXRNZWxEZWNvZGUoIE9QVEFHMk1FTElOU1QoIE1FTElOU1QubWVsU1RBQ0ssIE1FTFRBR1NUQUNLLm1lbFN0YWNrUE9QTiApLCBcIlBPUE5cIiwgTUVMUEFSQU1ERUYubWVsUGFyYW1EZWZCeXRlT3BlckxlbiApO1xyXG4gIHNldE1lbERlY29kZSggT1BUQUcyTUVMSU5TVCggTUVMSU5TVC5tZWxTVEFDSywgTUVMVEFHU1RBQ0subWVsU3RhY2tQT1BCICksIFwiUE9QQlwiICk7XHJcbiAgc2V0TWVsRGVjb2RlKCBPUFRBRzJNRUxJTlNUKCBNRUxJTlNULm1lbFNUQUNLLCBNRUxUQUdTVEFDSy5tZWxTdGFja1BPUFcgKSwgXCJQT1BXXCIgKTtcclxuICAvLyBzZXRNZWxEZWNvZGUoIE9QVEFHMk1FTElOU1QoIG1lbFNUQUNLLCBtZWxTdGFja1hYNyApLCBcIi0tXCIgKTtcclxuXHJcbiAgc2V0TWVsRGVjb2RlKCBPUFRBRzJNRUxJTlNUKCBNRUxJTlNULm1lbFBSSU1SRVQsIE1FTFRBR1BSSU1SRVQubWVsUHJpbVJldFBSSU0wICksIFwiUFJJTVwiLCBNRUxQQVJBTURFRi5tZWxQYXJhbURlZkJ5dGVJbW1lZGlhdGUgKTtcclxuICBzZXRNZWxEZWNvZGUoIE9QVEFHMk1FTElOU1QoIE1FTElOU1QubWVsUFJJTVJFVCwgTUVMVEFHUFJJTVJFVC5tZWxQcmltUmV0UFJJTTEgKSwgXCJQUklNXCIsIE1FTFBBUkFNREVGLm1lbFBhcmFtRGVmQnl0ZUltbWVkaWF0ZSwgTUVMUEFSQU1ERUYubWVsUGFyYW1EZWZCeXRlSW1tZWRpYXRlICk7XHJcbiAgc2V0TWVsRGVjb2RlKCBPUFRBRzJNRUxJTlNUKCBNRUxJTlNULm1lbFBSSU1SRVQsIE1FTFRBR1BSSU1SRVQubWVsUHJpbVJldFBSSU0yICksIFwiUFJJTVwiLCBNRUxQQVJBTURFRi5tZWxQYXJhbURlZkJ5dGVJbW1lZGlhdGUsIE1FTFBBUkFNREVGLm1lbFBhcmFtRGVmQnl0ZUltbWVkaWF0ZSwgTUVMUEFSQU1ERUYubWVsUGFyYW1EZWZCeXRlSW1tZWRpYXRlICk7XHJcbiAgc2V0TWVsRGVjb2RlKCBPUFRBRzJNRUxJTlNUKCBNRUxJTlNULm1lbFBSSU1SRVQsIE1FTFRBR1BSSU1SRVQubWVsUHJpbVJldFBSSU0zICksIFwiUFJJTVwiLCBNRUxQQVJBTURFRi5tZWxQYXJhbURlZkJ5dGVJbW1lZGlhdGUsIE1FTFBBUkFNREVGLm1lbFBhcmFtRGVmQnl0ZUltbWVkaWF0ZSwgTUVMUEFSQU1ERUYubWVsUGFyYW1EZWZCeXRlSW1tZWRpYXRlLCBNRUxQQVJBTURFRi5tZWxQYXJhbURlZkJ5dGVJbW1lZGlhdGUgKTtcclxuICBzZXRNZWxEZWNvZGUoIE9QVEFHMk1FTElOU1QoIE1FTElOU1QubWVsUFJJTVJFVCwgTUVMVEFHUFJJTVJFVC5tZWxQcmltUmV0UkVUICksIFwiUkVUXCIgKTtcclxuICBzZXRNZWxEZWNvZGUoIE9QVEFHMk1FTElOU1QoIE1FTElOU1QubWVsUFJJTVJFVCwgTUVMVEFHUFJJTVJFVC5tZWxQcmltUmV0UkVUSSApLCBcIlJFVFwiLCBNRUxQQVJBTURFRi5tZWxQYXJhbURlZkJ5dGVPcGVyTGVuICk7XHJcbiAgc2V0TWVsRGVjb2RlKCBPUFRBRzJNRUxJTlNUKCBNRUxJTlNULm1lbFBSSU1SRVQsIE1FTFRBR1BSSU1SRVQubWVsUHJpbVJldFJFVE8gKSwgXCJSRVRcIiwgTUVMUEFSQU1ERUYubWVsUGFyYW1EZWZCeXRlT3BlckxlbiApO1xyXG4gIHNldE1lbERlY29kZSggT1BUQUcyTUVMSU5TVCggTUVMSU5TVC5tZWxQUklNUkVULCBNRUxUQUdQUklNUkVULm1lbFByaW1SZXRSRVRJTyApLCBcIlJFVFwiLCBNRUxQQVJBTURFRi5tZWxQYXJhbURlZkJ5dGVPcGVyTGVuLCBNRUxQQVJBTURFRi5tZWxQYXJhbURlZkJ5dGVPcGVyTGVuICk7XHJcbn1cclxuXHJcblxyXG5maWxsTWVsRGVjb2RlKCk7XHJcblxyXG5leHBvcnQgdmFyIE1FTERlY29kZSA9IE1FTC5tZWxEZWNvZGU7XHJcbmV4cG9ydCBjb25zdCBNRUxfQ0NSX1ogPSAweDAxO1xyXG5leHBvcnQgY29uc3QgTUVMX0NDUl9DID0gMHgwMjtcclxuIiwiaW1wb3J0ICogYXMgTUVMIGZyb20gJy4vbWVsLWRlZmluZXMnO1xyXG5pbXBvcnQgeyBCeXRlQXJyYXkgfSBmcm9tICdjcnlwdG9ncmFwaGl4LXNpbS1jb3JlJztcclxuXHJcbmltcG9ydCB7IENvbW1hbmRBUERVIH0gZnJvbSAnLi4vaXNvNzgxNi9jb21tYW5kLWFwZHUnO1xyXG5pbXBvcnQgeyBSZXNwb25zZUFQRFUgfSBmcm9tICcuLi9pc283ODE2L3Jlc3BvbnNlLWFwZHUnO1xyXG5cclxuZnVuY3Rpb24gaGV4KCB2YWwgKSB7IHJldHVybiB2YWwudG9TdHJpbmcoIDE2ICk7IH1cclxuZnVuY3Rpb24gaGV4MiggdmFsICkgeyByZXR1cm4gKCBcIjAwXCIgKyB2YWwudG9TdHJpbmcoIDE2ICkgKS5zdWJzdHIoIC0yICk7IH1cclxuZnVuY3Rpb24gaGV4NCggdmFsICkgeyByZXR1cm4gKCBcIjAwMDBcIiArIHZhbC50b1N0cmluZyggMTYgKSApLnN1YnN0ciggLTQgKTsgfVxyXG5mdW5jdGlvbiBsanVzdCggc3RyLCB3ICkgeyByZXR1cm4gKCBzdHIgKyBBcnJheSggdyArIDEgKS5qb2luKCBcIiBcIiApICkuc3Vic3RyKCAwLCB3ICk7IH1cclxuZnVuY3Rpb24gcmp1c3QoIHN0ciwgdyApIHsgcmV0dXJuICggQXJyYXkoIHcgKyAxICkuam9pbiggXCIgXCIgKSArIHN0ciApLnN1YnN0ciggLXcgKTsgfVxyXG5cclxuZnVuY3Rpb24gICBCQTJXKCB2YWwgKVxyXG57XHJcbiAgcmV0dXJuICggdmFsWyAwIF0gPDwgOCApIHwgdmFsWyAxIF07XHJcbn1cclxuXHJcbmZ1bmN0aW9uICAgVzJCQSggdmFsIClcclxue1xyXG5cclxuICByZXR1cm4gbmV3IEJ5dGVBcnJheSggWyB2YWwgPj4gOCwgdmFsICYgMHhGRiBdICk7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBNRUxWaXJ0dWFsTWFjaGluZSB7XHJcbiAgLy8gY2FyZFxyXG4gIHJhbVNlZ21lbnQ7XHJcbiAgcm9tU2VnbWVudDtcclxuXHJcbiAgLy8gYXBwbGljYXRpb25cclxuICBjb2RlQXJlYTtcclxuICBzdGF0aWNBcmVhO1xyXG4gIHB1YmxpY0FyZWE7XHJcbiAgZHluYW1pY0FyZWE7XHJcbiAgc2Vzc2lvblNpemU7XHJcblxyXG4gIC8vIGV4ZWN1dGlvblxyXG4gIGlzRXhlY3V0aW5nO1xyXG4gIGN1cnJlbnRJUDtcclxuICBsb2NhbEJhc2U7XHJcbiAgZHluYW1pY1RvcDtcclxuICBjb25kaXRpb25Db2RlUmVnO1xyXG5cclxuICBpbml0TVZNKCBwYXJhbXMgKVxyXG4gIHtcclxuICAgIHRoaXMucm9tU2VnbWVudCA9IHBhcmFtcy5yb21TZWdtZW50O1xyXG4gICAgdGhpcy5yYW1TZWdtZW50ID0gcGFyYW1zLnJhbVNlZ21lbnQ7XHJcblxyXG4gICAgdGhpcy5wdWJsaWNBcmVhID0gdGhpcy5yYW1TZWdtZW50Lm5ld0FjY2Vzc29yKCAwLCA1MTIsIFwiUFwiICk7XHJcbiAgfVxyXG5cclxuICBkaXNhc3NlbWJsZUNvZGUoIHJlc2V0SVAsIHN0ZXBUb05leHRJUCApXHJcbiAge1xyXG4gICAgdmFyIGRpc21UZXh0ID0gXCJcIjtcclxuICAgIGZ1bmN0aW9uIHByaW50KCBzdHIgKSB7IGRpc21UZXh0ICs9IHN0cjsgfVxyXG5cclxuICAgIGlmICggcmVzZXRJUCApXHJcbiAgICAgIHRoaXMuY3VycmVudElQID0gMDtcclxuXHJcbiAgICBpZiAoIHRoaXMuY3VycmVudElQID49IHRoaXMuY29kZUFyZWEuZ2V0TGVuZ3RoKCkgKVxyXG4gICAgICByZXR1cm4gbnVsbDtcclxuXHJcbiAgICB0cnlcclxuICAgIHtcclxuICAgICAgdmFyIG5leHRJUCA9IHRoaXMuY3VycmVudElQO1xyXG4gICAgICB2YXIgaW5zdEJ5dGUgPSB0aGlzLmNvZGVBcmVhLnJlYWRCeXRlKCBuZXh0SVArKyApO1xyXG4gICAgICB2YXIgcGFyYW1Db3VudCA9IDA7XHJcbiAgICAgIHZhciBwYXJhbVZhbCA9IFtdO1xyXG4gICAgICB2YXIgcGFyYW1EZWYgPSBbXTtcclxuXHJcbiAgICAgIHZhciBtZWxJbnN0ID0gTUVMLk1FTERlY29kZVsgaW5zdEJ5dGUgXTtcclxuXHJcbiAgICAgIGlmICggbWVsSW5zdCA9PSB1bmRlZmluZWQgKVxyXG4gICAgICB7XHJcbiAgICAgICAgcHJpbnQoIFwiW1wiICsgaGV4NCggdGhpcy5jdXJyZW50SVAgKSArIFwiXSAgICAgICAgICBcIiArIGxqdXN0KCBcIkVSUk9SOlwiICsgaGV4MiggaW5zdEJ5dGUgKSwgOCApICsgXCIgKioqKioqKipcXG5cIiApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2VcclxuICAgICAge1xyXG4gICAgICAgIHZhciBwYXJhbURlZnMgPSBtZWxJbnN0LnBhcmFtRGVmcztcclxuICAgICAgICB3aGlsZSggcGFyYW1EZWZzICE9IDAgKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHBhcmFtRGVmWyBwYXJhbUNvdW50IF0gPSBwYXJhbURlZnMgJiAweEZGO1xyXG4gICAgICAgICAgc3dpdGNoKCBwYXJhbURlZnMgJiAweEYwIClcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgY2FzZSAweDAwOiBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAweDEwOiBwYXJhbVZhbFsgcGFyYW1Db3VudCBdID0gdGhpcy5jb2RlQXJlYS5yZWFkQnl0ZSggbmV4dElQKysgKTsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMHgyMDogcGFyYW1WYWxbIHBhcmFtQ291bnQgXSA9IEJBMlcoIFsgdGhpcy5jb2RlQXJlYS5yZWFkQnl0ZSggbmV4dElQKysgKSwgdGhpcy5jb2RlQXJlYS5yZWFkQnl0ZSggbmV4dElQKysgKSBdICk7IGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcGFyYW1Db3VudCsrO1xyXG4gICAgICAgICAgcGFyYW1EZWZzID4+PSA4O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpbnQoIFwiW1wiICsgaGV4NCggdGhpcy5jdXJyZW50SVAgKSArIFwiXSAgICAgICAgICBcIiArIGxqdXN0KCBtZWxJbnN0Lmluc3ROYW1lLCA4ICkgKTtcclxuXHJcbiAgICAgICAgaWYgKCAoIHBhcmFtQ291bnQgPiAxIClcclxuICAgICAgICAgICYmICggKCBwYXJhbURlZlsgMCBdID09IE1FTC5NRUxQQVJBTURFRi5tZWxQYXJhbURlZkJ5dGVPcGVyTGVuIClcclxuICAgICAgICAgICAgfHwgKCBwYXJhbURlZlsgMCBdID09IE1FTC5NRUxQQVJBTURFRi5tZWxQYXJhbURlZkJ5dGVJbW1lZGlhdGUgKVxyXG4gICAgICAgICAgICB8fCAoIHBhcmFtRGVmWyAwIF0gPT0gTUVMLk1FTFBBUkFNREVGLm1lbFBhcmFtRGVmV29yZEltbWVkaWF0ZSApIClcclxuICAgICAgICAgICYmICggcGFyYW1EZWZbIDEgXSAhPSBNRUwuTUVMUEFSQU1ERUYubWVsUGFyYW1EZWZCeXRlSW1tZWRpYXRlIClcclxuICAgICAgICAgICYmICggcGFyYW1EZWZbIDEgXSAhPSBNRUwuTUVMUEFSQU1ERUYubWVsUGFyYW1EZWZCeXRlT3BlckxlbiApIClcclxuICAgICAgICB7XHJcbiAgICAgICAgICB2YXIgdGVtcFZhbCA9IHBhcmFtVmFsWzFdOyBwYXJhbVZhbFsxXSA9IHBhcmFtVmFsWzBdOyBwYXJhbVZhbFswXSA9IHRlbXBWYWw7XHJcbiAgICAgICAgICB2YXIgdGVtcERlZiA9IHBhcmFtRGVmWzFdOyBwYXJhbURlZlsxXSA9IHBhcmFtRGVmWzBdOyBwYXJhbURlZlswXSA9IHRlbXBEZWY7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IoIHZhciBwYXJhbUluZGV4ID0gMDsgcGFyYW1JbmRleCA8IHBhcmFtQ291bnQ7ICsrcGFyYW1JbmRleCApXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgdmFyIHYgPSBwYXJhbVZhbFsgcGFyYW1JbmRleCBdO1xyXG4gICAgICAgICAgdmFyIGQgPSBwYXJhbURlZlsgcGFyYW1JbmRleCBdO1xyXG5cclxuICAgICAgICAgIHN3aXRjaCggZCApXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGNhc2UgTUVMLk1FTFBBUkFNREVGLm1lbFBhcmFtRGVmQnl0ZU9wZXJMZW46XHJcbiAgICAgICAgICAgICAgaWYgKCB2ID4gMCApXHJcbiAgICAgICAgICAgICAgICBwcmludCggXCIweFwiICsgaGV4KCB2ICkgKTtcclxuICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICBwcmludCggdiApO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgY2FzZSBNRUwuTUVMUEFSQU1ERUYubWVsUGFyYW1EZWZCeXRlSW1tZWRpYXRlOlxyXG4gICAgICAgICAgICAgIGlmICggdiA+IDAgKVxyXG4gICAgICAgICAgICAgICAgcHJpbnQoIFwiMHhcIiArIGhleCggdiApICk7XHJcbiAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgcHJpbnQoIHYgKTtcclxuICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgIGNhc2UgTUVMLk1FTFBBUkFNREVGLm1lbFBhcmFtRGVmV29yZEltbWVkaWF0ZTpcclxuICAgICAgICAgICAgICBwcmludCggXCIweFwiICsgaGV4KCB2ICkgKTtcclxuICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgIGNhc2UgTUVMLk1FTFBBUkFNREVGLm1lbFBhcmFtRGVmV29yZENvZGVBZGRyZXNzOlxyXG4gICAgICAgICAgICAgIHByaW50KCBoZXg0KCB2ICkgKTtcclxuICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgIGNhc2UgTUVMLk1FTFBBUkFNREVGLm1lbFBhcmFtRGVmQnl0ZUNvZGVSZWxhdGl2ZTpcclxuICAgICAgICAgICAgICBwcmludCggaGV4NCggdGhpcy5jdXJyZW50SVAgKyAyICsgdiApICk7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICBjYXNlIE1FTC5NRUxQQVJBTURFRi5tZWxQYXJhbURlZldvcmRPZmZzZXRTQjogIC8vIDAxXHJcbiAgICAgICAgICAgIGNhc2UgTUVMLk1FTFBBUkFNREVGLm1lbFBhcmFtRGVmV29yZE9mZnNldFNUOiAgLy8gMDJcclxuICAgICAgICAgICAgY2FzZSBNRUwuTUVMUEFSQU1ERUYubWVsUGFyYW1EZWZXb3JkT2Zmc2V0REI6ICAvLyAwM1xyXG4gICAgICAgICAgICBjYXNlIE1FTC5NRUxQQVJBTURFRi5tZWxQYXJhbURlZldvcmRPZmZzZXRMQjogIC8vIDA0XHJcbiAgICAgICAgICAgIGNhc2UgTUVMLk1FTFBBUkFNREVGLm1lbFBhcmFtRGVmV29yZE9mZnNldERUOiAgLy8gMDVcclxuICAgICAgICAgICAgY2FzZSBNRUwuTUVMUEFSQU1ERUYubWVsUGFyYW1EZWZXb3JkT2Zmc2V0UEI6ICAvLyAwNlxyXG4gICAgICAgICAgICBjYXNlIE1FTC5NRUxQQVJBTURFRi5tZWxQYXJhbURlZldvcmRPZmZzZXRQVDogIC8vIDA3XHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICB2YXIgc2VnID0gWyBcIlwiLCBcIlNCXCIsIFwiU1RcIiwgXCJEQlwiLCBcIkxCXCIsIFwiRFRcIiwgXCJQQlwiLCBcIlBUXCIgXTtcclxuICAgICAgICAgICAgICBwcmludCggc2VnWyBkICYgMHgwNyBdICk7XHJcbiAgICAgICAgICAgICAgaWYgKCB2ID4gMCApXHJcbiAgICAgICAgICAgICAgICBwcmludCggXCJbMHhcIiArIGhleCggdiApICsgXCJdXCIgKTtcclxuICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICBwcmludCggXCJbXCIgKyB2ICsgXCJdXCIgKTtcclxuICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmICggcGFyYW1JbmRleCA8IHBhcmFtQ291bnQgLSAxIClcclxuICAgICAgICAgICAgcHJpbnQoIFwiLCBcIiApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwcmludCggXCJcXG5cIiApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIHN0ZXBUb05leHRJUCApXHJcbiAgICAgICAgdGhpcy5jdXJyZW50SVAgPSBuZXh0SVA7XHJcbiAgICB9XHJcbiAgICBjYXRjaCggZSApXHJcbiAgICB7XHJcbiAgICAgIHByaW50KCBlICk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICByZXR1cm4gZGlzbVRleHQ7XHJcbiAgfVxyXG5cclxuICAvL1xyXG4gIC8vIE1VTFRPUyBhZGRyZXNzZXMgYXJlIDE2LWJpdCBsaW5lYXIgdmFsdWVzLCB3aGVuIHB1c2hlZCBvbnRvIHN0YWNrXHJcbiAgLy8gYW5kIHVzZWQgZm9yIGluZGlyZWN0aW9uLiBXZSBtYXAgYWRkcmVzcy10YWcgYW5kIG9mZnNldCBwYWlycyB0byBsaW5lYXJcclxuICAvLyBhZGRyZXNzZXMsIGFuZCBiYWNrIGFnYWluLCBieSBiYXNpbmcgc3RhdGljIGF0IDB4MDAwMCwgZHluYW1pYyBhdCAweDgwMDBcclxuICAvLyBhbmQgcHVibGljIGF0IDB4RjAwMC5cclxuICAvL1xyXG4gIHByaXZhdGUgbWFwVG9TZWdtZW50QWRkciggYWRkclRhZywgYWRkck9mZnNldCApXHJcbiAge1xyXG4gICAgdmFyIHRhcmdldEFjY2VzcyA9IHRoaXMuY2hlY2tEYXRhQWNjZXNzKCBhZGRyVGFnLCBhZGRyT2Zmc2V0LCAwICk7XHJcblxyXG4gICAgc3dpdGNoKCBhZGRyVGFnIClcclxuICAgIHtcclxuICAgICAgY2FzZSBNRUwuTUVMVEFHQUREUi5tZWxBZGRyVE9TOlxyXG4gICAgICBjYXNlIE1FTC5NRUxUQUdBRERSLm1lbEFkZHJEQjpcclxuICAgICAgY2FzZSBNRUwuTUVMVEFHQUREUi5tZWxBZGRyTEI6XHJcbiAgICAgIGNhc2UgTUVMLk1FTFRBR0FERFIubWVsQWRkckRUOlxyXG4gICAgICAgIHJldHVybiAweDgwMDAgKyB0YXJnZXRBY2Nlc3MuZGF0YU9mZnNldDtcclxuXHJcbiAgICAgIGNhc2UgTUVMLk1FTFRBR0FERFIubWVsQWRkclNCOlxyXG4gICAgICBjYXNlIE1FTC5NRUxUQUdBRERSLm1lbEFkZHJTVDpcclxuICAgICAgICByZXR1cm4gdGFyZ2V0QWNjZXNzLmRhdGFPZmZzZXQ7XHJcblxyXG4gICAgICBjYXNlIE1FTC5NRUxUQUdBRERSLm1lbEFkZHJQQjpcclxuICAgICAgY2FzZSBNRUwuTUVMVEFHQUREUi5tZWxBZGRyUFQ6XHJcbiAgICAgICAgcmV0dXJuIDB4RjAwMCArIHRhcmdldEFjY2Vzcy5kYXRhT2Zmc2V0O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBtYXBGcm9tU2VnbWVudEFkZHIoIHNlZ21lbnRBZGRyIClcclxuICB7XHJcbiAgICBpZiAoIHNlZ21lbnRBZGRyICYgMHg4MDAwIClcclxuICAgIHtcclxuICAgICAgaWYgKCBzZWdtZW50QWRkciA+PSAweEYwMDAgKVxyXG4gICAgICB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIGRhdGFBcmVhOiB0aGlzLnB1YmxpY0FyZWEsXHJcbiAgICAgICAgICBkYXRhQWRkclRhZzogTUVMLk1FTFRBR0FERFIubWVsQWRkclBCLFxyXG4gICAgICAgICAgZGF0YU9mZnNldDogc2VnbWVudEFkZHIgJiAweDBGRkZcclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2VcclxuICAgICAge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBkYXRhQXJlYTogdGhpcy5keW5hbWljQXJlYSxcclxuICAgICAgICAgIGRhdGFBZGRyVGFnOiBNRUwuTUVMVEFHQUREUi5tZWxBZGRyREIsXHJcbiAgICAgICAgICBkYXRhT2Zmc2V0OiBzZWdtZW50QWRkciAmIDB4M0ZGRlxyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2VcclxuICAgIHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBkYXRhQXJlYTogdGhpcy5zdGF0aWNBcmVhLFxyXG4gICAgICAgIGRhdGFBZGRyVGFnOiBNRUwuTUVMVEFHQUREUi5tZWxBZGRyU0IsXHJcbiAgICAgICAgZGF0YU9mZnNldDogc2VnbWVudEFkZHIgJiAweDdGRkZcclxuICAgICAgfTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vXHJcbiAgLy8gdmFsaWRhdGUgYSBtdWx0aS1ieXRlIG1lbW9yeSBhY2Nlc3MsIHNwZWNpZmllZCBieSBhZGRyZXNzLXRhZy9vZmZzZXQgcGFpclxyXG4gIC8vIGFuZCBsZW5ndGggdmFsdWVzLiBJZiBvaywgbWFwIHRvIGFuIGFyZWEgYW5kIG9mZnNldCB3aXRoaW4gdGhhdCBhcmVhLlxyXG4gIC8vIENhbiBhY2NlcHQgcG9zaXRpdmUvbmVnYXRpdmUgb2Zmc2V0cywgc2luY2UgdGhleSBhcmVhIHJlbGF0aXZlIHRvIHRoZVxyXG4gIC8vIHRoZSB0b3Agb3IgdGhlIGJvdHRvbSBvZiB0aGUgc3BlY2lmaWVkIGFyZWEsIGFzIGluZGljYXRlZCBieSB0aGUgdGFnLlxyXG4gIC8vXHJcbiAgcHJpdmF0ZSBjaGVja0RhdGFBY2Nlc3MoIGFkZHJUYWcsIG9mZnNldCwgbGVuZ3RoIClcclxuICB7XHJcbiAgICB2YXIgZGF0YUFyZWE7XHJcbiAgICB2YXIgZGF0YU9mZnNldCA9IG9mZnNldDtcclxuICAgIHZhciBhcmVhTGltaXQ7XHJcblxyXG4gICAgc3dpdGNoKCBhZGRyVGFnIClcclxuICAgIHtcclxuICAgICAgY2FzZSBNRUwuTUVMVEFHQUREUi5tZWxBZGRyVE9TOlxyXG4gICAgICAgIGRhdGFBcmVhID0gdGhpcy5keW5hbWljQXJlYTtcclxuICAgICAgICBhcmVhTGltaXQgPSB0aGlzLmR5bmFtaWNBcmVhLmdldExlbmd0aCgpO1xyXG4gICAgICAgIGRhdGFPZmZzZXQgKz0gdGhpcy5sb2NhbEJhc2U7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBjYXNlIE1FTC5NRUxUQUdBRERSLm1lbEFkZHJEQjpcclxuICAgICAgICBkYXRhQXJlYSA9IHRoaXMuZHluYW1pY0FyZWE7XHJcbiAgICAgICAgYXJlYUxpbWl0ID0gdGhpcy5keW5hbWljQXJlYS5nZXRMZW5ndGgoKTtcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIGNhc2UgTUVMLk1FTFRBR0FERFIubWVsQWRkckxCOlxyXG4gICAgICAgIGRhdGFBcmVhID0gdGhpcy5keW5hbWljQXJlYTtcclxuICAgICAgICBhcmVhTGltaXQgPSB0aGlzLmR5bmFtaWNBcmVhLmdldExlbmd0aCgpO1xyXG4gICAgICAgIGRhdGFPZmZzZXQgKz0gdGhpcy5sb2NhbEJhc2U7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBjYXNlIE1FTC5NRUxUQUdBRERSLm1lbEFkZHJEVDpcclxuICAgICAgICBkYXRhQXJlYSA9IHRoaXMuZHluYW1pY0FyZWE7XHJcbiAgICAgICAgYXJlYUxpbWl0ID0gdGhpcy5keW5hbWljQXJlYS5nZXRMZW5ndGgoKTtcclxuICAgICAgICBkYXRhT2Zmc2V0ICs9IHRoaXMuZHluYW1pY1RvcDtcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIGNhc2UgTUVMLk1FTFRBR0FERFIubWVsQWRkclNCOlxyXG4gICAgICAgIGRhdGFBcmVhID0gdGhpcy5zdGF0aWNBcmVhO1xyXG4gICAgICAgIGFyZWFMaW1pdCA9IHRoaXMuc3RhdGljQXJlYS5nZXRMZW5ndGgoKTtcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIGNhc2UgTUVMLk1FTFRBR0FERFIubWVsQWRkclNUOlxyXG4gICAgICAgIGRhdGFBcmVhID0gdGhpcy5zdGF0aWNBcmVhO1xyXG4gICAgICAgIGFyZWFMaW1pdCA9IHRoaXMuc3RhdGljQXJlYS5nZXRMZW5ndGgoKTtcclxuICAgICAgICBkYXRhT2Zmc2V0ICs9IGFyZWFMaW1pdDtcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIGNhc2UgTUVMLk1FTFRBR0FERFIubWVsQWRkclBCOlxyXG4gICAgICAgIGRhdGFBcmVhID0gdGhpcy5wdWJsaWNBcmVhO1xyXG4gICAgICAgIGFyZWFMaW1pdCA9IHRoaXMucHVibGljQXJlYS5nZXRMZW5ndGgoKTtcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIGNhc2UgTUVMLk1FTFRBR0FERFIubWVsQWRkclBUOlxyXG4gICAgICAgIGRhdGFBcmVhID0gdGhpcy5wdWJsaWNBcmVhO1xyXG4gICAgICAgIGFyZWFMaW1pdCA9IHRoaXMucHVibGljQXJlYS5nZXRMZW5ndGgoKTtcclxuICAgICAgICBkYXRhT2Zmc2V0ICs9IGFyZWFMaW1pdDtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuXHJcbiAgICBkYXRhT2Zmc2V0ICY9IDB4ZmZmZjsgLy8gMTYgYml0cyBhZGRyZXNzZXNcclxuICAgIGlmICggKCBkYXRhT2Zmc2V0IDwgYXJlYUxpbWl0ICkgJiYgKCBkYXRhT2Zmc2V0ICsgbGVuZ3RoIDwgYXJlYUxpbWl0ICkgKVxyXG4gICAge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIGRhdGFBcmVhOiBkYXRhQXJlYSxcclxuICAgICAgICBkYXRhT2Zmc2V0OiBkYXRhT2Zmc2V0XHJcbiAgICAgIH07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvL1xyXG4gIC8vIHBlcmZvcm0gYSB2YWxpZGF0ZWQgbXVsdGktYnl0ZSByZWFkLCBzcGVjaWZpZWQgYnkgYWRkcmVzcy10YWcvb2Zmc2V0IHBhaXIgYW5kXHJcbiAgLy8gbGVuZ3RoIHZhbHVlcy4gUmV0dXJuIGRhdGEtYXJyYXksIG9yIHVuZGVmaW5lZFxyXG4gIC8vXHJcbiAgcHJpdmF0ZSByZWFkU2VnbWVudERhdGEoIGFkZHJUYWcsIG9mZnNldCwgbGVuZ3RoIClcclxuICB7XHJcbiAgICB2YXIgdGFyZ2V0QWNjZXNzID0gdGhpcy5jaGVja0RhdGFBY2Nlc3MoIGFkZHJUYWcsIG9mZnNldCwgMSApO1xyXG4gICAgaWYgKCB0YXJnZXRBY2Nlc3MgPT0gdW5kZWZpbmVkIClcclxuICAgICAgcmV0dXJuO1xyXG5cclxuICAgIHJldHVybiB0YXJnZXRBY2Nlc3MuZGF0YUFyZWEucmVhZEJ5dGVzKCB0YXJnZXRBY2Nlc3MuZGF0YU9mZnNldCwgbGVuZ3RoICk7XHJcbiAgfVxyXG5cclxuICAvL1xyXG4gIC8vIHBlcmZvcm0gYSB2YWxpZGF0ZWQgbXVsdGktYnl0ZSB3cml0ZSwgc3BlY2lmaWVkIGJ5IGFkZHJlc3MtdGFnL29mZnNldCBwYWlyIGFuZFxyXG4gIC8vIGRhdGEtYXJyYXkgdG8gYmUgd3JpdHRlbi5cclxuICAvL1xyXG4gIHByaXZhdGUgd3JpdGVTZWdtZW50RGF0YSggYWRkclRhZywgb2Zmc2V0LCB2YWwgKVxyXG4gIHtcclxuICAgIHZhciB0YXJnZXRBY2Nlc3MgPSB0aGlzLmNoZWNrRGF0YUFjY2VzcyggYWRkclRhZywgb2Zmc2V0LCAxICk7XHJcbiAgICBpZiAoIHRhcmdldEFjY2VzcyA9PSB1bmRlZmluZWQgKVxyXG4gICAgICByZXR1cm47XHJcblxyXG4gICAgdGFyZ2V0QWNjZXNzLmRhdGFBcmVhLndyaXRlQnl0ZXMoIHRhcmdldEFjY2Vzcy5kYXRhT2Zmc2V0LCB2YWwgKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcHVzaFplcm9zVG9TdGFjayggY250IClcclxuICB7XHJcbiAgICB0aGlzLmR5bmFtaWNBcmVhLnplcm9CeXRlcyggdGhpcy5keW5hbWljVG9wLCBjbnQgKTtcclxuXHJcbiAgICB0aGlzLmR5bmFtaWNUb3AgKz0gY250O1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBwdXNoQ29uc3RUb1N0YWNrKCBjbnQsIHZhbCApXHJcbiAge1xyXG4gICAgaWYgKCBjbnQgPT0gMSApXHJcbiAgICAgIHRoaXMuZHluYW1pY0FyZWEud3JpdGVCeXRlcyggdGhpcy5keW5hbWljVG9wLCBbIHZhbCBdICk7XHJcbiAgICBlbHNlXHJcbiAgICAgIHRoaXMuZHluYW1pY0FyZWEud3JpdGVCeXRlcyggdGhpcy5keW5hbWljVG9wLCBXMkJBKCB2YWwgKSApO1xyXG5cclxuICAgIHRoaXMuZHluYW1pY1RvcCArPSBjbnQ7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGNvcHlPblN0YWNrKCBmcm9tT2Zmc2V0LCB0b09mZnNldCwgY250IClcclxuICB7XHJcbiAgICB0aGlzLmR5bmFtaWNBcmVhLmNvcHlCeXRlcyggZnJvbU9mZnNldCwgdG9PZmZzZXQsIGNudCApO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBwdXNoVG9TdGFjayggYWRkclRhZywgb2Zmc2V0LCBjbnQgKVxyXG4gIHtcclxuICAgIHRoaXMuZHluYW1pY1RvcCArPSBjbnQ7XHJcbiAgICB0aGlzLmR5bmFtaWNBcmVhLndyaXRlQnl0ZXMoIHRoaXMuZHluYW1pY1RvcCwgdGhpcy5yZWFkU2VnbWVudERhdGEoIGFkZHJUYWcsIG9mZnNldCwgY250ICkgKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcG9wRnJvbVN0YWNrQW5kU3RvcmUoIGFkZHJUYWcsIG9mZnNldCwgY250IClcclxuICB7XHJcbiAgICB0aGlzLmR5bmFtaWNUb3AgLT0gY250O1xyXG5cclxuICAgIHRoaXMud3JpdGVTZWdtZW50RGF0YSggYWRkclRhZywgb2Zmc2V0LCB0aGlzLmR5bmFtaWNBcmVhLnJlYWRCeXRlcyggdGhpcy5keW5hbWljVG9wLCBjbnQgKSApO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBwb3BGcm9tU3RhY2soIGNudCApXHJcbiAge1xyXG4gICAgdGhpcy5keW5hbWljVG9wIC09IGNudDtcclxuXHJcbiAgICByZXR1cm4gdGhpcy5keW5hbWljQXJlYS5yZWFkQnl0ZXMoIHRoaXMuZHluYW1pY1RvcCwgY250ICk7XHJcbiAgfVxyXG5cclxuICAvLyBzZXR1cCBhcHBsaWNhdGlvbiBmb3IgZXhlY3V0aW9uXHJcbiAgc2V0dXBBcHBsaWNhdGlvbiggZXhlY1BhcmFtcyApXHJcbiAge1xyXG4gICAgdGhpcy5jb2RlQXJlYSA9IGV4ZWNQYXJhbXMuY29kZUFyZWE7XHJcbiAgICB0aGlzLnN0YXRpY0FyZWEgPSBleGVjUGFyYW1zLnN0YXRpY0FyZWE7XHJcbiAgICB0aGlzLnNlc3Npb25TaXplID0gZXhlY1BhcmFtcy5zZXNzaW9uU2l6ZTtcclxuXHJcbiAgICB0aGlzLmR5bmFtaWNBcmVhID0gdGhpcy5yYW1TZWdtZW50Lm5ld0FjY2Vzc29yKCAwLCA1MTIsIFwiRFwiICk7IC8vVE9ETzogZXhlY1BhcmFtcy5zZXNzaW9uU2l6ZVxyXG5cclxuICAgIHRoaXMuaW5pdEV4ZWN1dGlvbigpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBpbml0RXhlY3V0aW9uKClcclxuICB7XHJcbiAgICB0aGlzLmN1cnJlbnRJUCA9IDA7XHJcbiAgICB0aGlzLmlzRXhlY3V0aW5nID0gdHJ1ZTtcclxuXHJcbiAgICAvLyBUT0RPOiBTZXBhcmF0ZSBzdGFjayBhbmQgc2Vzc2lvblxyXG4gICAgdGhpcy5sb2NhbEJhc2UgPSB0aGlzLnNlc3Npb25TaXplO1xyXG4gICAgdGhpcy5keW5hbWljVG9wID0gdGhpcy5sb2NhbEJhc2U7XHJcblxyXG4gICAgdGhpcy5jb25kaXRpb25Db2RlUmVnID0gMDtcclxuICB9XHJcblxyXG4gIHNlZ3MgPSBbIFwiXCIsIFwiU0JcIiwgXCJTVFwiLCBcIkRCXCIsIFwiTEJcIiwgXCJEVFwiLCBcIlBCXCIsIFwiUFRcIiBdO1xyXG5cclxuICBwcml2YXRlIGNvbnN0Qnl0ZUJpbmFyeU9wZXJhdGlvbiggb3BDb2RlLCBjb25zdFZhbCwgYWRkclRhZywgYWRkck9mZnNldCApXHJcbiAge1xyXG4gICAgdmFyIHRhcmdldEFjY2VzcyA9IHRoaXMuY2hlY2tEYXRhQWNjZXNzKCBhZGRyVGFnLCBhZGRyT2Zmc2V0LCAxICk7XHJcbiAgICBpZiAoIHRhcmdldEFjY2VzcyA9PSB1bmRlZmluZWQgKVxyXG4gICAgICByZXR1cm47XHJcblxyXG4gICAgdmFyIHRlbXBWYWwgPSB0YXJnZXRBY2Nlc3MuZGF0YUFyZWEucmVhZEJ5dGUoIHRhcmdldEFjY2Vzcy5kYXRhT2Zmc2V0ICk7XHJcblxyXG4gICAgc3dpdGNoKCBvcENvZGUgKVxyXG4gICAge1xyXG4gICAgICBjYXNlIE1FTC5NRUxJTlNULm1lbEFEREI6XHJcbiAgICAgICAgdGhpcy5jb25kaXRpb25Db2RlUmVnICY9IH4oIE1FTC5NRUxfQ0NSX0MgfCBNRUwuTUVMX0NDUl9aICk7XHJcbiAgICAgICAgdGVtcFZhbCA9ICggdGVtcFZhbCArIGNvbnN0VmFsICk7XHJcbiAgICAgICAgaWYgKCB0ZW1wVmFsIDwgY29uc3RWYWwgKSAgLy8gd3JhcD9cclxuICAgICAgICAgIHRoaXMuY29uZGl0aW9uQ29kZVJlZyB8PSBNRUwuTUVMX0NDUl9DO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgY2FzZSBNRUwuTUVMSU5TVC5tZWxTVUJCOlxyXG4gICAgICAgIHRoaXMuY29uZGl0aW9uQ29kZVJlZyAmPSB+KCBNRUwuTUVMX0NDUl9DIHwgTUVMLk1FTF9DQ1JfWiApO1xyXG4gICAgICAgIHRlbXBWYWwgPSAoIHRlbXBWYWwgLSBjb25zdFZhbCApO1xyXG4gICAgICAgIGlmICggdGVtcFZhbCA+IGNvbnN0VmFsICkgIC8vIHdyYXA/XHJcbiAgICAgICAgICB0aGlzLmNvbmRpdGlvbkNvZGVSZWcgfD0gTUVMLk1FTF9DQ1JfQztcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIGNhc2UgTUVMLk1FTElOU1QubWVsQ01QQjpcclxuICAgICAgICB0aGlzLmNvbmRpdGlvbkNvZGVSZWcgJj0gfiggTUVMLk1FTF9DQ1JfQyB8IE1FTC5NRUxfQ0NSX1ogKTtcclxuICAgICAgICB0ZW1wVmFsID0gKCB0ZW1wVmFsIC0gY29uc3RWYWwgKTtcclxuICAgICAgICBpZiAoIHRlbXBWYWwgPiBjb25zdFZhbCApIC8vIHdyYXA/XHJcbiAgICAgICAgICB0aGlzLmNvbmRpdGlvbkNvZGVSZWcgfD0gTUVMLk1FTF9DQ1JfQztcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIGNhc2UgTUVMLk1FTElOU1QubWVsU0VUQjpcclxuICAgICAgICB0aGlzLmNvbmRpdGlvbkNvZGVSZWcgJj0gfiggTUVMLk1FTF9DQ1JfQyB8IE1FTC5NRUxfQ0NSX1ogKTtcclxuICAgICAgICB0ZW1wVmFsID0gY29uc3RWYWw7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCB0ZW1wVmFsID09IDAgKVxyXG4gICAgICB0aGlzLmNvbmRpdGlvbkNvZGVSZWcgfD0gTUVMLk1FTF9DQ1JfWjtcclxuXHJcbiAgICBpZiAoIG9wQ29kZSAhPSBNRUwuTUVMSU5TVC5tZWxDTVBCIClcclxuICAgIHtcclxuICAgICAgdGFyZ2V0QWNjZXNzLmRhdGFBcmVhLndyaXRlQnl0ZSggdGFyZ2V0QWNjZXNzLmRhdGFPZmZzZXQsIHRlbXBWYWwgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgY29uc3RXb3JkQmluYXJ5T3BlcmF0aW9uKCBvcENvZGUsIGNvbnN0VmFsLCBhZGRyVGFnLCBhZGRyT2Zmc2V0IClcclxuICB7XHJcbiAgICB2YXIgdGFyZ2V0QWNjZXNzID0gdGhpcy5jaGVja0RhdGFBY2Nlc3MoIGFkZHJUYWcsIGFkZHJPZmZzZXQsIDIgKTtcclxuICAgIGlmICggdGFyZ2V0QWNjZXNzID09IHVuZGVmaW5lZCApXHJcbiAgICAgIHJldHVybjtcclxuXHJcbiAgICB2YXIgdGVtcFZhbCA9IEJBMlcoIHRhcmdldEFjY2Vzcy5kYXRhQXJlYS5yZWFkQnl0ZXMoIHRhcmdldEFjY2Vzcy5kYXRhT2Zmc2V0LCAyICkgKTtcclxuXHJcbiAgICBzd2l0Y2goIG9wQ29kZSApXHJcbiAgICB7XHJcbiAgICAgIGNhc2UgTUVMLk1FTElOU1QubWVsQUREQjpcclxuICAgICAgICB0aGlzLmNvbmRpdGlvbkNvZGVSZWcgJj0gfiggTUVMLk1FTF9DQ1JfQyB8IE1FTC5NRUxfQ0NSX1ogKTtcclxuICAgICAgICB0ZW1wVmFsID0gKCB0ZW1wVmFsICsgY29uc3RWYWwgKTtcclxuICAgICAgICBpZiAoIHRlbXBWYWwgPCBjb25zdFZhbCApICAvLyB3cmFwP1xyXG4gICAgICAgICAgdGhpcy5jb25kaXRpb25Db2RlUmVnIHw9IE1FTC5NRUxfQ0NSX0M7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBjYXNlIE1FTC5NRUxJTlNULm1lbFNVQkI6XHJcbiAgICAgICAgdGhpcy5jb25kaXRpb25Db2RlUmVnICY9IH4oIE1FTC5NRUxfQ0NSX0MgfCBNRUwuTUVMX0NDUl9aICk7XHJcbiAgICAgICAgdGVtcFZhbCA9ICggdGVtcFZhbCAtIGNvbnN0VmFsICk7XHJcbiAgICAgICAgaWYgKCB0ZW1wVmFsID4gY29uc3RWYWwgKSAgLy8gd3JhcD9cclxuICAgICAgICAgIHRoaXMuY29uZGl0aW9uQ29kZVJlZyB8PSBNRUwuTUVMX0NDUl9DO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgY2FzZSBNRUwuTUVMSU5TVC5tZWxDTVBCOlxyXG4gICAgICAgIHRoaXMuY29uZGl0aW9uQ29kZVJlZyAmPSB+KCBNRUwuTUVMX0NDUl9DIHwgTUVMLk1FTF9DQ1JfWiApO1xyXG4gICAgICAgIHRlbXBWYWwgPSAoIHRlbXBWYWwgLSBjb25zdFZhbCApO1xyXG4gICAgICAgIGlmICggdGVtcFZhbCA+IGNvbnN0VmFsICkgLy8gd3JhcD9cclxuICAgICAgICAgIHRoaXMuY29uZGl0aW9uQ29kZVJlZyB8PSBNRUwuTUVMX0NDUl9DO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgY2FzZSBNRUwuTUVMSU5TVC5tZWxTRVRCOlxyXG4gICAgICAgIHRoaXMuY29uZGl0aW9uQ29kZVJlZyAmPSB+KCBNRUwuTUVMX0NDUl9DIHwgTUVMLk1FTF9DQ1JfWiApO1xyXG4gICAgICAgIHRlbXBWYWwgPSBjb25zdFZhbDtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIHRlbXBWYWwgPT0gMCApXHJcbiAgICAgIHRoaXMuY29uZGl0aW9uQ29kZVJlZyB8PSBNRUwuTUVMX0NDUl9aO1xyXG5cclxuICAgIGlmICggb3BDb2RlICE9IE1FTC5NRUxJTlNULm1lbENNUFcgKVxyXG4gICAge1xyXG4gICAgICB0YXJnZXRBY2Nlc3MuZGF0YUFyZWEud3JpdGVCeXRlcyggdGFyZ2V0QWNjZXNzLmRhdGFPZmZzZXQsIFcyQkEoIHRlbXBWYWwgKSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBiaW5hcnlPcGVyYXRpb24oIG9wQ29kZSwgb3BTaXplLCBhZGRyVGFnLCBhZGRyT2Zmc2V0IClcclxuICB7XHJcbiAgICB2YXIgdGFyZ2V0QWNjZXNzID0gdGhpcy5jaGVja0RhdGFBY2Nlc3MoIGFkZHJUYWcsIGFkZHJPZmZzZXQsIDEgKTtcclxuICAgIGlmICggdGFyZ2V0QWNjZXNzID09IHVuZGVmaW5lZCApXHJcbiAgICAgIHJldHVybjtcclxuXHJcbiAgICB0aGlzLmNoZWNrRGF0YUFjY2VzcyggLW9wU2l6ZSAtIDEsIG9wU2l6ZSwgTUVMLk1FTFRBR0FERFIubWVsQWRkclRPUyApOyAvLyBGaXJzdFxyXG5cclxuICAgIC8vIHRvZG86XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHVuYXJ5T3BlcmF0aW9uKCBvcENvZGUsIG9wU2l6ZSwgYWRkclRhZywgYWRkck9mZnNldCApXHJcbiAge1xyXG4gICAgdmFyIHRhcmdldEFjY2VzcyA9IHRoaXMuY2hlY2tEYXRhQWNjZXNzKCBhZGRyVGFnLCBhZGRyT2Zmc2V0LCAxICk7XHJcbiAgICBpZiAoIHRhcmdldEFjY2VzcyA9PSB1bmRlZmluZWQgKVxyXG4gICAgICByZXR1cm47XHJcblxyXG4gICAgc3dpdGNoKCBvcENvZGUgKVxyXG4gICAge1xyXG4gICAgICBjYXNlIE1FTC5NRUxJTlNULm1lbENMRUFSTjpcclxuICAgICAgICB0YXJnZXRBY2Nlc3MuZGF0YUFyZWEuemVyb0J5dGVzKCB0YXJnZXRBY2Nlc3MuZGF0YU9mZnNldCwgb3BTaXplICk7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBjYXNlIE1FTC5NRUxJTlNULm1lbFRFU1ROOiAgICAgICAgIC8vIDE2XHJcbiAgICAgIGNhc2UgTUVMLk1FTElOU1QubWVsSU5DTjogICAgICAgICAgLy8gMTdcclxuICAgICAgY2FzZSBNRUwuTUVMSU5TVC5tZWxERUNOOiAgICAgICAgICAvLyAxOFxyXG4gICAgICBjYXNlIE1FTC5NRUxJTlNULm1lbE5PVE46ICAgICAgICAgIC8vIDE5XHJcbiAgICAgICAgO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVSZXR1cm4oIGluQnl0ZXMsIG91dEJ5dGVzIClcclxuICB7XHJcbiAgICB2YXIgcmV0VmFsT2Zmc2V0ID0gdGhpcy5keW5hbWljVG9wIC0gb3V0Qnl0ZXM7XHJcblxyXG4gICAgdmFyIHJldHVybklQID0gQkEyVyggdGhpcy5keW5hbWljQXJlYS5yZWFkQnl0ZXMoIHRoaXMubG9jYWxCYXNlIC0gMiwgMiApICk7XHJcbiAgICB0aGlzLmxvY2FsQmFzZSA9IEJBMlcoIHRoaXMuZHluYW1pY0FyZWEucmVhZEJ5dGVzKCB0aGlzLmxvY2FsQmFzZSAtIDQsIDIgKSApO1xyXG5cclxuICAgIHRoaXMuZHluYW1pY1RvcCA9IHRoaXMubG9jYWxCYXNlICsgb3V0Qnl0ZXM7XHJcbiAgICBpZiAoIG91dEJ5dGVzIClcclxuICAgICAgdGhpcy5jb3B5T25TdGFjayggcmV0VmFsT2Zmc2V0LCB0aGlzLmxvY2FsQmFzZSwgb3V0Qnl0ZXMgKTtcclxuXHJcbiAgICByZXR1cm4gcmV0dXJuSVA7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGlzQ29uZGl0aW9uKCB0YWcgKVxyXG4gIHtcclxuICAgIHN3aXRjaCggdGFnIClcclxuICAgIHtcclxuICAgICAgY2FzZSBNRUwuTUVMVEFHQ09ORC5tZWxDb25kRVE6XHJcbiAgICAgICAgcmV0dXJuICggdGhpcy5jb25kaXRpb25Db2RlUmVnICYgTUVMLk1FTF9DQ1JfWiApO1xyXG4gICAgICBjYXNlIE1FTC5NRUxUQUdDT05ELm1lbENvbmRMVDpcclxuICAgICAgICByZXR1cm4gISggdGhpcy5jb25kaXRpb25Db2RlUmVnICYgTUVMLk1FTF9DQ1JfQyApO1xyXG4gICAgICBjYXNlIE1FTC5NRUxUQUdDT05ELm1lbENvbmRMRTpcclxuICAgICAgICByZXR1cm4gKCB0aGlzLmNvbmRpdGlvbkNvZGVSZWcgJiBNRUwuTUVMX0NDUl9aICkgfHwgISggdGhpcy5jb25kaXRpb25Db2RlUmVnICYgTUVMLk1FTF9DQ1JfQyApO1xyXG4gICAgICBjYXNlIE1FTC5NRUxUQUdDT05ELm1lbENvbmRHVDpcclxuICAgICAgICByZXR1cm4gKCB0aGlzLmNvbmRpdGlvbkNvZGVSZWcgJiBNRUwuTUVMX0NDUl9DICk7XHJcbiAgICAgIGNhc2UgTUVMLk1FTFRBR0NPTkQubWVsQ29uZEdFOlxyXG4gICAgICAgIHJldHVybiAoIHRoaXMuY29uZGl0aW9uQ29kZVJlZyAmIE1FTC5NRUxfQ0NSX1ogKSB8fCAoIHRoaXMuY29uZGl0aW9uQ29kZVJlZyAmIE1FTC5NRUxfQ0NSX0MgKTtcclxuICAgICAgY2FzZSBNRUwuTUVMVEFHQ09ORC5tZWxDb25kTkU6XHJcbiAgICAgICAgcmV0dXJuICEoIHRoaXMuY29uZGl0aW9uQ29kZVJlZyAmIE1FTC5NRUxfQ0NSX1ogKTtcclxuICAgICAgY2FzZSBNRUwuTUVMVEFHQ09ORC5tZWxDb25kQUxMOlxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICBkZWZhdWx0OiAvLyBtZWxDb25kU1BFQ1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIGV4ZWN1dGVTdGVwKClcclxuICB7XHJcbiAgICB0cnlcclxuICAgIHtcclxuICAgICAgdmFyIG5leHRJUCA9IHRoaXMuY3VycmVudElQO1xyXG4gICAgICB2YXIgaW5zdEJ5dGUgPSB0aGlzLmNvZGVBcmVhLnJlYWRCeXRlKCBuZXh0SVArKyApO1xyXG4gICAgICB2YXIgcGFyYW1Db3VudCA9IDA7XHJcbiAgICAgIHZhciBwYXJhbVZhbCA9IFtdO1xyXG4gICAgICB2YXIgcGFyYW1EZWYgPSBbXTtcclxuXHJcbiAgICAgIHZhciBtZWxJbnN0ID0gTUVMLk1FTERlY29kZVsgaW5zdEJ5dGUgXTtcclxuXHJcbiAgICAgIGlmICggbWVsSW5zdCA9PSB1bmRlZmluZWQgKVxyXG4gICAgICB7XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZVxyXG4gICAgICB7XHJcbiAgICAgICAgdmFyIHBhcmFtRGVmcyA9IG1lbEluc3QucGFyYW1EZWZzO1xyXG5cclxuICAgICAgICB3aGlsZSggcGFyYW1EZWZzICE9IDAgKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHBhcmFtRGVmWyBwYXJhbUNvdW50IF0gPSBwYXJhbURlZnMgJiAweEZGO1xyXG4gICAgICAgICAgc3dpdGNoKCBwYXJhbURlZnMgJiAweEYwIClcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgY2FzZSAweDAwOiBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAweDEwOiBwYXJhbVZhbFsgcGFyYW1Db3VudCBdID0gdGhpcy5jb2RlQXJlYS5yZWFkQnl0ZSggbmV4dElQKysgKTsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMHgyMDogcGFyYW1WYWxbIHBhcmFtQ291bnQgXSA9IEJBMlcoIFsgdGhpcy5jb2RlQXJlYS5yZWFkQnl0ZSggbmV4dElQKysgKSwgdGhpcy5jb2RlQXJlYS5yZWFkQnl0ZSggbmV4dElQKysgKSBdICk7IGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcGFyYW1Db3VudCsrO1xyXG4gICAgICAgICAgcGFyYW1EZWZzID4+PSA4O1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgdmFyIG9wQ29kZSA9IE1FTC5NRUwyT1BDT0RFKCBpbnN0Qnl0ZSApO1xyXG4gICAgICB2YXIgdGFnID0gTUVMLk1FTDJUQUcoIGluc3RCeXRlICk7XHJcblxyXG4gICAgICBzd2l0Y2goIG9wQ29kZSApXHJcbiAgICAgIHtcclxuICAgICAgICBjYXNlIE1FTC5NRUxJTlNULm1lbFNZU1RFTTogICAgICAgIC8vIDAwXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgdmFyIHB1YmxpY1RvcCA9IHRoaXMucHVibGljQXJlYS5nZXRMZW5ndGgoKTtcclxuXHJcbiAgICAgICAgICBzd2l0Y2goIHRhZyApXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGNhc2UgTUVMLk1FTFRBR1NZU1RFTS4gbWVsU3lzdGVtRXhpdDpcclxuICAgICAgICAgICAgICB0aGlzLmlzRXhlY3V0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgLy9ubyBicmVha1xyXG4gICAgICAgICAgICBjYXNlIE1FTC5NRUxUQUdTWVNURU0uIG1lbFN5c3RlbU5PUDpcclxuICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgIGNhc2UgTUVMLk1FTFRBR1NZU1RFTS4gbWVsU3lzdGVtRXhpdFNXOlxyXG4gICAgICAgICAgICAgIHRoaXMuaXNFeGVjdXRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAvL25vIGJyZWFrXHJcbiAgICAgICAgICAgIGNhc2UgTUVMLk1FTFRBR1NZU1RFTS4gbWVsU3lzdGVtU2V0U1c6XHJcbiAgICAgICAgICAgICAgdGhpcy5wdWJsaWNBcmVhLndyaXRlQnl0ZXMoIHB1YmxpY1RvcCAtIDIsIFcyQkEoIHBhcmFtVmFsWyAwIF0gKSApO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgY2FzZSBNRUwuTUVMVEFHU1lTVEVNLiBtZWxTeXN0ZW1FeGl0TGE6XHJcbiAgICAgICAgICAgICAgdGhpcy5pc0V4ZWN1dGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgIC8vbm8gYnJlYWtcclxuICAgICAgICAgICAgY2FzZSBNRUwuTUVMVEFHU1lTVEVNLiBtZWxTeXN0ZW1TZXRMYTpcclxuICAgICAgICAgICAgICB0aGlzLnB1YmxpY0FyZWEud3JpdGVCeXRlcyggcHVibGljVG9wIC0gNCwgVzJCQSggcGFyYW1WYWxbIDAgXSApICk7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICBjYXNlIE1FTC5NRUxUQUdTWVNURU0uIG1lbFN5c3RlbUV4aXRTV0xhOlxyXG4gICAgICAgICAgICAgIHRoaXMuaXNFeGVjdXRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAvL25vIGJyZWFrXHJcbiAgICAgICAgICAgIGNhc2UgTUVMLk1FTFRBR1NZU1RFTS4gbWVsU3lzdGVtU2V0U1dMYTpcclxuICAgICAgICAgICAgICB0aGlzLnB1YmxpY0FyZWEud3JpdGVCeXRlcyggcHVibGljVG9wIC0gMiwgVzJCQSggcGFyYW1WYWxbIDAgXSApICk7XHJcbiAgICAgICAgICAgICAgdGhpcy5wdWJsaWNBcmVhLndyaXRlQnl0ZXMoIHB1YmxpY1RvcCAtIDQsIFcyQkEoIHBhcmFtVmFsWyAxIF0gKSApO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjYXNlIE1FTC5NRUxJTlNULm1lbEJSQU5DSDogICAgICAgIC8vIDAxXHJcbiAgICAgICAgICBpZiAoIHRoaXMuaXNDb25kaXRpb24oIHRhZyApIClcclxuICAgICAgICAgICAgbmV4dElQID0gbmV4dElQICsgcGFyYW1WYWxbIDAgXTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlIE1FTC5NRUxJTlNULm1lbEpVTVA6ICAgICAgICAgIC8vIDAyXHJcbiAgICAgICAgICBpZiAoIHRoaXMuaXNDb25kaXRpb24oIHRhZyApIClcclxuICAgICAgICAgICAgbmV4dElQID0gcGFyYW1WYWxbIDAgXTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlIE1FTC5NRUxJTlNULm1lbENBTEw6ICAgICAgICAgIC8vIDAzXHJcbiAgICAgICAgICBpZiAoIHRoaXMuaXNDb25kaXRpb24oIHRhZyApIClcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wdXNoQ29uc3RUb1N0YWNrKCAyLCB0aGlzLmxvY2FsQmFzZSApO1xyXG4gICAgICAgICAgICB0aGlzLnB1c2hDb25zdFRvU3RhY2soIDIsIG5leHRJUCApO1xyXG5cclxuICAgICAgICAgICAgbmV4dElQID0gcGFyYW1WYWxbIDAgXTtcclxuICAgICAgICAgICAgdGhpcy5sb2NhbEJhc2UgPSB0aGlzLmR5bmFtaWNUb3A7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSBNRUwuTUVMSU5TVC5tZWxTVEFDSzogICAgICAgICAvLyAwNFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHN3aXRjaCggdGFnIClcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgY2FzZSBNRUwuTUVMVEFHU1RBQ0subWVsU3RhY2tQVVNIWjpcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgIHRoaXMucHVzaFplcm9zVG9TdGFjayggcGFyYW1WYWxbIDAgXSApO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgTUVMLk1FTFRBR1NUQUNLLm1lbFN0YWNrUFVTSEI6XHJcbiAgICAgICAgICAgICAgdGhpcy5wdXNoQ29uc3RUb1N0YWNrKCAxLCBwYXJhbVZhbFsgMCBdICk7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICBjYXNlIE1FTC5NRUxUQUdTVEFDSy5tZWxTdGFja1BVU0hXOlxyXG4gICAgICAgICAgICAgIHRoaXMucHVzaENvbnN0VG9TdGFjayggMiwgcGFyYW1WYWxbIDAgXSApO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgY2FzZSBNRUwuTUVMVEFHU1RBQ0subWVsU3RhY2tQT1BOOlxyXG4gICAgICAgICAgICAgIHRoaXMucG9wRnJvbVN0YWNrKCBwYXJhbVZhbFsgMCBdICk7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICBjYXNlIE1FTC5NRUxUQUdTVEFDSy5tZWxTdGFja1BPUEI6XHJcbiAgICAgICAgICAgICAgdGhpcy5wb3BGcm9tU3RhY2soIDEgKTtcclxuICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgIGNhc2UgTUVMLk1FTFRBR1NUQUNLLm1lbFN0YWNrUE9QVzpcclxuICAgICAgICAgICAgICB0aGlzLnBvcEZyb21TdGFjayggMiApO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjYXNlIE1FTC5NRUxJTlNULm1lbFBSSU1SRVQ6ICAgICAgIC8vIDA1XHJcbiAgICAgICAge1xyXG4gICAgICAgICAgc3dpdGNoKCB0YWcgKVxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBjYXNlIE1FTC5NRUxUQUdQUklNUkVULm1lbFByaW1SZXRQUklNMDpcclxuICAgICAgICAgICAgY2FzZSBNRUwuTUVMVEFHUFJJTVJFVC5tZWxQcmltUmV0UFJJTTE6XHJcbiAgICAgICAgICAgIGNhc2UgTUVMLk1FTFRBR1BSSU1SRVQubWVsUHJpbVJldFBSSU0yOlxyXG4gICAgICAgICAgICBjYXNlIE1FTC5NRUxUQUdQUklNUkVULm1lbFByaW1SZXRQUklNMzpcclxuICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgIGNhc2UgTUVMLk1FTFRBR1BSSU1SRVQubWVsUHJpbVJldFJFVDpcclxuICAgICAgICAgICAgICBuZXh0SVAgPSB0aGlzLmhhbmRsZVJldHVybiggMCwgMCApO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgY2FzZSBNRUwuTUVMVEFHUFJJTVJFVC5tZWxQcmltUmV0UkVUSTpcclxuICAgICAgICAgICAgICBuZXh0SVAgPSB0aGlzLmhhbmRsZVJldHVybiggcGFyYW1WYWxbIDAgXSwgMCApO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgY2FzZSBNRUwuTUVMVEFHUFJJTVJFVC5tZWxQcmltUmV0UkVUTzpcclxuICAgICAgICAgICAgICBuZXh0SVAgPSB0aGlzLmhhbmRsZVJldHVybiggMCwgcGFyYW1WYWxbIDAgXSApO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgY2FzZSBNRUwuTUVMVEFHUFJJTVJFVC5tZWxQcmltUmV0UkVUSU86XHJcbiAgICAgICAgICAgICAgbmV4dElQID0gdGhpcy5oYW5kbGVSZXR1cm4oIHBhcmFtVmFsWyAwIF0sIHBhcmFtVmFsWyAxIF0gKTtcclxuICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY2FzZSBNRUwuTUVMSU5TVC5tZWxMT0FEOiAgICAgICAgICAvLyAwN1xyXG4gICAgICAgICAgaWYgKCB0YWcgPT0gTUVMLk1FTFRBR0FERFIubWVsQWRkclRPUyApXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIC8vIERVUCBUT1NcclxuICAgICAgICAgICAgdGhpcy5jb3B5T25TdGFjayggdGhpcy5keW5hbWljVG9wIC0gcGFyYW1WYWxbIDAgXSwgdGhpcy5keW5hbWljVG9wLCBwYXJhbVZhbFsgMCBdICk7XHJcbiAgICAgICAgICAgIHRoaXMuZHluYW1pY1RvcCArPSBwYXJhbVZhbFsgMCBdO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB0aGlzLnB1c2hUb1N0YWNrKCB0YWcsIHBhcmFtVmFsWyAxIF0sIHBhcmFtVmFsWyAwIF0gKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlIE1FTC5NRUxJTlNULm1lbFNUT1JFOiAgICAgICAgIC8vIDA4XHJcbiAgICAgICAgICBpZiAoIHRhZyA9PSBNRUwuTUVMVEFHQUREUi5tZWxBZGRyVE9TIClcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgLy8gU0hJRlQgVE9TXHJcbiAgICAgICAgICAgIHRoaXMuZHluYW1pY1RvcCAtPSBwYXJhbVZhbFsgMCBdO1xyXG4gICAgICAgICAgICB0aGlzLmNvcHlPblN0YWNrKCB0aGlzLmR5bmFtaWNUb3AsIHRoaXMuZHluYW1pY1RvcCAtIHBhcmFtVmFsWyAwIF0sIHBhcmFtVmFsWyAwIF0gKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgdGhpcy5wb3BGcm9tU3RhY2tBbmRTdG9yZSggdGFnLCBwYXJhbVZhbFsgMSBdLCBwYXJhbVZhbFsgMCBdICk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcblxyXG4gICAgICAgIGNhc2UgTUVMLk1FTElOU1QubWVsTE9BREk6ICAgICAgICAgLy8gMDlcclxuICAgICAgICB7XHJcbiAgICAgICAgICB2YXIgc2VnbWVudEFkZHIgPSBCQTJXKCB0aGlzLnJlYWRTZWdtZW50RGF0YSggdGFnLCBwYXJhbVZhbFsgMSBdLCAyICkgKTtcclxuICAgICAgICAgIHZhciB0YXJnZXRBY2Nlc3MgPSB0aGlzLm1hcEZyb21TZWdtZW50QWRkciggc2VnbWVudEFkZHIgKTtcclxuICAgICAgICAgIHRoaXMucHVzaFRvU3RhY2soIHRhcmdldEFjY2Vzcy5kYXRhQWRkclRhZywgdGFyZ2V0QWNjZXNzLmRhdGFPZmZzZXQsIHBhcmFtVmFsWyAwIF0gKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY2FzZSBNRUwuTUVMSU5TVC5tZWxTVE9SRUk6ICAgICAgICAvLyAwQVxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHZhciBzZWdtZW50QWRkciA9IEJBMlcoIHRoaXMucmVhZFNlZ21lbnREYXRhKCB0YWcsIHBhcmFtVmFsWyAxIF0sIDIgKSApO1xyXG4gICAgICAgICAgdmFyIHRhcmdldEFjY2VzcyA9IHRoaXMubWFwRnJvbVNlZ21lbnRBZGRyKCBzZWdtZW50QWRkciApO1xyXG4gICAgICAgICAgdGhpcy5wb3BGcm9tU3RhY2tBbmRTdG9yZSggdGFyZ2V0QWNjZXNzLmRhdGFBZGRyVGFnLCB0YXJnZXRBY2Nlc3MuZGF0YU9mZnNldCwgcGFyYW1WYWxbIDAgXSApO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjYXNlIE1FTC5NRUxJTlNULm1lbExPQURBOiAgICAgICAgIC8vIDBCXHJcbiAgICAgICAgICB0aGlzLnB1c2hDb25zdFRvU3RhY2soIDIsIHRoaXMubWFwVG9TZWdtZW50QWRkciggdGFnLCBwYXJhbVZhbFsgMCBdICkgKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlIE1FTC5NRUxJTlNULm1lbElOREVYOiAgICAgICAgIC8vIDBDXHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSBNRUwuTUVMSU5TVC5tZWxTRVRCOiAgICAgICAgICAvLyAwRFxyXG4gICAgICAgIGNhc2UgTUVMLk1FTElOU1QubWVsQ01QQjogICAgICAgICAgLy8gMEVcclxuICAgICAgICBjYXNlIE1FTC5NRUxJTlNULm1lbEFEREI6ICAgICAgICAgIC8vIDBGXHJcbiAgICAgICAgY2FzZSBNRUwuTUVMSU5TVC5tZWxTVUJCOiAgICAgICAgICAvLyAxMFxyXG4gICAgICAgICAgaWYgKCB0YWcgPT0gTUVMLk1FTFRBR0FERFIubWVsQWRkclRPUyApXHJcbiAgICAgICAgICAgIHRoaXMuY29uc3RCeXRlQmluYXJ5T3BlcmF0aW9uKCBvcENvZGUsIHBhcmFtVmFsWzBdLCBNRUwuTUVMVEFHQUREUi5tZWxBZGRyRFQsIC0xICk7XHJcbiAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHRoaXMuY29uc3RCeXRlQmluYXJ5T3BlcmF0aW9uKCBvcENvZGUsIHBhcmFtVmFsWzBdLCB0YWcsIHBhcmFtVmFsWzFdICk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSBNRUwuTUVMSU5TVC5tZWxTRVRXOiAgICAgICAgICAvLyAxMVxyXG4gICAgICAgIGNhc2UgTUVMLk1FTElOU1QubWVsQ01QVzogICAgICAgICAgLy8gMTJcclxuICAgICAgICBjYXNlIE1FTC5NRUxJTlNULm1lbEFERFc6ICAgICAgICAgIC8vIDEzXHJcbiAgICAgICAgY2FzZSBNRUwuTUVMSU5TVC5tZWxTVUJXOiAgICAgICAgICAvLyAxNFxyXG4gICAgICAgICAgaWYgKCB0YWcgPT0gTUVMLk1FTFRBR0FERFIubWVsQWRkclRPUyApXHJcbiAgICAgICAgICAgIHRoaXMuY29uc3RXb3JkQmluYXJ5T3BlcmF0aW9uKCBvcENvZGUsIHBhcmFtVmFsWzBdLCBNRUwuTUVMVEFHQUREUi5tZWxBZGRyRFQsIC0yICk7XHJcbiAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHRoaXMuY29uc3RXb3JkQmluYXJ5T3BlcmF0aW9uKCBvcENvZGUsIHBhcmFtVmFsWzBdLCB0YWcsIHBhcmFtVmFsWzFdICk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSBNRUwuTUVMSU5TVC5tZWxDTEVBUk46ICAgICAgICAvLyAxNVxyXG4gICAgICAgIGNhc2UgTUVMLk1FTElOU1QubWVsVEVTVE46ICAgICAgICAgLy8gMTZcclxuICAgICAgICBjYXNlIE1FTC5NRUxJTlNULm1lbElOQ046ICAgICAgICAgIC8vIDE3XHJcbiAgICAgICAgY2FzZSBNRUwuTUVMSU5TVC5tZWxERUNOOiAgICAgICAgICAvLyAxOFxyXG4gICAgICAgIGNhc2UgTUVMLk1FTElOU1QubWVsTk9UTjogICAgICAgICAgLy8gMTlcclxuICAgICAgICAgIGlmICggdGFnID09IE1FTC5NRUxUQUdBRERSLm1lbEFkZHJUT1MgKVxyXG4gICAgICAgICAgICB0aGlzLnVuYXJ5T3BlcmF0aW9uKCBvcENvZGUsIHBhcmFtVmFsWzBdLCBNRUwuTUVMVEFHQUREUi5tZWxBZGRyRFQsIC0xICogcGFyYW1WYWxbMF0gKTtcclxuICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgdGhpcy51bmFyeU9wZXJhdGlvbiggb3BDb2RlLCBwYXJhbVZhbFswXSwgdGFnLCBwYXJhbVZhbFsxXSApO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgTUVMLk1FTElOU1QubWVsQ01QTjogICAgICAgICAgLy8gMUFcclxuICAgICAgICBjYXNlIE1FTC5NRUxJTlNULm1lbEFERE46ICAgICAgICAgIC8vIDFCXHJcbiAgICAgICAgY2FzZSBNRUwuTUVMSU5TVC5tZWxTVUJOOiAgICAgICAgICAvLyAxQ1xyXG4gICAgICAgIGNhc2UgTUVMLk1FTElOU1QubWVsQU5ETjogICAgICAgICAgLy8gMURcclxuICAgICAgICBjYXNlIE1FTC5NRUxJTlNULm1lbE9STjogICAgICAgICAgIC8vIDFFXHJcbiAgICAgICAgY2FzZSBNRUwuTUVMSU5TVC5tZWxYT1JOOiAgICAgICAgICAvLyAxRlxyXG4gICAgICAgICAgaWYgKCB0YWcgPT0gTUVMLk1FTFRBR0FERFIubWVsQWRkclRPUyApXHJcbiAgICAgICAgICAgIHRoaXMuYmluYXJ5T3BlcmF0aW9uKCBvcENvZGUsIHBhcmFtVmFsWzBdLCBNRUwuTUVMVEFHQUREUi5tZWxBZGRyRFQsIC0yICogcGFyYW1WYWxbMF0gKTtcclxuICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgdGhpcy5iaW5hcnlPcGVyYXRpb24oIG9wQ29kZSwgcGFyYW1WYWxbMF0sIHRhZywgcGFyYW1WYWxbMV0gKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLmN1cnJlbnRJUCA9IG5leHRJUDtcclxuICAgIH1cclxuICAgIGNhdGNoKCBlIClcclxuICAgIHtcclxuICAgICAgLy9wcmludCggZSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc2V0Q29tbWFuZEFQRFUoIGNvbW1hbmRBUERVOiBDb21tYW5kQVBEVSApXHJcbiAge1xyXG4gICAgdmFyIHB1YmxpY1RvcCA9IHRoaXMucHVibGljQXJlYS5nZXRMZW5ndGgoKTtcclxuXHJcbiAgICAvLyAtMiwtMSA9IFNXMTJcclxuICAgIHRoaXMucHVibGljQXJlYS53cml0ZUJ5dGVzKCBwdWJsaWNUb3AgLSAyLCBXMkJBKCAweDkwMDAgKSApO1xyXG5cclxuICAgIC8vIC00LC0zID0gTGFcclxuICAgIHRoaXMucHVibGljQXJlYS53cml0ZUJ5dGVzKCBwdWJsaWNUb3AgLSA0LCBXMkJBKCAweDAwMDAgKSApO1xyXG5cclxuICAgIC8vIC02LC01ID0gTGVcclxuICAgIHRoaXMucHVibGljQXJlYS53cml0ZUJ5dGVzKCBwdWJsaWNUb3AgLSA2LCBXMkJBKCBjb21tYW5kQVBEVS5MZSApICk7XHJcblxyXG4gICAgLy8gLTgsLTcgPSBMY1xyXG4gICAgdGhpcy5wdWJsaWNBcmVhLndyaXRlQnl0ZXMoIHB1YmxpY1RvcCAtIDgsIFcyQkEoIGNvbW1hbmRBUERVLmRhdGEubGVuZ3RoICkgKTtcclxuICAgIHRoaXMucHVibGljQXJlYS53cml0ZUJ5dGVzKCBwdWJsaWNUb3AgLSAxMywgY29tbWFuZEFQRFUuaGVhZGVyICk7XHJcblxyXG4gICAgdGhpcy5wdWJsaWNBcmVhLndyaXRlQnl0ZXMoIDAsIGNvbW1hbmRBUERVLmRhdGEgKTtcclxuXHJcbiAgICB0aGlzLmluaXRFeGVjdXRpb24oKTtcclxuICB9XHJcblxyXG4gIGdldFJlc3BvbnNlQVBEVSgpOiBSZXNwb25zZUFQRFVcclxuICB7XHJcbiAgICB2YXIgcHVibGljVG9wID0gdGhpcy5wdWJsaWNBcmVhLmdldExlbmd0aCgpO1xyXG5cclxuICAgIHZhciBsYSA9IEJBMlcoIHRoaXMucHVibGljQXJlYS5yZWFkQnl0ZXMoIHB1YmxpY1RvcCAtIDQsIDIgKSApO1xyXG5cclxuICAgIHJldHVybiBuZXcgUmVzcG9uc2VBUERVKCB7IHN3OiBCQTJXKCB0aGlzLnB1YmxpY0FyZWEucmVhZEJ5dGVzKCBwdWJsaWNUb3AgLSAyLCAyICkgKSwgZGF0YTogdGhpcy5wdWJsaWNBcmVhLnJlYWRCeXRlcyggMCwgbGEgKSAgfSApXHJcblxyXG4gIH1cclxuXHJcbiAgZ2V0IGdldERlYnVnKCk6IHt9XHJcbiAge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgcmFtU2VnbWVudDogdGhpcy5yYW1TZWdtZW50LFxyXG4gICAgICBkeW5hbWljQXJlYTogdGhpcy5keW5hbWljQXJlYSxcclxuICAgICAgcHVibGljQXJlYTogdGhpcy5wdWJsaWNBcmVhLFxyXG4gICAgICBzdGF0aWNBcmVhOiB0aGlzLnN0YXRpY0FyZWEsXHJcbiAgICAgIGN1cnJlbnRJUDogdGhpcy5jdXJyZW50SVAsXHJcbiAgICAgIGR5bmFtaWNUb3A6IHRoaXMuZHluYW1pY1RvcCxcclxuICAgICAgbG9jYWxCYXNlOiB0aGlzLmxvY2FsQmFzZVxyXG4gICAgfTtcclxuICB9XHJcbi8vICBpc0V4ZWN1dGluZzogZnVuY3Rpb24oKSB7IHJldHVybiBpc0V4ZWN1dGluZzsgfSxcclxufVxyXG4iLCJpbXBvcnQgeyBCeXRlQXJyYXkgfSBmcm9tICdjcnlwdG9ncmFwaGl4LXNpbS1jb3JlJztcclxuaW1wb3J0IHsgTWVtb3J5TWFuYWdlciwgTUVNRkxBR1MgfSBmcm9tICcuL21lbW9yeS1tYW5hZ2VyJztcclxuaW1wb3J0IHsgTUVMVmlydHVhbE1hY2hpbmUgfSBmcm9tICcuL3ZpcnR1YWwtbWFjaGluZSc7XHJcblxyXG5pbXBvcnQgeyBJU083ODE2IH0gZnJvbSAnLi4vaXNvNzgxNi9JU083ODE2JztcclxuaW1wb3J0IHsgQ29tbWFuZEFQRFUgfSBmcm9tICcuLi9pc283ODE2L2NvbW1hbmQtYXBkdSc7XHJcbmltcG9ydCB7IFJlc3BvbnNlQVBEVSB9IGZyb20gJy4uL2lzbzc4MTYvcmVzcG9uc2UtYXBkdSc7XHJcblxyXG5pbXBvcnQgeyBKU0lNQ2FyZCB9IGZyb20gJy4uL2pzaW0tY2FyZC9qc2ltLWNhcmQnO1xyXG5cclxuZnVuY3Rpb24gIEJBMlcoIHZhbCApXHJcbntcclxuICByZXR1cm4gKCB2YWxbIDAgXSA8PCA4ICkgfCB2YWxbIDEgXTtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEpTSU1NdWx0b3NBcHBsZXRcclxue1xyXG4gIHNlc3Npb25TaXplO1xyXG4gIGNvZGVBcmVhO1xyXG4gIHN0YXRpY0FyZWE7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCBjb2RlQXJlYSwgc3RhdGljQXJlYSwgc2Vzc2lvblNpemUgKVxyXG4gIHtcclxuICAgIHRoaXMuY29kZUFyZWEgPSBjb2RlQXJlYTtcclxuICAgIHRoaXMuc3RhdGljQXJlYSA9IHN0YXRpY0FyZWE7XHJcbiAgICB0aGlzLnNlc3Npb25TaXplID0gc2Vzc2lvblNpemU7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgSlNJTU11bHRvc0NhcmQgaW1wbGVtZW50cyBKU0lNQ2FyZFxyXG57XHJcbiAgcHJpdmF0ZSBjYXJkQ29uZmlnO1xyXG5cclxuICBzdGF0aWMgZGVmYXVsdENvbmZpZyA9IHtcclxuICAgIHJvbVNpemU6IDAsXHJcbiAgICByYW1TaXplOiAxMDI0LFxyXG4gICAgcHVibGljU2l6ZTogNTEyLFxyXG4gICAgbnZyYW1TaXplOiAzMjc2OFxyXG4gIH07XHJcblxyXG4gIHByaXZhdGUgcG93ZXJJc09uOiBib29sZWFuO1xyXG4gIHByaXZhdGUgYXRyOiBCeXRlQXJyYXk7XHJcblxyXG4gIGFwcGxldHM6IHsgYWlkOiBCeXRlQXJyYXksIGFwcGxldDogSlNJTU11bHRvc0FwcGxldCB9W107XHJcblxyXG4gIHNlbGVjdGVkQXBwbGV0OiBKU0lNTXVsdG9zQXBwbGV0O1xyXG5cclxuICBjb25zdHJ1Y3RvciggY29uZmlnPyApXHJcbiAge1xyXG4gICAgaWYgKCBjb25maWcgKVxyXG4gICAgICB0aGlzLmNhcmRDb25maWcgPSBjb25maWc7XHJcbiAgICBlbHNlXHJcbiAgICAgIHRoaXMuY2FyZENvbmZpZyA9IEpTSU1NdWx0b3NDYXJkLmRlZmF1bHRDb25maWc7XHJcblxyXG4gICAgdGhpcy5hdHIgPSBuZXcgQnl0ZUFycmF5KCBbXSApO1xyXG5cclxuICAgIHRoaXMuYXBwbGV0cyA9IFtdO1xyXG4gIH1cclxuXHJcbiAgbG9hZEFwcGxpY2F0aW9uKCBhaWQ6IEJ5dGVBcnJheSwgYWx1OiBCeXRlQXJyYXkgKVxyXG4gIHtcclxuICAgIHZhciBsZW4gPSAwO1xyXG5cclxuICAgIHZhciBvZmYgPSA4O1xyXG5cclxuICAgIC8vIExFTjo6Q09ERVxyXG4gICAgbGVuID0gYWx1LndvcmRBdCggb2ZmICk7XHJcbiAgICBvZmYgKz0gMjtcclxuXHJcbiAgICBsZXQgY29kZUFyZWEgPSB0aGlzLm52cmFtU2VnbWVudC5uZXdBY2Nlc3NvciggMCwgbGVuLCBcImNvZGVcIiApO1xyXG4gICAgY29kZUFyZWEud3JpdGVCeXRlcyggMCwgYWx1LnZpZXdBdCggb2ZmLCBsZW4gKSApO1xyXG4gICAgb2ZmICs9IGxlbjtcclxuXHJcbiAgICAvLyBMRU46OkRBVEFcclxuICAgIGxlbiA9IGFsdS53b3JkQXQoIG9mZiApO1xyXG4gICAgb2ZmICs9IDI7XHJcblxyXG4gICAgbGV0IHN0YXRpY0FyZWEgPSB0aGlzLm52cmFtU2VnbWVudC5uZXdBY2Nlc3NvciggY29kZUFyZWEuZ2V0TGVuZ3RoKCksIGxlbiwgXCJTXCIgKTtcclxuICAgIHN0YXRpY0FyZWEud3JpdGVCeXRlcyggMCwgYWx1LnZpZXdBdCggb2ZmLCBsZW4gKSApO1xyXG4gICAgb2ZmICs9IGxlbjtcclxuXHJcbiAgICBsZXQgYXBwbGV0ID0gbmV3IEpTSU1NdWx0b3NBcHBsZXQoIGNvZGVBcmVhLCBzdGF0aWNBcmVhLCAwICk7XHJcblxyXG4gICAgdGhpcy5hcHBsZXRzLnB1c2goIHsgYWlkOiBhaWQsIGFwcGxldDogYXBwbGV0IH0gKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgaXNQb3dlcmVkKCk6IGJvb2xlYW5cclxuICB7XHJcbiAgICByZXR1cm4gdGhpcy5wb3dlcklzT247XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcG93ZXJPbigpOiBQcm9taXNlPEJ5dGVBcnJheT5cclxuICB7XHJcbiAgICB0aGlzLnBvd2VySXNPbiA9IHRydWU7XHJcblxyXG4gICAgdGhpcy5pbml0aWFsaXplVk0oIHRoaXMuY2FyZENvbmZpZyApO1xyXG5cclxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoIHRoaXMuYXRyICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcG93ZXJPZmYoKTogUHJvbWlzZTxhbnk+XHJcbiAge1xyXG4gICAgdGhpcy5wb3dlcklzT24gPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLnJlc2V0Vk0oKTtcclxuXHJcbiAgICB0aGlzLnNlbGVjdGVkQXBwbGV0ID0gdW5kZWZpbmVkO1xyXG5cclxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoICApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlc2V0KCk6IFByb21pc2U8Qnl0ZUFycmF5PlxyXG4gIHtcclxuICAgIHRoaXMucG93ZXJJc09uID0gdHJ1ZTtcclxuXHJcbiAgICB0aGlzLnNlbGVjdGVkQXBwbGV0ID0gdW5kZWZpbmVkO1xyXG5cclxuICAgIHRoaXMuc2h1dGRvd25WTSgpO1xyXG5cclxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoIHRoaXMuYXRyICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZXhjaGFuZ2VBUERVKCBjb21tYW5kQVBEVTogQ29tbWFuZEFQRFUgKTogUHJvbWlzZTxSZXNwb25zZUFQRFU+XHJcbiAge1xyXG4gICAgaWYgKCBjb21tYW5kQVBEVS5JTlMgPT0gMHhBNCApXHJcbiAgICB7XHJcbiAgICAgIGlmICggdGhpcy5zZWxlY3RlZEFwcGxldCApXHJcbiAgICAgIHtcclxuICAgICAgICAvL3RoaXMuc2VsZWN0ZWRBcHBsZXQuZGVzZWxlY3RBcHBsaWNhdGlvbigpO1xyXG5cclxuICAgICAgICB0aGlzLnNlbGVjdGVkQXBwbGV0ID0gdW5kZWZpbmVkO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvL1RPRE86IExvb2t1cCBBcHBsaWNhdGlvblxyXG4gICAgICB0aGlzLnNlbGVjdGVkQXBwbGV0ID0gdGhpcy5hcHBsZXRzWyAwIF0uYXBwbGV0O1xyXG5cclxuICAgICAgbGV0IGZjaSA9IG5ldyBCeXRlQXJyYXkoIFsgMHg2RiwgMHgwMCBdICk7XHJcblxyXG4gICAgICB0aGlzLm12bS5zZXR1cEFwcGxpY2F0aW9uKCB0aGlzLnNlbGVjdGVkQXBwbGV0ICk7XHJcblxyXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlPFJlc3BvbnNlQVBEVT4oIG5ldyBSZXNwb25zZUFQRFUoIHsgc3c6IDB4OTAwMCwgZGF0YTogZmNpICB9ICkgKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLm12bS5zZXRDb21tYW5kQVBEVSggY29tbWFuZEFQRFUpO1xyXG5cclxuLy8gICAgZ2V0UmVzcG9uc2VBUERVKClcclxuLy8gICAge1xyXG4vLyAgICAgIHJldHVybiB0aGlzLm12bS5nZXRSZXNwb25zZUFQRFUoKTtcclxuLy8gICAgfVxyXG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZTxSZXNwb25zZUFQRFU+KCBuZXcgUmVzcG9uc2VBUERVKCB7IHN3OiAweDkwMDAsIGRhdGE6IFtdICB9ICkgKTtcclxuXHJcbiAgICAvL3JldHVybiB0aGlzLmV4ZWN1dGVBUERVKCBjb21tYW5kQVBEVSApO1xyXG4gIH1cclxuXHJcbiAgbWVtb3J5TWFuYWdlcjogTWVtb3J5TWFuYWdlcjtcclxuXHJcbiAgLy8gQ2FyZCBNZW1vcnkgU2VnbWVudHNcclxuICByb21TZWdtZW50OyAgICAgIC8vIFJPTTogY29kZWxldHNcclxuICBudnJhbVNlZ21lbnQ7ICAgIC8vIE5WUkFNOiBhcHBsZXRzIGNvZGUgKyBkYXRhXHJcbiAgcmFtU2VnbWVudDsgICAgICAvLyBSQU06IHdvcmtzcGFjZVxyXG5cclxuICBtdm07XHJcblxyXG4gIGluaXRpYWxpemVWTSggY29uZmlnIClcclxuICB7XHJcbiAgICB0aGlzLm1lbW9yeU1hbmFnZXIgPSBuZXcgTWVtb3J5TWFuYWdlcigpO1xyXG5cclxuICAgIHRoaXMucm9tU2VnbWVudCA9IHRoaXMubWVtb3J5TWFuYWdlci5uZXdTZWdtZW50KCAwLCB0aGlzLmNhcmRDb25maWcucm9tU2l6ZSwgTUVNRkxBR1MuUkVBRF9PTkxZIClcclxuICAgIHRoaXMucmFtU2VnbWVudCA9IHRoaXMubWVtb3J5TWFuYWdlci5uZXdTZWdtZW50KCAxLCB0aGlzLmNhcmRDb25maWcucmFtU2l6ZSwgMCApO1xyXG4gICAgdGhpcy5udnJhbVNlZ21lbnQgPSB0aGlzLm1lbW9yeU1hbmFnZXIubmV3U2VnbWVudCggMiwgdGhpcy5jYXJkQ29uZmlnLm52cmFtU2l6ZSwgTUVNRkxBR1MuVFJBTlNBQ1RJT05BQkxFICk7XHJcblxyXG4gICAgdGhpcy5tdm0gPSBuZXcgTUVMVmlydHVhbE1hY2hpbmUoKTtcclxuXHJcbiAgICB0aGlzLnJlc2V0Vk0oKTtcclxuICB9XHJcblxyXG4gIHJlc2V0Vk0oKVxyXG4gIHtcclxuICAgIC8vIGZpcnN0IHRpbWUgLi4uXHJcbiAgICAvLyBpbml0IFZpcnR1YWxNYWNoaW5lXHJcbiAgICB2YXIgbXZtUGFyYW1zID0ge1xyXG4gICAgICByYW1TZWdtZW50OiB0aGlzLnJhbVNlZ21lbnQsXHJcbiAgICAgIHJvbVNlZ21lbnQ6IHRoaXMucm9tU2VnbWVudCxcclxuICAgICAgcHVibGljU2l6ZTogdGhpcy5jYXJkQ29uZmlnLnB1YmxpY1NpemVcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5tdm0uaW5pdE1WTSggbXZtUGFyYW1zICk7XHJcbiAgfVxyXG5cclxuICBzaHV0ZG93blZNKClcclxuICB7XHJcbiAgICB0aGlzLnJlc2V0Vk0oKTtcclxuICAgIHRoaXMubXZtID0gbnVsbDtcclxuICB9XHJcblxyXG4gIHNlbGVjdEFwcGxpY2F0aW9uKCBhcHBsZXQ6IEpTSU1NdWx0b3NBcHBsZXQsIHNlc3Npb25TaXplIClcclxuICB7XHJcbiAgICB2YXIgZXhlY1BhcmFtcyA9IHtcclxuICAgICAgY29kZUFyZWE6IGFwcGxldC5jb2RlQXJlYSxcclxuICAgICAgc3RhdGljQXJlYTogYXBwbGV0LnN0YXRpY0FyZWEsXHJcbiAgICAgIHNlc3Npb25TaXplOiBzZXNzaW9uU2l6ZVxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLm12bS5leGVjQXBwbGljYXRpb24oIGV4ZWNQYXJhbXMgKTtcclxuICB9XHJcblxyXG4gIGV4ZWN1dGVTdGVwKClcclxuICB7XHJcbiAgICByZXR1cm4gdGhpcy5tdm0uZXhlY3V0ZVN0ZXAoKTtcclxuICB9XHJcbn1cclxuIiwidmFyIHNldFplcm9QcmltaXRpdmVzID1cclxue1xyXG4gIDB4MDE6IHtcclxuICAgIG5hbWU6IFwiQ0hFQ0tfQ0FTRVwiLFxyXG4gICAgcHJvYzogZnVuY3Rpb24oKSB7IC8qXHJcbiAgXHQgIHZhciBleHBlY3RlZElTTz0gcG9wQnl0ZSgpO1xyXG5cclxuICBcdCAgaWYgKGV4cGVjdGVkSVNPPCAxIHx8IGV4cGVjdGVkSVNPPiA0KVxyXG4gIFx0ICAgIFNldENDUkZsYWcoWmZsYWcsIGZhbHNlKTtcclxuICBcdCAgZWxzZVxyXG4gIFx0ICAgIFNldENDUkZsYWcoWmZsYWcsIENoZWNrSVNPQ2FzZShleHBlY3RlZElTT0Nhc2UpKTtcclxuICAgICovfVxyXG4gIH0sXHJcbiAgMHgwMjoge1xyXG4gICAgbmFtZTogXCJSRVNFVF9XV1RcIixcclxuICAgIHByb2M6IGZ1bmN0aW9uKCkgeyAvKlxyXG4gICAgICBzZW5kV2FpdFJlcXVlc3QoKTtcclxuICAgICovfVxyXG4gIH0sXHJcbiAgMHgwNToge1xyXG4gICAgbmFtZTogXCJMT0FEX0NDUlwiLFxyXG4gICAgcHJvYzogZnVuY3Rpb24oKSB7IC8qXHJcbiAgICAgIHB1c2hCeXRlKENDUigpKTtcclxuICAgICovfVxyXG4gIH0sXHJcbiAgMHgwNjoge1xyXG4gICAgbmFtZTogXCJTVE9SRV9DQ1JcIixcclxuICAgIHByb2M6IGZ1bmN0aW9uKCkgeyAvKlxyXG4gICAgICBDQ1IoKSA9IHBvcEJ5dGUoKTtcclxuICAgICovfVxyXG4gIH0sXHJcbiAgMHgwNzoge1xyXG4gICAgbmFtZTogXCJTRVRfQVRSX0ZJTEVfUkVDT1JEXCIsXHJcbiAgICBwcm9jOiBmdW5jdGlvbigpIHsgLypcclxuICAgICAgdmFyIGFkZHIgPSBnZXRXb3JkKGR5bmFtaWNUb3AtMik7XHJcbiAgICAgIHZhciBsZW4gPSBnZXRCeXRlKGFkZHIpO1xyXG5cclxuICAgICAgTUVMQXBwbGljYXRpb24gKmEgPSBzdGF0ZS5hcHBsaWNhdGlvbjtcclxuICAgICAgaWYgKGEuQVRSRmlsZVJlY29yZFNpemUpXHJcbiAgICAgICAgZGVsZXRlIFtdYS5BVFJGaWxlUmVjb3JkO1xyXG5cclxuICAgICAgYS5BVFJGaWxlUmVjb3JkU2l6ZSA9IGxlbjtcclxuXHJcbiAgICAgIGlmIChsZW4pXHJcbiAgICAgIHtcclxuICAgICAgICBhLkFUUkZpbGVSZWNvcmQgPSBuZXcgdmFyW2xlbl07XHJcbiAgICAgICAgcmVhZChhZGRyLCBsZW4sIGEuQVRSRmlsZVJlY29yZCk7XHJcbiAgICAgIH1cclxuICAgICAgRFQoLTIpO1xyXG4gICAgICBwdXNoQnl0ZShsZW4pO1xyXG4gICAgKi99XHJcbiAgfSxcclxuICAweDA4OiB7XHJcbiAgICBuYW1lOiBcIlNFVF9BVFJfSElTVE9SSUNBTF9DSEFSQUNURVJTXCIsXHJcbiAgICBwcm9jOiBmdW5jdGlvbigpIHsgLypcclxuICAgICAgdmFyIGFkZHIgPSBnZXRXb3JkKGR5bmFtaWNUb3AtMik7XHJcbiAgICAgIHZhciBsZW4gPSBnZXRCeXRlKGFkZHIpO1xyXG4gICAgICB2YXIgd3JpdHRlbjtcclxuICAgICAgdmFyIG9rYXkgPSBzZXRBVFJIaXN0b3JpY2FsQ2hhcmFjdGVycyhsZW4sIGFkZHIrMSwgd3JpdHRlbik7XHJcblxyXG4gICAgICBEVCgtMik7XHJcbiAgICAgIHB1c2hCeXRlKHdyaXR0ZW4pO1xyXG4gICAgICBTZXRDQ1JGbGFnKENmbGFnLCB3cml0dGVuIDwgbGVuKTtcclxuICAgICAgU2V0Q0NSRmxhZyhaZmxhZywgIW9rYXkpO1xyXG4gICAgKi99XHJcbiAgfSxcclxuICAweDA5OiB7XHJcbiAgICBuYW1lOiBcIkdFVF9NRU1PUllfUkVMSUFCSUxJVFlcIixcclxuICAgIHByb2M6IGZ1bmN0aW9uKCkgeyAvKlxyXG4gICAgICBTZXRDQ1JGbGFnKENmbGFnLCBmYWxzZSk7XHJcbiAgICAgIFNldENDUkZsYWcoWmZsYWcsIGZhbHNlKTtcclxuICAgICovfVxyXG4gIH0sXHJcbiAgMHhhOiB7XHJcbiAgICBuYW1lOiBcIkxPT0tVUFwiLFxyXG4gICAgcHJvYzogZnVuY3Rpb24oKSB7IC8qXHJcbiAgICAgIHZhciB2YWx1ZSA9IGdldEJ5dGUoZHluYW1pY1RvcC0zKTtcclxuICAgICAgdmFyIGFyckFkZHIgPSBnZXRXb3JkKGR5bmFtaWNUb3AtMik7XHJcblxyXG4gICAgICBEVCgtMik7XHJcbiAgICAgIFNldENDUkZsYWcoWmZsYWcsIGZhbHNlKTtcclxuXHJcbiAgICAgIHZhciBhcnJsZW4gPSBnZXRCeXRlKGFyckFkZHIpO1xyXG4gICAgICBmb3IgKHZhciBpPTA7aTxhcnJsZW47aSsrKVxyXG4gICAgICAgIGlmIChnZXRCeXRlKGFyckFkZHIraSsxKSA9PSB2YWx1ZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICBzZXRCeXRlKGR5bmFtaWNUb3AtMSwgKHZhcilpKTtcclxuICAgICAgICAgIFNldENDUkZsYWcoWmZsYWcsIHRydWUpO1xyXG4gICAgICAgICAgaSA9IGFycmxlbjtcclxuICAgICAgICB9XHJcbiAgICAqL31cclxuICB9LFxyXG4gIDB4Yjoge1xyXG4gICAgbmFtZTogXCJNRU1PUllfQ09NUEFSRVwiLFxyXG4gICAgcHJvYzogZnVuY3Rpb24oKSB7IC8qXHJcbiAgICAgIHZhciBsZW4gPSBnZXRXb3JkKGR5bmFtaWNUb3AtNik7XHJcbiAgICAgIHZhciBvcDEgPSBnZXRXb3JkKGR5bmFtaWNUb3AtNCk7XHJcbiAgICAgIHZhciBvcDIgPSBnZXRXb3JkKGR5bmFtaWNUb3AtMik7XHJcblxyXG4gICAgICBibG9ja0NvbXBhcmUob3AxLCBvcDIsIGxlbik7XHJcbiAgICAgIERUKC02KTtcclxuICAgICovfVxyXG4gIH0sXHJcbiAgMHhjOiB7XHJcbiAgICBuYW1lOiBcIk1FTU9SWV9DT1BZXCIsXHJcbiAgICBwcm9jOiBmdW5jdGlvbigpIHsgLypcclxuICAgICAgdmFyIG51bSA9IGdldFdvcmQoZHluYW1pY1RvcC02KTtcclxuICAgICAgdmFyIGRzdCA9IGdldFdvcmQoZHluYW1pY1RvcC00KTtcclxuICAgICAgdmFyIHNyYyA9IGdldFdvcmQoZHluYW1pY1RvcC0yKTtcclxuXHJcbiAgICAgIGNvcHkoZHN0LCBzcmMsIG51bSk7XHJcbiAgICAgIERUKC02KTtcclxuICAgICovfVxyXG4gIH0sXHJcbiAgMHhkOiB7XHJcbiAgICBuYW1lOiBcIlFVRVJZX0lOVEVSRkFDRV9UWVBFXCIsXHJcbiAgICBwcm9jOiBmdW5jdGlvbigpIHsgLypcclxuICAgICAgU2V0Q0NSRmxhZyhaZmxhZywgZmFsc2UpOyAvLyBjb250YWN0XHJcbiAgICAqL31cclxuICB9LFxyXG4gIDB4MTA6IHtcclxuICAgIG5hbWU6IFwiQ09OVFJPTF9BVVRPX1JFU0VUX1dXVFwiLFxyXG4gICAgcHJvYzogZnVuY3Rpb24oKSB7IC8qXHJcbiAgICAgIC8vIERvZXNuJ3QgZG8gYW55dGhpbmdcclxuICAgICAgRFQoLTIpO1xyXG4gICAgKi99XHJcbiAgfSxcclxuICAweDExOiB7XHJcbiAgICBuYW1lOiBcIlNFVF9GQ0lfRklMRV9SRUNPUkRcIixcclxuICAgIHByb2M6IGZ1bmN0aW9uKCkgeyAvKlxyXG4gICAgICB2YXIgYWRkciA9IGdldFdvcmQoZHluYW1pY1RvcC0yKTtcclxuICAgICAgdmFyIGxlbiA9IGdldEJ5dGUoYWRkcik7XHJcblxyXG4gICAgICBNRUxBcHBsaWNhdGlvbiAqYSA9IHN0YXRlLmFwcGxpY2F0aW9uO1xyXG5cclxuICAgICAgaWYgKGEuRkNJUmVjb3JkU2l6ZSlcclxuICAgICAgICBkZWxldGUgW11hLkZDSVJlY29yZDtcclxuXHJcbiAgICAgIGEuRkNJUmVjb3JkU2l6ZSA9IGxlbjtcclxuICAgICAgYS5GQ0lSZWNvcmQgPSBuZXcgdmFyW2xlbl07XHJcbiAgICAgIHJlYWQoYWRkciArIDEsIGxlbiwgYS5GQ0lSZWNvcmQpO1xyXG4gICAgICBEVCgtMik7XHJcbiAgICAgIHB1c2hCeXRlKGxlbik7XHJcbiAgICAqL31cclxuICB9LFxyXG4gIDB4ODA6IHtcclxuICAgIG5hbWU6IFwiREVMRUdBVEVcIixcclxuICAgIHByb2M6IGZ1bmN0aW9uKCkgeyAvKlxyXG4gICAgICAvLyByb2xsYmFjayBhbmQgdHVybiBvZmYgdHJhbnNhY3Rpb24gcHJvdGVjdGlvblxyXG4gICAgICB2YXIgbSA9IHN0YXRlLmFwcGxpY2F0aW9uLnN0YXRpY0RhdGE7XHJcbiAgICAgIGlmIChtLm9uKVxyXG4gICAgICB7XHJcbiAgICAgICAgbS5kaXNjYXJkKCk7XHJcbiAgICAgICAgbS5vbiA9IGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgQUlEQWRkciA9IGdldFdvcmQoZHluYW1pY1RvcC0yKTtcclxuICAgICAgRFQoLTIpO1xyXG5cclxuICAgICAgdmFyIEFJRGxlbiA9IGdldEJ5dGUoQUlEQWRkcik7XHJcbiAgICAgIGlmIChBSURsZW4gPCAxIHx8IEFJRGxlbiA+IDE2KVxyXG4gICAgICAgIHNldFdvcmQoUFQoKStTVzEsIDB4NmE4Myk7XHJcbiAgICAgIGVsc2VcclxuICAgICAge1xyXG4gICAgICAgIHZhciBBSUQgPSBuZXcgdmFyW0FJRGxlbl07XHJcblxyXG4gICAgICAgIHJlYWQoQUlEQWRkcisxLCBBSURsZW4sIEFJRCk7XHJcbiAgICAgICAgaWYgKCFkZWxlZ2F0ZUFwcGxpY2F0aW9uKEFJRGxlbiwgQUlEKSlcclxuICAgICAgICAgIHNldFdvcmQoUFQoKStTVzEsIDB4NmE4Myk7XHJcbiAgICAgIH1cclxuICAgICovfVxyXG4gIH0sXHJcbiAgMHg4MToge1xyXG4gICAgbmFtZTogXCJSRVNFVF9TRVNTSU9OX0RBVEFcIixcclxuICAgIHByb2M6IGZ1bmN0aW9uKCkgeyAvKlxyXG4gICAgICBpZiAoc3RhdGUuYXBwbGljYXRpb24uaXNTaGVsbEFwcClcclxuICAgICAgICBSZXNldFNlc3Npb25EYXRhKCk7XHJcbiAgICAqL31cclxuICB9LFxyXG4gIDB4ODI6IHtcclxuICAgIG5hbWU6IFwiQ0hFQ0tTVU1cIixcclxuICAgIHByb2M6IGZ1bmN0aW9uKCkgeyAvKlxyXG4gICAgICB2YXIgbGVuZ3RoID0gZ2V0V29yZChkeW5hbWljVG9wLTQpO1xyXG4gICAgICB2YXIgYWRkciA9IGdldFdvcmQoZHluYW1pY1RvcC0yKTtcclxuICAgICAgdmFyIGNoZWNrc3VtWzRdID0geyAweDVhLCAweGE1LCAweDVhLCAweGE1IH07XHJcblxyXG4gICAgICB2YXIgbSA9IHN0YXRlLmFwcGxpY2F0aW9uLnN0YXRpY0RhdGE7XHJcbiAgICAgIHZhciBhY2NvdW50Rm9yVHJhbnNhY3Rpb25Qcm90ZWN0aW9uID0gKGFkZHIgPj0gbS5zdGFydCgpICYmIGFkZHIgPD0gbS5zdGFydCgpICsgbS5zaXplKCkgJiYgbS5vbik7XHJcblxyXG4gICAgICBmb3IgKHZhciBqPTA7IGogPCBsZW5ndGg7IGorKylcclxuICAgICAge1xyXG4gICAgICAgIGlmIChhY2NvdW50Rm9yVHJhbnNhY3Rpb25Qcm90ZWN0aW9uKVxyXG4gICAgICAgICAgY2hlY2tzdW1bMF0gKz0gKHZhciltLnJlYWRQZW5kaW5nQnl0ZU1lbW9yeShhZGRyK2opO1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgIGNoZWNrc3VtWzBdICs9ICh2YXIpZ2V0Qnl0ZShhZGRyICsgaik7XHJcblxyXG4gICAgICAgIGNoZWNrc3VtWzFdICs9IGNoZWNrc3VtWzBdO1xyXG4gICAgICAgIGNoZWNrc3VtWzJdICs9IGNoZWNrc3VtWzFdO1xyXG4gICAgICAgIGNoZWNrc3VtWzNdICs9IGNoZWNrc3VtWzJdO1xyXG4gICAgICB9XHJcbiAgICAgIHdyaXRlKGR5bmFtaWNUb3AtNCwgNCwgY2hlY2tzdW0pO1xyXG4gICAgKi99XHJcbiAgfSxcclxuICAweDgzOiB7XHJcbiAgICBuYW1lOiBcIkNBTExfQ09ERUxFVFwiLFxyXG4gICAgcHJvYzogZnVuY3Rpb24oKSB7IC8qXHJcbiAgICAgIHZhciBjb2RlbGV0SWQgPSBnZXRXb3JkKGR5bmFtaWNUb3AtNCk7XHJcbiAgICAgIHZhciBjb2RlYWRkciA9IGdldFdvcmQoZHluYW1pY1RvcC0yKTtcclxuXHJcbiAgICAgIERUKC00KTtcclxuICAgICAgY2FsbENvZGVsZXQoY29kZWxldElkLCBjb2RlYWRkcik7XHJcbiAgICAqL31cclxuICB9LFxyXG4gIDB4ODQ6IHtcclxuICAgIG5hbWU6IFwiUVVFUllfQ09ERUxFVFwiLFxyXG4gICAgcHJvYzogZnVuY3Rpb24oKSB7IC8qXHJcbiAgICAgIHZhciBjb2RlbGV0SWQgPSBnZXRXb3JkKGR5bmFtaWNUb3AtMik7XHJcblxyXG4gICAgICBTZXRDQ1JGbGFnKFpmbGFnLCBxdWVyeUNvZGVsZXQoY29kZWxldElkKSk7XHJcbiAgICAgIERUKC0yKTtcclxuICAgICovfVxyXG4gIH0sXHJcbiAgMHhjMToge1xyXG4gICAgbmFtZTogXCJERVNfRUNCX0VOQ0lQSEVSXCIsXHJcbiAgICBwcm9jOiBmdW5jdGlvbigpIHsgLypcclxuICAgICAgdmFyICprZXkgPSBkdW1wKGdldFdvcmQoZHluYW1pY1RvcC0weDYpLDgpO1xyXG4gICAgICB2YXIgcGxhaW50ZXh0QWRkciA9IGdldFdvcmQoZHluYW1pY1RvcC0weDQpO1xyXG4gICAgICB2YXIgKmNpcGhlcnRleHQgPSBkdW1wKGdldFdvcmQoZHluYW1pY1RvcC0weDIpLDgpO1xyXG4gICAgICB2YXIgcGxhaW50ZXh0WzhdO1xyXG5cclxuICAgICAgbXRoX2RlcyhERVNfREVDUllQVCwga2V5LCBjaXBoZXJ0ZXh0LCBwbGFpbnRleHQpO1xyXG4gICAgICB3cml0ZShwbGFpbnRleHRBZGRyLCA4LCBwbGFpbnRleHQpO1xyXG4gICAgICBEVCgtNik7XHJcbiAgICAqL31cclxuICB9LFxyXG4gIDB4YzI6IHtcclxuICAgIG5hbWU6IFwiTU9EVUxBUl9NVUxUSVBMSUNBVElPTlwiLFxyXG4gICAgcHJvYzogZnVuY3Rpb24oKSB7IC8qXHJcbiAgICAgIHZhciBtb2RsZW4gPSBnZXRXb3JkKGR5bmFtaWNUb3AtOCk7XHJcbiAgICAgIGNvbnN0IHZhciAqbGhzID0gZHVtcChnZXRXb3JkKGR5bmFtaWNUb3AtNiksIG1vZGxlbik7XHJcbiAgICAgIGNvbnN0IHZhciAqcmhzID0gZHVtcChnZXRXb3JkKGR5bmFtaWNUb3AtNCksIG1vZGxlbik7XHJcbiAgICAgIGNvbnN0IHZhciAqbW9kID0gZHVtcChnZXRXb3JkKGR5bmFtaWNUb3AtMiksIG1vZGxlbik7XHJcbiAgICAgIHZhciAqcmVzID0gbmV3IHZhclttb2RsZW5dO1xyXG4gICAgICBtdGhfbW9kX211bHQobGhzLCBtb2RsZW4sIHJocywgbW9kbGVuLCBtb2QsIG1vZGxlbiwgcmVzKTtcclxuICAgICAgd3JpdGUoZ2V0V29yZChkeW5hbWljVG9wLTYpLCBtb2RsZW4sIHJlcyk7XHJcbiAgICAgIERUKC04KTtcclxuICAgICovfVxyXG4gIH0sXHJcbiAgMHhjMzoge1xyXG4gICAgbmFtZTogXCJNT0RVTEFSX1JFRFVDVElPTlwiLFxyXG4gICAgcHJvYzogZnVuY3Rpb24oKSB7IC8qXHJcbiAgICAgIHZhciBvcGxlbiA9IGdldFdvcmQoZHluYW1pY1RvcC04KTtcclxuICAgICAgdmFyIG1vZGxlbiA9IGdldFdvcmQoZHluYW1pY1RvcC02KTtcclxuICAgICAgY29uc3QgdmFyICpvcCA9IGR1bXAoZ2V0V29yZChkeW5hbWljVG9wLTQpLCBvcGxlbik7XHJcbiAgICAgIGNvbnN0IHZhciAqbW9kID0gZHVtcChnZXRXb3JkKGR5bmFtaWNUb3AtMiksIG9wbGVuKTtcclxuICAgICAgdmFyICpyZXMgPSBuZXcgdmFyW29wbGVuXTtcclxuICAgICAgbXRoX21vZF9yZWQob3AsIG9wbGVuLCBtb2QsIG1vZGxlbiwgcmVzKTtcclxuICAgICAgd3JpdGUoZ2V0V29yZChkeW5hbWljVG9wLTQpLCBvcGxlbiwgcmVzKTtcclxuICAgICAgRFQoLTgpO1xyXG4gICAgICBkZWxldGUgW11yZXM7XHJcbiAgICAqL31cclxuICB9LFxyXG4gIDB4YzQ6IHtcclxuICAgIG5hbWU6IFwiR0VUX1JBTkRPTV9OVU1CRVJcIixcclxuICAgIHByb2M6IGZ1bmN0aW9uKCkgeyAvKlxyXG4gICAgICB2YXIgcmFuZFs4XTtcclxuICAgICAgcmFuZGRhdGEocmFuZCwgOCk7XHJcbiAgICAgIERUKDgpO1xyXG4gICAgICB3cml0ZShkeW5hbWljVG9wLTgsIDgsIHJhbmQpO1xyXG4gICAgKi99XHJcbiAgfSxcclxuICAweGM1OiB7XHJcbiAgICBuYW1lOiBcIkRFU19FQ0JfREVDSVBIRVJcIixcclxuICAgIHByb2M6IGZ1bmN0aW9uKCkgeyAvKlxyXG4gICAgICB2YXIgKmtleSA9IGR1bXAoZ2V0V29yZChkeW5hbWljVG9wLTB4NiksOCk7XHJcbiAgICAgIHZhciBjaXBoZXJBZGRyID0gZ2V0V29yZChkeW5hbWljVG9wLTB4NCk7XHJcbiAgICAgIHZhciAqcGxhaW50ZXh0ID0gZHVtcChnZXRXb3JkKGR5bmFtaWNUb3AtMHgyKSw4KTtcclxuICAgICAgdmFyIGNpcGhlcnRleHRbOF07XHJcblxyXG4gICAgICBtdGhfZGVzKERFU19FTkNSWVBULCBrZXksIHBsYWludGV4dCwgY2lwaGVydGV4dCk7XHJcbiAgICAgIHdyaXRlKGNpcGhlckFkZHIsIDgsIGNpcGhlcnRleHQpO1xyXG4gICAgICBEVCgtNik7XHJcbiAgICAqL31cclxuICB9LFxyXG4gIDB4YzY6IHtcclxuICAgIG5hbWU6IFwiR0VORVJBVEVfREVTX0NCQ19TSUdOQVRVUkVcIixcclxuICAgIHByb2M6IGZ1bmN0aW9uKCkgeyAvKlxyXG4gICAgICB2YXIgcGxhaW5UZXh0TGVuZ3RoID0gZ2V0V29yZChkeW5hbWljVG9wLTB4YSk7XHJcbiAgICAgIHZhciBJVmFkZHIgPSBnZXRXb3JkKGR5bmFtaWNUb3AtMHg4KTtcclxuICAgICAgdmFyICprZXkgPSBkdW1wKGdldFdvcmQoZHluYW1pY1RvcC0weDYpLCA4KTtcclxuICAgICAgdmFyIHNpZ25hdHVyZUFkZHIgPSBnZXRXb3JkKGR5bmFtaWNUb3AtMHg0KTtcclxuICAgICAgdmFyICpwbGFpblRleHQgPSBkdW1wKGdldFdvcmQoZHluYW1pY1RvcC0weDIpLCBwbGFpblRleHRMZW5ndGgpO1xyXG4gICAgICB2YXIgc2lnbmF0dXJlWzhdO1xyXG5cclxuICAgICAgcmVhZChJVmFkZHIsIDgsIHNpZ25hdHVyZSk7XHJcbiAgICAgIHdoaWxlIChwbGFpblRleHRMZW5ndGggPj0gOClcclxuICAgICAge1xyXG4gICAgICAgIGZvciAodmFyIGk9MDtpPDg7aSsrKVxyXG4gICAgICAgICAgc2lnbmF0dXJlW2ldIF49IHBsYWluVGV4dFtpXTtcclxuXHJcbiAgICAgICAgdmFyIGVuY3J5cHRlZFNpZ25hdHVyZVs4XTtcclxuXHJcbiAgICAgICAgbXRoX2RlcyhERVNfRU5DUllQVCwga2V5LCBzaWduYXR1cmUsIGVuY3J5cHRlZFNpZ25hdHVyZSk7XHJcbiAgICAgICAgbWVtY3B5KHNpZ25hdHVyZSwgZW5jcnlwdGVkU2lnbmF0dXJlLCA4KTtcclxuICAgICAgICBwbGFpblRleHRMZW5ndGggLT0gODtcclxuICAgICAgICBwbGFpblRleHQgKz0gODtcclxuICAgICAgfVxyXG4gICAgICB3cml0ZShzaWduYXR1cmVBZGRyLCA4LCBzaWduYXR1cmUpO1xyXG4gICAgICBEVCgtMTApO1xyXG4gICAgKi99XHJcbiAgfSxcclxuICAweGM3OiB7XHJcbiAgICBuYW1lOiBcIkdFTkVSQVRFX1RSSVBMRV9ERVNfQ0JDX1NJR05BVFVSRVwiLFxyXG4gICAgcHJvYzogZnVuY3Rpb24oKSB7IC8qXHJcbiAgICAgIGludCBwbGFpblRleHRMZW5ndGggPSBnZXRXb3JkKGR5bmFtaWNUb3AtMHhhKTtcclxuICAgICAgdmFyIElWYWRkciA9IGdldFdvcmQoZHluYW1pY1RvcC0weDgpO1xyXG4gICAgICB2YXIga2V5MSA9IGR1bXAoZ2V0V29yZChkeW5hbWljVG9wLTB4NiksIDE2KTtcclxuICAgICAgdmFyIGtleTIgPSBrZXkxICsgODtcclxuICAgICAgdmFyIHNpZ25hdHVyZUFkZHIgPSBnZXRXb3JkKGR5bmFtaWNUb3AtMHg0KTtcclxuICAgICAgdmFyIHBsYWluVGV4dCA9IGR1bXAoZ2V0V29yZChkeW5hbWljVG9wLTB4MiksIHBsYWluVGV4dExlbmd0aCk7XHJcbiAgICAgIHZhciBzaWduYXR1cmVbOF07XHJcblxyXG4gICAgICByZWFkKElWYWRkciwgOCwgc2lnbmF0dXJlKTtcclxuICAgICAgd2hpbGUgKHBsYWluVGV4dExlbmd0aCA+IDApXHJcbiAgICAgIHtcclxuICAgICAgICBmb3IgKHZhciBpPTA7aTw4O2krKylcclxuICAgICAgICAgIHNpZ25hdHVyZVtpXSBePSBwbGFpblRleHRbaV07XHJcblxyXG4gICAgICAgIHZhciBlbmNyeXB0ZWRTaWduYXR1cmVbOF07XHJcblxyXG4gICAgICAgIG10aF9kZXMoREVTX0VOQ1JZUFQsIGtleTEsIHNpZ25hdHVyZSwgZW5jcnlwdGVkU2lnbmF0dXJlKTtcclxuICAgICAgICBtdGhfZGVzKERFU19ERUNSWVBULCBrZXkyLCBlbmNyeXB0ZWRTaWduYXR1cmUsIHNpZ25hdHVyZSk7XHJcbiAgICAgICAgbXRoX2RlcyhERVNfRU5DUllQVCwga2V5MSwgc2lnbmF0dXJlLCBlbmNyeXB0ZWRTaWduYXR1cmUpO1xyXG4gICAgICAgIG1lbWNweShzaWduYXR1cmUsIGVuY3J5cHRlZFNpZ25hdHVyZSwgOCk7XHJcbiAgICAgICAgcGxhaW5UZXh0TGVuZ3RoIC09IDg7XHJcbiAgICAgICAgcGxhaW5UZXh0ICs9IDg7XHJcbiAgICAgIH1cclxuICAgICAgd3JpdGUoc2lnbmF0dXJlQWRkciwgOCwgc2lnbmF0dXJlKTtcclxuICAgICAgRFQoLTEwKTtcclxuICAgICovfVxyXG4gIH0sXHJcbiAgMHhjODoge1xyXG4gICAgbmFtZTogXCJNT0RVTEFSX0VYUE9ORU5USUFUSU9OXCIsXHJcbiAgICBwcm9jOiBmdW5jdGlvbigpIHsgLypcclxuICAgICAgdmFyIGV4cGxlbiA9IGdldFdvcmQoZHluYW1pY1RvcC0weGMpO1xyXG4gICAgICB2YXIgbW9kbGVuID0gZ2V0V29yZChkeW5hbWljVG9wLTB4YSk7XHJcbiAgICAgIHZhciBleHBvbmVudCA9IGR1bXAoZ2V0V29yZChkeW5hbWljVG9wLTB4OCksIGV4cGxlbik7XHJcbiAgICAgIHZhciBtb2QgPSBkdW1wKGdldFdvcmQoZHluYW1pY1RvcC0weDYpLCBtb2RsZW4pO1xyXG4gICAgICB2YXIgYmFzZSA9IGR1bXAoZ2V0V29yZChkeW5hbWljVG9wLTB4NCksIG1vZGxlbik7XHJcbiAgICAgIHZhciByZXNBZGRyID0gZ2V0V29yZChkeW5hbWljVG9wLTB4Mik7XHJcbiAgICAgIHZhciByZXMgPSBuZXcgdmFyW21vZGxlbl07XHJcblxyXG4gICAgICBtdGhfbW9kX2V4cChiYXNlLCBtb2RsZW4sIGV4cG9uZW50LCBleHBsZW4sIG1vZCwgbW9kbGVuLCByZXMpO1xyXG4gICAgICB3cml0ZShyZXNBZGRyLCBtb2RsZW4sIHJlcyk7XHJcbiAgICAgIERUKC0xMik7XHJcblxyXG4gICAgICBkZWxldGUgW11yZXM7XHJcbiAgICAqL31cclxuICB9LFxyXG4gIDB4Yzk6IHtcclxuICAgIG5hbWU6IFwiTU9EVUxBUl9FWFBPTkVOVElBVElPTl9DUlRcIixcclxuICAgIHByb2M6IGZ1bmN0aW9uKCkgeyAvKlxyXG4gICAgICB2YXIgbW9kdWx1c19sZW4gPSBnZXRXb3JkKGR5bmFtaWNUb3AtMTApO1xyXG4gICAgICB2YXIgZHBkcSA9IGR1bXAoZ2V0V29yZChkeW5hbWljVG9wLTgpLCBtb2R1bHVzX2xlbik7XHJcbiAgICAgIHZhciBwcXUgID0gZHVtcChnZXRXb3JkKGR5bmFtaWNUb3AtNiksIG1vZHVsdXNfbGVuICogMyAvIDIpO1xyXG4gICAgICB2YXIgYmFzZSA9IGR1bXAoZ2V0V29yZChkeW5hbWljVG9wLTQpLCBtb2R1bHVzX2xlbik7XHJcbiAgICAgIHZhciBvdXRBZGRyID0gZ2V0V29yZChkeW5hbWljVG9wLTIpO1xyXG4gICAgICB2YXIgcmVzID0gbmV3IHZhclttb2R1bHVzX2xlbl07XHJcblxyXG4gICAgICBtdGhfbW9kX2V4cF9jcnQobW9kdWx1c19sZW4sIGRwZHEsIHBxdSwgYmFzZSwgcmVzKTtcclxuICAgICAgd3JpdGUob3V0QWRkciwgbW9kdWx1c19sZW4sIHJlcyk7XHJcbiAgICAgIERUKC0xMCk7XHJcbiAgICAgIGRlbGV0ZVtdIHJlcztcclxuICAgICovfVxyXG4gIH0sXHJcbiAgMHhjYToge1xyXG4gICAgbmFtZTogXCJTSEExXCIsXHJcbiAgICBwcm9jOiBmdW5jdGlvbigpIHsgLypcclxuICAgICAgdmFyIHBsYWludGV4dExlbmd0aCA9IGdldFdvcmQoZHluYW1pY1RvcC0weDYpO1xyXG4gICAgICB2YXIgaGFzaERpZ2VzdEFkZHIgPSBnZXRXb3JkKGR5bmFtaWNUb3AtMHg0KTtcclxuICAgICAgdmFyIHBsYWludGV4dCA9IGR1bXAoZ2V0V29yZChkeW5hbWljVG9wLTB4MiksIHBsYWludGV4dExlbmd0aCk7XHJcbiAgICAgIHZhciBsb25nIGhhc2hEaWdlc3RbNV07IC8vIDIwIGJ5dGUgaGFzaFxyXG5cclxuICAgICAgbXRoX3NoYV9pbml0KGhhc2hEaWdlc3QpO1xyXG5cclxuICAgICAgd2hpbGUgKHBsYWludGV4dExlbmd0aCA+IDY0KVxyXG4gICAgICB7XHJcbiAgICAgICAgbXRoX3NoYV91cGRhdGUoaGFzaERpZ2VzdCwgKHZhciAqKXBsYWludGV4dCk7XHJcbiAgICAgICAgcGxhaW50ZXh0ICs9IDY0O1xyXG4gICAgICAgIHBsYWludGV4dExlbmd0aCAtPSA2NDtcclxuICAgICAgfVxyXG5cclxuICAgICAgbXRoX3NoYV9maW5hbChoYXNoRGlnZXN0LCAodmFyICopcGxhaW50ZXh0LCBwbGFpbnRleHRMZW5ndGgpO1xyXG5cclxuICAgICAgZm9yIChpbnQgaT0wO2k8NTtpKyspXHJcbiAgICAgICAgd3JpdGVOdW1iZXIoaGFzaERpZ2VzdEFkZHIrKGkqNCksIDQsIGhhc2hEaWdlc3RbaV0pO1xyXG5cclxuICAgICAgRFQoLTYpO1xyXG4gICAgKi99XHJcbiAgfSxcclxuICAweGNjOiB7XHJcbiAgICBuYW1lOiBcIkdFTkVSQVRFX1JBTkRPTV9QUklNRVwiLFxyXG4gICAgcHJvYzogZnVuY3Rpb24oKSB7IC8qXHJcbiAgICAgIHZhciBnY2RGbGFnID0gZ2V0Qnl0ZShkeW5hbWljVG9wLTEzKTtcclxuICAgICAgdmFyIGNvbmYgPSBnZXRXb3JkKGR5bmFtaWNUb3AtMTIpO1xyXG4gICAgICB2YXIgdGltZW91dCA9IGdldFdvcmQoZHluYW1pY1RvcC0xMCk7XHJcbiAgICAgIHZhciByZ0V4cCA9IGdldFdvcmQoZHluYW1pY1RvcC04KTtcclxuICAgICAgY29uc3QgdmFyICptaW5Mb2MgPSBkdW1wKGdldFdvcmQoZHluYW1pY1RvcC02KSwgNCk7XHJcbiAgICAgIGNvbnN0IHZhciAqbWF4TG9jID0gZHVtcChnZXRXb3JkKGR5bmFtaWNUb3AtNCksIDQpO1xyXG4gICAgICB2YXIgcmVzQWRkciA9IGdldFdvcmQoZHluYW1pY1RvcC0weDIpO1xyXG4gICAgICBpZiAoKHJnRXhwIDwgNSkgfHwgKHJnRXhwID4gMjU2KSlcclxuICAgICAge1xyXG4gICAgICAgIEFiZW5kKFwicmdFeHAgcGFyYW1ldGVyIG91dCBvZiByYW5nZVwiKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlXHJcbiAgICAgIHtcclxuICAgICAgICBzdGF0aWMgY29uc3Qgdmxvbmcgb25lKDEpO1xyXG4gICAgICAgIHN0YXRpYyBjb25zdCB2bG9uZyB0aHJlZSgzKTtcclxuICAgICAgICBzdGQ6OnZlY3Rvcjx2YXI+IGNhbmRpZGF0ZShyZ0V4cCk7XHJcbiAgICAgICAgZm9yICg7OylcclxuICAgICAgICB7XHJcbiAgICAgICAgICBzdGQ6OmdlbmVyYXRlKGNhbmRpZGF0ZS5iZWdpbigpLCBjYW5kaWRhdGUuZW5kKCksIHJhbmQpO1xyXG4gICAgICAgICAgaWYgKHN0ZDo6bGV4aWNvZ3JhcGhpY2FsX2NvbXBhcmUoXHJcbiAgICAgICAgICAgICAgICBjYW5kaWRhdGUuYmVnaW4oKSwgY2FuZGlkYXRlLmVuZCgpLFxyXG4gICAgICAgICAgICAgICAgbWluTG9jLCBtaW5Mb2MgKyA0KSlcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICBpZiAoc3RkOjpsZXhpY29ncmFwaGljYWxfY29tcGFyZShcclxuICAgICAgICAgICAgICAgIG1heExvYywgbWF4TG9jICsgNCxcclxuICAgICAgICAgICAgICAgIGNhbmRpZGF0ZS5iZWdpbigpLCBjYW5kaWRhdGUuZW5kKCkpKVxyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgIHZsb25nIHZsb25nX2NhbmRpZGF0ZShjYW5kaWRhdGUuc2l6ZSgpLCAmY2FuZGlkYXRlWzBdKTtcclxuICAgICAgICAgIGlmICgweDgwID09IGdjZEZsYWcpXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChvbmUgIT0gZ2NkKHRocmVlLCB2bG9uZ19jYW5kaWRhdGUpKVxyXG4gICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKCFpc19wcm9iYWJsZV9wcmltZSh2bG9uZ19jYW5kaWRhdGUpKVxyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgd3JpdGUocmVzQWRkciwgcmdFeHAsICZjYW5kaWRhdGVbMF0pO1xyXG4gICAgICAgIERUKC0xMyk7XHJcbiAgICAgIH1cclxuICAgICovfVxyXG4gIH0sXHJcbiAgMHhjZDoge1xyXG4gICAgbmFtZTogXCJTRUVEX0VDQl9ERUNJUEhFUlwiLFxyXG4gICAgcHJvYzogZnVuY3Rpb24oKSB7IC8qXHJcbiAgICAgIHN0YXRpYyBjb25zdCB2YXIgYmxvY2tfc2l6ZSA9IDE2O1xyXG5cclxuICAgICAgY29uc3QgdmFyICprZXkgPSBkdW1wKGdldFdvcmQoZHluYW1pY1RvcC02KSwgYmxvY2tfc2l6ZSk7XHJcbiAgICAgIHZhciByZXNBZGRyID0gZ2V0V29yZChkeW5hbWljVG9wLTB4NCk7XHJcbiAgICAgIGNvbnN0IHZhciAqcGxhaW50ZXh0ID0gZHVtcChnZXRXb3JkKGR5bmFtaWNUb3AtMiksIGJsb2NrX3NpemUpO1xyXG5cclxuICAgICAgdmFyIGJ1ZmZlcltibG9ja19zaXplXTtcclxuICAgICAgbWVtY3B5KGJ1ZmZlciwga2V5LCBibG9ja19zaXplKTtcclxuICAgICAgRFdPUkQgcm91bmRfa2V5WzIgKiBibG9ja19zaXplXTtcclxuICAgICAgU2VlZEVuY1JvdW5kS2V5KHJvdW5kX2tleSwgYnVmZmVyKTtcclxuICAgICAgbWVtY3B5KGJ1ZmZlciwgcGxhaW50ZXh0LCBibG9ja19zaXplKTtcclxuICAgICAgU2VlZERlY3J5cHQoYnVmZmVyLCByb3VuZF9rZXkpO1xyXG5cclxuICAgICAgd3JpdGUocmVzQWRkciwgYmxvY2tfc2l6ZSwgYnVmZmVyKTtcclxuICAgICAgRFQoLTYpO1xyXG4gICAgKi99XHJcbiAgfSxcclxuICAweGNlOiB7XHJcbiAgICBuYW1lOiBcIlNFRURfRUNCX0VOQ0lQSEVSXCIsXHJcbiAgICBwcm9jOiBmdW5jdGlvbigpIHsgLypcclxuICAgICAgc3RhdGljIGNvbnN0IHZhciBibG9ja19zaXplID0gMTY7XHJcblxyXG4gICAgICBjb25zdCB2YXIgKmtleSA9IGR1bXAoZ2V0V29yZChkeW5hbWljVG9wLTYpLCBibG9ja19zaXplKTtcclxuICAgICAgdmFyIHJlc0FkZHIgPSBnZXRXb3JkKGR5bmFtaWNUb3AtMHg0KTtcclxuICAgICAgY29uc3QgdmFyICpwbGFpbnRleHQgPSBkdW1wKGdldFdvcmQoZHluYW1pY1RvcC0yKSwgYmxvY2tfc2l6ZSk7XHJcblxyXG4gICAgICB2YXIgYnVmZmVyW2Jsb2NrX3NpemVdO1xyXG4gICAgICBtZW1jcHkoYnVmZmVyLCBrZXksIGJsb2NrX3NpemUpO1xyXG4gICAgICBEV09SRCByb3VuZF9rZXlbMiAqIGJsb2NrX3NpemVdO1xyXG4gICAgICBTZWVkRW5jUm91bmRLZXkocm91bmRfa2V5LCBidWZmZXIpO1xyXG4gICAgICBtZW1jcHkoYnVmZmVyLCBwbGFpbnRleHQsIGJsb2NrX3NpemUpO1xyXG4gICAgICBTZWVkRW5jcnlwdChidWZmZXIsIHJvdW5kX2tleSk7XHJcblxyXG4gICAgICB3cml0ZShyZXNBZGRyLCBibG9ja19zaXplLCBidWZmZXIpO1xyXG4gICAgICBEVCgtNik7XHJcbiAgICAqL31cclxuICB9XHJcbn07XHJcblxyXG52YXIgc2V0T25lUHJpbWl0aXZlcyA9XHJcbntcclxuICAweDAwOiB7XHJcbiAgICBuYW1lOiBcIlFVRVJZMFwiLFxyXG4gICAgcHJvYzogZnVuY3Rpb24oKSB7IC8qXHJcbiAgICAgIGkgPSBwcmltMC5maW5kKGFyZzEpO1xyXG4gICAgICBTZXRDQ1JGbGFnKFpmbGFnLCBpICE9IHByaW0wLmVuZCgpKTtcclxuICAgICovfVxyXG4gIH0sXHJcbiAgMHgwMToge1xyXG4gICAgbmFtZTogXCJRVUVSWTFcIixcclxuICAgIHByb2M6IGZ1bmN0aW9uKCkgeyAvKlxyXG4gICAgICBpID0gcHJpbTEuZmluZChhcmcxKTtcclxuICAgICAgU2V0Q0NSRmxhZyhaZmxhZywgaSAhPSBwcmltMS5lbmQoKSk7XHJcbiAgICAqL31cclxuICB9LFxyXG4gIDB4MDI6IHtcclxuICAgIG5hbWU6IFwiUVVFUlkyXCIsXHJcbiAgICBwcm9jOiBmdW5jdGlvbigpIHsgLypcclxuICAgICAgaSA9IHByaW0yLmZpbmQoYXJnMSk7XHJcbiAgICAgIFNldENDUkZsYWcoWmZsYWcsIGkgIT0gcHJpbTIuZW5kKCkpO1xyXG4gICAgKi99XHJcbiAgfSxcclxuICAweDAzOiB7XHJcbiAgICBuYW1lOiBcIlFVRVJZM1wiLFxyXG4gICAgcHJvYzogZnVuY3Rpb24oKSB7IC8qXHJcbiAgICAgIGkgPSBwcmltMy5maW5kKGFyZzEpO1xyXG4gICAgICBTZXRDQ1JGbGFnKFpmbGFnLCBpICE9IHByaW0zLmVuZCgpKTtcclxuICAgICovfVxyXG4gIH0sXHJcbiAgMHgwODoge1xyXG4gICAgbmFtZTogXCJESVZJREVOXCIsXHJcbiAgICBwcm9jOiBmdW5jdGlvbigpIHsgLypcclxuICAgICAgdmFyIGxlbiA9IGFyZzE7XHJcbiAgICAgIHZhciAqZGVub21pbmF0b3IgPSBkdW1wKGR5bmFtaWNUb3AtbGVuLCBsZW4pO1xyXG4gICAgICBpZiAoYmxvY2tJc1plcm8oZGVub21pbmF0b3IsIGxlbikpXHJcbiAgICAgIHtcclxuICAgICAgICBTZXRDQ1JGbGFnKENmbGFnLCB0cnVlKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlXHJcbiAgICAgIHtcclxuICAgICAgICBjb25zdCB2YXIgKm51bWVyYXRvciA9IGR1bXAoZHluYW1pY1RvcC0yKmxlbiwgbGVuKTtcclxuICAgICAgICB2YXIgKnF1b3RpZW50ID0gbmV3IHZhcltsZW5dO1xyXG4gICAgICAgIHZhciAqcmVtYWluZGVyID0gbmV3IHZhcltsZW5dO1xyXG4gICAgICAgIG10aF9kaXYobnVtZXJhdG9yLCBkZW5vbWluYXRvciwgbGVuLCBxdW90aWVudCwgcmVtYWluZGVyKTtcclxuICAgICAgICB3cml0ZShkeW5hbWljVG9wLTIqbGVuLCBsZW4sIHF1b3RpZW50KTtcclxuICAgICAgICB3cml0ZShkeW5hbWljVG9wLWxlbiwgbGVuLCByZW1haW5kZXIpO1xyXG4gICAgICAgIFNldENDUkZsYWcoQ2ZsYWcsIGZhbHNlKTtcclxuICAgICAgICBTZXRDQ1JGbGFnKFpmbGFnLCBibG9ja0lzWmVybyhxdW90aWVudCxsZW4pKTtcclxuICAgICAgICBkZWxldGUgW11xdW90aWVudDtcclxuICAgICAgICBkZWxldGUgW11yZW1haW5kZXI7XHJcbiAgICAgIH1cclxuICAgICovfVxyXG4gIH0sXHJcbiAgMHgwOToge1xyXG4gICAgbmFtZTogXCJHRVRfRElSX0ZJTEVfUkVDT1JEXCIsXHJcbiAgICBwcm9jOiBmdW5jdGlvbigpIHsgLypcclxuICAgICAgLy8gU2FtZSBhcyBiZWxvd1xyXG4gICAgICBNVUxUT1MuUHJpbWl0aXZlcy5zZXRPbmVQcmltaXRpdmVzWyAweDBhIF0ucHJvYygpO1xyXG4gICAgKi99XHJcbiAgfSxcclxuICAweDBhOiB7XHJcbiAgICBuYW1lOiBcIkdFVF9GSUxFX0NPTlRST0xfSU5GT1JNQVRJT05cIixcclxuICAgIHByb2M6IGZ1bmN0aW9uKCkgeyAvKlxyXG4gICAgICB2YXIgbGVuID0gYXJnMTtcclxuICAgICAgdmFyIGFkZHIgPSBnZXRXb3JkKGR5bmFtaWNUb3AtMyk7XHJcbiAgICAgIHZhciByZWNvcmROdW1iZXIgPSBnZXRCeXRlKGR5bmFtaWNUb3AtMSk7XHJcbiAgICAgIHZhciBva2F5O1xyXG4gICAgICB2YXIgKmRhdGE7XHJcbiAgICAgIHZhciBkYXRhbGVuO1xyXG4gICAgICBpZiAocHJpbSA9PSBHRVRfRElSX0ZJTEVfUkVDT1JEKVxyXG4gICAgICAgIG9rYXkgPSBnZXREaXJGaWxlUmVjb3JkKHJlY29yZE51bWJlci0xLCAmZGF0YWxlbiwgJmRhdGEpO1xyXG4gICAgICBlbHNlXHJcbiAgICAgICAgb2theSA9IGdldEZDSShyZWNvcmROdW1iZXItMSwgJmRhdGFsZW4sICZkYXRhKTtcclxuICAgICAgaWYgKG9rYXkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgdmFyIGNvcGllZCA9IGxlbiA8IGRhdGFsZW4gPyBsZW4gOiBkYXRhbGVuO1xyXG4gICAgICAgICAgaWYgKGNvcGllZClcclxuICAgICAgICAgICAgd3JpdGUoYWRkciwgY29waWVkLCBkYXRhKTtcclxuICAgICAgICAgIHB1c2hCeXRlKGNvcGllZCk7XHJcbiAgICAgICAgICBTZXRDQ1JGbGFnKENmbGFnLCAoY29waWVkIDwgbGVuKSk7XHJcbiAgICAgICAgICBTZXRDQ1JGbGFnKFpmbGFnLCAwKTtcclxuICAgICAgICB9XHJcbiAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICBwdXNoQnl0ZSgwKTtcclxuICAgICAgICAgIFNldENDUkZsYWcoQ2ZsYWcsIDEpO1xyXG4gICAgICAgICAgU2V0Q0NSRmxhZyhaZmxhZywgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgKi99XHJcbiAgfSxcclxuICAweDBiOiB7XHJcbiAgICBuYW1lOiBcIkdFVF9NQU5VRkFDVFVSRVJfREFUQVwiLFxyXG4gICAgcHJvYzogZnVuY3Rpb24oKSB7IC8qXHJcbiAgICAgIHZhciBhZGRyID0gZ2V0V29yZChkeW5hbWljVG9wLTIpO1xyXG4gICAgICBEVCgtMSk7XHJcbiAgICAgIHZhciBtYW51ZmFjdHVyZXJbMjU2XTtcclxuICAgICAgdmFyIGxlbiA9IGdldE1hbnVmYWN0dXJlckRhdGEobWFudWZhY3R1cmVyKTtcclxuICAgICAgbGVuID0gYXJnMSA8IGxlbiA/IGFyZzEgOiBsZW47XHJcbiAgICAgIGlmIChsZW4pXHJcbiAgICAgICAgd3JpdGUoYWRkciwgbGVuLCBtYW51ZmFjdHVyZXIpO1xyXG4gICAgICBzZXRCeXRlKGR5bmFtaWNUb3AtMSwgKHZhcilsZW4pO1xyXG4gICAgKi99XHJcbiAgfSxcclxuICAweDBjOiB7XHJcbiAgICBuYW1lOiBcIkdFVF9NVUxUT1NfREFUQVwiLFxyXG4gICAgcHJvYzogZnVuY3Rpb24oKSB7IC8qXHJcbiAgICAgIHZhciBhZGRyID0gZ2V0V29yZChkeW5hbWljVG9wLTIpO1xyXG4gICAgICBEVCgtMSk7XHJcbiAgICAgIHZhciBNVUxUT1NEYXRhWzI1Nl07XHJcbiAgICAgIHZhciBsZW4gPSBnZXRNVUxUT1NEYXRhKE1VTFRPU0RhdGEpO1xyXG4gICAgICBpZiAobGVuKVxyXG4gICAgICAgIGxlbiA9IGFyZzEgPCBsZW4gPyBhcmcxIDogbGVuO1xyXG4gICAgICB3cml0ZShhZGRyLCBsZW4sIE1VTFRPU0RhdGEpO1xyXG4gICAgICBzZXRCeXRlKGR5bmFtaWNUb3AtMSwgKHZhcilsZW4pO1xyXG4gICAgKi99XHJcbiAgfSxcclxuICAweDBkOiB7XHJcbiAgICBuYW1lOiBcIkdFVF9QVVJTRV9UWVBFXCIsXHJcbiAgICBwcm9jOiBmdW5jdGlvbigpIHsgLypcclxuICAgICAgQWJlbmQoXCJwcmltaXRpdmUgbm90IHN1cHBvcnRlZFwiKTtcclxuICAgICovfVxyXG4gIH0sXHJcbiAgMHgwZToge1xyXG4gICAgbmFtZTogXCJNRU1PUllfQ09QWV9GSVhFRF9MRU5HVEhcIixcclxuICAgIHByb2M6IGZ1bmN0aW9uKCkgeyAvKlxyXG4gICAgICB2YXIgZHN0ID0gZ2V0V29yZChkeW5hbWljVG9wLTQpO1xyXG4gICAgICB2YXIgc3JjID0gZ2V0V29yZChkeW5hbWljVG9wLTIpO1xyXG5cclxuICAgICAgY29weShkc3QsIHNyYywgYXJnMSk7XHJcbiAgICAgIERUKC00KTtcclxuICAgICovfVxyXG4gIH0sXHJcbiAgMHgwZjoge1xyXG4gICAgbmFtZTogXCJNRU1PUllfQ09NUEFSRV9GSVhFRF9MRU5HVEhcIixcclxuICAgIHByb2M6IGZ1bmN0aW9uKCkgeyAvKlxyXG4gICAgICB2YXIgb3AxID0gZ2V0V29yZChkeW5hbWljVG9wLTQpO1xyXG4gICAgICB2YXIgb3AyID0gZ2V0V29yZChkeW5hbWljVG9wLTIpO1xyXG4gICAgICBibG9ja0NvbXBhcmUob3AxLCBvcDIsIGFyZzEpO1xyXG4gICAgICBEVCgtNCk7XHJcbiAgICAqL31cclxuICB9LFxyXG4gIDB4MTA6IHtcclxuICAgIG5hbWU6IFwiTVVMVElQTFlOXCIsXHJcbiAgICBwcm9jOiBmdW5jdGlvbigpIHsgLypcclxuICAgICAgdmFyIGxlbiA9IGFyZzE7XHJcbiAgICAgIGNvbnN0IHZhciAqb3AxID0gZHVtcChkeW5hbWljVG9wLTIqbGVuLCBsZW4pO1xyXG4gICAgICBjb25zdCB2YXIgKm9wMiA9IGR1bXAoZHluYW1pY1RvcC1sZW4sIGxlbik7XHJcbiAgICAgIHZhciAqcmVzID0gbmV3IHZhcltsZW4qMl07XHJcbiAgICAgIG10aF9tdWwob3AxLCBvcDIsIGxlbiwgcmVzKTtcclxuICAgICAgd3JpdGUoZHluYW1pY1RvcC0yKmxlbiwgbGVuKjIsIHJlcyk7XHJcbiAgICAgIFNldENDUkZsYWcoWmZsYWcsIGJsb2NrSXNaZXJvKHJlcyxsZW4qMikpO1xyXG4gICAgICBkZWxldGUgW11yZXM7XHJcbiAgICAqL31cclxuICB9LFxyXG4gIDB4ODA6IHtcclxuICAgIG5hbWU6IFwiU0VUX1RSQU5TQUNUSU9OX1BST1RFQ1RJT05cIixcclxuICAgIHByb2M6IGZ1bmN0aW9uKCkgeyAvKlxyXG4gICAgICB2YXIgbSA9IHN0YXRlLmFwcGxpY2F0aW9uLnN0YXRpY0RhdGE7XHJcbiAgICAgIGlmIChtLm9uKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGlmIChhcmcxICYgMSlcclxuICAgICAgICAgICAgbS5jb21taXQoKTtcclxuICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgbS5kaXNjYXJkKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICBpZiAoYXJnMSAmIDIpXHJcbiAgICAgICAgbS5vbiA9IHRydWU7XHJcbiAgICAgIGVsc2VcclxuICAgICAgICBtLm9uID0gZmFsc2U7XHJcbiAgICAqL31cclxuICB9LFxyXG4gIDB4ODE6IHtcclxuICAgIG5hbWU6IFwiR0VUX0RFTEVHQVRPUl9BSURcIixcclxuICAgIHByb2M6IGZ1bmN0aW9uKCkgeyAvKlxyXG4gICAgICB2YXIgQUlEQWRkciA9IGdldFdvcmQoZHluYW1pY1RvcC0yKTtcclxuICAgICAgRFQoLTIpO1xyXG4gICAgICBNRUxFeGVjdXRpb25TdGF0ZSAqZSA9IGdldERlbGVnYXRvclN0YXRlKCk7XHJcbiAgICAgIGlmIChlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHZhciBsZW47XHJcbiAgICAgICAgICBpZiAoIGFyZzEgPCBlLmFwcGxpY2F0aW9uLkFJRGxlbmd0aClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgIGxlbiA9IGFyZzE7XHJcbiAgICAgICAgICAgICAgU2V0Q0NSRmxhZyhDZmxhZywgdHJ1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgIGxlbiA9ICBlLmFwcGxpY2F0aW9uLkFJRGxlbmd0aDtcclxuICAgICAgICAgICAgICBTZXRDQ1JGbGFnKENmbGFnLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIHNldEJ5dGUoQUlEQWRkciwgKHZhcilsZW4pO1xyXG4gICAgICAgICAgQUlEQWRkcisrO1xyXG4gICAgICAgICAgZm9yICh2YXIgaT0wOyBpIDwgbGVuOyBpKyspXHJcbiAgICAgICAgICAgIHNldEJ5dGUoQUlEQWRkcitpLCBlLmFwcGxpY2F0aW9uLkFJRFtpXSk7XHJcbiAgICAgICAgICBTZXRDQ1JGbGFnKFpmbGFnLCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgU2V0Q0NSRmxhZyhaZmxhZywgdHJ1ZSk7XHJcbiAgICAqL31cclxuICB9LFxyXG4gIDB4YzQ6IHtcclxuICAgIG5hbWU6IFwiR0VORVJBVEVfQVNZTU1FVFJJQ19IQVNIXCIsXHJcbiAgICBwcm9jOiBmdW5jdGlvbigpIHsgLypcclxuICAgICAgY29uc3QgdmFyICppdjtcclxuICAgICAgdmFyIHBsYWluX2xlbjtcclxuICAgICAgdmFyIGRpZ2VzdE91dEFkZHI7XHJcbiAgICAgIGNvbnN0IHZhciAqcGxhaW47XHJcbiAgICAgIE1FTEtleSogYWhhc2hLZXk7XHJcbiAgICAgIGludCBkdHZhbDtcclxuICAgICAgc3RkOjphdXRvX3B0cjxTaW1wbGVNRUxLZXlXcmFwcGVyPiBzbWt3O1xyXG4gICAgICB2YXIgaGNsID0gMTY7XHJcblxyXG4gICAgICBzd2l0Y2ggKGFyZzEpXHJcbiAgICAgIHtcclxuICAgICAgICBjYXNlIDA6XHJcbiAgICAgICAgICBpdiA9IDA7XHJcbiAgICAgICAgICBwbGFpbl9sZW4gPSBnZXRXb3JkKGR5bmFtaWNUb3AtNik7XHJcbiAgICAgICAgICBkaWdlc3RPdXRBZGRyID0gZ2V0V29yZChkeW5hbWljVG9wLTQpO1xyXG4gICAgICAgICAgcGxhaW4gPSBkdW1wKGdldFdvcmQoZHluYW1pY1RvcC0yKSwgcGxhaW5fbGVuKTtcclxuICAgICAgICAgIGFoYXNoS2V5ID0gZ2V0QUhhc2hLZXkoKTtcclxuICAgICAgICAgIGR0dmFsID0gLTY7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgaXYgPSBkdW1wKGdldFdvcmQoZHluYW1pY1RvcC04KSwgMTYpO1xyXG4gICAgICAgICAgcGxhaW5fbGVuID0gZ2V0V29yZChkeW5hbWljVG9wLTYpO1xyXG4gICAgICAgICAgZGlnZXN0T3V0QWRkciA9IGdldFdvcmQoZHluYW1pY1RvcC00KTtcclxuICAgICAgICAgIHBsYWluID0gZHVtcChnZXRXb3JkKGR5bmFtaWNUb3AtMiksIHBsYWluX2xlbik7XHJcbiAgICAgICAgICBhaGFzaEtleSA9IGdldEFIYXNoS2V5KCk7XHJcbiAgICAgICAgICBkdHZhbCA9IC02O1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgIGl2ID0gMDtcclxuICAgICAgICAgIHBsYWluX2xlbiA9IGdldFdvcmQoZHluYW1pY1RvcC0xMCk7XHJcbiAgICAgICAgICBkaWdlc3RPdXRBZGRyID0gZ2V0V29yZChkeW5hbWljVG9wLTgpO1xyXG4gICAgICAgICAgcGxhaW4gPSBkdW1wKGdldFdvcmQoZHluYW1pY1RvcC02KSwgcGxhaW5fbGVuKTtcclxuICAgICAgICAgIHZhciBtb2R1bHVzX2xlbiA9IGdldFdvcmQoZHluYW1pY1RvcC00KTtcclxuICAgICAgICAgIHZhciBtb2R1bHVzID0gZHVtcChnZXRXb3JkKGR5bmFtaWNUb3AtMiksIG1vZHVsdXNfbGVuKTtcclxuICAgICAgICAgIHNta3cgPSBzdGQ6OmF1dG9fcHRyPFNpbXBsZU1FTEtleVdyYXBwZXI+KG5ldyBTaW1wbGVNRUxLZXlXcmFwcGVyKG1vZHVsdXNfbGVuLCBtb2R1bHVzKSk7XHJcbiAgICAgICAgICBhaGFzaEtleSA9IHNta3cuZ2V0KCk7XHJcbiAgICAgICAgICBkdHZhbCA9IC0xMDtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICBpdiA9IGR1bXAoZ2V0V29yZChkeW5hbWljVG9wLTEyKSwgMTYpO1xyXG4gICAgICAgICAgcGxhaW5fbGVuID0gZ2V0V29yZChkeW5hbWljVG9wLTEwKTtcclxuICAgICAgICAgIGRpZ2VzdE91dEFkZHIgPSBnZXRXb3JkKGR5bmFtaWNUb3AtOCk7XHJcbiAgICAgICAgICBwbGFpbiA9IGR1bXAoZ2V0V29yZChkeW5hbWljVG9wLTYpLCBwbGFpbl9sZW4pO1xyXG4gICAgICAgICAgdmFyIG1vZHVsdXNfbGVuID0gZ2V0V29yZChkeW5hbWljVG9wLTQpO1xyXG4gICAgICAgICAgY29uc3QgdmFyKiBtb2R1bHVzID0gZHVtcChnZXRXb3JkKGR5bmFtaWNUb3AtMiksIG1vZHVsdXNfbGVuKTtcclxuICAgICAgICAgIHNta3cgPSBzdGQ6OmF1dG9fcHRyPFNpbXBsZU1FTEtleVdyYXBwZXI+KG5ldyBTaW1wbGVNRUxLZXlXcmFwcGVyKG1vZHVsdXNfbGVuLCBtb2R1bHVzKSk7XHJcbiAgICAgICAgICBhaGFzaEtleSA9IHNta3cuZ2V0KCk7XHJcbiAgICAgICAgICBkdHZhbCA9IC0xMjtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlIDQ6XHJcbiAgICAgICAgICBpdiA9IDA7XHJcbiAgICAgICAgICBwbGFpbl9sZW4gPSBnZXRXb3JkKGR5bmFtaWNUb3AtMTIpO1xyXG4gICAgICAgICAgZGlnZXN0T3V0QWRkciA9IGdldFdvcmQoZHluYW1pY1RvcC0xMCk7XHJcbiAgICAgICAgICBwbGFpbiA9IGR1bXAoZ2V0V29yZChkeW5hbWljVG9wLTgpLCBwbGFpbl9sZW4pO1xyXG4gICAgICAgICAgdmFyIG1vZHVsdXNfbGVuID0gZ2V0V29yZChkeW5hbWljVG9wLTYpO1xyXG4gICAgICAgICAgY29uc3QgdmFyKiBtb2R1bHVzID0gZHVtcChnZXRXb3JkKGR5bmFtaWNUb3AtNCksIG1vZHVsdXNfbGVuKTtcclxuICAgICAgICAgIHNta3cgPSBzdGQ6OmF1dG9fcHRyPFNpbXBsZU1FTEtleVdyYXBwZXI+KG5ldyBTaW1wbGVNRUxLZXlXcmFwcGVyKG1vZHVsdXNfbGVuLCBtb2R1bHVzKSk7XHJcbiAgICAgICAgICBhaGFzaEtleSA9IHNta3cuZ2V0KCk7XHJcbiAgICAgICAgICBoY2wgPSBnZXRXb3JkKGR5bmFtaWNUb3AtMik7XHJcbiAgICAgICAgICBkdHZhbCA9IC0xMjtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlIDU6XHJcbiAgICAgICAgICBoY2wgPSBnZXRXb3JkKGR5bmFtaWNUb3AtMik7XHJcbiAgICAgICAgICBpdiA9IGR1bXAoZ2V0V29yZChkeW5hbWljVG9wLTE0KSwgaGNsKTtcclxuICAgICAgICAgIHBsYWluX2xlbiA9IGdldFdvcmQoZHluYW1pY1RvcC0xMik7XHJcbiAgICAgICAgICBkaWdlc3RPdXRBZGRyID0gZ2V0V29yZChkeW5hbWljVG9wLTEwKTtcclxuICAgICAgICAgIHBsYWluID0gZHVtcChnZXRXb3JkKGR5bmFtaWNUb3AtOCksIHBsYWluX2xlbik7XHJcbiAgICAgICAgICB2YXIgbW9kdWx1c19sZW4gPSBnZXRXb3JkKGR5bmFtaWNUb3AtNik7XHJcbiAgICAgICAgICBjb25zdCB2YXIqIG1vZHVsdXMgPSBkdW1wKGdldFdvcmQoZHluYW1pY1RvcC00KSwgbW9kdWx1c19sZW4pO1xyXG4gICAgICAgICAgc21rdyA9IHN0ZDo6YXV0b19wdHI8U2ltcGxlTUVMS2V5V3JhcHBlcj4obmV3IFNpbXBsZU1FTEtleVdyYXBwZXIobW9kdWx1c19sZW4sIG1vZHVsdXMpKTtcclxuICAgICAgICAgIGFoYXNoS2V5ID0gc21rdy5nZXQoKTtcclxuICAgICAgICAgIGR0dmFsID0gLTE0O1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICBBYmVuZChcImJhZCBiMiB2YWx1ZSBmb3IgR2VuZXJhdGVBc3ltbWV0cmljSGFzaCBwcmltaXRpdmVcIik7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG5cclxuICAgICAgc3RkOjp2ZWN0b3I8dmFyPiBoYXNoKGhjbCk7XHJcbiAgICAgIEFIYXNoKGFoYXNoS2V5LCBwbGFpbl9sZW4sIHBsYWluLCAmaGFzaFswXSwgaXYsIGhjbCk7XHJcbiAgICAgIHdyaXRlKGRpZ2VzdE91dEFkZHIsIGhjbCwgJmhhc2hbMF0pO1xyXG4gICAgICBEVChkdHZhbCk7XHJcbiAgICAqL31cclxuICB9XHJcbn07XHJcblxyXG5mdW5jdGlvbiBiaXRNYW5pcHVsYXRlKGJpdG1hcCwgbGl0ZXJhbCwgZGF0YSlcclxue1xyXG4gIHZhciBtb2RpZnkgPSAoKGJpdG1hcCAmICgxPDw3KSkgPT0gKDE8PDcpKTtcclxuICBpZiAoYml0bWFwICYgMHg3YykgLy8gYml0cyA2LTIgc2hvdWxkIGJlIHplcm9cclxuICAgIHRocm93IG5ldyBFcnJvciggXCJVbmRlZmluZWQgYXJndW1lbnRzXCIpO1xyXG5cclxuICBzd2l0Y2ggKGJpdG1hcCAmIDMpXHJcbiAge1xyXG4gICAgY2FzZSAzOlxyXG4gICAgICBkYXRhICY9IGxpdGVyYWw7XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgY2FzZSAyOlxyXG4gICAgICBkYXRhIHw9IGxpdGVyYWw7XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgY2FzZSAxOlxyXG4gICAgICBkYXRhID0gfihkYXRhIF4gbGl0ZXJhbCk7XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgY2FzZSAwOlxyXG4gICAgICBkYXRhIF49IGxpdGVyYWw7XHJcbiAgICAgIGJyZWFrO1xyXG4gIH1cclxuXHJcbiAgLy9TZXRDQ1JGbGFnKFpmbGFnLCBkYXRhPT0wKTtcclxuXHJcbiAgcmV0dXJuIG1vZGlmeTsgLy9UT0RPOiByZXR1cm4gZGF0YVxyXG59XHJcblxyXG52YXIgc2V0VHdvUHJpbWl0aXZlcyA9XHJcbntcclxuICAweDAxOiB7XHJcbiAgICBuYW1lOiBcIkJJVF9NQU5JUFVMQVRFX0JZVEVcIixcclxuICAgIHByb2M6IGZ1bmN0aW9uKCkgeyAvKi8qXHJcbiAgICAgIHZhciBiID0gZ2V0Qnl0ZShkeW5hbWljVG9wLTEpO1xyXG5cclxuICAgICAgaWYgKGJpdE1hbmlwdWxhdGUoYXJnMSwgYXJnMiwgYikpXHJcbiAgICAgICAgc2V0Qnl0ZShkeW5hbWljVG9wLTEsICh2YXIpYik7XHJcbiAgICAqL31cclxuICB9LFxyXG4gIDB4MDI6IHtcclxuICAgIG5hbWU6IFwiU0hJRlRfTEVGVFwiLFxyXG4gICAgcHJvYzogZnVuY3Rpb24oKSB7IC8qXHJcbiAgICAgIC8vIHNhbWUgYXMgU0hJRlRfUklHSFRcclxuICAgICovfVxyXG4gIH0sXHJcbiAgMHgwMzoge1xyXG4gICAgbmFtZTogXCJTSElGVF9SSUdIVFwiLFxyXG4gICAgcHJvYzogZnVuY3Rpb24oKSB7IC8qXHJcbiAgICAgIHZhciBsZW4gPSBhcmcxO1xyXG4gICAgICB2YXIgbnVtU2hpZnRCaXRzID0gYXJnMjtcclxuICAgICAgaWYgKCFsZW4gfHwgIW51bVNoaWZ0Qml0cyB8fCBudW1TaGlmdEJpdHM+PTgqbGVuKVxyXG4gICAgICAgIEFiZW5kKFwidW5kZWZpbmVkIHNoaWZ0IGFyZ3VtZW50c1wiKTtcclxuXHJcbiAgICAgIHZhciAqZGF0YSA9IG5ldyB2YXJbbGVuXTtcclxuICAgICAgcmVhZChkeW5hbWljVG9wLWxlbiwgbGVuLCBkYXRhKTtcclxuXHJcbiAgICAgIGlmIChwcmltID09IFNISUZUX0xFRlQpXHJcbiAgICAgIHtcclxuICAgICAgICBTZXRDQ1JGbGFnKENmbGFnLCBibG9ja0JpdFNldChsZW4sIGRhdGEsIGxlbio4LW51bVNoaWZ0Qml0cykpO1xyXG4gICAgICAgIG10aF9zaGwoZGF0YSwgbGVuLCBudW1TaGlmdEJpdHMpO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2VcclxuICAgICAge1xyXG4gICAgICAgIFNldENDUkZsYWcoQ2ZsYWcsIGJsb2NrQml0U2V0KGxlbiwgZGF0YSwgbnVtU2hpZnRCaXRzLTEpKTtcclxuICAgICAgICBtdGhfc2hyKGRhdGEsIGxlbiwgbnVtU2hpZnRCaXRzKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgd3JpdGUoZHluYW1pY1RvcC1sZW4sIGxlbiwgZGF0YSk7XHJcbiAgICAgIFNldENDUkZsYWcoWmZsYWcsIGJsb2NrSXNaZXJvKGRhdGEsbGVuKSk7XHJcbiAgICAgIGRlbGV0ZSBbXWRhdGE7XHJcbiAgICAqL31cclxuICB9LFxyXG4gIDB4MDQ6IHtcclxuICAgIG5hbWU6IFwiU0VUX1NFTEVDVF9TV1wiLFxyXG4gICAgcHJvYzogZnVuY3Rpb24oKSB7IC8qXHJcbiAgICAgIHNldFNlbGVjdFNXKGFyZzEsIGFyZzIpO1xyXG4gICAgKi99XHJcbiAgfSxcclxuICAweDA1OiB7XHJcbiAgICBuYW1lOiBcIkNBUkRfQkxPQ0tcIixcclxuICAgIHByb2M6IGZ1bmN0aW9uKCkgeyAvKlxyXG4gICAgICBBYmVuZChcInByaW1pdGl2ZSBub3Qgc3VwcG9ydGVkXCIpO1xyXG4gICAgKi99XHJcbiAgfSxcclxuICAweDgwOiB7XHJcbiAgICBuYW1lOiBcIlJFVFVSTl9GUk9NX0NPREVMRVRcIixcclxuICAgIHByb2M6IGZ1bmN0aW9uKCkgeyAvKlxyXG4gICAgICByZXR1cm5Gcm9tQ29kZWxldChhcmcxLCBhcmcyKTtcclxuICAgICovfVxyXG4gIH1cclxufVxyXG5cclxudmFyIHNldFRocmVlUHJpbWl0aXZlcyA9XHJcbntcclxuICAweDAxOiB7XHJcbiAgICBuYW1lOiBcIkJJVF9NQU5JUFVMQVRFX1dPUkRcIixcclxuICAgIHByb2M6IGZ1bmN0aW9uKCkgeyAvKlxyXG4gICAgICB2YXIgdyA9IGdldFdvcmQoZHluYW1pY1RvcC0yKTtcclxuXHJcbiAgICAgIGlmIChiaXRNYW5pcHVsYXRlKGFyZzEsIG1rV29yZChhcmcyLCBhcmczKSwgdykpXHJcbiAgICAgICAgc2V0V29yZChkeW5hbWljVG9wLTIsIHcpO1xyXG4gICAgKi99XHJcbiAgfSxcclxuICAweDgwOiB7XHJcbiAgICBuYW1lOiBcIkNBTExfRVhURU5TSU9OX1BSSU1JVElWRTBcIixcclxuICAgIHByb2M6IGZ1bmN0aW9uKCkgeyAvKlxyXG4gICAgICBBYmVuZChcInByaW1pdGl2ZSBub3Qgc3VwcG9ydGVkXCIpO1xyXG4gICAgKi99XHJcbiAgfSxcclxuICAweDgxOiB7XHJcbiAgICBuYW1lOiBcIkNBTExfRVhURU5TSU9OX1BSSU1JVElWRTFcIixcclxuICAgIHByb2M6IGZ1bmN0aW9uKCkgeyAvKlxyXG4gICAgICBBYmVuZChcInByaW1pdGl2ZSBub3Qgc3VwcG9ydGVkXCIpO1xyXG4gICAgKi99XHJcbiAgfSxcclxuICAweDgyOiB7XHJcbiAgICBuYW1lOiBcIkNBTExfRVhURU5TSU9OX1BSSU1JVElWRTJcIixcclxuICAgIHByb2M6IGZ1bmN0aW9uKCkgeyAvKlxyXG4gICAgICBBYmVuZChcInByaW1pdGl2ZSBub3Qgc3VwcG9ydGVkXCIpO1xyXG4gICAgKi99XHJcbiAgfSxcclxuICAweDgzOiB7XHJcbiAgICBuYW1lOiBcIkNBTExfRVhURU5TSU9OX1BSSU1JVElWRTNcIixcclxuICAgIHByb2M6IGZ1bmN0aW9uKCkgeyAvKlxyXG4gICAgICBBYmVuZChcInByaW1pdGl2ZSBub3Qgc3VwcG9ydGVkXCIpO1xyXG4gICAgKi99XHJcbiAgfSxcclxuICAweDg0OiB7XHJcbiAgICBuYW1lOiBcIkNBTExfRVhURU5TSU9OX1BSSU1JVElWRTRcIixcclxuICAgIHByb2M6IGZ1bmN0aW9uKCkgeyAvKlxyXG4gICAgICBBYmVuZChcInByaW1pdGl2ZSBub3Qgc3VwcG9ydGVkXCIpO1xyXG4gICAgKi99XHJcbiAgfSxcclxuICAweDg1OiB7XHJcbiAgICBuYW1lOiBcIkNBTExfRVhURU5TSU9OX1BSSU1JVElWRTVcIixcclxuICAgIHByb2M6IGZ1bmN0aW9uKCkgeyAvKlxyXG4gICAgICBBYmVuZChcInByaW1pdGl2ZSBub3Qgc3VwcG9ydGVkXCIpO1xyXG4gICAgKi99XHJcbiAgfSxcclxuICAweDg2OiB7XHJcbiAgICBuYW1lOiBcIkNBTExfRVhURU5TSU9OX1BSSU1JVElWRTZcIixcclxuICAgIHByb2M6IGZ1bmN0aW9uKCkgeyAvKlxyXG4gICAgICBBYmVuZChcInByaW1pdGl2ZSBub3Qgc3VwcG9ydGVkXCIpO1xyXG4gICAgKi99XHJcbiAgfVxyXG59O1xyXG5cclxudmFyIHByaW1pdGl2ZVNldHMgPSBbXHJcbiAgc2V0WmVyb1ByaW1pdGl2ZXMsXHJcbiAgc2V0T25lUHJpbWl0aXZlcyxcclxuICBzZXRUd29QcmltaXRpdmVzLFxyXG4gIHNldFRocmVlUHJpbWl0aXZlc1xyXG5dO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNhbGxQcmltaXRpdmUoIGN0eCwgcHJpbSwgc2V0LCBhcmcxLCBhcmcyLCBhcmczIClcclxue1xyXG4gIHZhciBwcmltSW5mbyA9IHByaW1pdGl2ZVNldHNbIHNldCBdWyBwcmltIF07XHJcblxyXG4gIGlmICggcHJpbUluZm8gKVxyXG4gIHtcclxuICAgIHN3aXRjaCggc2V0IClcclxuICAgIHtcclxuICAgICAgY2FzZSAwOiBwcmltSW5mby5wcm9jKCk7IGJyZWFrO1xyXG4gICAgICBjYXNlIDE6IHByaW1JbmZvLnByb2MoIGFyZzEgKTsgYnJlYWs7XHJcbiAgICAgIGNhc2UgMjogcHJpbUluZm8ucHJvYyggYXJnMSwgYXJnMiApOyBicmVhaztcclxuICAgICAgY2FzZSAzOiBwcmltSW5mby5wcm9jKCBhcmcxLCBhcmcyLCBhcmczICk7IGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuICBlbHNlXHJcbiAge1xyXG4gICAgLy8gbm8gcHJpbVxyXG4gICAgdGhyb3cgbmV3IEVycm9yKCBcIlByaW1pdGl2ZSBub3QgSW1wbGVtZW50ZWRcIiApO1xyXG4gIH1cclxufVxyXG4iLCJleHBvcnQgY2xhc3MgU2VjdXJpdHlNYW5hZ2VyXHJcbntcclxuICBpbml0U2VjdXJpdHkoKVxyXG4gIHtcclxuICB9XHJcblxyXG4gIHByb2Nlc3NBUERVKCBhcGR1IClcclxuICB7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCB7IEJ5dGVBcnJheSxLaW5kLEtpbmRJbmZvIH0gZnJvbSAnY3J5cHRvZ3JhcGhpeC1zaW0tY29yZSc7XG5cbmV4cG9ydCBjbGFzcyBBRENcbntcbn1cbiIsImltcG9ydCB7IEJ5dGVBcnJheSxLaW5kLEtpbmRJbmZvIH0gZnJvbSAnY3J5cHRvZ3JhcGhpeC1zaW0tY29yZSc7XG5cbmV4cG9ydCBjbGFzcyBBTENcbntcbn1cbiIsImltcG9ydCB7IEJ5dGVBcnJheSwgS2luZCwgS2luZENvbnN0cnVjdG9yLCBLaW5kQnVpbGRlciB9IGZyb20gJ2NyeXB0b2dyYXBoaXgtc2ltLWNvcmUnO1xyXG5cclxuLyoqXHJcbiAqIEVuY29kZXIvRGVjb2RvciBmb3IgYSBNVUxUT1MgQXBwbGljYXRpb24gTG9hZCBVbml0XHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQUxVIGltcGxlbWVudHMgS2luZFxyXG57XHJcbiAgY29kZTogQnl0ZUFycmF5O1xyXG4gIGRhdGE6IEJ5dGVBcnJheTs7XHJcbiAgZmNpOiBCeXRlQXJyYXk7O1xyXG4gIGRpcjogQnl0ZUFycmF5OztcclxuXHJcbiAgLyoqXHJcbiAgICogQGNvbnN0cnVjdG9yXHJcbiAgICpcclxuICAgKiBEZXNlcmlhbGl6ZSBmcm9tIGEgSlNPTiBvYmplY3RcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggYXR0cmlidXRlcz86IHt9IClcclxuICB7XHJcbiAgICBLaW5kLmluaXRGaWVsZHMoIHRoaXMsIGF0dHJpYnV0ZXMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlcmlhbGl6YXRpb24sIHJldHVybnMgYSBKU09OIG9iamVjdFxyXG4gICAqL1xyXG4gIHB1YmxpYyB0b0pTT04oKToge31cclxuICB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBjb2RlOiB0aGlzLmNvZGUsXHJcbiAgICAgIGRhdGE6IHRoaXMuZGF0YSxcclxuICAgICAgZmNpOiB0aGlzLmZjaSxcclxuICAgICAgZGlyOiB0aGlzLmRpclxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0QUxVU2VnbWVudCggYnl0ZXM6IEJ5dGVBcnJheSwgc2VnbWVudElEOiBudW1iZXIgKVxyXG4gIHtcclxuICAgIHZhciBvZmZzZXQgPSA4O1xyXG5cclxuICAgIHdoaWxlKCAoIHNlZ21lbnRJRCA+IDEgKSAmJiAoIG9mZnNldCA8IGJ5dGVzLmxlbmd0aCApIClcclxuICAgIHtcclxuICAgICAgb2Zmc2V0ICs9IDIgKyBieXRlcy53b3JkQXQoIG9mZnNldCApO1xyXG4gICAgICAtLXNlZ21lbnRJRDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gYnl0ZXMudmlld0F0KCBvZmZzZXQgKyAyLCBieXRlcy53b3JkQXQoIG9mZnNldCApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEZWNvZGVyIGZhY3RvcnkgZnVuY3Rpb24sIGRlY29kZXMgYSBibG9iIGludG8gYSBNdWx0b3NBTFUgb2JqZWN0XHJcbiAgICovXHJcbiAgcHVibGljIGRlY29kZUJ5dGVzKCBieXRlczogQnl0ZUFycmF5LCBvcHRpb25zPzogT2JqZWN0ICk6IHRoaXNcclxuICB7XHJcbiAgICB0aGlzLmNvZGUgPSB0aGlzLmdldEFMVVNlZ21lbnQoIGJ5dGVzLCAxICk7XHJcbiAgICB0aGlzLmRhdGEgPSB0aGlzLmdldEFMVVNlZ21lbnQoIGJ5dGVzLCAyICk7XHJcbiAgICB0aGlzLmRpciA9IHRoaXMuZ2V0QUxVU2VnbWVudCggYnl0ZXMsIDMgKTtcclxuICAgIHRoaXMuZmNpID0gdGhpcy5nZXRBTFVTZWdtZW50KCBieXRlcywgNCApO1xyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRW5jb2RlciBmdW5jdGlvbiwgcmV0dXJucyBhIGJsb2IgZnJvbSBhIE11bHRvc0FMVSBvYmplY3RcclxuICAgKi9cclxuICBwdWJsaWMgZW5jb2RlQnl0ZXMoIG9wdGlvbnM/OiB7fSApOiBCeXRlQXJyYXlcclxuICB7XHJcbiAgICAvL0AgVE9ETzogcmVidWlsZCBiaW5hcnkgQUxVXHJcbiAgICByZXR1cm4gbmV3IEJ5dGVBcnJheSggW10gKTtcclxuICB9XHJcbn1cclxuXHJcbktpbmRCdWlsZGVyLmluaXQoIEFMVSwgXCJNVUxUT1MgQXBwbGljYXRpb24gTG9hZCBVbml0XCIgKVxyXG4gIC5maWVsZCggXCJjb2RlXCIsIFwiQ29kZSBTZWdtZW50XCIsIEJ5dGVBcnJheSApXHJcbiAgLmZpZWxkKCBcImRhdGFcIiwgXCJEYXRhIFNlZ21lbnRcIiwgQnl0ZUFycmF5IClcclxuICAuZmllbGQoIFwiZmNpXCIsIFwiRkNJIFNlZ21lbnRcIiwgQnl0ZUFycmF5IClcclxuICAuZmllbGQoIFwiZGlyXCIsIFwiRElSIFNlZ21lbnRcIiwgQnl0ZUFycmF5IClcclxuICA7XHJcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
