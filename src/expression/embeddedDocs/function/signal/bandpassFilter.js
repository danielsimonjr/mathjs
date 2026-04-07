export const bandpassFilterDocs = {
  name: 'bandpassFilter',
  category: 'Signal',
  syntax: [
    'bandpassFilter(signal, lowCutoff, highCutoff, sampleRate)'
  ],
  description: 'Apply a 2nd order Butterworth bandpass filter to a signal by cascading a highpass at lowCutoff and a lowpass at highCutoff.',
  examples: [
    'bandpassFilter([1, 0, -1, 0, 1, 0, -1, 0], 0.05, 0.45, 1)',
    'bandpassFilter([1, 1, 1, 1, 1, 1, 1, 1], 0.1, 0.4, 1)'
  ],
  seealso: ['lowpassFilter', 'highpassFilter', 'fft']
}
