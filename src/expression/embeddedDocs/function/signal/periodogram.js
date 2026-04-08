export const periodogramDocs = {
  name: 'periodogram',
  category: 'Signal',
  syntax: [
    'periodogram(signal)',
    'periodogram(signal, options)'
  ],
  description: 'Estimate the power spectral density (PSD) of a signal using the periodogram method. Computes |FFT(x)|^2 scaled by window normalization. Returns the one-sided spectrum (DC to Nyquist) as an object with frequencies and power arrays. Options: sampleRate (default: 1), window type (default: "rectangular"), nfft (default: next power of 2 >= signal length).',
  examples: [
    'periodogram([1, 0, -1, 0, 1, 0, -1, 0])',
    'periodogram([1, 0, -1, 0], {sampleRate: 44100, window: "hamming"})'
  ],
  seealso: ['fourier', 'spectrogram', 'fft', 'windowFunction']
}
