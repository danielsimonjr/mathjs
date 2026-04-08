export const resampleDocs = {
  name: 'resample',
  category: 'Signal',
  syntax: [
    'resample(signal, factor)'
  ],
  description: 'Resample a signal by a given factor using linear interpolation. A factor > 1 upsamples (increases length), a factor < 1 downsamples (decreases length). The output has round((N-1)*factor)+1 samples, mapping evenly between the first and last input samples. Non-integer factors are fully supported.',
  examples: [
    'resample([1, 2, 3], 2)',
    'resample([1, 2, 3, 4, 5], 0.5)'
  ],
  seealso: ['convolve', 'medfilt', 'lowpassFilter']
}
