import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
  Linking,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// API Base URL - same as other screens
const API_BASE = 'https://policysaath.com/api/';

interface PolicyDetails {
  _id: string;
  customerId: string;
  policyNumber: string;
  productName: string;
  policyType: string;
  premiumAmount: string;
  endDate: string;
  startDate?: string;
  status: string;
  company?: string;
  policyHolderName?: string;
  policyHolderAddress?: string;
  policyHolderPhone?: string;
  policyHolderEmail?: string;
  agentName?: string;
  agentContact?: string;
  agentEmail?: string;
  agentPhone?: string;
  policyTerm?: string;
  policyPeriod?: string;
  tenure?: string;
  coverage?: string;
  coverageDetails?: any;
  insuredMembers?: Array<{
    insuredName?: string;
    name?: string;
    relationship?: string;
    relation?: string;
    dob?: string;
    dateOfBirth?: string;
  }>;
}

interface ApiResponse {
  success: boolean;
  policy?: PolicyDetails;
  message?: string;
}

const PolicyOverviewScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [policyDetails, setPolicyDetails] = useState<PolicyDetails | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Get route parameters
  const { customerId, policyId, policyNumber } = route.params || {};

  useEffect(() => {
    if (customerId && policyId && policyNumber) {
      fetchPolicyDetails();
    } else {
      setError('Missing required parameters');
      setLoading(false);
    }
  }, [customerId, policyId, policyNumber]);

  const fetchPolicyDetails = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);

      console.log('Fetching policy details:', {
        customerId,
        policyId,
        policyNumber,
      });

      // Use the policy details API endpoint
      const apiUrl = `${API_BASE}/v1/customer/${customerId}/${policyId}/${policyNumber}`;
      console.log('API URL:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('API Response status:', response.status);

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // If not JSON, might be HTML error page - try fetching from policyData instead
        console.log('Response not JSON, trying alternate approach...');

        // Fallback: fetch all policies and find the matching one
        const fallbackUrl = `${API_BASE}/v1/customer/customer-fetch-policy/${customerId}`;
        const fallbackResponse = await fetch(fallbackUrl);
        const fallbackData = await fallbackResponse.json();

        if (fallbackResponse.ok && fallbackData.policyData) {
          const matchingPolicy = fallbackData.policyData.find(
            (p: any) => p._id === policyId || p.policyNumber === policyNumber,
          );

          if (matchingPolicy) {
            setPolicyDetails(matchingPolicy);
            console.log('Policy details loaded from fallback');
            return;
          }
        }
        throw new Error('Policy not found');
      }

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Policy not found');
        }
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('Policy details response:', JSON.stringify(data, null, 2));

      // Handle different response structures
      if (data.policy) {
        setPolicyDetails(data.policy);
        console.log('Policy details loaded successfully');
      } else if (data.policyData) {
        // If response has policyData array, find matching policy
        const matchingPolicy = Array.isArray(data.policyData)
          ? data.policyData.find(
              (p: any) => p._id === policyId || p.policyNumber === policyNumber,
            )
          : data.policyData;

        if (matchingPolicy) {
          setPolicyDetails(matchingPolicy);
          console.log('Policy details loaded from policyData');
        } else {
          throw new Error('Policy not found in response');
        }
      } else if (data._id) {
        // Response is the policy object directly
        setPolicyDetails(data);
        console.log('Policy details loaded directly');
      } else {
        throw new Error('Policy data not found in response');
      }
    } catch (error) {
      console.error('Error fetching policy details:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to fetch policy details',
      );
      setPolicyDetails(null);
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPolicyDetails(true);
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

  const formatPremium = (amount: string | number) => {
    if (!amount) return '0';
    const numericAmount =
      typeof amount === 'string'
        ? parseInt(amount.replace(/[^0-9]/g, ''))
        : amount;

    if (isNaN(numericAmount)) return '0';

    return numericAmount.toLocaleString('en-IN');
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

  const getPolicyPeriod = (startDate?: string, endDate?: string) => {
    if (startDate && endDate) {
      return `${formatDate(startDate)} to ${formatDate(endDate)}`;
    }
    if (endDate) {
      // Assume 1 year policy if only end date is available
      const endYear = endDate.includes('/')
        ? endDate.split('/')[2]
        : endDate.split('-')[0];
      const startYear = (parseInt(endYear) - 1).toString();
      return `01/01/${startYear} to 31/12/${endYear}`;
    }
    return 'N/A';
  };

  const handleDownloadPolicy = () => {
    Alert.alert(
      'Download Policy',
      'Policy document download feature will be implemented soon.',
      [{ text: 'OK' }],
    );
  };

  const handlePayPremium = () => {
    Alert.alert(
      'Pay Premium',
      'Premium payment feature will be implemented soon.',
      [{ text: 'OK' }],
    );
  };

  const handleContactSupport = () => {
    Alert.alert('Contact Support', 'Choose contact method:', [
      { text: 'Call', onPress: () => handleCall('1800-XXX-XXXX') },
      { text: 'Email', onPress: () => handleEmail('support@insurance.com') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleChatWithAgent = () => {
    if (policyDetails?.agentPhone || policyDetails?.agentContact) {
      const phoneNumber =
        policyDetails.agentPhone || policyDetails.agentContact;
      Alert.alert(
        'Contact Agent',
        `Contact ${policyDetails.agentName || 'your agent'}?`,
        [
          { text: 'Call', onPress: () => handleCall(phoneNumber || '') },
          {
            text: 'Email',
            onPress: () => handleEmail(policyDetails.agentEmail || ''),
          },
          { text: 'Cancel', style: 'cancel' },
        ],
      );
    } else {
      Alert.alert('Chat with Agent', 'Agent contact information not available');
    }
  };

  const handleCall = (phoneNumber: string) => {
    if (phoneNumber && phoneNumber.trim()) {
      Linking.openURL(`tel:${phoneNumber}`).catch(err =>
        Alert.alert('Error', 'Unable to make phone call'),
      );
    } else {
      Alert.alert('Error', 'Phone number not available');
    }
  };

  const handleEmail = (email: string) => {
    if (email && email.trim()) {
      Linking.openURL(`mailto:${email}`).catch(err =>
        Alert.alert('Error', 'Unable to open email client'),
      );
    } else {
      Alert.alert('Error', 'Email address not available');
    }
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1F9393" />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerBackButton}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Policy Overview</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1F9393" />
          <Text style={styles.loadingText}>Loading policy details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !policyDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1F9393" />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerBackButton}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Policy Overview</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error || 'Policy not found'}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchPolicyDetails()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F9393" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerBackButton}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Policy Overview</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
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
        {/* Policy Card */}
        <View style={styles.policyCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.companyName}>
              {getCompanyName(policyDetails.policyType || '')}
            </Text>
            <View style={styles.companyLogo} />
          </View>

          <Text style={styles.policyName}>
            {policyDetails.productName || 'Insurance Policy'}
          </Text>
          <Text style={styles.policyAddress}>
            {policyDetails.policyHolderAddress || 'Address not available'}
          </Text>
          <Text style={styles.policyNumber}>
            Policy Number: {policyDetails.policyNumber}
          </Text>
          <Text style={styles.validPeriod}>
            Valid Period:{' '}
            {getPolicyPeriod(policyDetails.startDate, policyDetails.endDate)}
          </Text>

          <View style={styles.cardFooter}>
            <View style={styles.premiumInfo}>
              <Text style={styles.premiumLabel}>
                Premium: ₹{formatPremium(policyDetails.premiumAmount)} /{' '}
                {policyDetails.policyPeriod?.toLowerCase().includes('month')
                  ? 'Month'
                  : 'Year'}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.statusBadge,
                policyDetails.status?.toLowerCase() === 'active' &&
                  styles.activeStatusBadge,
                policyDetails.status?.toLowerCase() === 'due' &&
                  styles.dueStatusBadge,
                policyDetails.status?.toLowerCase() === 'expired' &&
                  styles.expiredStatusBadge,
              ]}
            >
              <Text style={styles.statusText}>
                {policyDetails.status || 'Active'} Insurance
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <TouchableOpacity
              style={{
                backgroundColor: 'red',
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                width: '50%',
              }}
              onPress={() => {
                console.log('change status', { customerId, policyId });
              }}
            >
              <Text style={{ color: '#eee', textAlign: 'center' }}>
                Change Status
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
            onPress={() => setActiveTab('overview')}
          >
            {/* <Text style={styles.tabIcon}>👁</Text> */}
            <Text
              style={[
                styles.tabText,
                activeTab === 'overview' && styles.activeTabText,
              ]}
            >
              Overview
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'documents' && styles.activeTab]}
            onPress={() => setActiveTab('documents')}
          >
            {/* <Text style={styles.tabIcon}>📄</Text> */}
            <Text
              style={[
                styles.tabText,
                activeTab === 'documents' && styles.activeTabText,
              ]}
            >
              Documents
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'pay' && styles.activeTab]}
            onPress={() => setActiveTab('pay')}
          >
            {/* <Text style={styles.tabIcon}>💳</Text> */}
            <Text
              style={[
                styles.tabText,
                activeTab === 'pay' && styles.activeTabText,
              ]}
            >
              Pay Record
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content Sections */}
        {activeTab === 'overview' && (
          <>
            {/* Policy Holder Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Policy Holder Details</Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>FULL NAME</Text>
                <Text style={styles.detailValue}>
                  {policyDetails.policyHolderName || 'Not available'}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>ADDRESS</Text>
                <Text style={styles.detailValue}>
                  {policyDetails.policyHolderAddress || 'Address not available'}
                </Text>
              </View>

              <View style={styles.detailRowDouble}>
                <View style={styles.detailColumn}>
                  <Text style={styles.detailLabel}>PHONE</Text>
                  <TouchableOpacity
                    onPress={() =>
                      handleCall(policyDetails.policyHolderPhone || '')
                    }
                    disabled={!policyDetails.policyHolderPhone}
                  >
                    <Text
                      style={[
                        styles.detailValue,
                        policyDetails.policyHolderPhone && styles.linkText,
                      ]}
                    >
                      {policyDetails.policyHolderPhone || 'Not available'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.detailColumn}>
                  <Text style={styles.detailLabel}>EMAIL</Text>
                  <TouchableOpacity
                    onPress={() =>
                      handleEmail(policyDetails.policyHolderEmail || '')
                    }
                    disabled={!policyDetails.policyHolderEmail}
                  >
                    <Text
                      style={[
                        styles.detailValue,
                        policyDetails.policyHolderEmail && styles.linkText,
                      ]}
                    >
                      {policyDetails.policyHolderEmail || 'Not available'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Covered Members */}
            {policyDetails.insuredMembers &&
              policyDetails.insuredMembers.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Covered Members</Text>

                  {policyDetails.insuredMembers.map((member, index) => (
                    <View key={index} style={styles.memberCard}>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>
                          FULL NAME{' '}
                          {index === 0
                            ? '(PRIMARY MEMBER)'
                            : `(MEMBER ${index + 1})`}
                        </Text>
                        <Text style={styles.detailValue}>
                          {member.insuredName || member.name || 'Not available'}
                        </Text>
                      </View>

                      <View style={styles.detailRowDouble}>
                        <View style={styles.detailColumn}>
                          <Text style={styles.detailLabel}>RELATION</Text>
                          <Text style={styles.detailValue}>
                            {member.relationship ||
                              member.relation ||
                              'Not specified'}
                          </Text>
                        </View>
                        <View style={styles.detailColumn}>
                          <Text style={styles.detailLabel}>DATE OF BIRTH</Text>
                          <Text style={styles.detailValue}>
                            {formatDate(member.dob || member.dateOfBirth || '')}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}

            {/* Agent and Company Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Agent and Company Details</Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>INSURANCE COMPANY</Text>
                <Text style={styles.detailValue}>
                  {policyDetails.productName ||
                    getCompanyName(policyDetails.policyType || '')}
                </Text>
              </View>

              <View style={styles.detailRowDouble}>
                <View style={styles.detailColumn}>
                  <Text style={styles.detailLabel}>AGENT NAME</Text>
                  <Text style={styles.detailValue}>
                    {policyDetails.agentName || 'Not assigned'}
                  </Text>
                </View>
                <View style={styles.detailColumn}>
                  <Text style={styles.detailLabel}>AGENT CONTACT</Text>
                  <TouchableOpacity
                    onPress={() =>
                      handleCall(
                        policyDetails.agentContact ||
                          policyDetails.agentPhone ||
                          '',
                      )
                    }
                    disabled={
                      !policyDetails.agentContact && !policyDetails.agentPhone
                    }
                  >
                    <Text
                      style={[
                        styles.detailValue,
                        (policyDetails.agentContact ||
                          policyDetails.agentPhone) &&
                          styles.linkText,
                      ]}
                    >
                      {policyDetails.agentContact ||
                        policyDetails.agentPhone ||
                        'Not available'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.detailRowDouble}>
                <View style={styles.detailColumn}>
                  <Text style={styles.detailLabel}>POLICY TYPE</Text>
                  <Text style={styles.detailValue}>
                    {policyDetails.policyType || 'Not specified'}
                  </Text>
                </View>
                <View style={styles.detailColumn}>
                  <Text style={styles.detailLabel}>AGENT EMAIL</Text>
                  <TouchableOpacity
                    onPress={() => handleEmail(policyDetails.agentEmail || '')}
                    disabled={!policyDetails.agentEmail}
                  >
                    <Text
                      style={[
                        styles.detailValue,
                        policyDetails.agentEmail && styles.linkText,
                      ]}
                    >
                      {policyDetails.agentEmail || 'Not available'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Policy Summary */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Policy Summary</Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>PREMIUM</Text>
                <Text style={styles.detailValue}>
                  ₹ {formatPremium(policyDetails.premiumAmount)} /{' '}
                  {policyDetails.policyPeriod?.toLowerCase().includes('month')
                    ? 'month'
                    : 'year'}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>POLICY TERM</Text>
                <Text style={styles.detailValue}>
                  {policyDetails.policyTerm ||
                    policyDetails.tenure ||
                    'Not specified'}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>MEMBERS</Text>
                <Text style={styles.detailValue}>
                  {policyDetails.insuredMembers?.length || 1} member
                  {(policyDetails.insuredMembers?.length || 1) > 1 ? 's' : ''}
                </Text>
              </View>

              {policyDetails.coverage && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>COVERAGE</Text>
                  <Text style={styles.detailValue}>
                    {policyDetails.coverage}
                  </Text>
                </View>
              )}
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleDownloadPolicy}
              >
                <Text style={styles.actionButtonText}>Download My Policy</Text>
                <Text style={styles.actionButtonIcon}>⬇</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handlePayPremium}
              >
                <Text style={styles.actionButtonText}>Pay Premium Now</Text>
                <Text style={styles.actionButtonIcon}>💳</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleContactSupport}
              >
                <Text style={styles.actionButtonText}>Contact Support</Text>
                <Text style={styles.actionButtonIcon}>📞</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleChatWithAgent}
              >
                <Text style={styles.actionButtonText}>Chat with Agent</Text>
                <Text style={styles.actionButtonIcon}>💬</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {activeTab === 'documents' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Policy Documents</Text>
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Document management coming soon
              </Text>
              <Text style={styles.emptyStateSubtext}>
                You will be able to view and download policy documents here
              </Text>
            </View>
          </View>
        )}

        {activeTab === 'pay' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Records</Text>
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Payment history coming soon
              </Text>
              <Text style={styles.emptyStateSubtext}>
                You will be able to view your payment history and due dates here
              </Text>
            </View>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9F8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#61BACA',
    marginTop: 16,
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
    backgroundColor: '#1F9393',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 10,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#1F9393',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  backButtonText: {
    color: '#1F9393',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#1F9393',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  headerBackButton: {
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
  content: {
    flex: 1,
    padding: 20,
  },
  policyCard: {
    backgroundColor: '#6FD0CD',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#1F9393',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  companyName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  companyLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  policyName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  policyAddress: {
    color: 'white',
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  policyNumber: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginBottom: 4,
  },
  validPeriod: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  premiumInfo: {
    flex: 1,
  },
  premiumLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    backgroundColor: '#1F9393',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  activeStatusBadge: {
    backgroundColor: '#10B981',
  },
  dueStatusBadge: {
    backgroundColor: '#F59E0B',
  },
  expiredStatusBadge: {
    backgroundColor: '#EF4444',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    shadowColor: '#1F9393',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#1F9393',
  },
  tabIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  tabText: {
    fontSize: 14,
    color: '#61BACA',
    fontWeight: '600',
  },
  activeTabText: {
    color: 'white',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#1F9393',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F9393',
    marginBottom: 16,
  },
  detailRow: {
    marginBottom: 16,
  },
  detailRowDouble: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailColumn: {
    flex: 0.48,
  },
  detailLabel: {
    fontSize: 12,
    color: '#9CD1CE',
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 14,
    color: '#2D3748',
    fontWeight: '500',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    minHeight: 44,
    textAlignVertical: 'center',
  },
  linkText: {
    color: '#1F9393',
    textDecorationLine: 'underline',
  },
  memberCard: {
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#1F9393',
    paddingLeft: 12,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0F9F8',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8F6F3',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#1F9393',
    fontWeight: '600',
  },
  actionButtonIcon: {
    fontSize: 16,
    color: '#1F9393',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#61BACA',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CD1CE',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 40,
  },
});

export default PolicyOverviewScreen;
