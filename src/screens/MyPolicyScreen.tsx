import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Modal,
  Alert,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// Configuration - Update this to match your server URL
const API_CONFIG = {
  BASE_URL: 'http://10.0.2.2:5000', // Change to your server URL
  ENDPOINTS: {
    FETCH_POLICIES: (customerId: string) => `/v1/customer/customer-fetch-policy/${customerId}`,
  }
};

interface Policy {
  _id: string;
  customerId: string;
  policyNumber: string;
  productName: string;
  policyType: string;
  premiumAmount: string;
  endDate: string;
  status: string;
  company?: string;
  startDate?: string;
  coverageDetails?: any;
  policyPeriod?: string;
  tenure?: string;
}

interface FilterOptions {
  company: string;
  type: string;
  status: string;
  year: string;
  premiumRange: [number, number];
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  policyData?: T;
}

const MyPolicyScreen = () => {
  const navigation = useNavigation<any>();
  
  // State management
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [filteredPolicies, setFilteredPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortBy, setSortBy] = useState('Newest First');
  
  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    company: 'All Company',
    type: 'All Types',
    status: 'All Status',
    year: '2025',
    premiumRange: [0, 10000000]
  });

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchPolicies();
    }
  }, [userId]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [policies, filters, sortBy]);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setUserId(user.id);
      } else {
        // If no user data, navigate to login
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Failed to load user data');
      setLoading(false);
    }
  };

  const fetchPolicies = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);

      if (!userId) {
        setError('User ID not found');
        return;
      }

      console.log('Fetching policies for user ID:', userId);
      const apiUrl = `${API_CONFIG.BASE_URL}/v1/customer/customer-fetch-policy/${userId}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('API Response status:', response.status);

      if (!response.ok) {
        if (response.status === 404) {
          // No policies found - this is normal for new users
          setPolicies([]);
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data: ApiResponse<Policy[]> = await response.json();
      console.log('API Response:', data);

      if (data.policyData && Array.isArray(data.policyData)) {
        setPolicies(data.policyData);
        console.log('Policies loaded successfully:', data.policyData.length);
      } else {
        setPolicies([]);
        console.log('No policies found in response');
      }

    } catch (error) {
      console.error('Error fetching policies:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch policies');
      setPolicies([]);
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPolicies(true);
  };

  const applyFiltersAndSort = () => {
    let filtered = [...policies];

    // Apply filters
    if (filters.company !== 'All Company') {
      filtered = filtered.filter(policy => {
        const company = getCompanyName(policy.policyType || '');
        return company === filters.company;
      });
    }
    
    if (filters.type !== 'All Types') {
      filtered = filtered.filter(policy => policy.policyType === filters.type);
    }
    
    if (filters.status !== 'All Status') {
      filtered = filtered.filter(policy => policy.status === filters.status);
    }

    // Apply premium range filter
    filtered = filtered.filter(policy => {
      const premium = parseInt(policy.premiumAmount?.toString().replace(/[^0-9]/g, '') || '0');
      return premium >= filters.premiumRange[0] && premium <= filters.premiumRange[1];
    });

    // Apply year filter based on endDate
    if (filters.year !== 'All Years') {
      filtered = filtered.filter(policy => {
        if (!policy.endDate) return false;
        const year = policy.endDate.includes('/') ? 
          policy.endDate.split('/')[2] : 
          policy.endDate.split('-')[0];
        return year === filters.year;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'Newest First':
          return new Date(formatDateForSort(b.endDate)).getTime() - new Date(formatDateForSort(a.endDate)).getTime();
        case 'Oldest First':
          return new Date(formatDateForSort(a.endDate)).getTime() - new Date(formatDateForSort(b.endDate)).getTime();
        case 'Premium High to Low':
          return parseInt(b.premiumAmount?.toString().replace(/[^0-9]/g, '') || '0') - 
                 parseInt(a.premiumAmount?.toString().replace(/[^0-9]/g, '') || '0');
        case 'Premium Low to High':
          return parseInt(a.premiumAmount?.toString().replace(/[^0-9]/g, '') || '0') - 
                 parseInt(b.premiumAmount?.toString().replace(/[^0-9]/g, '') || '0');
        default:
          return 0;
      }
    });

    setFilteredPolicies(filtered);
  };

  const formatDateForSort = (dateString: string) => {
    if (!dateString) return new Date();
    
    // Handle DD/MM/YYYY format
    if (dateString.includes('/')) {
      const [day, month, year] = dateString.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    // Already in YYYY-MM-DD format
    return dateString;
  };

  const getCompanyName = (policyType: string) => {
    if (!policyType) return 'Insurance Co.';
    const type = policyType.toLowerCase();
    if (type.includes('hdfc')) return 'HDFC';
    if (type.includes('icici')) return 'ICICI';
    if (type.includes('tata')) return 'TATA';
    if (type.includes('lic')) return 'LIC';
    if (type.includes('bajaj')) return 'BAJAJ';
    return 'Insurance Co.';
  };

  const formatPremium = (amount: string | number) => {
    if (!amount) return '0';
    const numericAmount = typeof amount === 'string' ? 
      parseInt(amount.replace(/[^0-9]/g, '')) : amount;
    
    if (isNaN(numericAmount)) return '0';
    
    return numericAmount.toLocaleString('en-IN');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    // Handle different date formats from backend
    if (dateString.includes('/')) {
      return dateString; // Already in DD/MM/YYYY format
    }
    if (dateString.includes('-')) {
      // Convert YYYY-MM-DD to DD/MM/YYYY
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    }
    return dateString;
  };

  const handlePolicyPress = (policy: Policy) => {
    navigation.navigate('PolicyDetails', {
      customerId: policy.customerId,
      policyId: policy._id,
      policyNumber: policy.policyNumber
    });
  };

  const handleAddNewPolicy = () => {
    navigation.navigate('ChooseCompany');
  };

  const clearAllFilters = () => {
    setFilters({
      company: 'All Company',
      type: 'All Types',
      status: 'All Status',
      year: '2025',
      premiumRange: [0, 100000]
    });
  };

  const applyFilters = () => {
    setShowFilterModal(false);
    applyFiltersAndSort();
  };

  // Get unique companies from policies for filter options
  const getUniqueCompanies = () => {
    const companies = policies.map(policy => getCompanyName(policy.policyType || ''));
    return ['All Company', ...Array.from(new Set(companies))];
  };

  // Get unique policy types for filter options
  const getUniquePolicyTypes = () => {
    const types = policies.map(policy => policy.policyType).filter(Boolean);
    return ['All Types', ...Array.from(new Set(types))];
  };

  // Get unique statuses for filter options
  const getUniqueStatuses = () => {
    const statuses = policies.map(policy => policy.status).filter(Boolean);
    return ['All Status', ...Array.from(new Set(statuses))];
  };

  const PolicyCard = ({ policy, index }: { policy: Policy; index: number }) => {
    const isSelected = index === 0; // First card is selected in your design
    
    return (
      <TouchableOpacity
        style={[styles.policyCard, isSelected && styles.selectedPolicyCard]}
        onPress={() => handlePolicyPress(policy)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={[
            styles.statusBadge, 
            (policy.status === 'Due' || policy.status === 'Overdue') && styles.dueBadge
          ]}>
            <Text style={[
              styles.statusText, 
              (policy.status === 'Due' || policy.status === 'Overdue') && styles.dueStatusText
            ]}>
              {policy.status || 'Active'}
            </Text>
          </View>
          <View style={styles.companySection}>
            <Text style={styles.companyName}>
              {getCompanyName(policy.policyType || '')}
            </Text>
            <View style={styles.companyLogo} />
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.policyType}>{policy.policyType || 'Insurance Policy'}</Text>
          <Text style={styles.productName}>
            {policy.productName && policy.productName.length > 20 ? 
              policy.productName.substring(0, 20) + '...' : 
              policy.productName || 'Policy Coverage'}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.premiumSection}>
            <Text style={styles.premiumLabel}>Premium :</Text>
            <Text style={styles.premiumAmount}>
              ₹{formatPremium(policy.premiumAmount || '0')} / Year
            </Text>
          </View>
          <View style={styles.expirySection}>
            <Text style={styles.expiryLabel}>Expires :</Text>
            <Text style={styles.expiryDate}>{formatDate(policy.endDate)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
              <Text style={styles.modalCloseIcon}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterContent}>
            {/* Company Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Company</Text>
              <View style={styles.filterRow}>
                {getUniqueCompanies().map((company) => (
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

            {/* Type Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Type</Text>
              <View style={styles.filterRow}>
                {getUniquePolicyTypes().slice(0, 6).map((type) => (
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
                {getUniqueStatuses().map((status) => (
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

            {/* Year Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Year</Text>
              <View style={styles.filterRow}>
                {['2023', '2024', '2025', '2026'].map((year) => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.filterChip,
                      filters.year === year && styles.activeFilterChip
                    ]}
                    onPress={() => setFilters({...filters, year})}
                  >
                    <Text style={[
                      styles.filterChipText,
                      filters.year === year && styles.activeFilterChipText
                    ]}>
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Premium Range */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Premium Range</Text>
              <View style={styles.rangeContainer}>
                <Text style={styles.rangeText}>
                  ₹{filters.premiumRange[0].toLocaleString()} - ₹{filters.premiumRange[1].toLocaleString()}
                </Text>
                <View style={styles.rangeSlider}>
                  <View style={styles.rangeTrack} />
                  <View style={styles.rangeThumb} />
                  <View style={[styles.rangeThumb, styles.rangeThumbRight]} />
                </View>
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

  // Error state
  if (error && !policies.length && !loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#4ECDC4" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Policy</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchPolicies()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4ECDC4" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Policy</Text>
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
          <Text style={styles.sectionTitle}>Your Policies</Text>
          <TouchableOpacity 
            style={styles.sortButton}
            onPress={() => setShowSortDropdown(true)}
          >
            <Text style={styles.sortText}>Sort by: {sortBy}</Text>
            <Text style={styles.sortArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* Policy List */}
        <ScrollView 
          style={styles.policyList} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#4ECDC4']}
              tintColor="#4ECDC4"
            />
          }
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4ECDC4" />
              <Text style={styles.loadingText}>Loading policies...</Text>
            </View>
          ) : filteredPolicies.length > 0 ? (
            filteredPolicies.map((policy, index) => (
              <PolicyCard key={policy._id} policy={policy} index={index} />
            ))
          ) : (
            <View style={styles.noPoliciesContainer}>
              <Text style={styles.noPoliciesText}>
                {policies.length === 0 ? 'No policies found' : 'No policies match your filters'}
              </Text>
              <Text style={styles.noPoliciesSubtext}>
                {policies.length === 0 ? 
                  'Add your first policy to get started' : 
                  'Try adjusting your filters'}
              </Text>
              {policies.length === 0 && (
                <TouchableOpacity 
                  style={styles.addFirstPolicyButton}
                  onPress={handleAddNewPolicy}
                  activeOpacity={0.8}
                >
                  <Text style={styles.addFirstPolicyButtonText}>Add Your First Policy</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Add New Policy Button - Only show if there are existing policies */}
          {filteredPolicies.length > 0 && (
            <TouchableOpacity 
              style={styles.addNewButton}
              onPress={handleAddNewPolicy}
              activeOpacity={0.8}
            >
              <Text style={styles.addNewButtonText}>+ Add New Policies</Text>
            </TouchableOpacity>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#4ECDC4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 8,
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
    backgroundColor: '#4ECDC4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 10,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#4ECDC4',
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
    color: '#4ECDC4',
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
    color: '#4ECDC4',
    marginRight: 4,
  },
  sortArrow: {
    fontSize: 10,
    color: '#4ECDC4',
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
    marginTop: 16,
  },
  noPoliciesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noPoliciesText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginBottom: 8,
  },
  noPoliciesSubtext: {
    fontSize: 14,
    color: '#61BACA',
    textAlign: 'center',
    marginBottom: 20,
  },
  addFirstPolicyButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  addFirstPolicyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  policyCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  selectedPolicyCard: {
    borderWidth: 2,
    borderColor: '#4ECDC4',
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
    backgroundColor: '#E6F7F5',
  },
  dueBadge: {
    backgroundColor: '#4ECDC4',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4ECDC4',
  },
  dueStatusText: {
    color: 'white',
  },
  companySection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4ECDC4',
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
    color: '#4ECDC4',
    marginBottom: 4,
  },
  productName: {
    fontSize: 14,
    color: '#61BACA',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  premiumSection: {
    flex: 1,
  },
  premiumLabel: {
    fontSize: 12,
    color: '#61BACA',
    marginBottom: 4,
  },
  premiumAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4ECDC4',
  },
  expirySection: {
    alignItems: 'flex-end',
  },
  expiryLabel: {
    fontSize: 12,
    color: '#61BACA',
    marginBottom: 4,
  },
  expiryDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4ECDC4',
  },
  addNewButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 20,
  },
  addNewButtonText: {
    color: 'white',
    fontSize: 16,
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
    color: '#4ECDC4',
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4ECDC4',
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
    marginBottom: 8,
  },
  activeFilterChip: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  filterChipText: {
    fontSize: 14,
    color: '#61BACA',
  },
  activeFilterChipText: {
    color: 'white',
  },
  rangeContainer: {
    marginTop: 8,
  },
  rangeText: {
    fontSize: 14,
    color: '#4ECDC4',
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  rangeSlider: {
    height: 40,
    justifyContent: 'center',
    position: 'relative',
  },
  rangeTrack: {
    height: 4,
    backgroundColor: '#4ECDC4',
    borderRadius: 2,
  },
  rangeThumb: {
    position: 'absolute',
    left: 20,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    borderWidth: 3,
    borderColor: '#4ECDC4',
  },
  rangeThumbRight: {
    left: width - 100,
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
    borderColor: '#4ECDC4',
  },
  clearButtonText: {
    color: '#4ECDC4',
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#4ECDC4',
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
    color: '#4ECDC4',
    fontWeight: '600',
  },
});

export default MyPolicyScreen;