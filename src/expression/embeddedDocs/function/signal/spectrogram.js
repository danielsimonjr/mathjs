export const spectrogramDocs = {
  name: 'spectrogram',
  category: 'Signal',
  syntax: [
    'spectrogram(signal, windowSize)',
    'spectrogram(signal, windowSize, options)'
  ],
  description: 'Compute the spectrogram (Short-Time Fourier Transform magnitude) of a signal. Slides a window across the signal, applies a window function, and computes the FFT magnitude at each position. Returns an object with times, frequencies, and magnitude (2D array indexed by [timeIndex][freqBin]). Options: hopSize (default: windowSize/2), window type (default: "hamming").',
  examples: [
    'spectrogram([1, 0, -1, 0, 1, 0, -1, 0], 4)',
    'spectrogram([1, 0, -1, 0, 1, 0, -1, 0], 4, {hopSize: 2, window: "hamming"})'
  ],
  seealso: ['fourier', 'fft', 'periodogram', 'windowFunction']
}
