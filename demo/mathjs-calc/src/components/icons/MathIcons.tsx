interface IconProps {
  className?: string
  size?: number
}

// Algebra icons
export function SimplifyIcon({ className, size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" className={className} fill="currentColor">
      <text x="2" y="13" fontSize="12" fontFamily="serif">=</text>
      <text x="10" y="8" fontSize="7" fontFamily="serif">*</text>
    </svg>
  )
}

export function ExpandIcon({ className, size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" className={className} fill="currentColor">
      <text x="1" y="14" fontSize="13" fontFamily="serif">⟨ ⟩</text>
    </svg>
  )
}

export function FactorIcon({ className, size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" className={className} fill="currentColor">
      <text x="1" y="14" fontSize="13" fontFamily="serif">[ ]</text>
    </svg>
  )
}

export function SolveIcon({ className, size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" className={className} fill="currentColor">
      <text x="1" y="13" fontSize="12" fontFamily="serif" fontStyle="italic">x</text>
      <text x="9" y="13" fontSize="10" fontFamily="sans-serif">✓</text>
    </svg>
  )
}

export function RationalizeIcon({ className, size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" className={className} fill="currentColor">
      <line x1="2" y1="9" x2="16" y2="9" stroke="currentColor" strokeWidth="1.5" />
      <text x="5" y="7" fontSize="8" fontFamily="serif" fontStyle="italic">a</text>
      <text x="5" y="16" fontSize="8" fontFamily="serif" fontStyle="italic">b</text>
    </svg>
  )
}

// Calculus icons
export function DerivativeIcon({ className, size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" className={className} fill="currentColor">
      <text x="0" y="13" fontSize="10" fontFamily="serif" fontStyle="italic">d/dx</text>
    </svg>
  )
}

export function IntegralIcon({ className, size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" className={className} fill="currentColor">
      <text x="3" y="15" fontSize="16" fontFamily="serif">∫</text>
    </svg>
  )
}

export function LimitIcon({ className, size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" className={className} fill="currentColor">
      <text x="1" y="13" fontSize="10" fontFamily="serif">lim</text>
    </svg>
  )
}

export function SummationIcon({ className, size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" className={className} fill="currentColor">
      <text x="2" y="15" fontSize="16" fontFamily="serif">Σ</text>
    </svg>
  )
}

export function ProductIcon({ className, size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" className={className} fill="currentColor">
      <text x="2" y="15" fontSize="16" fontFamily="serif">∏</text>
    </svg>
  )
}

export function TaylorIcon({ className, size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" className={className} fill="currentColor">
      <text x="1" y="13" fontSize="10" fontFamily="serif">T</text>
      <text x="9" y="13" fontSize="8" fontFamily="serif">∞</text>
    </svg>
  )
}

// Matrix icons
export function DeterminantIcon({ className, size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" className={className} fill="currentColor">
      <text x="0" y="13" fontSize="10" fontFamily="serif">|A|</text>
    </svg>
  )
}

export function InverseIcon({ className, size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" className={className} fill="currentColor">
      <text x="0" y="13" fontSize="10" fontFamily="serif">A⁻¹</text>
    </svg>
  )
}

export function TransposeIcon({ className, size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" className={className} fill="currentColor">
      <text x="1" y="13" fontSize="10" fontFamily="serif">Aᵀ</text>
    </svg>
  )
}

export function EigenvalueIcon({ className, size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" className={className} fill="currentColor">
      <text x="3" y="14" fontSize="14" fontFamily="serif" fontStyle="italic">λ</text>
    </svg>
  )
}

export function MatrixGridIcon({ className, size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" className={className} fill="currentColor">
      <rect x="2" y="2" width="4" height="4" rx="1" />
      <rect x="8" y="2" width="4" height="4" rx="1" />
      <rect x="2" y="8" width="4" height="4" rx="1" />
      <rect x="8" y="8" width="4" height="4" rx="1" />
      <rect x="14" y="2" width="2" height="4" rx="0.5" opacity="0.4" />
      <rect x="14" y="8" width="2" height="4" rx="0.5" opacity="0.4" />
    </svg>
  )
}

// Trig icons
export function SinIcon({ className, size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" className={className} fill="currentColor">
      <text x="1" y="13" fontSize="11" fontFamily="serif">sin</text>
    </svg>
  )
}

export function CosIcon({ className, size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" className={className} fill="currentColor">
      <text x="1" y="13" fontSize="11" fontFamily="serif">cos</text>
    </svg>
  )
}

export function TanIcon({ className, size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" className={className} fill="currentColor">
      <text x="1" y="13" fontSize="11" fontFamily="serif">tan</text>
    </svg>
  )
}

export function AsinIcon({ className, size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" className={className} fill="currentColor">
      <text x="0" y="12" fontSize="8" fontFamily="serif">sin⁻¹</text>
    </svg>
  )
}

export function AcosIcon({ className, size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" className={className} fill="currentColor">
      <text x="0" y="12" fontSize="8" fontFamily="serif">cos⁻¹</text>
    </svg>
  )
}

export function AtanIcon({ className, size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" className={className} fill="currentColor">
      <text x="0" y="12" fontSize="8" fontFamily="serif">tan⁻¹</text>
    </svg>
  )
}

// Stats icons
export function MeanIcon({ className, size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" className={className} fill="currentColor">
      <text x="3" y="14" fontSize="13" fontFamily="serif" fontStyle="italic">x̄</text>
    </svg>
  )
}

export function StdDevIcon({ className, size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" className={className} fill="currentColor">
      <text x="3" y="14" fontSize="14" fontFamily="serif" fontStyle="italic">σ</text>
    </svg>
  )
}

export function MedianIcon({ className, size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" className={className} fill="currentColor">
      <text x="2" y="14" fontSize="13" fontFamily="serif" fontStyle="italic">M̃</text>
    </svg>
  )
}

export function HistogramIcon({ className, size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" className={className} fill="currentColor">
      <rect x="2" y="10" width="3" height="6" />
      <rect x="6" y="4" width="3" height="12" />
      <rect x="10" y="7" width="3" height="9" />
      <rect x="14" y="11" width="3" height="5" />
    </svg>
  )
}

export function RegressionIcon({ className, size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" className={className} stroke="currentColor" fill="none" strokeWidth="1.5">
      <circle cx="4" cy="13" r="1.5" fill="currentColor" />
      <circle cx="7" cy="10" r="1.5" fill="currentColor" />
      <circle cx="11" cy="8" r="1.5" fill="currentColor" />
      <circle cx="15" cy="4" r="1.5" fill="currentColor" />
      <line x1="2" y1="14" x2="16" y2="3" strokeWidth="1" />
    </svg>
  )
}

// Plot icons
export function Plot2DIcon({ className, size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" className={className} stroke="currentColor" fill="none" strokeWidth="1.5">
      <path d="M2 14 Q6 2 10 9 T16 4" strokeLinecap="round" />
      <line x1="2" y1="16" x2="16" y2="16" strokeWidth="1" opacity="0.4" />
      <line x1="2" y1="2" x2="2" y2="16" strokeWidth="1" opacity="0.4" />
    </svg>
  )
}

export function ParametricIcon({ className, size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" className={className} stroke="currentColor" fill="none" strokeWidth="1.5">
      <path d="M9 2 C14 4 14 14 9 16 C4 14 4 4 9 2" strokeLinecap="round" />
    </svg>
  )
}

export function PolarIcon({ className, size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" className={className} stroke="currentColor" fill="none" strokeWidth="1.5">
      <circle cx="9" cy="9" r="6" />
      <line x1="9" y1="9" x2="14" y2="5" />
    </svg>
  )
}

export function Surface3DIcon({ className, size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" className={className} stroke="currentColor" fill="none" strokeWidth="1">
      <path d="M2 12 L9 8 L16 12 L9 16 Z" />
      <path d="M2 8 L9 4 L16 8 L9 12 Z" opacity="0.5" />
      <path d="M5 6 Q9 2 13 6" opacity="0.4" />
    </svg>
  )
}

export function ClearPlotIcon({ className, size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" className={className} stroke="currentColor" fill="none" strokeWidth="2">
      <line x1="4" y1="4" x2="14" y2="14" />
      <line x1="14" y1="4" x2="4" y2="14" />
    </svg>
  )
}

// Settings icons
export function AngleModeIcon({ className, size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" className={className} fill="currentColor">
      <text x="3" y="14" fontSize="13" fontFamily="serif">°</text>
    </svg>
  )
}

export function EngineIcon({ className, size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" className={className} fill="currentColor">
      <text x="2" y="14" fontSize="13">⚡</text>
    </svg>
  )
}

export function InfinityIcon({ className, size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" className={className} fill="currentColor">
      <text x="1" y="14" fontSize="14" fontFamily="serif">∞</text>
    </svg>
  )
}
