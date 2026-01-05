class MicProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = new Float32Array(960);
    this.offset = 0;
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0]) return true;

    const channel = input[0];

    let i = 0;
    while (i < channel.length) {
      const remaining = this.buffer.length - this.offset;
      const toCopy = Math.min(remaining, channel.length - i);

      this.buffer.set(channel.subarray(i, i + toCopy), this.offset);

      this.offset += toCopy;
      i += toCopy;

      if (this.offset === this.buffer.length) {
        // COPY before sending
        this.port.postMessage(this.buffer.slice());
        this.offset = 0;
      }
    }

    return true;
  }
}

registerProcessor("mic-processor", MicProcessor);
