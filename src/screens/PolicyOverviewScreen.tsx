import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  Linking,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface PolicyDetails {
  _id: string;
  customerId: string;
  policyNumber: string;
  productName: string;
  policyType: string;
  premiumAmount: string;
  endDate: string;
  status: string;
  company?: string;
  policyHolderName?: string;
  policyHolderAddress?: string;
  policyHolderPhone?: string;
  policyHolderEmail?: string;
  agentName?: string;
  agentContact?: string;
  agentEmail?: string;
  policyTerm?: string;
  coverage?: string;
  insuredMembers?: Array<{
    name: string;
    relation: string;
    dateOfBirth: string;
  }>;
}

const PolicyOverviewScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [policyDetails, setPolicyDetails] = useState<PolicyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Get route parameters
  const { customerId, policyId, policyNumber } = route.params || {};

  // Sample data - replace with API call
  const samplePolicyDetails: PolicyDetails = {
    _id: policyId || '1',
    customerId: customerId || 'user123',
    policyNumber: policyNumber || 'HDFC001',
    productName: 'Health Insurance Home Loan',
    policyType: 'Health Insurance',
    premiumAmount: '28855',
    endDate: '12/24',
    status: 'Active',
    company: 'HDFC',
    policyHolderName: 'John Doe',
    policyHolderAddress: 'A-19 street no-12 divya garden, New Delhi-110069',
    policyHolderPhone: '10 Member',
    policyHolderEmail: '11 Member',
    agentName: 'Ajay',
    agentContact: '734591265',
    agentEmail: 'ajay@gmail.com',
    policyTerm: '1 Year',
    coverage: '5 Lakhs',
    insuredMembers: [
      {
        name: 'John Doe',
        relation: 'Self',
        dateOfBirth: '05-JAN-YYYY'
      },
      {
        name: 'Son',
        relation: 'Child',
        dateOfBirth: '05-JAN-YYYY'
      }
    ]
  };

  useEffect(() => {
    fetchPolicyDetails();
  }, []);

  const fetchPolicyDetails = async () => {
    try {
      // Replace with actual API call
      // const response = await fetch(`${API_URL}/policy/${customerId}/${policyId}`);
      // const data = await response.json();
      
      // Simulate API call
      setTimeout(() => {
        setPolicyDetails(samplePolicyDetails);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching policy details:', error);
      setLoading(false);
    }
  };

  const handleDownloadPolicy = () => {
    Alert.alert('Download', 'Policy document download would be implemented here');
  };

  const handlePayPremium = () => {
    Alert.alert('Pay Premium', 'Premium payment would be implemented here');
  };

  const handleContactSupport = () => {
    Alert.alert('Contact Support', 'Support contact would be implemented here');
  };

  const handleChatWithAgent = () => {
    Alert.alert('Chat with Agent', 'Agent chat would be implemented here');
  };

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#4ECDC4" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading policy details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!policyDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#4ECDC4" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Policy not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Policy Overview</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Policy Card */}
        <View style={styles.policyCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.companyName}>{policyDetails.company}</Text>
            <View style={styles.companyLogo} />
          </View>
          
          <Text style={styles.policyAddress}>{policyDetails.policyHolderAddress}</Text>
          <Text style={styles.policyNumber}>Policy Number: {policyDetails.policyNumber}</Text>
          <Text style={styles.validPeriod}>Valid Period: From 01/24 to 01/26</Text>
          
          <View style={styles.cardFooter}>
            <View style={styles.premiumInfo}>
              <Text style={styles.premiumLabel}>Premium: ₹{policyDetails.premiumAmount} / Month</Text>
            </View>
            <TouchableOpacity style={styles.statusBadge}>
              <Text style={styles.statusText}>Active Insurance</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
            onPress={() => setActiveTab('overview')}
          >
            <Text style={styles.tabIcon}>👁</Text>
            <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
              Overview
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'documents' && styles.activeTab]}
            onPress={() => setActiveTab('documents')}
          >
            <Text style={styles.tabIcon}>📄</Text>
            <Text style={[styles.tabText, activeTab === 'documents' && styles.activeTabText]}>
              Documents
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'pay' && styles.activeTab]}
            onPress={() => setActiveTab('pay')}
          >
            <Text style={styles.tabIcon}>💳</Text>
            <Text style={[styles.tabText, activeTab === 'pay' && styles.activeTabText]}>
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
                <Text style={styles.detailValue}>{policyDetails.policyHolderName}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>ADDRESS</Text>
                <Text style={styles.detailValue}>{policyDetails.policyHolderAddress}</Text>
              </View>
              
              <View style={styles.detailRowDouble}>
                <View style={styles.detailColumn}>
                  <Text style={styles.detailLabel}>PHONE</Text>
                  <TouchableOpacity onPress={() => handleCall(policyDetails.policyHolderPhone || '')}>
                    <Text style={[styles.detailValue, styles.linkText]}>
                      {policyDetails.policyHolderPhone}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.detailColumn}>
                  <Text style={styles.detailLabel}>EMAIL</Text>
                  <TouchableOpacity onPress={() => handleEmail(policyDetails.policyHolderEmail || '')}>
                    <Text style={[styles.detailValue, styles.linkText]}>
                      {policyDetails.policyHolderEmail}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Covered Members */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Covered Members</Text>
              
              {policyDetails.insuredMembers?.map((member, index) => (
                <View key={index} style={styles.memberCard}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>
                      FULL NAME {index === 0 ? '(FIRST MEMBER)' : '(SECOND MEMBER)'}
                    </Text>
                    <Text style={styles.detailValue}>{member.name}</Text>
                  </View>
                  
                  <View style={styles.detailRowDouble}>
                    <View style={styles.detailColumn}>
                      <Text style={styles.detailLabel}>RELATION</Text>
                      <Text style={styles.detailValue}>{member.relation}</Text>
                    </View>
                    <View style={styles.detailColumn}>
                      <Text style={styles.detailLabel}>DATE OF BIRTH</Text>
                      <Text style={styles.detailValue}>{member.dateOfBirth}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Agent and Company Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Agent and Company Details</Text>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>INSURANCE COMPANY</Text>
                <Text style={styles.detailValue}>A.I.G General Pvt. Ltd</Text>
              </View>
              
              <View style={styles.detailRowDouble}>
                <View style={styles.detailColumn}>
                  <Text style={styles.detailLabel}>AGENT NAME</Text>
                  <Text style={styles.detailValue}>{policyDetails.agentName}</Text>
                </View>
                <View style={styles.detailColumn}>
                  <Text style={styles.detailLabel}>AGENT CONTACT</Text>
                  <TouchableOpacity onPress={() => handleCall(policyDetails.agentContact || '')}>
                    <Text style={[styles.detailValue, styles.linkText]}>
                      {policyDetails.agentContact}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.detailRowDouble}>
                <View style={styles.detailColumn}>
                  <Text style={styles.detailLabel}>POLICY TYPE</Text>
                  <Text style={styles.detailValue}>Health</Text>
                </View>
                <View style={styles.detailColumn}>
                  <Text style={styles.detailLabel}>AGENT EMAIL</Text>
                  <TouchableOpacity onPress={() => handleEmail(policyDetails.agentEmail || '')}>
                    <Text style={[styles.detailValue, styles.linkText]}>
                      {policyDetails.agentEmail}
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
                <Text style={styles.detailValue}>₹ {policyDetails.premiumAmount} / month</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>POLICY TERM</Text>
                <Text style={styles.detailValue}>{policyDetails.policyTerm}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>MEMBERS</Text>
                <Text style={styles.detailValue}>2 members</Text>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              
              <TouchableOpacity style={styles.actionButton} onPress={handleDownloadPolicy}>
                <Text style={styles.actionButtonText}>Download My Policy</Text>
                <Text style={styles.actionButtonIcon}>⬇</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton} onPress={handlePayPremium}>
                <Text style={styles.actionButtonText}>Pay Premium Now</Text>
                <Text style={styles.actionButtonIcon}>📄</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton} onPress={handleContactSupport}>
                <Text style={styles.actionButtonText}>Contact</Text>
                <Text style={styles.actionButtonIcon}>📞</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton} onPress={handleChatWithAgent}>
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
              <Text style={styles.emptyStateText}>Document management coming soon</Text>
            </View>
          </View>
        )}

        {activeTab === 'pay' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Records</Text>
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Payment history coming soon</Text>
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
  },
  loadingText: {
    fontSize: 16,
    color: '#61BACA',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#FF6B6B',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  backButtonText: {
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
  headerBackButton: {
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
  content: {
    flex: 1,
    padding: 20,
  },
  policyCard: {
    backgroundColor: '#4ECDC4',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#4ECDC4',
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
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
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
    shadowColor: '#4ECDC4',
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
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#4ECDC4',
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
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4ECDC4',
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
  },
  linkText: {
    color: '#4ECDC4',
  },
  memberCard: {
    marginBottom: 16,
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
    color: '#4ECDC4',
    fontWeight: '600',
  },
  actionButtonIcon: {
    fontSize: 16,
    color: '#4ECDC4',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#61BACA',
    fontStyle: 'italic',
  },
  bottomSpacing: {
    height: 40,
  },
});

export default PolicyOverviewScreen;