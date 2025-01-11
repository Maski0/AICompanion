/**
 * Convert PCM 16000 or MP3 binary data into a WAV file.
 * @param audioBlob - The audio blob containing PCM or MP3 data.
 * @param sampleRate - The target sample rate (e.g., 16000 for PCM 16000).
 * @returns A Promise that resolves to a Blob of the WAV file.
 */
export const convertToWav = async (
  audioBlob: Blob,
  sampleRate: number
): Promise<Blob> => {
  // Create an AudioContext for decoding
  const audioContext = new AudioContext({ sampleRate });

  // Read the binary data as an ArrayBuffer
  const arrayBuffer = await audioBlob.arrayBuffer();

  // Decode the audio data
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  // Extract PCM data and format it into a WAV
  return createWavBlob(audioBuffer);
};

/**
 * Create a WAV Blob from an AudioBuffer
 * @param audioBuffer - The decoded audio buffer.
 * @returns A Blob containing the WAV data.
 */
const createWavBlob = (audioBuffer: AudioBuffer): Blob => {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const samples = audioBuffer.length;
  const bitsPerSample = 16; // Hardcoded to 16-bit PCM
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;

  // WAV Header Constants
  const wavHeaderSize = 44;
  const dataSize = samples * numChannels * (bitsPerSample / 8);
  const fileSize = wavHeaderSize + dataSize;

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  // Write WAV Header
  // ChunkID "RIFF"
  writeString(view, 0, "RIFF");
  view.setUint32(4, fileSize - 8, true); // ChunkSize
  writeString(view, 8, "WAVE");

  // Format Subchunk
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true); // Subchunk1Size (PCM header size)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, byteRate, true); // ByteRate
  view.setUint16(32, blockAlign, true); // BlockAlign
  view.setUint16(34, bitsPerSample, true); // BitsPerSample

  // Data Subchunk
  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true); // Subchunk2Size

  // Write PCM data
  let offset = 44;
  const channelData = [];
  for (let i = 0; i < numChannels; i++) {
    channelData.push(audioBuffer.getChannelData(i));
  }

  for (let sample = 0; sample < samples; sample++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const value = Math.max(-1, Math.min(1, channelData[channel][sample])); // Clamp to [-1, 1]
      const int16 = value < 0 ? value * 0x8000 : value * 0x7fff; // Scale to 16-bit PCM
      view.setInt16(offset, int16, true); // Write as little-endian
      offset += 2;
    }
  }

  return new Blob([buffer], { type: "audio/wav" });
};

/**
 * Helper function to write ASCII strings to the DataView
 */
const writeString = (view: DataView, offset: number, str: string): void => {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
};
