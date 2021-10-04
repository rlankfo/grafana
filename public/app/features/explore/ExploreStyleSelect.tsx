import { GraphDrawStyle, StackingMode, GraphFieldConfig } from '@grafana/schema';
import produce from 'immer';
import { FieldConfigSource, SelectableValue } from '@grafana/data';
import { RadioButtonGroup } from '@grafana/ui';
import React from 'react';

type FieldConfig = FieldConfigSource<GraphFieldConfig>;

function updateFieldConfig(
  config: FieldConfig,
  newDrawStyle: GraphDrawStyle,
  newStackingMode: StackingMode
): FieldConfig {
  return produce(config, (draft) => {
    if (draft.defaults.custom === undefined) {
      draft.defaults.custom = {};
    }

    draft.defaults.custom.drawStyle = newDrawStyle;
    draft.defaults.custom.stacking = {
      group: 'A', // we only need one group
      mode: newStackingMode,
    };

    // if stacking is enabled, we make the graph non-transparent
    // FIXME: is this a good idea?
    draft.defaults.custom.fillOpacity = newStackingMode === StackingMode.None ? 0 : 100;
  });
}

function getStyleInfo(config: FieldConfig): { drawStyle: GraphDrawStyle; stackingMode: StackingMode } {
  const customConf = config.defaults.custom;
  const drawStyle = customConf?.drawStyle ?? GraphDrawStyle.Line;
  const stackingMode = customConf?.stacking?.mode ?? StackingMode.None;
  return { drawStyle, stackingMode };
}

// keeping the same labels as in the dashboard
const ALL_DRAW_STYLE_OPTIONS: Array<SelectableValue<GraphDrawStyle>> = [
  {
    label: 'Lines',
    value: GraphDrawStyle.Line,
  },
  {
    label: 'Bars',
    value: GraphDrawStyle.Bars,
  },
  {
    label: 'Points',
    value: GraphDrawStyle.Points,
  },
];

const ALL_STACKING_MODE_OPTIONS: Array<SelectableValue<StackingMode>> = [
  {
    label: 'Not stacked',
    value: StackingMode.None,
  },
  {
    label: 'Stacked',
    value: StackingMode.Normal,
  },
];

type Props = {
  fieldConfig: FieldConfig;
  onChange: (newConfig: FieldConfigSource) => void;
};

export function ExploreStyleSelect({ fieldConfig, onChange }: Props) {
  const { drawStyle, stackingMode } = getStyleInfo(fieldConfig);

  const handleStyleChange = (newDrawStyle: GraphDrawStyle, newStackingMode: StackingMode) => {
    const newConfig = updateFieldConfig(fieldConfig, newDrawStyle, newStackingMode);
    onChange(newConfig);
  };

  return (
    <div>
      <RadioButtonGroup
        options={ALL_DRAW_STYLE_OPTIONS}
        value={drawStyle}
        onChange={(value) => {
          handleStyleChange(value, stackingMode);
        }}
      />
      <RadioButtonGroup
        options={ALL_STACKING_MODE_OPTIONS}
        value={stackingMode}
        onChange={(value) => {
          handleStyleChange(drawStyle, value);
        }}
      />
    </div>
  );
}
