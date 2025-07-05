import { checkbox } from '../../../common/components/checkbox.ts'
import { rich } from '../../../common/components/rich.ts'
import { verticalTable } from '../../../common/components/vertical_table.ts'
import { c } from '../../../common/rendering/component.ts'
import { mathml } from '../../../common/rich.ts'
import { snakeToKebabCase } from '../../../common/support/strings.ts'
import { type ClientWebsiteEnvironment } from '../../core/environment.ts'
import { type IInterpolatedFunction, type IInterpolator, type InterpolatorId } from '../types.ts'

interface IInterpolationLegendState {
  interpolated: IInterpolatedFunction[]
  visible: Record<InterpolatorId, boolean>
  toggleVisibility: (interpolator: IInterpolator, newValue: boolean) => void
}

export function interpolationLegendTable({ interpolated, visible, toggleVisibility }: IInterpolationLegendState, env: ClientWebsiteEnvironment) {
  const _ = env.gettext$

  return c('div', { class: 'interpolation-legend-table-wrapper' },
    c(verticalTable<IInterpolatedFunction>, {
      tableClass: 'interpolation-legend-table',
      columnSpecs: [
        {
          id: 'method',
          class: 'col-method',
          label: { bundleId: 'univariate_interpolation', key: 'legend_table.heading.method' },
          value({ interpolator }: IInterpolatedFunction) {
            const kebabCase = snakeToKebabCase(interpolator.id)

            return c(checkbox, {
              name: `interpolation-legend-${kebabCase}`,
              value: visible[interpolator.id],
              labelClass: `interpolation-legend-table-control interpolator-${kebabCase}`,
              content: _({ bundleId: 'univariate_interpolation', key: `legend_table.interpolator.${interpolator.id}.name` }),
              update(newValue: boolean) {
                toggleVisibility(interpolator, newValue)
              },
            })
          },
        },
        {
          id: 'expression',
          label: { bundleId: 'univariate_interpolation', key: 'legend_table.heading.expression' },
          class: 'col-expression',
          value({ fun }: IInterpolatedFunction) {
            return c(rich, {
              mode: 'mathml',
              doc: {
                kind: 'document',
                entries: [mathml.root('inline', fun.getRichTextEntry())],
              },
            })
          },
        },
      ],
      data: interpolated,
    }),
  )
}
