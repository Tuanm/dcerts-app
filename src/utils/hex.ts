// I just copied these shit from `https://stackoverflow.com/a/57391629/11085089`
// So please don't ask me any questions kinda 'What the fuck is it?'

// This is the same for all of the below, and
// you probably won't need it except for debugging
// in most cases.
export function bytesToHex(bytes: Uint8Array) {
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(
        '',
    );
}

// You almost certainly want UTF-8, which is
// now natively supported:
export function textToUTF8Bytes(text: string) {
    return new TextEncoder().encode(text);
}

// But you might want UTF-16 for some reason.
// .charCodeAt(index) will return the underlying
// UTF-16 code-units (not code-points!), so you
// just need to format them in whichever endian order you want.
export function textToUTF16Bytes(text: string, littleEndian: boolean) {
    const bytes = new Uint8Array(text.length * 2);
    // Using DataView is the only way to get a specific
    // endianness.
    const view = new DataView(bytes.buffer);
    for (let i = 0; i !== text.length; i++) {
        view.setUint16(i, text.charCodeAt(i), littleEndian);
    }
    return bytes;
}

// And you might want UTF-32 in even weirder cases.
// Fortunately, iterating a text gives the code
// points, which are identical to the UTF-32 encoding,
// though you still have the endianess issue.
export function textToUTF32Bytes(text: string, littleEndian: boolean) {
    const codepoints = Array.from(text, (c) => c.codePointAt(0));
    const bytes = new Uint8Array(codepoints.length * 4);
    // Using DataView is the only way to get a specific
    // endianness.
    const view = new DataView(bytes.buffer);
    for (let i = 0; i !== codepoints.length; i++) {
        view.setUint32(i, codepoints[i] || 0, littleEndian);
    }
    return bytes;
}

// For decoding, it's generally a lot simpler
export function hexToBytes(hex: string) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i !== bytes.length; i++) {
        bytes[i] = parseInt(hex.substring(i * 2, 2), 16);
    }
    return bytes;
}

export function textToHex(text: string) {
    return bytesToHex(textToUTF8Bytes(text));
}

export function hexToInt(hex: string) {
    return parseInt(hex, 16);
}

export function intToHex(number: number) {
    return number.toString(16);
}