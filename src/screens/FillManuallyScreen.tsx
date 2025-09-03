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
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface DropdownOption {
  label: string;
  value: string;
}

const FillManuallyScreen = () => {
  const navigation = useNavigation<any>();
  
  // Form state
  const [formData, setFormData] = useState({
    policyHolderName: '',
    policyNumber: '',
    contact: '',
    address: '',
    insuranceCompany: '',
    policyName: '',
    startDate: '',
    dueDate: '',
    tenure: '',
  });

  // Dropdown states
  const [showInsuranceDropdown, setShowInsuranceDropdown] = useState(false);
  const [showTenureDropdown, setShowTenureDropdown] = useState(false);
  const [pdfUploaded, setPdfUploaded] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState('manual');

  const insuranceCompanies: DropdownOption[] = [
    { label: 'LIC', value: 'lic' },
    { label: 'HDFC Life', value: 'hdfc' },
    { label: 'ICICI Prudential', value: 'icici' },
    { label: 'Tata AIG', value: 'tata' },
    { label: 'Bajaj Allianz', value: 'bajaj' },
    { label: 'Max Life', value: 'max' },
  ];

  const tenureOptions: DropdownOption[] = [
    { label: '1 Year', value: '1' },
    { label: '2 Years', value: '2' },
    { label: '5 Years', value: '5' },
    { label: '10 Years', value: '10' },
    { label: '15 Years', value: '15' },
    { label: '20 Years', value: '20' },
  ];

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInsuranceSelect = (option: DropdownOption) => {
    updateFormData('insuranceCompany', option.label);
    setShowInsuranceDropdown(false);
  };

  const handleTenureSelect = (option: DropdownOption) => {
    updateFormData('tenure', option.label);
    setShowTenureDropdown(false);
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

  const handleAddPolicy = () => {
    // Validate form
    const requiredFields = ['policyHolderName', 'policyNumber', 'contact', 'insuranceCompany'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      Alert.alert('Missing Information', 'Please fill all required fields');
      return;
    }

    // Submit form
    Alert.alert('Success', 'Policy added successfully!', [
      { text: 'OK', onPress: () => navigation.navigate('CustomerDashboard') }
    ]);
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
        {/* Manual Form Header */}
        {/* <View style={styles.formHeader}>
          <View style={styles.formHeaderIcon}>
            <Text style={styles.formHeaderEmoji}>➕</Text>
          </View>
          <Text style={styles.formHeaderText}>Add Policy Manually</Text>
        </View> */}

        {/* Form Fields */}
        <View style={styles.formContainer}>
          
          {/* Policy Holder Name */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Policy Holder Name</Text>
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

          {/* Policy Number */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Policy Number</Text>
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

          {/* Contact */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Contact</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>📞</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter Contact Number"
                value={formData.contact}
                onChangeText={(text) => updateFormData('contact', text)}
                keyboardType="phone-pad"
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
                placeholder="Enter Current Address"
                value={formData.address}
                onChangeText={(text) => updateFormData('address', text)}
                placeholderTextColor="#A0B7B3"
              />
            </View>
          </View>

          {/* Insurance Company Dropdown */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Insurance Company</Text>
            <TouchableOpacity 
              style={styles.dropdownButton}
              onPress={() => setShowInsuranceDropdown(true)}
            >
              <Text style={styles.dropdownIcon}>🏢</Text>
              <Text style={[
                styles.dropdownText, 
                !formData.insuranceCompany && styles.placeholderText
              ]}>
                {formData.insuranceCompany || 'Select Insurance Company'}
              </Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
          </View>

          {/* Policy Name */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Policy Name</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>📄</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter Policy Name"
                value={formData.policyName}
                onChangeText={(text) => updateFormData('policyName', text)}
                placeholderTextColor="#A0B7B3"
              />
            </View>
          </View>

          {/* Start Date */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Start Date</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>📅</Text>
              <TextInput
                style={styles.textInput}
                placeholder="DD-MM-YYYY"
                value={formData.startDate}
                onChangeText={(text) => updateFormData('startDate', text)}
                placeholderTextColor="#A0B7B3"
              />
            </View>
          </View>

          {/* Due Date */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Due Date</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>📅</Text>
              <TextInput
                style={styles.textInput}
                placeholder="DD-MM-YYYY"
                value={formData.dueDate}
                onChangeText={(text) => updateFormData('dueDate', text)}
                placeholderTextColor="#A0B7B3"
              />
            </View>
          </View>

          {/* Tenure Dropdown */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Tenure</Text>
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

          {/* Upload Insurance PDF */}
          <View style={styles.fieldContainer}>
            <Text style={styles.uploadSectionTitle}>📤 Upload Insurance PDF</Text>
            
            <TouchableOpacity 
              style={styles.uploadContainer}
              onPress={pdfUploaded ? handleSelectPDF : handleUploadPDF}
            >
              <View style={styles.uploadContent}>
                {pdfUploaded ? (
                  <>
                    <View style={styles.uploadSuccessIcon}>
                      <Text style={styles.checkmark}>✓</Text>
                    </View>
                    <Text style={styles.uploadSuccessText}>PDF Added</Text>
                    <Text style={styles.uploadSuccessSubtext}>policyDocument.pdf</Text>
                    <TouchableOpacity style={styles.selectButton}>
                      <Text style={styles.selectButtonText}>Select</Text>
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
          <TouchableOpacity style={styles.addPolicyButton} onPress={handleAddPolicy}>
            <Text style={styles.addPolicyButtonText}>✓ Add Policy</Text>
          </TouchableOpacity>
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
  formHeader: {
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
  formHeaderIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F9F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  formHeaderEmoji: {
    fontSize: 16,
  },
  formHeaderText: {
    fontSize: 16,
    color: '#4ECDC4',
    fontWeight: 'bold',
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
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
  addPolicyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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