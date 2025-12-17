import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Modal,
  Alert,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const API_BASE = "https://policysaath.com/api"

interface DuePolicy {
  _id: string;
  customerId: string;
  policyNumber: string;
  productName: string;
  policyType: string;
  premiumAmount: string;
  dueDate: string; // This maps to endDate from API
  status: 'Due' | 'Overdue' | 'Paid';
  company: string;
  isOverdue: boolean;
}

interface APIPolicy {
  _id: string;
  customerId: string;
  policyNumber: string;
  productName: string;
  policyType: string;
  premiumAmount: string;
  endDate: string;
  status: string;
  insuranceCompany?: string;
  company?: string;
}

interface FilterOptions {
  company: string;
  type: string;
  status: string;
  year: string;
}

const DuePaymentsScreen = () => {
  const navigation = useNavigation<any>();
  
  // State management
  const [duePolicies, setDuePolicies] = useState<DuePolicy[]>([]);
  const [filteredPolicies, setFilteredPolicies] = useState<DuePolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortBy, setSortBy] = useState('Newest First');
  const [showAlert, setShowAlert] = useState(true);
  
  // Dynamic filter options from API data
  const [availableCompanies, setAvailableCompanies] = useState<string[]>(['All Company']);
  const [availableTypes, setAvailableTypes] = useState<string[]>(['All Types']);
  
  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    company: 'All Company',
    type: 'All Types',
    status: 'All Status',
    year: new Date().getFullYear().toString()
  });

  // Fetch policies on mount and when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchDuePolicies();
    }, [])
  );

  useEffect(() => {
    applyFiltersAndSort();
  }, [duePolicies, filters, sortBy]);

  // Parse date from various formats (dd/mm/yyyy or other formats)
  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    
    // Try dd/mm/yyyy format first (common in Indian format)
    const ddmmyyyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ddmmyyyy) {
      const [, day, month, year] = ddmmyyyy;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    
    // Try ISO format or other standard formats
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
    
    return null;
  };

  // Determine if a policy is overdue based on end date
  const calculateStatus = (endDateStr: string): { status: 'Due' | 'Overdue' | 'Paid'; isOverdue: boolean } => {
    const endDate = parseDate(endDateStr);
    if (!endDate) {
      return { status: 'Due', isOverdue: false };
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    
    if (endDate < today) {
      return { status: 'Overdue', isOverdue: true };
    }
    return { status: 'Due', isOverdue: false };
  };

  // Extract company name from product name or use provided company
  const extractCompany = (policy: APIPolicy): string => {
    if (policy.insuranceCompany) return policy.insuranceCompany;
    if (policy.company) return policy.company;
    
    // Try to extract from product name
    const productName = policy.productName?.toUpperCase() || '';
    if (productName.includes('TATA')) return 'TATA';
    if (productName.includes('HDFC')) return 'HDFC';
    if (productName.includes('LIC')) return 'LIC';
    if (productName.includes('ICICI')) return 'ICICI';
    if (productName.includes('MAX')) return 'MAX';
    if (productName.includes('STAR')) return 'STAR';
    
    return 'Other';
  };

  const fetchDuePolicies = async () => {
    try {
      setLoading(true);
      
      // Get user from AsyncStorage (equivalent to localStorage in web)
      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) {
        console.warn('❌ User not found in storage');
        setLoading(false);
        return;
      }
      
      const user = JSON.parse(userStr);
      if (!user?.id && !user?._id) {
        console.warn('❌ User ID not found');
        setLoading(false);
        return;
      }
      
      const userId = user.id || user._id;
      console.log('📥 Fetching policies for user ID:', userId);
      
      // API call matching web app endpoint
      const response = await fetch(`${API_BASE}/v1/customer/customer-fetch-policy/${userId}`);
      const data = await response.json();
      
      console.log('📊 Fetched data:', data);
      
      if (response.ok && data.policyData) {
        // Transform API data to match DuePolicy interface
        // Filter only Due and Overdue policies (exclude Paid ones)
        const transformedPolicies: DuePolicy[] = data.policyData
          .map((policy: APIPolicy) => {
            const { status, isOverdue } = policy.status 
              ? { status: policy.status as 'Due' | 'Overdue' | 'Paid', isOverdue: policy.status === 'Overdue' }
              : calculateStatus(policy.endDate);
            
            return {
              _id: policy._id,
              customerId: policy.customerId,
              policyNumber: policy.policyNumber || 'N/A',
              productName: policy.productName || 'Unknown Policy',
              policyType: policy.policyType || 'General',
              premiumAmount: policy.premiumAmount?.toString() || '0',
              dueDate: policy.endDate || 'N/A',
              status,
              company: extractCompany(policy),
              isOverdue,
            };
          })
          .filter((policy: DuePolicy) => policy.status === 'Due' || policy.status === 'Overdue');
        
        setDuePolicies(transformedPolicies);
        
        // Update available filter options based on fetched data
        const companies = ['All Company', ...new Set(transformedPolicies.map(p => p.company))];
        const types = ['All Types', ...new Set(transformedPolicies.map(p => p.policyType).filter(Boolean))];
        
        setAvailableCompanies(companies as string[]);
        setAvailableTypes(types as string[]);
        
      } else {
        console.warn('⚠️ Unexpected policy data structure:', data);
        Alert.alert('Error', data.msg || 'Failed to fetch policies');
      }
    } catch (error) {
      console.error('🚫 Failed to fetch policies:', error);
      Alert.alert('Error', 'Failed to load due payments. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDuePolicies();
  };

  const applyFiltersAndSort = () => {
    let filtered = [...duePolicies];

    // Apply filters
    if (filters.company !== 'All Company') {
      filtered = filtered.filter(policy => policy.company === filters.company);
    }
    if (filters.type !== 'All Types') {
      filtered = filtered.filter(policy => policy.policyType === filters.type);
    }
    if (filters.status !== 'All Status') {
      filtered = filtered.filter(policy => policy.status === filters.status);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = parseDate(a.dueDate)?.getTime() || 0;
      const dateB = parseDate(b.dueDate)?.getTime() || 0;
      
      switch (sortBy) {
        case 'Newest First':
          return dateB - dateA;
        case 'Oldest First':
          return dateA - dateB;
        case 'Premium High to Low':
          return parseInt(b.premiumAmount) - parseInt(a.premiumAmount);
        case 'Premium Low to High':
          return parseInt(a.premiumAmount) - parseInt(b.premiumAmount);
        default:
          return 0;
      }
    });

    setFilteredPolicies(filtered);
  };

  const handlePayNow = (policy: DuePolicy) => {
    Alert.alert(
      policy.isOverdue ? 'Pay Overdue Premium' : 'Pay Premium',
      `Pay ₹${policy.premiumAmount} for ${policy.productName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: policy.isOverdue ? 'Pay Overdue' : 'Pay Now', 
          onPress: () => {
            // Implement payment logic here
            Alert.alert('Payment', 'Payment functionality would be implemented here');
          }
        }
      ]
    );
  };

  const clearAllFilters = () => {
    setFilters({
      company: 'All Company',
      type: 'All Types',
      status: 'All Status',
      year: new Date().getFullYear().toString()
    });
  };

  const applyFilters = () => {
    setShowFilterModal(false);
    applyFiltersAndSort();
  };

  const getOverdueCount = () => {
    return duePolicies.filter(policy => policy.status === 'Overdue').length;
  };

  const getDueCount = () => {
    return duePolicies.filter(policy => policy.status === 'Due').length;
  };

  const PolicyCard = ({ policy }: { policy: DuePolicy }) => (
    <TouchableOpacity
      style={styles.policyCard}
      onPress={() => navigation.navigate('PolicyDetails', {
        customerId: policy.customerId,
        policyId: policy._id,
        policyNumber: policy.policyNumber
      })}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.statusBadge, policy.isOverdue && styles.overdueBadge]}>
          <Text style={[styles.statusText, policy.isOverdue && styles.overdueStatusText]}>
            {policy.status}
          </Text>
        </View>
        <View style={styles.companySection}>
          <Text style={styles.companyName}>{policy.company}</Text>
          <View style={styles.companyLogo} />
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.policyType}>{policy.policyType}</Text>
        <Text style={styles.productName} numberOfLines={2}>
          {policy.productName
            ? policy.productName.split(" ").slice(0, 3).join(" ")
            : "N/A"}
        </Text>
        <Text style={styles.policyNumber}>{policy.policyNumber} 📋</Text>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.paymentInfo}>
          <Text style={styles.premiumLabel}>Premium : ₹{policy.premiumAmount}/Month</Text>
          <Text style={styles.dueLabel}>Due Date : {policy.dueDate}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.payButton, policy.isOverdue && styles.overduePayButton]}
          onPress={() => handlePayNow(policy)}
        >
          <Text style={styles.payButtonIcon}>{policy.isOverdue ? '⚠️' : '💳'}</Text>
          <Text style={styles.payButtonText}>
            {policy.isOverdue ? 'Pay Overdue' : 'Pay Now'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const FilterModal = () => (
    <Modal visible={showFilterModal} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.filterModal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Text style={styles.modalCloseIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Filter Policies</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Text style={styles.modalCloseIcon}>↓</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterContent}>
            {/* Company Filter - Dynamic from API data */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Company</Text>
              <View style={styles.filterRow}>
                {availableCompanies.map((company) => (
                  <TouchableOpacity
                    key={company}
                    style={[
                      styles.filterChip,
                      filters.company === company && styles.activeFilterChip
                    ]}
                    onPress={() => setFilters({...filters, company})}
                  >
                    <Text style={[
                      styles.filterChipText,
                      filters.company === company && styles.activeFilterChipText
                    ]}>
                      {company}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Type Filter - Dynamic from API data */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Type</Text>
              <View style={styles.filterRow}>
                {availableTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.filterChip,
                      filters.type === type && styles.activeFilterChip
                    ]}
                    onPress={() => setFilters({...filters, type})}
                  >
                    <Text style={[
                      styles.filterChipText,
                      filters.type === type && styles.activeFilterChipText
                    ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Status Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Status</Text>
              <View style={styles.filterRow}>
                {['All Status', 'Due', 'Overdue'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.filterChip,
                      filters.status === status && styles.activeFilterChip
                    ]}
                    onPress={() => setFilters({...filters, status})}
                  >
                    <Text style={[
                      styles.filterChipText,
                      filters.status === status && styles.activeFilterChipText
                    ]}>
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.clearButton} onPress={clearAllFilters}>
              <Text style={styles.clearButtonText}>Clear all</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
              <Text style={styles.applyButtonText}>Apply Filter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const SortDropdown = () => (
    <Modal visible={showSortDropdown} transparent animationType="fade">
      <TouchableOpacity 
        style={styles.dropdownOverlay} 
        onPress={() => setShowSortDropdown(false)}
      >
        <View style={styles.sortDropdown}>
          {['Newest First', 'Oldest First', 'Premium High to Low', 'Premium Low to High'].map((option) => (
            <TouchableOpacity
              key={option}
              style={styles.sortOption}
              onPress={() => {
                setSortBy(option);
                setShowSortDropdown(false);
              }}
            >
              <Text style={[
                styles.sortOptionText,
                sortBy === option && styles.activeSortText
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F9393" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Due Payments</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Filter Button */}
      <TouchableOpacity 
        style={styles.filterButton} 
        onPress={() => setShowFilterModal(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.filterIcon}>⚡</Text>
        <Text style={styles.filterText}>Filter Policies</Text>
        <Text style={styles.filterArrow}>▼</Text>
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.contentHeader}>
          <Text style={styles.sectionTitle}>Due Policies</Text>
          <TouchableOpacity 
            style={styles.sortButton}
            onPress={() => setShowSortDropdown(true)}
          >
            <Text style={styles.sortText}>Sort by: {sortBy}</Text>
            <Text style={styles.sortArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* Alert Banner - Similar to web app */}
        {showAlert && (getOverdueCount() > 0 || getDueCount() > 0) && (
          <View style={styles.alertBanner}>
            <Text style={styles.alertIcon}>⚠️</Text>
            <View style={styles.alertContent}>
              <Text style={styles.alertText}>
                You have <Text style={styles.overdueCount}>{getOverdueCount()} overdue</Text> and <Text style={styles.dueCount}>{getDueCount()} due</Text> policies
              </Text>
              <Text style={styles.alertSubtext}>Immediate attention required for overdue policies</Text>
            </View>
            <TouchableOpacity 
              style={styles.alertCloseButton}
              onPress={() => setShowAlert(false)}
            >
              <Text style={styles.alertCloseIcon}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Policy List */}
        <ScrollView 
          style={styles.policyList} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#1F9393']}
              tintColor="#1F9393"
            />
          }
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1F9393" />
              <Text style={styles.loadingText}>Loading due payments...</Text>
            </View>
          ) : filteredPolicies.length > 0 ? (
            filteredPolicies.map((policy) => (
              <PolicyCard key={policy._id} policy={policy} />
            ))
          ) : (
            <View style={styles.noPoliciesContainer}>
              <Text style={styles.noPoliciesEmoji}>🎉</Text>
              <Text style={styles.noPoliciesText}>No due payments found</Text>
              <Text style={styles.noPoliciesSubtext}>All your premiums are up to date!</Text>
            </View>
          )}

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>

      {/* Modals */}
      <FilterModal />
      <SortDropdown />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9F8',
  },
  header: {
    backgroundColor: '#1F9393',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  backButton: {
    // padding: 8,
  },
  backArrow: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  filterButton: {
    backgroundColor: '#1F9393',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 10,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#1F9393',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  filterIcon: {
    color: 'white',
    fontSize: 16,
    marginRight: 8,
  },
  filterText: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  filterArrow: {
    color: 'white',
    fontSize: 12,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F9393',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sortText: {
    fontSize: 12,
    color: '#1F9393',
    marginRight: 4,
  },
  sortArrow: {
    fontSize: 10,
    color: '#1F9393',
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  alertIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertText: {
    fontSize: 14,
    color: '#856404',
    fontWeight: '600',
    marginBottom: 4,
  },
  overdueCount: {
    color: '#E74C3C',
    fontWeight: 'bold',
  },
  dueCount: {
    color: '#F39C12',
    fontWeight: 'bold',
  },
  alertSubtext: {
    fontSize: 12,
    color: '#856404',
  },
  alertCloseButton: {
    padding: 4,
  },
  alertCloseIcon: {
    fontSize: 16,
    color: '#856404',
  },
  policyList: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#61BACA',
    marginTop: 12,
  },
  noPoliciesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noPoliciesEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  noPoliciesText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F9393',
    marginBottom: 8,
  },
  noPoliciesSubtext: {
    fontSize: 14,
    color: '#61BACA',
  },
  policyCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#1F9393',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#1F9393',
  },
  overdueBadge: {
    backgroundColor: '#FF6B6B',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  overdueStatusText: {
    color: 'white',
  },
  companySection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F9393',
    marginRight: 8,
  },
  companyLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E8F6F3',
  },
  cardBody: {
    marginBottom: 16,
  },
  policyType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F9393',
    marginBottom: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F9393',
    marginBottom: 8,
  },
  policyNumber: {
    fontSize: 14,
    color: '#61BACA',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  paymentInfo: {
    flex: 1,
  },
  premiumLabel: {
    fontSize: 14,
    color: '#1F9393',
    fontWeight: '600',
    marginBottom: 4,
  },
  dueLabel: {
    fontSize: 14,
    color: '#1F9393',
    fontWeight: '600',
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F9393',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  overduePayButton: {
    backgroundColor: '#FF6B6B',
  },
  payButtonIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  payButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: 20,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  filterModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F9F8',
  },
  modalCloseIcon: {
    fontSize: 24,
    color: '#1F9393',
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F9393',
  },
  filterContent: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F9F8',
    borderWidth: 1,
    borderColor: '#E8F6F3',
    marginRight: 8,
    marginBottom: 8,
  },
  activeFilterChip: {
    backgroundColor: '#1F9393',
    borderColor: '#1F9393',
  },
  filterChipText: {
    fontSize: 14,
    color: '#61BACA',
  },
  activeFilterChipText: {
    color: 'white',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#1F9393',
  },
  clearButtonText: {
    color: '#1F9393',
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#1F9393',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Dropdown Styles
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 180,
    paddingRight: 20,
  },
  sortDropdown: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  sortOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  sortOptionText: {
    fontSize: 14,
    color: '#2D3748',
  },
  activeSortText: {
    color: '#1F9393',
    fontWeight: '600',
  },
});

export default DuePaymentsScreen;