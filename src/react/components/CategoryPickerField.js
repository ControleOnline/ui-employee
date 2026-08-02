import React, {useMemo} from 'react';
import {Text, View} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import styles from './CategoryPickerField.styles';
import {resolveCategoryIri} from '@controleonline/ui-employee/src/shared/employeeFormats';

const normalizeText = value => String(value ?? '').trim();

const CategoryPickerField = ({
  label,
  options = [],
  placeholder = 'Selecionar',
  value = '',
  onChange,
}) => {
  const normalizedValue = normalizeText(value);

  const items = useMemo(
    () =>
      Array.isArray(options)
        ? options
            .filter(option => option && typeof option === 'object')
            .map(option => ({
              key: resolveCategoryIri(option) || String(option?.id || ''),
              label: normalizeText(option?.name) || `Categoria ${option?.id || ''}`,
              color: option?.color || undefined,
            }))
        : [],
    [options],
  );

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={normalizedValue}
          style={styles.picker}
          onValueChange={nextValue => {
            if (typeof onChange === 'function') {
              const selectedOption = items.find(option => option.key === nextValue) || null;
              onChange(nextValue, selectedOption);
            }
          }}
        >
          <Picker.Item label={placeholder} value="" />
          {items.map(option => (
            <Picker.Item
              key={option.key}
              label={option.label}
              value={option.key}
              color={option.color}
            />
          ))}
        </Picker>
      </View>
    </View>
  );
};

export default CategoryPickerField;
