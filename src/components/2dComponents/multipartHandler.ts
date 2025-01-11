export interface MultipartPart {
  headers: string;
  body: Uint8Array;
}

export function parseMultipartMixed(
  buffer: ArrayBuffer,
  boundary: string
): MultipartPart[] {
  const boundaryMarker = new TextEncoder().encode(`--${boundary}`);
  const delimiter = new TextEncoder().encode(`\r\n\r\n`);
  const decoder = new TextDecoder("utf-8");

  const uint8 = new Uint8Array(buffer);
  const parts: MultipartPart[] = [];

  let start = 0;

  while (true) {
    // Find the next boundary marker
    const boundaryIndex = indexOf(uint8, boundaryMarker, start);
    if (boundaryIndex === -1) break;

    // Move start to after the boundary and skip following CRLF
    let partStart = boundaryIndex + boundaryMarker.length;
    if (uint8[partStart] === 13 && uint8[partStart + 1] === 10) {
      partStart += 2; // skip CRLF after boundary
    }

    // Find the next boundary to determine the end of this part
    const nextBoundaryIndex = indexOf(uint8, boundaryMarker, partStart);
    let partEnd = nextBoundaryIndex !== -1 ? nextBoundaryIndex : uint8.length;

    // Extract part slice
    const part = uint8.slice(partStart, partEnd);

    // Find header/body delimiter within this part
    const headerEndIndex = indexOf(part, delimiter, 0);
    let headers = "";
    let body = part;
    if (headerEndIndex !== -1) {
      headers = decoder.decode(part.slice(0, headerEndIndex));
      body = part.slice(headerEndIndex + delimiter.length);
    }

    parts.push({ headers, body });

    start = partEnd;
  }

  return parts;
}

// Helper function to find a subarray within a Uint8Array
function indexOf(
  source: Uint8Array,
  search: Uint8Array,
  start: number
): number {
  outer: for (let i = start; i <= source.length - search.length; i++) {
    for (let j = 0; j < search.length; j++) {
      if (source[i + j] !== search[j]) continue outer;
    }
    return i;
  }
  return -1;
}

export function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function binaryStringToUint8Array(binary: string): Uint8Array {
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
