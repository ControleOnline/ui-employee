/* eslint-disable no-unused-vars */
import React, {useCallback, useLayoutEffect, useMemo} from 'react';
import {useNavigation} from '@react-navigation/native';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {Text, TouchableOpacity, View, useWindowDimensions} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useStore} from '@store';
import {resolveThemePalette} from '@controleonline/../../src/styles/branding';
import {colors} from '@controleonline/../../src/styles/colors';
import {resolvePeopleLabel} from '@controleonline/ui-employee/src/shared/employeeFormats';
import {RH_HOME_LINKS} from '@controleonline/ui-employee/src/shared/employeeNavigation';
import {createStyles} from './RhWorkspace.styles';

const RhHomePage = () => {
  const navigation = useNavigation();
  const {width} = useWindowDimensions();
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
      title: 'RH',
    });
  }, [navigation]);

  const handleNavigate = useCallback(
    item => {
      if (!item?.routeName) {
        return;
      }

      navigation.navigate(item.routeName, item.routeParams || {});
    },
    [navigation],
  );

  const isCompact = width > 0 && width < 780;
  const companyLabel = resolvePeopleLabel(currentCompany);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.screen}>
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={{flex: 1}}>
              <Text style={styles.heroTitle}>RH</Text>
              <Text style={styles.heroDescription}>
                Funcionarios, pontos, cargos, contratos, escalas e folha de
                ponto em uma unica area.
              </Text>
            </View>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>
                {companyLabel || 'Empresa atual'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.homeGrid}>
          {RH_HOME_LINKS.map(item => (
            <TouchableOpacity
              key={item.key}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              activeOpacity={0.88}
              style={[
                styles.homeCard,
                isCompact ? {flexBasis: '100%'} : null,
              ]}
              onPress={() => handleNavigate(item)}
            >
              <View style={styles.homeCardTop}>
                <View style={[styles.homeCardIcon, {backgroundColor: item.color}]}>
                  <MaterialCommunityIcons name={item.icon} size={22} color="#FFFFFF" />
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={22}
                  color={palette.textSecondary || '#64748B'}
                />
              </View>
              <Text style={styles.homeCardTitle}>{item.label}</Text>
              <Text style={styles.homeCardText}>{item.description}</Text>
              <Text style={styles.homeCardHint}>Abrir area</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default RhHomePage;
