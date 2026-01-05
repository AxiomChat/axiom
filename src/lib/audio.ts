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

  const audioCtx = new AudioContext({ sampleRate: 48000 });
  await audioCtx.audioWorklet.addModule("/audio-worklet.js");

  const source = audioCtx.createMediaStreamSource(stream);
  const worklet = new AudioWorkletNode(audioCtx, "mic-processor");

  source.connect(worklet);
  worklet.connect(audioCtx.destination); // optional

  worklet.port.onmessage = (e) => {
    const float32 = e.data as Float32Array;
    const pcm16 = float32ToPCM16(float32);
    onAudio(pcm16);
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

export function sendVoice(ws: WebSocket, voiceId: number, pcm: Int16Array) {
  const buffer = new ArrayBuffer(2 + pcm.byteLength);
  const view = new DataView(buffer);

  view.setUint16(0, voiceId, true); // little endian
  new Uint8Array(buffer, 2).set(new Uint8Array(pcm.buffer));

  ws.send(buffer);
}
