import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Screen 1: Choose Insurance Company
const ChooseCompanyScreen = () => {
  const navigation = useNavigation<any>();
  const [selectedCompany, setSelectedCompany] = useState('');
  const [activeTab, setActiveTab] = useState('upload');
  const [searchQuery, setSearchQuery] = useState('');

  const insuranceCompanies = [
    'LIC',
    'HDFC Life',
    'ICICI Prudential',
    'Tata AIG',
    'Bajaj Allianz',
    'Max Life',
  ];

  const filteredCompanies = insuranceCompanies.filter(company =>
    company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContinue = () => {
    if (!selectedCompany) {
      Alert.alert('Selection Required', 'Please choose an insurance company');
      return;
    }
    navigation.navigate('AddPolicyStep2', { company: selectedCompany });
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'manual') {
      navigation.navigate('FillManually');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4ECDC4" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Policy</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tab Bar */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'upload' && styles.activeTab]}
          onPress={() => handleTabChange('upload')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'upload' && styles.activeTabText]}>
            📤 Upload Policy
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'manual' && styles.activeTab]}
          onPress={() => handleTabChange('manual')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'manual' && styles.activeTabText]}>
            ✏️ Fill Manually
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Search Section */}
        <View style={styles.searchSection}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Choose Your Insurance Company"
            placeholderTextColor="#A0B7B3"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Company List */}
        <View style={styles.companyList}>
          {filteredCompanies.map((company, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.companyItem,
                selectedCompany === company && styles.selectedCompanyItem
              ]}
              onPress={() => setSelectedCompany(company)}
            >
              <Text style={[
                styles.companyText,
                selectedCompany === company && styles.selectedCompanyText
              ]}>
                {company}
              </Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Continue Button */}
        <TouchableOpacity 
          style={[styles.continueButton, !selectedCompany && styles.disabledButton]} 
          onPress={handleContinue}
          disabled={!selectedCompany}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>

        {/* Progress Indicator */}
        <View style={styles.progressSection}>
          <View style={styles.progressCircle}>
            <View style={styles.progressInner}>
              <Text style={styles.progressText}>1 of 3</Text>
            </View>
          </View>
          <Text style={styles.progressLabel}>Choose Company</Text>
          <Text style={styles.progressDescription}>Select your insurance provider to proceed</Text>
        </View>

        {/* Navigation */}
        <View style={styles.navigationSection}>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.navText}>← Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.navButton} 
            onPress={handleContinue}
            activeOpacity={0.7}
          >
            <Text style={styles.navText}>Next →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Screen 2: Insurance Number Input
const InsuranceNumberScreen = () => {
  const navigation = useNavigation<any>();
  const [insuranceNumber, setInsuranceNumber] = useState('');
  const [activeTab, setActiveTab] = useState('upload');

  const handleContinue = () => {
    if (!insuranceNumber.trim()) {
      Alert.alert('Input Required', 'Please enter your insurance number');
      return;
    }
    navigation.navigate('AddPolicyStep3', { insuranceNumber });
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'manual') {
      navigation.navigate('FillManually');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4ECDC4" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Policy</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tab Bar */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'upload' && styles.activeTab]}
          onPress={() => handleTabChange('upload')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'upload' && styles.activeTabText]}>
            📤 Upload Policy
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'manual' && styles.activeTab]}
          onPress={() => handleTabChange('manual')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'manual' && styles.activeTabText]}>
            ✏️ Fill Manually
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Input Section */}
        <View style={styles.inputSection}>
          <View style={styles.inputHeader}>
            <Text style={styles.inputIcon}>📄</Text>
            <Text style={styles.inputLabel}>Insurance Number</Text>
          </View>
          
          <TextInput
            style={styles.textInput}
            placeholder="Enter Insurance Number"
            value={insuranceNumber}
            onChangeText={setInsuranceNumber}
            autoCapitalize="characters"
          />
        </View>

        {/* Continue Button */}
        <TouchableOpacity 
          style={[styles.continueButton, !insuranceNumber.trim() && styles.disabledButton]} 
          onPress={handleContinue}
          disabled={!insuranceNumber.trim()}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>

        {/* Progress Indicator */}
        <View style={styles.progressSection}>
          <View style={styles.progressCircle}>
            <View style={styles.progressInner}>
              <Text style={styles.progressText}>2 of 3</Text>
            </View>
          </View>
          <Text style={styles.progressLabel}>Insurance Number</Text>
          <Text style={styles.progressDescription}>Add your policy number reference</Text>
        </View>

        {/* Navigation */}
        <View style={styles.navigationSection}>
          <TouchableOpacity 
            style={styles.navButton} 
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.navText}>← Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.navButton} 
            onPress={handleContinue}
            activeOpacity={0.7}
          >
            <Text style={styles.navText}>Next →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Screen 3: Insurance Number with Sample Data
const InsuranceNumberWithDataScreen = () => {
  const navigation = useNavigation<any>();
  const [insuranceNumber, setInsuranceNumber] = useState('876473474764324764');
  const [activeTab, setActiveTab] = useState('upload');

  const handleContinue = () => {
    navigation.navigate('AddPolicyStep4', { insuranceNumber });
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'manual') {
      navigation.navigate('FillManually');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4ECDC4" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Policy</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tab Bar */}
      <View style={styles.tabContainer}>
        <View style={[styles.tab, styles.activeTab]}>
          <Text style={styles.activeTabText}>📤 Upload Policy</Text>
        </View>
        <View style={styles.tab}>
          <Text style={styles.tabText}>✏️ Fill Manually</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Input Section */}
        <View style={styles.inputSection}>
          <View style={styles.inputHeader}>
            <Text style={styles.inputIcon}>📄</Text>
            <Text style={styles.inputLabel}>Insurance Number</Text>
          </View>
          
          <TextInput
            style={styles.textInput}
            placeholder="Enter Insurance Number"
            value={insuranceNumber}
            onChangeText={setInsuranceNumber}
            autoCapitalize="characters"
          />
        </View>

        {/* Continue Button */}
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>

        {/* Progress Indicator */}
        <View style={styles.progressSection}>
          <View style={styles.progressCircle}>
            <View style={styles.progressInner}>
              <Text style={styles.progressText}>2 of 3</Text>
            </View>
          </View>
          <Text style={styles.progressLabel}>Insurance Number</Text>
          <Text style={styles.progressDescription}>Add your policy number reference</Text>
        </View>

        {/* Navigation */}
        <View style={styles.navigationSection}>
          <TouchableOpacity style={styles.navButton} onPress={() => navigation.goBack()}>
            <Text style={styles.navText}>← Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={handleContinue}>
            <Text style={styles.navText}>Skip →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Screen 4: Upload Policy Document
const UploadPolicyScreen = () => {
  const navigation = useNavigation<any>();
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = () => {
    // Handle file upload logic here
    Alert.alert('Upload', 'File upload functionality would be implemented here');
  };

  const handleCompleteSetup = () => {
    navigation.navigate('Dashboard');
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4ECDC4" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Policy</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tab Bar */}
      <View style={styles.tabContainer}>
        <View style={[styles.tab, styles.activeTab]}>
          <Text style={styles.activeTabText}>📤 Upload Policy</Text>
        </View>
        <View style={styles.tab}>
          <Text style={styles.tabText}>✏️ Fill Manually</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Upload Section */}
        <View style={styles.uploadSection}>
          <View style={styles.uploadHeader}>
            <Text style={styles.uploadIcon}>📤</Text>
            <Text style={styles.uploadLabel}>Upload Your Policy</Text>
          </View>
          <Text style={styles.uploadDescription}>
            Choose how you'd like to add your policy document
          </Text>
        </View>

        {/* Upload Options */}
        <View style={styles.uploadOptionsContainer}>
          <TouchableOpacity 
            style={styles.uploadOption} 
            onPress={handleUpload}
            activeOpacity={0.8}
          >
            <View style={styles.uploadOptionIcon}>
              <Text style={styles.uploadOptionEmoji}>📷</Text>
            </View>
            <View style={styles.uploadOptionContent}>
              <Text style={styles.uploadOptionTitle}>Take a picture</Text>
              <Text style={styles.uploadOptionSubtitle}>
                Get fast and automated policy details
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.uploadOption} 
            onPress={handleUpload}
            activeOpacity={0.8}
          >
            <View style={styles.uploadOptionIcon}>
              <Text style={styles.uploadOptionEmoji}>📄</Text>
            </View>
            <View style={styles.uploadOptionContent}>
              <Text style={styles.uploadOptionTitle}>Import PDF</Text>
              <Text style={styles.uploadOptionSubtitle}>
                Don't let the file of your policy be deleted
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={styles.completeButton} 
            onPress={handleCompleteSetup}
            activeOpacity={0.8}
          >
            <Text style={styles.completeButtonText}>Complete Setup</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={handleCancel}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressSection}>
          <View style={styles.progressCircle}>
            <View style={styles.progressInner}>
              <Text style={styles.progressText}>3 of 3</Text>
            </View>
          </View>
          <Text style={styles.progressLabel}>Upload Documents</Text>
          <Text style={styles.progressDescription}>
            Together we're validating your documents
          </Text>
        </View>

        {/* Navigation */}
        <View style={styles.navigationSection}>
          <TouchableOpacity style={styles.navButton} onPress={() => navigation.goBack()}>
            <Text style={styles.navText}>← Previous</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#4ECDC4',
  },
  tabText: {
    fontSize: 14,
    color: '#61BACA',
    fontWeight: '600',
  },
  activeTabText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  companyList: {
    marginBottom: 20,
  },
  companyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  selectedCompanyItem: {
    backgroundColor: '#4ECDC4',
  },
  companyText: {
    fontSize: 16,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  selectedCompanyText: {
    color: 'white',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#61BACA',
  },
  inputSection: {
    marginBottom: 20,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  inputLabel: {
    fontSize: 16,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#4ECDC4',
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  uploadSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  uploadIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  uploadLabel: {
    fontSize: 18,
    color: '#4ECDC4',
    fontWeight: 'bold',
  },
  uploadDescription: {
    fontSize: 14,
    color: '#61BACA',
    textAlign: 'center',
  },
  uploadOptionsContainer: {
    marginBottom: 20,
  },
  uploadOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  uploadOptionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F9F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  uploadOptionEmoji: {
    fontSize: 24,
  },
  uploadOptionContent: {
    flex: 1,
  },
  uploadOptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginBottom: 4,
  },
  uploadOptionSubtitle: {
    fontSize: 14,
    color: '#61BACA',
  },
  continueButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    minHeight: 50, // Ensure minimum touch target
  },
  disabledButton: {
    backgroundColor: '#B0D9D5',
    shadowOpacity: 0.1,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtonsContainer: {
    marginBottom: 20,
  },
  completeButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    minHeight: 50,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#4ECDC4',
    minHeight: 50,
  },
  cancelButtonText: {
    color: '#4ECDC4',
    fontSize: 16,
    fontWeight: '600',
  },
  progressSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  progressCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginBottom: 4,
  },
  progressDescription: {
    fontSize: 14,
    color: '#61BACA',
    textAlign: 'center',
  },
  navigationSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  navButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 80,
    minHeight: 44, // Minimum touch target size
    justifyContent: 'center',
    alignItems: 'center',
  },
  navText: {
    fontSize: 14,
    color: '#4ECDC4',
    fontWeight: '600',
  },
});

// Export all screens
export {
  ChooseCompanyScreen,
  InsuranceNumberScreen,
  InsuranceNumberWithDataScreen,
  UploadPolicyScreen,
};