class MicProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0];
    if (input.length > 0) {
      const channelData = input[0]; // Float32Array
      this.port.postMessage(channelData);
    }
    return true;
  }
}

registerProcessor("mic-processor", MicProcessor);
