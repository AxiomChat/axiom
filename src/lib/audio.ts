"use client";

async function getMicStream() {
  return await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  });
}

export async function startMic(onAudio: (data: Int16Array) => void) {
  const stream = await getMicStream();
  const sampleRate = 48000;
  const audioCtx = new AudioContext({ sampleRate });
  await audioCtx.resume();
  await audioCtx.audioWorklet.addModule("/audio-worklet.js");

  const source = audioCtx.createMediaStreamSource(stream);
  const worklet = new AudioWorkletNode(audioCtx, "mic-processor");

  source.connect(worklet);
  worklet.connect(audioCtx.destination);

  const buffer: number[] = [];
  const chunkSize = sampleRate;

  worklet.port.onmessage = (e) => {
    const float32 = e.data as Float32Array;
    const pcm16 = float32ToPCM16(float32);
    buffer.push(...pcm16);
  };

  const interval = setInterval(() => {
    if (buffer.length === 0) return;
    let chunk: Int16Array;
    if (buffer.length >= chunkSize) {
      chunk = new Int16Array(buffer.splice(0, chunkSize));
    } else {
      chunk = new Int16Array(chunkSize);
      chunk.set(buffer.splice(0, buffer.length));
    }
    onAudio(chunk);
  }, 1000);

  // Return cleanup function
  return () => {
    clearInterval(interval);
    worklet.disconnect();
    source.disconnect();
    audioCtx.close();
    stream.getTracks().forEach((t) => t.stop());
  };
}

function float32ToPCM16(float32: Float32Array): Int16Array {
  const pcm16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return pcm16;
}

export function sendVoice(ws: WebSocket, pcm: Int16Array) {
  ws.send(new Uint8Array(pcm.buffer, pcm.byteOffset, pcm.byteLength));
}

let ctx: AudioContext | null = null;

function getAudioContext(sampleRate: number) {
  if (!ctx) {
    ctx = new AudioContext({ sampleRate });
  }
  return ctx;
}

export function playPCM16(u8: Uint8Array) {
  const audioCtx = getAudioContext(48000);

  // Remove the first two bytes
  const trimmed = u8.slice(2);

  const pcm16 = new Int16Array(
    trimmed.buffer,
    trimmed.byteOffset,
    trimmed.byteLength / 2
  );

  const float32 = new Float32Array(pcm16.length);
  for (let i = 0; i < pcm16.length; i++) {
    float32[i] = pcm16[i] / 0x8000;
  }

  const buffer = audioCtx.createBuffer(1, float32.length, 48000);
  buffer.getChannelData(0).set(float32);

  const src = audioCtx.createBufferSource();
  src.buffer = buffer;
  src.connect(audioCtx.destination);
  src.start();
}
