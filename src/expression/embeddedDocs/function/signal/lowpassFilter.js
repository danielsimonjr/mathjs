export const lowpassFilterDocs = {
  name: 'lowpassFilter',
  category: 'Signal',
  syntax: [
    'lowpassFilter(signal, cutoff, sampleRate)'
  ],
  description: 'Apply a 2nd order Butterworth lowpass IIR filter to a signal. The cutoff and sampleRate must use the same time unit (e.g., both in Hz).',
  examples: [
    'lowpassFilter([1, 1, 1, 1, 1, 1, 1, 1], 0.4, 1)',
    'lowpassFilter([1, 0, -1, 0, 1, 0, -1, 0], 0.1, 1)'
  ],
  seealso: ['highpassFilter', 'bandpassFilter', 'fft']
}
