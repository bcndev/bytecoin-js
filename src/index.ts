import {keccak256} from "js-sha3";

const tag1 = [6]; // legacy, 2*
const tag2 = [0xce, 0xf6, 0x22]; // amethyst, bcnZ*

const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const full_block_size = 8;
const full_encoded_block_size = 11;
const decoded_block_sizes = [0, -1, 1, 2, -1, 3, 4, 5, -1, 6, 7, 8];
const java_hi_parts = [0, 0, 0, 0, 0, 0, 8, 514, 29817, 1729386, 100304420];
const java_lo_parts = [1, 58, 3364, 195112, 11316496, 656356768, 3708954176, 370977408, 41853184, 2427484672, 3355157504];

function uint_be_to_bytes(buf: Uint8Array, pos: number, si: number, val: number) {
  for (let i = si; i-- > 0;) {
    buf[pos + i] = val & 0xFF;
    val >>= 8;
  }
}

function decode_block(enc: string, enc_pos: number, size: number, dec: Uint8Array, dec_pos: number): boolean {
  if (size < 1 || size > full_encoded_block_size)
    return false;

  const res_size = decoded_block_sizes[size];
  if (res_size <= 0)
    return false;  // Invalid block size

  let java_hi_part = 0;
  let java_lo_part = 0;
  let java_pos = 0;
  for (let i = size; i-- > 0; java_pos += 1) {
    const digit = alphabet.indexOf(enc[enc_pos + i]);
    if (digit < 0)
      return false;  // Invalid symbol
    java_hi_part += java_hi_parts[java_pos] * digit;
    java_lo_part += java_lo_parts[java_pos] * digit;
  }
  java_hi_part += Math.floor(java_lo_part / 0x100000000);
  java_lo_part %= 0x100000000;  // Not strictly necessary
  if (java_hi_part >= 0x100000000)
    return false;
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
}

function decode(enc: string): Uint8Array | false {
  const full_block_count = Math.floor(enc.length / full_encoded_block_size);
  const last_block_size = enc.length % full_encoded_block_size;
  const last_block_decoded_size = decoded_block_sizes[last_block_size];
  if (last_block_decoded_size < 0)
    return false;  // Invalid enc length
  const data_size = full_block_count * full_block_size + last_block_decoded_size;

  const data = new Uint8Array(data_size);
  for (let i = 0; i < full_block_count; ++i) {
    if (!decode_block(enc, i * full_encoded_block_size, full_encoded_block_size, data, i * full_block_size))
      return false;
  }

  if (last_block_size > 0) {
    if (!decode_block(enc, full_block_count * full_encoded_block_size, last_block_size,
      data, full_block_count * full_block_size))
      return false;
  }
  return data;
}

function to_hex(buf: number[] | Uint8Array) {
  return Array.from(buf).map((byte) => ('0' + (byte & 0xFF).toString(16)).slice(-2)).join('');
}

function decode_addr(addr: string) {
  let addr_data = decode(addr);
  const addr_checksum_size = 4;
  if (!addr_data)
    return false;
  if (addr_data.length <= addr_checksum_size)
    return false;

  const checksum = addr_data.slice(addr_data.length - addr_checksum_size, addr_data.length);
  addr_data = addr_data.slice(0, addr_data.length - addr_checksum_size);

  let hash = keccak256.digest(addr_data);
  hash = hash.slice(0, addr_checksum_size);
  if (to_hex(hash) !== to_hex(checksum))
    return false;
  return addr_data;
}

export function checkAddress(addr: string): boolean {
  if (!addressPattern.test(addr))
    return false;

  const addr_data = decode_addr(addr);
  const body_size = 64;
  if (!addr_data || addr_data.length < body_size)
    return false;

  const tag = addr_data.slice(0, addr_data.length - body_size);
  return to_hex(tag) === to_hex(tag1) || to_hex(tag) === to_hex(tag2);
}

export const addressPattern = /^(2|bcnZ)[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{94}$/;
