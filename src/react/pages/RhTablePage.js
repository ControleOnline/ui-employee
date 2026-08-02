/* eslint-disable no-unused-vars */
import React, {useLayoutEffect, useMemo} from 'react';
import {useNavigation} from '@react-navigation/native';
import {Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import DefaultTable from '@controleonline/ui-default/src/react/components/table/DefaultTable';
import {useStore} from '@store';
import {resolveThemePalette} from '@controleonline/../../src/styles/branding';
import {colors} from '@controleonline/../../src/styles/colors';
import {resolvePeopleLabel} from '@controleonline/ui-employee/src/shared/employeeFormats';
import {createStyles} from './RhWorkspace.styles';

const RhTablePage = ({
  title,
  description,
  storeName,
  requestParams = {},
  searchKey = 'search',
  searchPlaceholder = '',
  searchProps = null,
  onRowPress = null,
  toolbarActions = [],
  controls = null,
  totalItemsLabel = '',
  visibleColumnsPreferenceKey = '',
  showColumnFiltersButton = true,
  showRowActions = false,
  initialViewMode = 'table',
  rowStyle = null,
}) => {
  const navigation = useNavigation();
  const peopleStore = useStore('people');
  const themeStore = useStore('theme');
  const {currentCompany} = peopleStore.getters || {};
  const {colors: themeColors} = themeStore.getters || {};

  const palette = useMemo(
    () =>
      resolveThemePalette(
        {...themeColors, ...(currentCompany?.theme?.colors || {})},
        colors,
      ),
    [currentCompany?.id, currentCompany?.theme?.colors, themeColors],
  );
  const styles = useMemo(() => createStyles(palette), [palette]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title,
    });
  }, [navigation, title]);

  const hasCurrentCompany = Boolean(currentCompany?.id);
  const companyLabel = resolvePeopleLabel(currentCompany);
  const tableSearchProps = searchProps
    ? {
        ...searchProps,
        compact: true,
        searchKey,
        storeName,
        placeholder: searchProps.placeholder || searchPlaceholder,
      }
    : null;

  const visibleColumnsKey = visibleColumnsPreferenceKey || `${storeName}-rh`;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.screen}>
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={{flex: 1}}>
              <Text style={styles.heroTitle}>{title}</Text>
              <Text style={styles.heroDescription}>{description}</Text>
            </View>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>
                {companyLabel || 'Empresa'}
              </Text>
            </View>
          </View>
        </View>

        {!hasCurrentCompany ? (
          <View style={styles.emptyStateCard}>
            <Text style={styles.emptyStateTitle}>Selecione uma empresa</Text>
            <Text style={styles.emptyStateText}>
              A area de RH precisa de uma empresa ativa para carregar os
              registros.
            </Text>
          </View>
        ) : (
          <>
            {controls ? <View style={styles.controlsCard}>{controls}</View> : null}
            <View style={styles.tableShell}>
              <DefaultTable
                accentColor={palette.primary || '#2563EB'}
                data={undefined}
                initialViewMode={initialViewMode}
                onRowPress={onRowPress}
                requestParams={requestParams}
                searchProps={tableSearchProps}
                rowStyle={rowStyle}
                showColumnFiltersButton={showColumnFiltersButton}
                showRowActions={showRowActions}
                storeName={storeName}
                toolbarActions={toolbarActions}
                totalItemsLabel={totalItemsLabel}
                visibleColumnsPreferenceKey={visibleColumnsKey}
              />
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default RhTablePage;
