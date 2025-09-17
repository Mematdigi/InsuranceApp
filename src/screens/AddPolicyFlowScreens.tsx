/**
 * AddPolicyFlowScreens.tsx
 * 
 * IMPORTANT: This code uses @react-native-documents/picker
 * Installation:
 * npm install @react-native-documents/picker
 * 
 * For iOS: cd ios && pod install
 * 
 * Requirements:
 * - React Native 0.78+ requires this new package
 * - iOS 14 or later
 * - For Expo: SDK 52+
 */

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
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
// CORRECT IMPORT: Using named exports from @react-native-documents/picker
import { pick, types } from '@react-native-documents/picker';
import { useAuth } from '../context/AuthContext';

// ======================
// Screen 1: Choose Company
// ======================
// AddPolicyFlowScreens.tsx - Quick temporary fix
// Just replace the ChooseCompanyScreen function with this:

const ChooseCompanyScreen = () => {
  const navigation = useNavigation<any>();
  const [selectedCompany, setSelectedCompany] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // ✅ TEMPORARY FIX: Use your actual customerId from database
  const customerId = '68ada8d22071b4b868cd7951'; // Your actual customerId from the database
  
  const insuranceCompanies = [
    'Tata AIA Life Insurance',
    'Tata AIG General Insurance Company',
    'LIC',
    'HDFC Life',
    'ICICI Prudential',
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
    
    console.log('Using customerId:', customerId); // This should now show your actual ID
    
    navigation.navigate('AddPolicyStep2', {
      company: selectedCompany,
      customerId, // This will now be '68ada8d22071b4b868cd7951'
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4ECDC4" />
      <ScrollView style={styles.content}>
        <Text style={styles.headerTitle}>Choose Your Insurance Company</Text>

        {/* Debug Info - This should now show your actual customerId */}
        <View style={{ backgroundColor: '#e8f5e8', padding: 8, margin: 8, borderRadius: 4 }}>
          <Text style={{ fontSize: 12, color: '#2d5a2d' }}>
            ✅ Customer ID: {customerId}
          </Text>
        </View>

        {/* Search */}
        <View style={styles.searchSection}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search company"
            placeholderTextColor="#A0B7B3"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Company List */}
        <View style={styles.companyList}>
          {filteredCompanies.map((company, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.companyItem,
                selectedCompany === company && styles.selectedCompanyItem,
              ]}
              onPress={() => setSelectedCompany(company)}
            >
              <Text
                style={[
                  styles.companyText,
                  selectedCompany === company && styles.selectedCompanyText,
                ]}
              >
                {company}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Continue */}
        <TouchableOpacity
          style={[styles.continueButton, !selectedCompany && styles.disabledButton]}
          onPress={handleContinue}
          disabled={!selectedCompany}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// ======================
// Screen 2: Insurance Number
// ======================
const InsuranceNumberScreen = ({ route }: any) => {
  const navigation = useNavigation<any>();
  const { company, customerId } = route.params || {};
  const [insuranceNumber, setInsuranceNumber] = useState('');

  const handleContinue = () => {
    navigation.navigate('UploadPolicy', {
      company,
      insuranceNumber,
      customerId,
    });
  };

  const handleSkip = () => {
    navigation.navigate('UploadPolicy', {
      company,
      insuranceNumber: '',
      customerId,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4ECDC4" />
      <ScrollView style={styles.content}>
        <Text style={styles.headerTitle}>Insurance Number (Optional)</Text>

        <TextInput
          style={styles.textInput}
          placeholder="Enter Insurance Number"
          value={insuranceNumber}
          onChangeText={setInsuranceNumber}
          autoCapitalize="characters"
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.continueButtonInRow} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ======================
// Screen 3: Upload & Save Policy
// ======================
const UploadPolicyScreen = ({ route }: any) => {
  const navigation = useNavigation<any>();
  const { company, insuranceNumber, customerId } = route.params || {};

  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [pdfData, setPdfData] = useState<any>(null);
  const [insuredMembers, setInsuredMembers] = useState<any[]>([]);

  /** Step 1: Pick + upload PDF using the NEW @react-native-documents/picker API */
  const handleUpload = async () => {
    try {
      // NEW API: Using pick() with types.pdf
      // Note: pick() always returns an array, no more pickSingle
      const result = await pick({
        type: [types.pdf],
        copyTo: 'cachesDirectory', // Important for file system access
      });

      // The new API always returns an array, get the first file
      const res = result[0];

      if (!res) {
        console.log('No file selected');
        return;
      }

      const fileName = res.name ?? 'unknown.pdf';
      const fileUri = res.uri ?? '';
      const fileType = res.type ?? 'application/pdf';

      if (!fileName.toLowerCase().endsWith('.pdf')) {
        Alert.alert('Error', 'Please select a PDF file');
        return;
      }

      setUploadedFileName(fileName);
      setIsUploading(true);

      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        type: fileType,
        name: fileName,
      } as any);
      formData.append('insuranceCompney', company); // Note: There's a typo in the field name (should be insuranceCompany)

      const response = await fetch(
        `http://10.0.2.2:5000/v1/customer/pdf-reader/${customerId}`,
        {
          method: 'POST',
          body: formData,
          // Don't set Content-Type header, let the browser set it with boundary
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Server response:', errorData);
        throw new Error(`Upload failed: ${response.status}`);
      }

      const data = await response.json();
      setPdfData(data.policyHolder || {});
      setInsuredMembers(data.insuredMembers || []);
      Alert.alert('Success', 'PDF parsed successfully!');
    } catch (err: any) {
      // The new package doesn't have an isCancel method, check the error message
      if (err.message?.includes('User canceled') || err.message?.includes('cancelled')) {
        console.log('User cancelled picker');
      } else {
        console.error('Upload error:', err);
        Alert.alert('Error', `Failed to upload or parse PDF: ${err.message}`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  /** Step 2: Save parsed policy */
  const handleSavePolicy = async () => {
  if (!pdfData?.policyNumber) {
    Alert.alert('Error', 'No policy data found. Please upload a PDF first.');
    return;
  }

  try {
    setIsUploading(true);
    
    const payload = {
      policyHolder: {
        customerId,
        insuranceNumber,
        ...pdfData,
      },
      insuredMembers,
    };

    // ✅ Use EXACT same URL format as your working upload
    const saveUrl = `http://10.0.2.2:5000/v1/customer/save-pdf-reader/${customerId}`;
    console.log('💾 Save URL:', saveUrl);
    console.log('💾 Payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(saveUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('💾 Response status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const result = await response.json();
    console.log('💾 Success:', result);

    Alert.alert('Success', 'Policy saved successfully!');
    navigation.navigate('CustomerDashboard');

  } catch (err) {
    console.error('💾 Save error:', err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    Alert.alert('Save Error', `Failed to save: ${errorMessage}`);
  } finally {
    setIsUploading(false);
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4ECDC4" />
      <ScrollView style={styles.content}>
        <Text style={styles.headerTitle}>Upload Your Policy</Text>
        
        <TouchableOpacity 
          style={[styles.uploadOption, isUploading && styles.uploadingOption]} 
          onPress={handleUpload}
          disabled={isUploading}
        >
          <Text style={styles.uploadOptionTitle}>📄 Import PDF</Text>
          <Text style={styles.uploadOptionSubtitle}>
            {isUploading
              ? 'Uploading...'
              : uploadedFileName || 'Select a PDF to upload'}
          </Text>
        </TouchableOpacity>

        {isUploading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4ECDC4" />
          </View>
        )}

        {pdfData && !isUploading && (
          <View style={styles.pdfDataContainer}>
            <Text style={styles.pdfDataTitle}>Policy Details</Text>
            <Text style={styles.pdfDataText}>
              Policy Number: {pdfData.policyNumber || 'N/A'}
            </Text>
            {pdfData.policyHolderName && (
              <Text style={styles.pdfDataText}>
                Policy Holder: {pdfData.policyHolderName}
              </Text>
            )}
          </View>
        )}

        {pdfData && (
          <TouchableOpacity
            style={[styles.completeButton, isUploading && styles.disabledButton]}
            onPress={handleSavePolicy}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.completeButtonText}>Save to Dashboard</Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// ======================
// Styles
// ======================
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F0F9F8' 
  },
  content: { 
    flex: 1, 
    padding: 20 
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#4ECDC4', 
    marginBottom: 16 
  },
  searchSection: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: { 
    fontSize: 16, 
    color: '#4ECDC4' 
  },
  companyList: { 
    marginBottom: 20 
  },
  companyItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCompanyItem: { 
    backgroundColor: '#4ECDC4' 
  },
  companyText: { 
    fontSize: 16, 
    color: '#4ECDC4', 
    fontWeight: '600' 
  },
  selectedCompanyText: { 
    color: 'white' 
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#4ECDC4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonRow: { 
    flexDirection: 'row', 
    marginTop: 20, 
    gap: 12 
  },
  skipButton: {
    flex: 0.4,
    borderWidth: 1,
    borderColor: '#4ECDC4',
    padding: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  skipButtonText: { 
    color: '#4ECDC4', 
    fontWeight: '600' 
  },
  continueButtonInRow: {
    flex: 0.6,
    backgroundColor: '#4ECDC4',
    padding: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  continueButtonText: { 
    color: 'white', 
    fontWeight: 'bold' 
  },
  continueButton: {
    backgroundColor: '#4ECDC4',
    padding: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: { 
    backgroundColor: '#B0D9D5',
    opacity: 0.7,
  },
  uploadOption: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  uploadingOption: {
    opacity: 0.7,
  },
  uploadOptionTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#4ECDC4' 
  },
  uploadOptionSubtitle: { 
    fontSize: 14, 
    color: '#61BACA', 
    marginTop: 4 
  },
  completeButton: {
    backgroundColor: '#4ECDC4',
    padding: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 12,
  },
  completeButtonText: { 
    color: 'white', 
    fontWeight: 'bold' 
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  pdfDataContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pdfDataTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginBottom: 8,
  },
  pdfDataText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
});

// ======================
// Exports
// ======================
export { ChooseCompanyScreen, InsuranceNumberScreen, UploadPolicyScreen };