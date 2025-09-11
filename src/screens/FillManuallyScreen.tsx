import React, { useState, useEffect } from 'react';
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
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration - matches your backend
const API_CONFIG = {
  BASE_URL: 'http://10.0.2.2:5000', // Android emulator localhost
  ENDPOINTS: {
    SAVE_POLICY: '/v1/customer/save-pdf-reader', // Correct endpoint from your backend
  }
};

interface DropdownOption {
  label: string;
  value: string;
}

interface UserData {
  id: string;
  username?: string;
  name?: string;
  email?: string;
}

const FillManuallyScreen = () => {
  const navigation = useNavigation<any>();
  
  // User state
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Form state - matching backend CustomerPolicy schema
  const [formData, setFormData] = useState({
    policyHolderName: '',
    policyNumber: '',
    policyHolderPhone: '',
    policyHolderAddress: '',
    policyType: '', // This will be the insurance company
    productName: '',
    policyStartDate: '',
    policyEndDate: '',
    tenure: '',
    premiumAmount: '',
    nomineeName: '',
    nomineeRelationship: '',
  });

  // Dropdown states
  const [showInsuranceDropdown, setShowInsuranceDropdown] = useState(false);
  const [showTenureDropdown, setShowTenureDropdown] = useState(false);
  const [showRelationshipDropdown, setShowRelationshipDropdown] = useState(false);
  const [pdfUploaded, setPdfUploaded] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState('manual');

  // Insurance companies matching your backend
  const insuranceCompanies: DropdownOption[] = [
    { label: 'Tata AIG General Insurance Company', value: 'Tata AIG General Insurance Company' },
    { label: 'Tata AIA Life Insurance', value: 'Tata AIA Life Insurance' },
    { label: 'ACKO HEALTH', value: 'ACKO HEALTH' },
    { label: 'LIC', value: 'LIC' },
    { label: 'HDFC Life', value: 'HDFC Life' },
    { label: 'ICICI Prudential', value: 'ICICI Prudential' },
    { label: 'Bajaj Allianz', value: 'Bajaj Allianz' },
    { label: 'Max Life', value: 'Max Life' },
  ];

  const tenureOptions: DropdownOption[] = [
    { label: '1 Year', value: '1 Year' },
    { label: '2 Years', value: '2 Years' },
    { label: '3 Years', value: '3 Years' },
    { label: '5 Years', value: '5 Years' },
    { label: '10 Years', value: '10 Years' },
    { label: '15 Years', value: '15 Years' },
    { label: '20 Years', value: '20 Years' },
  ];

  const relationshipOptions: DropdownOption[] = [
    { label: 'Wife', value: 'Wife' },
    { label: 'Husband', value: 'Husband' },
    { label: 'Father', value: 'Father' },
    { label: 'Mother', value: 'Mother' },
    { label: 'Son', value: 'Son' },
    { label: 'Daughter', value: 'Daughter' },
    { label: 'Brother', value: 'Brother' },
    { label: 'Sister', value: 'Sister' },
    { label: 'Friend', value: 'Friend' },
    { label: 'Business Partner', value: 'Business Partner' },
    { label: 'Guardian', value: 'Guardian' },
    { label: 'Other', value: 'Other' },
  ];

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('user');
      if (userDataString) {
        const user = JSON.parse(userDataString);
        setUserData(user);
        
        // Pre-fill policy holder name if available
        if (user.name || user.username) {
          setFormData(prev => ({
            ...prev,
            policyHolderName: user.name || user.username
          }));
        }
      } else {
        // No user data found, redirect to login
        Alert.alert(
          'Authentication Required',
          'Please login to continue',
          [
            {
              text: 'OK',
              onPress: () => navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              })
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user data');
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInsuranceSelect = (option: DropdownOption) => {
    updateFormData('policyType', option.value);
    setShowInsuranceDropdown(false);
  };

  const handleTenureSelect = (option: DropdownOption) => {
    updateFormData('tenure', option.value);
    setShowTenureDropdown(false);
  };

  const handleRelationshipSelect = (option: DropdownOption) => {
    updateFormData('nomineeRelationship', option.value);
    setShowRelationshipDropdown(false);
  };

  const handleUploadPDF = () => {
    // Handle PDF upload logic
    setPdfUploaded(true);
    Alert.alert('Success', 'PDF uploaded successfully!');
  };

  const handleSelectPDF = () => {
    // Handle PDF selection logic
    Alert.alert('Select PDF', 'PDF selection functionality would be implemented here');
  };

  const formatDateForBackend = (date: string) => {
    // Convert DD-MM-YYYY to DD/MM/YYYY format expected by backend
    if (!date) return '';
    return date.replace(/-/g, '/');
  };

  const validateForm = () => {
    const requiredFields = [
      'policyHolderName',
      'policyNumber',
      'policyHolderPhone',
      'policyType',
      'productName',
      'policyStartDate',
      'policyEndDate',
      'tenure'
    ];
    
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      const fieldNames = missingFields.map(field => {
        switch(field) {
          case 'policyHolderName': return 'Policy Holder Name';
          case 'policyNumber': return 'Policy Number';
          case 'policyHolderPhone': return 'Contact';
          case 'policyHolderAddress': return 'Address';
          case 'policyType': return 'Insurance Company';
          case 'productName': return 'Policy Name';
          case 'policyStartDate': return 'Start Date';
          case 'policyEndDate': return 'Due Date';
          case 'tenure': return 'Tenure';
          default: return field;
        }
      });
      
      Alert.alert(
        'Missing Information',
        `Please fill the following fields:\n${fieldNames.join('\n')}`
      );
      return false;
    }
    
    // Validate contact number
    const contactRegex = /^[0-9]{10}$/;
    if (!contactRegex.test(formData.policyHolderPhone)) {
      Alert.alert('Invalid Contact', 'Please enter a valid 10-digit contact number');
      return false;
    }
    
    // Validate date format (DD-MM-YYYY)
    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[012])-\d{4}$/;
    if (!dateRegex.test(formData.policyStartDate)) {
      Alert.alert('Invalid Date', 'Please enter start date in DD-MM-YYYY format');
      return false;
    }
    if (!dateRegex.test(formData.policyEndDate)) {
      Alert.alert('Invalid Date', 'Please enter due date in DD-MM-YYYY format');
      return false;
    }
    
    return true;
  };

  const handleAddPolicy = async () => {
    // Validate form
    if (!validateForm()) {
      return;
    }

    if (!userData?.id) {
      Alert.alert('Error', 'User not authenticated. Please login again.');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
      return;
    }

    setLoading(true);

    try {
      // Format dates for backend
      const formattedStartDate = formatDateForBackend(formData.policyStartDate);
      const formattedEndDate = formatDateForBackend(formData.policyEndDate);
      
      // Prepare data matching backend CustomerPolicy schema
      const payload = {
        policyHolder: {
          customerId: userData.id,
          policyHolderName: formData.policyHolderName,
          policyHolderPhone: formData.policyHolderPhone,
          policyHolderAddress: formData.policyHolderAddress || 'Not provided',
          policyNumber: formData.policyNumber,
          productName: formData.productName,
          policyPeriod: `From ${formattedStartDate} to ${formattedEndDate}`,
          tenure: formData.tenure,
          endDate: formattedEndDate,
          policyType: formData.policyType,
          premiumAmount: formData.premiumAmount || '0',
          nomineeName: formData.nomineeName || '',
          nomineeRelationship: formData.nomineeRelationship || ''
        },
        insuredMembers: [] // Empty array for manual entry
      };

      console.log('Submitting policy data:', JSON.stringify(payload, null, 2));

      // Use the correct endpoint from your backend
      const apiUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SAVE_POLICY}/${userData.id}`;
      console.log('API URL:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);
      
      // Check content type
      const contentType = response.headers.get('content-type');
      let responseData;
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
        console.log('API Response:', responseData);
      } else {
        const responseText = await response.text();
        console.error('Non-JSON response:', responseText.substring(0, 500));
        throw new Error(`Server error: Expected JSON but got ${contentType}`);
      }

      if (response.ok) {
        Alert.alert(
          'Success',
          responseData.message || 'Policy added successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                // Clear form
                setFormData({
                  policyHolderName: userData.name || userData.username || '',
                  policyNumber: '',
                  policyHolderPhone: '',
                  policyHolderAddress: '',
                  policyType: '',
                  productName: '',
                  policyStartDate: '',
                  policyEndDate: '',
                  tenure: '',
                  premiumAmount: '',
                  nomineeName: '',
                  nomineeRelationship: '',
                });
                setPdfUploaded(false);
                
                // Navigate to dashboard or policies screen
                navigation.navigate('CustomerDashboard');
              }
            }
          ]
        );
      } else {
        const errorMessage = responseData?.error || responseData?.message || 'Failed to add policy';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error adding policy:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to add policy. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'upload') {
      navigation.navigate('ChooseCompany');
    }
  };

  const Dropdown = ({ 
    options, 
    isVisible, 
    onSelect, 
    onClose 
  }: { 
    options: DropdownOption[], 
    isVisible: boolean, 
    onSelect: (option: DropdownOption) => void,
    onClose: () => void 
  }) => (
    <Modal visible={isVisible} transparent animationType="fade">
      <TouchableOpacity style={styles.dropdownOverlay} onPress={onClose}>
        <View style={styles.dropdownContainer}>
          <ScrollView style={styles.dropdownList}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.dropdownItem}
                onPress={() => onSelect(option)}
              >
                <Text style={styles.dropdownItemText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
        >
          <Text style={[styles.tabText, activeTab === 'manual' && styles.activeTabText]}>
            ✏️ Fill Manually
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Form Fields */}
        <View style={styles.formContainer}>
          
          {/* Policy Holder Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Policy Holder Information</Text>
          </View>

          {/* Policy Holder Name */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Policy Holder Name *</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>👤</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter Name"
                value={formData.policyHolderName}
                onChangeText={(text) => updateFormData('policyHolderName', text)}
                placeholderTextColor="#A0B7B3"
              />
            </View>
          </View>

          {/* Contact */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Contact Number *</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>📞</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter 10-digit Contact Number"
                value={formData.policyHolderPhone}
                onChangeText={(text) => updateFormData('policyHolderPhone', text)}
                keyboardType="phone-pad"
                maxLength={10}
                placeholderTextColor="#A0B7B3"
              />
            </View>
          </View>

          {/* Address */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Address</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>📍</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter Current Address (Optional)"
                value={formData.policyHolderAddress}
                onChangeText={(text) => updateFormData('policyHolderAddress', text)}
                placeholderTextColor="#A0B7B3"
              />
            </View>
          </View>

          {/* Policy Details Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Policy Details</Text>
          </View>

          {/* Policy Number */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Policy Number *</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>🆔</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter Policy Number"
                value={formData.policyNumber}
                onChangeText={(text) => updateFormData('policyNumber', text)}
                placeholderTextColor="#A0B7B3"
              />
            </View>
          </View>

          {/* Insurance Company Dropdown */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Insurance Company *</Text>
            <TouchableOpacity 
              style={styles.dropdownButton}
              onPress={() => setShowInsuranceDropdown(true)}
            >
              <Text style={styles.dropdownIcon}>🏢</Text>
              <Text style={[
                styles.dropdownText, 
                !formData.policyType && styles.placeholderText
              ]}>
                {formData.policyType || 'Select Insurance Company'}
              </Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
          </View>

          {/* Policy Name/Product Name */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Policy Name *</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>📄</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter Policy/Product Name"
                value={formData.productName}
                onChangeText={(text) => updateFormData('productName', text)}
                placeholderTextColor="#A0B7B3"
              />
            </View>
          </View>

          {/* Premium Amount */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Premium Amount</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>₹</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter Premium Amount (Optional)"
                value={formData.premiumAmount}
                onChangeText={(text) => updateFormData('premiumAmount', text)}
                keyboardType="numeric"
                placeholderTextColor="#A0B7B3"
              />
            </View>
          </View>

          {/* Start Date */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Policy Start Date *</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>📅</Text>
              <TextInput
                style={styles.textInput}
                placeholder="DD-MM-YYYY"
                value={formData.policyStartDate}
                onChangeText={(text) => {
                  // Auto-format date
                  let formatted = text.replace(/[^0-9]/g, '');
                  if (formatted.length >= 3 && formatted.length <= 4) {
                    formatted = formatted.slice(0, 2) + '-' + formatted.slice(2);
                  } else if (formatted.length >= 5) {
                    formatted = formatted.slice(0, 2) + '-' + formatted.slice(2, 4) + '-' + formatted.slice(4, 8);
                  }
                  updateFormData('policyStartDate', formatted);
                }}
                placeholderTextColor="#A0B7B3"
                maxLength={10}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* End Date */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Policy End Date *</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>📅</Text>
              <TextInput
                style={styles.textInput}
                placeholder="DD-MM-YYYY"
                value={formData.policyEndDate}
                onChangeText={(text) => {
                  // Auto-format date
                  let formatted = text.replace(/[^0-9]/g, '');
                  if (formatted.length >= 3 && formatted.length <= 4) {
                    formatted = formatted.slice(0, 2) + '-' + formatted.slice(2);
                  } else if (formatted.length >= 5) {
                    formatted = formatted.slice(0, 2) + '-' + formatted.slice(2, 4) + '-' + formatted.slice(4, 8);
                  }
                  updateFormData('policyEndDate', formatted);
                }}
                placeholderTextColor="#A0B7B3"
                maxLength={10}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Tenure Dropdown */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Policy Tenure *</Text>
            <TouchableOpacity 
              style={styles.dropdownButton}
              onPress={() => setShowTenureDropdown(true)}
            >
              <Text style={styles.dropdownIcon}>⏱️</Text>
              <Text style={[
                styles.dropdownText, 
                !formData.tenure && styles.placeholderText
              ]}>
                {formData.tenure || 'Select Tenure'}
              </Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
          </View>

          {/* Nominee Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nominee Details (Optional)</Text>
          </View>

          {/* Nominee Name */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Nominee Name</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>👥</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter Nominee Name"
                value={formData.nomineeName}
                onChangeText={(text) => updateFormData('nomineeName', text)}
                placeholderTextColor="#A0B7B3"
              />
            </View>
          </View>

          {/* Nominee Relationship */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Nominee Relationship</Text>
            <TouchableOpacity 
              style={styles.dropdownButton}
              onPress={() => setShowRelationshipDropdown(true)}
            >
              <Text style={styles.dropdownIcon}>💑</Text>
              <Text style={[
                styles.dropdownText, 
                !formData.nomineeRelationship && styles.placeholderText
              ]}>
                {formData.nomineeRelationship || 'Select Relationship'}
              </Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
          </View>

          {/* Upload Insurance PDF */}
          <View style={styles.fieldContainer}>
            <Text style={styles.uploadSectionTitle}>📤 Upload Insurance PDF (Optional)</Text>
            
            <TouchableOpacity 
              style={styles.uploadContainer}
              onPress={pdfUploaded ? handleSelectPDF : handleUploadPDF}
            >
              <View style={styles.uploadContent}>
                {pdfUploaded ? (
                  <>
                    <View style={styles.uploadSuccessIcon}>
                      <Text style={styles.checkmark}>✔</Text>
                    </View>
                    <Text style={styles.uploadSuccessText}>PDF Added</Text>
                    <Text style={styles.uploadSuccessSubtext}>policyDocument.pdf</Text>
                    <TouchableOpacity style={styles.selectButton}>
                      <Text style={styles.selectButtonText}>Change PDF</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <View style={styles.uploadIcon}>
                      <Text style={styles.uploadEmoji}>📄</Text>
                    </View>
                    <Text style={styles.uploadText}>Upload PDF</Text>
                    <Text style={styles.uploadSubtext}>Select a PDF file of your policy to upload</Text>
                    <TouchableOpacity style={styles.selectButton}>
                      <Text style={styles.selectButtonText}>Select PDF</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Add Policy Button */}
          <TouchableOpacity 
            style={[styles.addPolicyButton, loading && styles.disabledButton]} 
            onPress={handleAddPolicy}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.addPolicyButtonText}>✔ Add Policy</Text>
            )}
          </TouchableOpacity>
          
          {/* Required Fields Note */}
          <Text style={styles.requiredNote}>* Required fields</Text>
        </View>
      </ScrollView>

      {/* Dropdowns */}
      <Dropdown
        options={insuranceCompanies}
        isVisible={showInsuranceDropdown}
        onSelect={handleInsuranceSelect}
        onClose={() => setShowInsuranceDropdown(false)}
      />
      
      <Dropdown
        options={tenureOptions}
        isVisible={showTenureDropdown}
        onSelect={handleTenureSelect}
        onClose={() => setShowTenureDropdown(false)}
      />

      <Dropdown
        options={relationshipOptions}
        isVisible={showRelationshipDropdown}
        onSelect={handleRelationshipSelect}
        onClose={() => setShowRelationshipDropdown(false)}
      />
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
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  sectionHeader: {
    marginTop: 20,
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E8F6F3',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4ECDC4',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1893B0',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
    backgroundColor: '#FAFAFA',
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 12,
    color: '#4ECDC4',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#2D3748',
    paddingVertical: 12,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1893B0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FAFAFA',
  },
  dropdownIcon: {
    fontSize: 16,
    marginRight: 12,
    color: '#4ECDC4',
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
    color: '#2D3748',
  },
  placeholderText: {
    color: '#A0B7B3',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#A0B7B3',
  },
  uploadSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4ECDC4',
    marginBottom: 12,
  },
  uploadContainer: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#4ECDC4',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#F8FFFE',
  },
  uploadContent: {
    alignItems: 'center',
  },
  uploadIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8F6F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadEmoji: {
    fontSize: 24,
  },
  uploadSuccessIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkmark: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  uploadText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  uploadSuccessText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginBottom: 4,
  },
  uploadSubtext: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 16,
  },
  uploadSuccessSubtext: {
    fontSize: 14,
    color: '#61BACA',
    textAlign: 'center',
    marginBottom: 16,
  },
  selectButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4ECDC4',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  selectButtonText: {
    color: '#4ECDC4',
    fontSize: 14,
    fontWeight: '600',
  },
  addPolicyButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    opacity: 0.7,
  },
  addPolicyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  requiredNote: {
    fontSize: 12,
    color: '#718096',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  // Dropdown Modal Styles
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 20,
    maxHeight: 300,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  dropdownList: {
    maxHeight: 280,
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F9F8',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#2D3748',
  },
});

export default FillManuallyScreen;