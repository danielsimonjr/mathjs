export const medfiltDocs = {
  name: 'medfilt',
  category: 'Signal',
  syntax: [
    'medfilt(signal, windowSize)'
  ],
  description: 'Apply a median filter to a 1D signal. For each position, computes the median of the windowSize-element sliding window centered on that position. Edge samples use mirror (reflect) padding. windowSize must be a positive odd integer. The median filter is effective for removing impulse noise (spikes) while preserving edges.',
  examples: [
    'medfilt([1, 2, 100, 2, 1], 3)',
    'medfilt([5, 1, 4, 2, 3], 3)'
  ],
  seealso: ['convolve', 'resample', 'lowpassFilter']
}
