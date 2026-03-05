import { ToolbarGroup } from './ToolbarGroup'
import { ToolbarButton } from './ToolbarButton'
import { useStore } from '../store/useStore'

interface ToolbarRibbonProps {
  onInsert: (template: string, cursorOffset?: number) => void
}

export function ToolbarRibbon({ onInsert }: ToolbarRibbonProps) {
  const { config, setConfig, setViewMode } = useStore()

  return (
    <div className="flex items-start gap-0 px-1 py-1 bg-gray-900 border-b border-gray-800 overflow-x-auto">
      {/* Algebra */}
      <ToolbarGroup title="Algebra">
        <ToolbarButton icon="≡" label="simplify" tooltip="Simplify expression"
          onClick={() => onInsert('simplify("")', -2)} />
        <ToolbarButton icon="⟨⟩" label="expand" tooltip="Expand expression"
          onClick={() => onInsert('expand("")', -2)} />
        <ToolbarButton icon="[ ]" label="factor" tooltip="Factor expression"
          onClick={() => onInsert('factor("")', -2)} />
        <ToolbarButton icon="✓" label="solve" tooltip="Solve equation"
          onClick={() => onInsert('solve("", "x")', -6)} />
        <ToolbarButton icon="⁄" label="rational" tooltip="Rationalize"
          onClick={() => onInsert('rationalize("")', -2)} />
      </ToolbarGroup>

      <div className="w-px h-10 bg-gray-800 mx-1 self-center" />

      {/* Calculus */}
      <ToolbarGroup title="Calculus">
        <ToolbarButton icon="d/dx" label="deriv" tooltip="Derivative"
          onClick={() => onInsert('derivative("", "x")', -6)} />
        <ToolbarButton icon="∫" label="integ" tooltip="Integral (symbolic)"
          onClick={() => onInsert('integrate("", "x")', -6)} />
        <ToolbarButton icon="lim" label="limit" tooltip="Limit"
          onClick={() => onInsert('limit("", "x", 0)', -7)} />
        <ToolbarButton icon="Σ" label="sum" tooltip="Summation"
          onClick={() => onInsert('sum([])', -2)} />
        <ToolbarButton icon="Tₙ" label="taylor" tooltip="Taylor series"
          onClick={() => onInsert('taylor("", "x", 0, 5)', -8)} />
      </ToolbarGroup>

      <div className="w-px h-10 bg-gray-800 mx-1 self-center" />

      {/* Matrix */}
      <ToolbarGroup title="Matrix">
        <ToolbarButton icon="|A|" label="det" tooltip="Determinant"
          onClick={() => onInsert('det()', -1)} />
        <ToolbarButton icon="A⁻¹" label="inv" tooltip="Inverse"
          onClick={() => onInsert('inv()', -1)} />
        <ToolbarButton icon="Aᵀ" label="trans" tooltip="Transpose"
          onClick={() => onInsert('transpose()', -1)} />
        <ToolbarButton icon="λ" label="eigs" tooltip="Eigenvalues"
          onClick={() => onInsert('eigs()', -1)} />
        <ToolbarButton icon="⊞" label="matrix" tooltip="Create matrix"
          onClick={() => onInsert('matrix([[]])', -3)} />
      </ToolbarGroup>

      <div className="w-px h-10 bg-gray-800 mx-1 self-center" />

      {/* Trig */}
      <ToolbarGroup title="Trig">
        <ToolbarButton icon="sin" label="sin" tooltip="Sine"
          onClick={() => onInsert('sin()', -1)} />
        <ToolbarButton icon="cos" label="cos" tooltip="Cosine"
          onClick={() => onInsert('cos()', -1)} />
        <ToolbarButton icon="tan" label="tan" tooltip="Tangent"
          onClick={() => onInsert('tan()', -1)} />
        <ToolbarButton icon="sin⁻¹" label="asin" tooltip="Arcsine"
          onClick={() => onInsert('asin()', -1)} />
        <ToolbarButton icon="cos⁻¹" label="acos" tooltip="Arccosine"
          onClick={() => onInsert('acos()', -1)} />
        <ToolbarButton icon="tan⁻¹" label="atan" tooltip="Arctangent"
          onClick={() => onInsert('atan()', -1)} />
      </ToolbarGroup>

      <div className="w-px h-10 bg-gray-800 mx-1 self-center" />

      {/* Stats */}
      <ToolbarGroup title="Stats">
        <ToolbarButton icon="x̄" label="mean" tooltip="Mean"
          onClick={() => onInsert('mean([])', -2)} />
        <ToolbarButton icon="σ" label="std" tooltip="Standard deviation"
          onClick={() => onInsert('std([])', -2)} />
        <ToolbarButton icon="M̃" label="median" tooltip="Median"
          onClick={() => onInsert('median([])', -2)} />
      </ToolbarGroup>

      <div className="w-px h-10 bg-gray-800 mx-1 self-center" />

      {/* Plot */}
      <ToolbarGroup title="Plot">
        <ToolbarButton icon="📈" label="y=f(x)" tooltip="Plot 2D function"
          onClick={() => onInsert('plot()', -1)} />
        <ToolbarButton icon="⟳" label="param" tooltip="Parametric plot"
          onClick={() => onInsert('plotParametric(cos(t), sin(t), t, 0, 2*pi)', 0)} />
        <ToolbarButton icon="◎" label="polar" tooltip="Polar plot"
          onClick={() => onInsert('plotPolar(, theta, 0, 2*pi)', -19)} />
        <ToolbarButton icon="🏔" label="3D" tooltip="3D surface plot"
          onClick={() => onInsert('plot3d()', -1)} />
        <ToolbarButton icon="🗑" label="clear" tooltip="Clear all plots"
          onClick={() => onInsert('clearPlot()', 0)} />
      </ToolbarGroup>

      <div className="w-px h-10 bg-gray-800 mx-1 self-center" />

      {/* Settings */}
      <ToolbarGroup title="Settings">
        <ToolbarButton
          icon={config.angleMode === 'deg' ? '°' : 'rad'}
          label="angle"
          tooltip="Toggle angle mode"
          onClick={() => setConfig({ angleMode: config.angleMode === 'deg' ? 'rad' : 'deg' })}
          active={config.angleMode === 'deg'}
        />
        <ToolbarButton icon="⚡" label="engine" tooltip="Toggle engine (JS/WASM)"
          onClick={() => {
            const modes = ['auto', 'js', 'wasm'] as const
            const idx = modes.indexOf(config.engine)
            setConfig({ engine: modes[(idx + 1) % 3] })
          }}
        />
      </ToolbarGroup>

      <div className="w-px h-10 bg-gray-800 mx-1 self-center" />

      {/* Views */}
      <ToolbarGroup title="Views">
        <ToolbarButton icon="📊" label="stats" tooltip="Statistics Dashboard"
          onClick={() => setViewMode('statistics')} />
        <ToolbarButton icon="⚡" label="perf" tooltip="Performance Dashboard"
          onClick={() => setViewMode('performance')} />
      </ToolbarGroup>
    </div>
  )
}
