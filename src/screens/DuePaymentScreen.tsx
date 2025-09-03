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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface DuePolicy {
  _id: string;
  customerId: string;
  policyNumber: string;
  productName: string;
  policyType: string;
  premiumAmount: string;
  dueDate: string;
  status: 'Due' | 'Overdue';
  company: string;
  isOverdue: boolean;
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
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortBy, setSortBy] = useState('Newest First');
  
  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    company: 'All Company',
    type: 'All Types',
    status: 'All Status',
    year: '2025'
  });

  // Sample data - replace with API call
  const sampleDuePolicies: DuePolicy[] = [
    {
      _id: '1',
      customerId: 'user123',
      policyNumber: '778999',
      productName: 'TATA AIA Life',
      policyType: 'Life Insurance',
      premiumAmount: '1900',
      dueDate: '24 Jan 2025',
      status: 'Due',
      company: 'TATA',
      isOverdue: false
    },
    {
      _id: '2',
      customerId: 'user123',
      policyNumber: '778999',
      productName: 'TATA AIA Life',
      policyType: 'Life Insurance',
      premiumAmount: '1900',
      dueDate: '24 Jan 2025',
      status: 'Due',
      company: 'TATA',
      isOverdue: false
    }
  ];

  useEffect(() => {
    fetchDuePolicies();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [duePolicies, filters, sortBy]);

  const fetchDuePolicies = async () => {
    try {
      // Replace with actual API call to get due policies
      setTimeout(() => {
        setDuePolicies(sampleDuePolicies);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching due policies:', error);
      setLoading(false);
    }
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
      switch (sortBy) {
        case 'Newest First':
          return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
        case 'Oldest First':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
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
      'Pay Premium',
      `Pay ₹${policy.premiumAmount} for ${policy.productName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Pay Now', 
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
      year: '2025'
    });
  };

  const applyFilters = () => {
    setShowFilterModal(false);
    applyFiltersAndSort();
  };

  const getOverdueCount = () => {
    return duePolicies.filter(policy => policy.isOverdue).length;
  };

  const getDueCount = () => {
    return duePolicies.filter(policy => !policy.isOverdue).length;
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
        <Text style={styles.productName}>{policy.productName}</Text>
        <Text style={styles.policyNumber}>{policy.policyNumber} 📋</Text>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.paymentInfo}>
          <Text style={styles.premiumLabel}>Premium : ₹{policy.premiumAmount}/Month</Text>
          <Text style={styles.dueLabel}>Due Date : {policy.dueDate}</Text>
        </View>
        <TouchableOpacity 
          style={styles.payButton}
          onPress={() => handlePayNow(policy)}
        >
          <Text style={styles.payButtonIcon}>💳</Text>
          <Text style={styles.payButtonText}>Pay Now</Text>
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
            {/* Company Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Company</Text>
              <View style={styles.filterRow}>
                {['All Company', 'TATA', 'HDFC', 'LIC', 'ICICI'].map((company) => (
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
                {['All Types', 'Life Insurance', 'Health Insurance', 'Motor Insurance'].map((type) => (
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
      <StatusBar barStyle="light-content" backgroundColor="#4ECDC4" />
      
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

        {/* Alert Banner */}
        <View style={styles.alertBanner}>
          <Text style={styles.alertIcon}>⚠️</Text>
          <View style={styles.alertContent}>
            <Text style={styles.alertText}>
              You have <Text style={styles.overdueCount}>{getOverdueCount()} overdue</Text> and <Text style={styles.dueCount}>{getDueCount()} due</Text> policies
            </Text>
            <Text style={styles.alertSubtext}>Immediate attention required for overdue policies</Text>
          </View>
        </View>

        {/* Policy List */}
        <ScrollView style={styles.policyList} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading due payments...</Text>
            </View>
          ) : filteredPolicies.length > 0 ? (
            filteredPolicies.map((policy) => (
              <PolicyCard key={policy._id} policy={policy} />
            ))
          ) : (
            <View style={styles.noPoliciesContainer}>
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
    backgroundColor: '#4ECDC4',
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4ECDC4',
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
    color: '#4ECDC4',
    fontWeight: '600',
    marginBottom: 4,
  },
  dueLabel: {
    fontSize: 14,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
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
  // Modal Styles (reused from My Policy screen)
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

export default DuePaymentsScreen;