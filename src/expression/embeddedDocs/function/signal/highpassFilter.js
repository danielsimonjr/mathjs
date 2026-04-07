export const highpassFilterDocs = {
  name: 'highpassFilter',
  category: 'Signal',
  syntax: [
    'highpassFilter(signal, cutoff, sampleRate)'
  ],
  description: 'Apply a 2nd order Butterworth highpass IIR filter to a signal. The cutoff and sampleRate must use the same time unit (e.g., both in Hz).',
  examples: [
    'highpassFilter([1, -1, 1, -1, 1, -1, 1, -1], 0.1, 1)',
    'highpassFilter([1, 1, 1, 1, 1, 1, 1, 1], 0.4, 1)'
  ],
  seealso: ['lowpassFilter', 'bandpassFilter', 'fft']
}
