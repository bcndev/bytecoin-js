
bcn_check_address = function(){
	// We use keccak sponge from https://github.com/emn178/js-sha3/blob/master/src/sha3.js
	// without modifications. (linked code is under MIT license)
	var alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

	var full_block_size = 8;
	var full_encoded_block_size = 11;
	var encoded_block_sizes = [0, 2, 3, 5, 6, 7, 9, 10, 11];
	var decoded_block_sizes = [0, -1, 1, 2, -1, 3, 4, 5, -1, 6, 7, 8];
	var java_hi_parts = [0, 0, 0, 0, 0, 0, 8, 514, 29817, 1729386, 100304420];
	var java_lo_parts = [1, 58, 3364, 195112, 11316496, 656356768, 3708954176, 370977408, 41853184, 2427484672, 3355157504];

	function uint_be_to_bytes(buf, pos, si, val) {
		for (var i = si; i-- > 0;) {
			buf[pos + i] = val & 0xFF;
			val >>= 8;
		}
	};

	function decode_block(enc, enc_pos, size, dec, dec_pos) {
		if (size < 1 || size > full_encoded_block_size)
			return false;

		var res_size = decoded_block_sizes[size];
		if (res_size <= 0)
			return false;  // Invalid block size

		var java_hi_part = 0;
		var java_lo_part = 0;
		var java_pos      = 0;
		for (var i = size; i-- > 0; java_pos += 1) {
			var digit = alphabet.indexOf(enc[enc_pos + i]);
			if (digit < 0)
				return false;  // Invalid symbol
			java_hi_part += java_hi_parts[java_pos] * digit;
			java_lo_part += java_lo_parts[java_pos] * digit;
		}
		java_hi_part += Math.floor(java_lo_part / 0x100000000);
		java_lo_part %= 0x100000000;  // Not strictly necessary
		if (java_hi_part >= 0x100000000)
			return false;
// 	 	console.log("java_hi_part=" + java_hi_part);
// 		console.log("java_lo_part=" + java_lo_part);
		if (res_size > 4) {
			if (res_size < full_block_size && java_hi_part >= (1 << (8 * (res_size - 4))))
				return false;  // Overflow
			uint_be_to_bytes(dec, dec_pos, res_size - 4, java_hi_part);
			uint_be_to_bytes(dec, dec_pos + res_size - 4, 4, java_lo_part);
		} else {
			if (res_size < full_block_size && java_lo_part >= (1 << (8 * res_size)))
				return false;  // Overflow
			uint_be_to_bytes(dec, dec_pos, res_size, java_lo_part);
		}
		return true;
	};

	function decode(enc) {
		var full_block_count     = Math.floor(enc.length / full_encoded_block_size);
		var last_block_size      = enc.length % full_encoded_block_size;
		var last_block_decoded_size = decoded_block_sizes[last_block_size];
		if (last_block_decoded_size < 0)
			return false;  // Invalid enc length
		var data_size = full_block_count * full_block_size + last_block_decoded_size;

		var data = new Uint8Array(data_size);
		for (var i = 0; i < full_block_count; ++i) {
			if (!decode_block(enc, i * full_encoded_block_size, full_encoded_block_size, data, i * full_block_size))
				return false;
		}

		if (last_block_size > 0) {
			if (!decode_block(enc, full_block_count * full_encoded_block_size, last_block_size,
				data, full_block_count * full_block_size))
				return false;
		}
		return data;
	};

	var RC = [1, 0, 32898, 0, 32906, 2147483648, 2147516416, 2147483648, 32907, 0, 2147483649,
	    0, 2147516545, 2147483648, 32777, 2147483648, 138, 0, 136, 0, 2147516425, 0,
	    2147483658, 0, 2147516555, 0, 139, 2147483648, 32905, 2147483648, 32771,
	    2147483648, 32770, 2147483648, 128, 2147483648, 32778, 0, 2147483658, 2147483648,
	2147516545, 2147483648, 32896, 2147483648, 2147483649, 0, 2147516424, 2147483648];

	function KeccakF1600_StatePermute(s) {
	    var h, l, n, c0, c1, c2, c3, c4, c5, c6, c7, c8, c9,
	      b0, b1, b2, b3, b4, b5, b6, b7, b8, b9, b10, b11, b12, b13, b14, b15, b16, b17,
	      b18, b19, b20, b21, b22, b23, b24, b25, b26, b27, b28, b29, b30, b31, b32, b33,
	      b34, b35, b36, b37, b38, b39, b40, b41, b42, b43, b44, b45, b46, b47, b48, b49;
	    for (n = 0; n < 48; n += 2) {
	      c0 = s[0] ^ s[10] ^ s[20] ^ s[30] ^ s[40];
	      c1 = s[1] ^ s[11] ^ s[21] ^ s[31] ^ s[41];
	      c2 = s[2] ^ s[12] ^ s[22] ^ s[32] ^ s[42];
	      c3 = s[3] ^ s[13] ^ s[23] ^ s[33] ^ s[43];
	      c4 = s[4] ^ s[14] ^ s[24] ^ s[34] ^ s[44];
	      c5 = s[5] ^ s[15] ^ s[25] ^ s[35] ^ s[45];
	      c6 = s[6] ^ s[16] ^ s[26] ^ s[36] ^ s[46];
	      c7 = s[7] ^ s[17] ^ s[27] ^ s[37] ^ s[47];
	      c8 = s[8] ^ s[18] ^ s[28] ^ s[38] ^ s[48];
	      c9 = s[9] ^ s[19] ^ s[29] ^ s[39] ^ s[49];

	      h = c8 ^ ((c2 << 1) | (c3 >>> 31));
	      l = c9 ^ ((c3 << 1) | (c2 >>> 31));
	      s[0] ^= h;
	      s[1] ^= l;
	      s[10] ^= h;
	      s[11] ^= l;
	      s[20] ^= h;
	      s[21] ^= l;
	      s[30] ^= h;
	      s[31] ^= l;
	      s[40] ^= h;
	      s[41] ^= l;
	      h = c0 ^ ((c4 << 1) | (c5 >>> 31));
	      l = c1 ^ ((c5 << 1) | (c4 >>> 31));
	      s[2] ^= h;
	      s[3] ^= l;
	      s[12] ^= h;
	      s[13] ^= l;
	      s[22] ^= h;
	      s[23] ^= l;
	      s[32] ^= h;
	      s[33] ^= l;
	      s[42] ^= h;
	      s[43] ^= l;
	      h = c2 ^ ((c6 << 1) | (c7 >>> 31));
	      l = c3 ^ ((c7 << 1) | (c6 >>> 31));
	      s[4] ^= h;
	      s[5] ^= l;
	      s[14] ^= h;
	      s[15] ^= l;
	      s[24] ^= h;
	      s[25] ^= l;
	      s[34] ^= h;
	      s[35] ^= l;
	      s[44] ^= h;
	      s[45] ^= l;
	      h = c4 ^ ((c8 << 1) | (c9 >>> 31));
	      l = c5 ^ ((c9 << 1) | (c8 >>> 31));
	      s[6] ^= h;
	      s[7] ^= l;
	      s[16] ^= h;
	      s[17] ^= l;
	      s[26] ^= h;
	      s[27] ^= l;
	      s[36] ^= h;
	      s[37] ^= l;
	      s[46] ^= h;
	      s[47] ^= l;
	      h = c6 ^ ((c0 << 1) | (c1 >>> 31));
	      l = c7 ^ ((c1 << 1) | (c0 >>> 31));
	      s[8] ^= h;
	      s[9] ^= l;
	      s[18] ^= h;
	      s[19] ^= l;
	      s[28] ^= h;
	      s[29] ^= l;
	      s[38] ^= h;
	      s[39] ^= l;
	      s[48] ^= h;
	      s[49] ^= l;

	      b0 = s[0];
	      b1 = s[1];
	      b32 = (s[11] << 4) | (s[10] >>> 28);
	      b33 = (s[10] << 4) | (s[11] >>> 28);
	      b14 = (s[20] << 3) | (s[21] >>> 29);
	      b15 = (s[21] << 3) | (s[20] >>> 29);
	      b46 = (s[31] << 9) | (s[30] >>> 23);
	      b47 = (s[30] << 9) | (s[31] >>> 23);
	      b28 = (s[40] << 18) | (s[41] >>> 14);
	      b29 = (s[41] << 18) | (s[40] >>> 14);
	      b20 = (s[2] << 1) | (s[3] >>> 31);
	      b21 = (s[3] << 1) | (s[2] >>> 31);
	      b2 = (s[13] << 12) | (s[12] >>> 20);
	      b3 = (s[12] << 12) | (s[13] >>> 20);
	      b34 = (s[22] << 10) | (s[23] >>> 22);
	      b35 = (s[23] << 10) | (s[22] >>> 22);
	      b16 = (s[33] << 13) | (s[32] >>> 19);
	      b17 = (s[32] << 13) | (s[33] >>> 19);
	      b48 = (s[42] << 2) | (s[43] >>> 30);
	      b49 = (s[43] << 2) | (s[42] >>> 30);
	      b40 = (s[5] << 30) | (s[4] >>> 2);
	      b41 = (s[4] << 30) | (s[5] >>> 2);
	      b22 = (s[14] << 6) | (s[15] >>> 26);
	      b23 = (s[15] << 6) | (s[14] >>> 26);
	      b4 = (s[25] << 11) | (s[24] >>> 21);
	      b5 = (s[24] << 11) | (s[25] >>> 21);
	      b36 = (s[34] << 15) | (s[35] >>> 17);
	      b37 = (s[35] << 15) | (s[34] >>> 17);
	      b18 = (s[45] << 29) | (s[44] >>> 3);
	      b19 = (s[44] << 29) | (s[45] >>> 3);
	      b10 = (s[6] << 28) | (s[7] >>> 4);
	      b11 = (s[7] << 28) | (s[6] >>> 4);
	      b42 = (s[17] << 23) | (s[16] >>> 9);
	      b43 = (s[16] << 23) | (s[17] >>> 9);
	      b24 = (s[26] << 25) | (s[27] >>> 7);
	      b25 = (s[27] << 25) | (s[26] >>> 7);
	      b6 = (s[36] << 21) | (s[37] >>> 11);
	      b7 = (s[37] << 21) | (s[36] >>> 11);
	      b38 = (s[47] << 24) | (s[46] >>> 8);
	      b39 = (s[46] << 24) | (s[47] >>> 8);
	      b30 = (s[8] << 27) | (s[9] >>> 5);
	      b31 = (s[9] << 27) | (s[8] >>> 5);
	      b12 = (s[18] << 20) | (s[19] >>> 12);
	      b13 = (s[19] << 20) | (s[18] >>> 12);
	      b44 = (s[29] << 7) | (s[28] >>> 25);
	      b45 = (s[28] << 7) | (s[29] >>> 25);
	      b26 = (s[38] << 8) | (s[39] >>> 24);
	      b27 = (s[39] << 8) | (s[38] >>> 24);
	      b8 = (s[48] << 14) | (s[49] >>> 18);
	      b9 = (s[49] << 14) | (s[48] >>> 18);

	      s[0] = b0 ^ (~b2 & b4);
	      s[1] = b1 ^ (~b3 & b5);
	      s[10] = b10 ^ (~b12 & b14);
	      s[11] = b11 ^ (~b13 & b15);
	      s[20] = b20 ^ (~b22 & b24);
	      s[21] = b21 ^ (~b23 & b25);
	      s[30] = b30 ^ (~b32 & b34);
	      s[31] = b31 ^ (~b33 & b35);
	      s[40] = b40 ^ (~b42 & b44);
	      s[41] = b41 ^ (~b43 & b45);
	      s[2] = b2 ^ (~b4 & b6);
	      s[3] = b3 ^ (~b5 & b7);
	      s[12] = b12 ^ (~b14 & b16);
	      s[13] = b13 ^ (~b15 & b17);
	      s[22] = b22 ^ (~b24 & b26);
	      s[23] = b23 ^ (~b25 & b27);
	      s[32] = b32 ^ (~b34 & b36);
	      s[33] = b33 ^ (~b35 & b37);
	      s[42] = b42 ^ (~b44 & b46);
	      s[43] = b43 ^ (~b45 & b47);
	      s[4] = b4 ^ (~b6 & b8);
	      s[5] = b5 ^ (~b7 & b9);
	      s[14] = b14 ^ (~b16 & b18);
	      s[15] = b15 ^ (~b17 & b19);
	      s[24] = b24 ^ (~b26 & b28);
	      s[25] = b25 ^ (~b27 & b29);
	      s[34] = b34 ^ (~b36 & b38);
	      s[35] = b35 ^ (~b37 & b39);
	      s[44] = b44 ^ (~b46 & b48);
	      s[45] = b45 ^ (~b47 & b49);
	      s[6] = b6 ^ (~b8 & b0);
	      s[7] = b7 ^ (~b9 & b1);
	      s[16] = b16 ^ (~b18 & b10);
	      s[17] = b17 ^ (~b19 & b11);
	      s[26] = b26 ^ (~b28 & b20);
	      s[27] = b27 ^ (~b29 & b21);
	      s[36] = b36 ^ (~b38 & b30);
	      s[37] = b37 ^ (~b39 & b31);
	      s[46] = b46 ^ (~b48 & b40);
	      s[47] = b47 ^ (~b49 & b41);
	      s[8] = b8 ^ (~b0 & b2);
	      s[9] = b9 ^ (~b1 & b3);
	      s[18] = b18 ^ (~b10 & b12);
	      s[19] = b19 ^ (~b11 & b13);
	      s[28] = b28 ^ (~b20 & b22);
	      s[29] = b29 ^ (~b21 & b23);
	      s[38] = b38 ^ (~b30 & b32);
	      s[39] = b39 ^ (~b31 & b33);
	      s[48] = b48 ^ (~b40 & b42);
	      s[49] = b49 ^ (~b41 & b43);

	      s[0] ^= RC[n];
	      s[1] ^= RC[n + 1];
	    }
	};

	function xorbyte(st, pos, byte) {
		var slot = Math.floor(pos/4);
		st[slot] ^= byte << (pos % 4) * 8;
	};

	function readbyte(st, pos) {
		var slot = Math.floor(pos/4);
		return (st[slot] >> (pos % 4) * 8) & 0xFF;
	};

	var hexTable = [];
	for (var i = 0; i < 256; i++)
		hexTable[i] = (i <= 15 ? '0' : '') + i.toString(16);

	function toHexString(byteArray) {
		var hexString = '';

		for (var i = 0; i < byteArray.length; i++)
			hexString += hexTable[byteArray[i] & 0xff];

		return hexString;
	};

	function keccak(inn, mdlen) {
		var st = new Uint32Array(50);
		var temp = new Uint8Array(144);
		var rsiz = (200 == mdlen) ? 136 : 200 - 2 * mdlen;
		var inpos = 0;
		var inlen = inn.length;

		for (; inlen >= rsiz; inlen -= rsiz, inpos += rsiz) {
			for (var i = 0; i < rsiz; i++)
				xorbyte(st, i, inn[inpos + i]);
			KeccakF1600_StatePermute(st);
		}

		// last block and padding
		for(var i = 0; i < inlen; i += 1)
			temp[i] = inn[inpos + i];
		temp[inlen++] = 1;
		for(var i = 0; i < rsiz - inlen; i += 1)
			temp[inlen + i] = 0;
		temp[rsiz - 1] |= 0x80;

		for (var i = 0; i < rsiz; i++)
			xorbyte(st, i, temp[i]);

		KeccakF1600_StatePermute(st);

		var md = new Uint8Array(mdlen);
		for (var i = 0; i < mdlen; i++)
			md[i] = readbyte(st, i);

		return md;
	};
	function decode_addr(addr) {
		var addr_data = decode(addr);
		var addr_checksum_size = 4;
		if (!addr_data)
			return false;
		if (addr_data.length <= addr_checksum_size)
			return false;

		var checksum = addr_data.slice(addr_data.length - addr_checksum_size, addr_data.length);
		addr_data = addr_data.slice(0, addr_data.length - addr_checksum_size)

		var hash = keccak(addr_data, 200);
		hash = hash.slice(0, addr_checksum_size);
		if (toHexString(hash) != toHexString(checksum))
			return false;
		return addr_data;
	};
	var tag1 = [6]; // legacy, 2*
	var tag2 = [0xce, 0xf6, 0x22]; // amethyst, bcnZ*
	return function(addr){
		var addr_data = decode_addr(addr);
		var body_size = 64;
		if (!addr_data || addr_data.length < body_size)
			return false;
		var addr_body = addr_data.slice(addr_data.length - body_size, addr_data.length);
		var tag = addr_data.slice(0, addr_data.length - body_size);
		if (toHexString(tag) == toHexString(tag1) || toHexString(tag) == toHexString(tag2))
			return true;
		return false;
	};
}();
