/**
 * AddPolicyFlowScreens.tsx - Enhanced with Camera & Gallery Support
 * 
 * IMPORTANT: Required packages:
 * npm install @react-native-documents/picker react-native-image-picker
 * 
 * For iOS: cd ios && pod install
 * 
 * Requirements:
 * - React Native 0.78+
 * - iOS 14 or later
 * - Android: Update AndroidManifest.xml with camera permissions
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
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
// PDF Picker
import { pick, types } from '@react-native-documents/picker';
// Camera & Gallery
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useAuth } from '../context/AuthContext';

// ======================
// Screen 1: Choose Company
// ======================
const ChooseCompanyScreen = () => {
  const navigation = useNavigation<any>();
  const [selectedCompany, setSelectedCompany] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { customerId } = useAuth();
  
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
    
    if (!customerId) {
      Alert.alert('Error', 'User not authenticated. Please login again.');
      return;
    }
    
    console.log('Using customerId:', customerId);
    
    navigation.navigate('AddPolicyStep2', {
      company: selectedCompany,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4ECDC4" />
      <ScrollView style={styles.content}>
        <Text style={styles.headerTitle}>Choose Your Insurance Company</Text>

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
// Screen 2: Insurance Number + PDF/Camera/Gallery Upload (Combined)
// ======================
const InsuranceNumberScreen = ({ route }: any) => {
  const navigation = useNavigation<any>();
  const { company } = route.params || {};
  const { customerId } = useAuth();
  
  // Policy number state
  const [insuranceNumber, setInsuranceNumber] = useState('');
  const [policyNumberEntered, setPolicyNumberEntered] = useState(false);
  
  // Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedFileType, setUploadedFileType] = useState<'pdf' | 'image' | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [pdfData, setPdfData] = useState<any>(null);
  const [insuredMembers, setInsuredMembers] = useState<any[]>([]);

  const handleContinueOrSkip = (skipped = false) => {
    if (skipped) {
      setInsuranceNumber('');
    }
    setPolicyNumberEntered(true);
  };

  /** PDF Upload functionality */
  const handlePDFUpload = async () => {
    if (!customerId) {
      Alert.alert('Error', 'User not authenticated. Please login again.');
      return;
    }

    try {
      const result = await pick({
        type: [types.pdf],
        copyTo: 'cachesDirectory',
      });

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
      setUploadedFileType('pdf');
      setImagePreview(null);
      setIsUploading(true);

      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        type: fileType,
        name: fileName,
      } as any);
      formData.append('insuranceCompney', company);

      const response = await fetch(
        `https://policysaath.com/api/v1/customer/pdf-reader/${customerId}`,
        {
          method: 'POST',
          body: formData,
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

  /** Camera Capture functionality */
  const handleCameraCapture = async () => {
    if (!customerId) {
      Alert.alert('Error', 'User not authenticated. Please login again.');
      return;
    }

    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1920,
        includeBase64: false,
        saveToPhotos: false,
      });

      if (result.didCancel) {
        console.log('User cancelled camera');
        return;
      }

      if (result.errorCode) {
        console.error('Camera Error:', result.errorMessage);
        Alert.alert('Error', 'Failed to capture image');
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const photo = result.assets[0];
        await uploadImage(photo);
      }
    } catch (err) {
      console.error('Camera error:', err);
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  /** Gallery Selection functionality */
  const handleGallerySelection = async () => {
    if (!customerId) {
      Alert.alert('Error', 'User not authenticated. Please login again.');
      return;
    }

    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1920,
        includeBase64: false,
        selectionLimit: 1,
      });

      if (result.didCancel) {
        console.log('User cancelled gallery');
        return;
      }

      if (result.errorCode) {
        console.error('Gallery Error:', result.errorMessage);
        Alert.alert('Error', 'Failed to select image');
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const photo = result.assets[0];
        await uploadImage(photo);
      }
    } catch (err) {
      console.error('Gallery error:', err);
      Alert.alert('Error', 'Failed to open gallery');
    }
  };

  /** Upload Image (Camera or Gallery) */
  const uploadImage = async (photo: any) => {
    try {
      const fileName = photo.fileName || `photo_${Date.now()}.jpg`;
      const fileUri = photo.uri || '';
      const fileType = photo.type || 'image/jpeg';

      setUploadedFileName(fileName);
      setUploadedFileType('image');
      setImagePreview(fileUri);
      setIsUploading(true);

      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        type: fileType,
        name: fileName,
      } as any);
      formData.append('insuranceCompney', company);

      // Use the same endpoint - backend should handle both PDF and images
      const response = await fetch(
        `https://policysaath.com/api/v1/customer/pdf-reader/${customerId}`,
        {
          method: 'POST',
          body: formData,
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
      Alert.alert('Success', 'Image uploaded and processed successfully!');
    } catch (err: any) {
      console.error('Upload error:', err);
      Alert.alert('Error', `Failed to upload image: ${err.message}`);
      setImagePreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  /** Show Upload Options */
  const showUploadOptions = () => {
    Alert.alert(
      'Upload Policy Document',
      'Choose how you want to upload your policy document',
      [
        {
          text: 'Take Photo',
          onPress: handleCameraCapture,
        },
        {
          text: 'Choose from Gallery',
          onPress: handleGallerySelection,
        },
        {
          text: 'Select PDF',
          onPress: handlePDFUpload,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  /** Save parsed policy */
  const handleSavePolicy = async () => {
    if (!pdfData?.policyNumber) {
      Alert.alert('Error', 'No policy data found. Please upload a document first.');
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

      const saveUrl = `https://policysaath.com/api/v1/customer/save-pdf-reader/${customerId}`;
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
        <Text style={styles.headerTitle}>Insurance Details</Text>

        {/* Policy Number Section */}
        {!policyNumberEntered && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Insurance Number (Optional)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter Insurance Number"
              value={insuranceNumber}
              onChangeText={setInsuranceNumber}
              autoCapitalize="characters"
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={styles.skipButton}
                onPress={() => handleContinueOrSkip(true)}
              >
                <Text style={styles.skipButtonText}>Skip</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.continueButtonInRow, !insuranceNumber && styles.disabledButton]}
                onPress={() => handleContinueOrSkip(false)}
                disabled={!insuranceNumber}
              >
                <Text style={styles.continueButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Upload Section */}
        {policyNumberEntered && (
          <>
            <Text style={styles.sectionTitle}>Upload Your Policy Document</Text>
            
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                ℹ️ Company: {company}
              </Text>
            </View>

            {/* Upload Options */}
            <View style={styles.uploadOptionsContainer}>
              {/* PDF Upload */}
              <TouchableOpacity
                style={[styles.uploadOption, isUploading && styles.uploadingOption]}
                onPress={handlePDFUpload}
                disabled={isUploading}
              >
                <Text style={styles.uploadOptionTitle}>📄 Import PDF</Text>
                <Text style={styles.uploadOptionSubtitle}>
                  Select a PDF document
                </Text>
              </TouchableOpacity>

              {/* Camera Capture */}
              <TouchableOpacity
                style={[styles.uploadOption, isUploading && styles.uploadingOption]}
                onPress={handleCameraCapture}
                disabled={isUploading}
              >
                <Text style={styles.uploadOptionTitle}>📷 Take Photo</Text>
                <Text style={styles.uploadOptionSubtitle}>
                  Capture with camera
                </Text>
              </TouchableOpacity>

              {/* Gallery Selection */}
              <TouchableOpacity
                style={[styles.uploadOption, isUploading && styles.uploadingOption]}
                onPress={handleGallerySelection}
                disabled={isUploading}
              >
                <Text style={styles.uploadOptionTitle}>🖼️ Choose from Gallery</Text>
                <Text style={styles.uploadOptionSubtitle}>
                  Select from photos
                </Text>
              </TouchableOpacity>

              {/* Quick Upload Button */}
              <TouchableOpacity
                style={[styles.quickUploadButton, isUploading && styles.uploadingOption]}
                onPress={showUploadOptions}
                disabled={isUploading}
              >
                <Text style={styles.quickUploadIcon}>⚡</Text>
                <Text style={styles.quickUploadText}>Quick Upload</Text>
                <Text style={styles.quickUploadSubtext}>All options in one</Text>
              </TouchableOpacity>
            </View>

            {/* Loading Indicator */}
            {isUploading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4ECDC4" />
                <Text style={styles.loadingText}>Processing...</Text>
              </View>
            )}

            {/* Image Preview */}
            {imagePreview && !isUploading && (
              <View style={styles.previewContainer}>
                <Text style={styles.previewTitle}>Image Preview:</Text>
                <Image
                  source={{ uri: imagePreview }}
                  style={styles.previewImage}
                  resizeMode="contain"
                />
                <Text style={styles.previewFileName}>{uploadedFileName}</Text>
              </View>
            )}

            {/* Uploaded File Info */}
            {uploadedFileName && !isUploading && !imagePreview && (
              <View style={styles.uploadedFileContainer}>
                <Text style={styles.uploadedFileTitle}>Uploaded File:</Text>
                <Text style={styles.uploadedFileName}>
                  {uploadedFileType === 'pdf' ? '📄' : '📷'} {uploadedFileName}
                </Text>
              </View>
            )}

            {/* Policy Data Display */}
            {pdfData && !isUploading && (
              <View style={styles.pdfDataContainer}>
                <Text style={styles.pdfDataTitle}>✅ Policy Details Extracted</Text>
                <Text style={styles.pdfDataText}>
                  Policy Number: {pdfData.policyNumber || 'N/A'}
                </Text>
                {pdfData.policyHolderName && (
                  <Text style={styles.pdfDataText}>
                    Policy Holder: {pdfData.policyHolderName}
                  </Text>
                )}
                {insuredMembers.length > 0 && (
                  <Text style={styles.pdfDataText}>
                    Insured Members: {insuredMembers.length}
                  </Text>
                )}
              </View>
            )}

            {/* Save Button */}
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

            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setPolicyNumberEntered(false)}
            >
              <Text style={styles.backButtonText}>← Edit Insurance Number</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// ======================
// Screen 3: Upload Policy (Standalone)
// ======================
const UploadPolicyScreen = ({ route }: any) => {
  const navigation = useNavigation<any>();
  const { company } = route.params || {};
  const { customerId } = useAuth();
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedFileType, setUploadedFileType] = useState<'pdf' | 'image' | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [pdfData, setPdfData] = useState<any>(null);
  const [insuredMembers, setInsuredMembers] = useState<any[]>([]);

  /** PDF Upload */
  const handlePDFUpload = async () => {
    if (!customerId) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    try {
      const result = await pick({
        type: [types.pdf],
        copyTo: 'cachesDirectory',
      });

      const res = result[0];
      if (!res) return;

      const fileName = res.name ?? 'unknown.pdf';
      const fileUri = res.uri ?? '';
      const fileType = res.type ?? 'application/pdf';

      setUploadedFileName(fileName);
      setUploadedFileType('pdf');
      setImagePreview(null);
      setIsUploading(true);

      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        type: fileType,
        name: fileName,
      } as any);
      formData.append('insuranceCompney', company);

      const response = await fetch(
        `https://policysaath.com/api/v1/customer/pdf-reader/${customerId}`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) throw new Error(`Upload failed: ${response.status}`);

      const data = await response.json();
      setPdfData(data.policyHolder || {});
      setInsuredMembers(data.insuredMembers || []);
      Alert.alert('Success', 'PDF parsed successfully!');
    } catch (err: any) {
      if (!err.message?.includes('canceled') && !err.message?.includes('cancelled')) {
        Alert.alert('Error', `Upload failed: ${err.message}`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  /** Camera Capture */
  const handleCameraCapture = async () => {
    if (!customerId) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1920,
      });

      if (result.didCancel) return;
      if (result.errorCode) {
        Alert.alert('Error', 'Failed to capture image');
        return;
      }

      if (result.assets && result.assets.length > 0) {
        await uploadImage(result.assets[0]);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  /** Gallery Selection */
  const handleGallerySelection = async () => {
    if (!customerId) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1920,
        selectionLimit: 1,
      });

      if (result.didCancel) return;
      if (result.errorCode) {
        Alert.alert('Error', 'Failed to select image');
        return;
      }

      if (result.assets && result.assets.length > 0) {
        await uploadImage(result.assets[0]);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to open gallery');
    }
  };

  /** Upload Image */
  const uploadImage = async (photo: any) => {
    try {
      const fileName = photo.fileName || `photo_${Date.now()}.jpg`;
      const fileUri = photo.uri || '';
      const fileType = photo.type || 'image/jpeg';

      setUploadedFileName(fileName);
      setUploadedFileType('image');
      setImagePreview(fileUri);
      setIsUploading(true);

      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        type: fileType,
        name: fileName,
      } as any);
      formData.append('insuranceCompney', company);

      const response = await fetch(
        `https://policysaath.com/api/v1/customer/pdf-reader/${customerId}`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) throw new Error(`Upload failed: ${response.status}`);

      const data = await response.json();
      setPdfData(data.policyHolder || {});
      setInsuredMembers(data.insuredMembers || []);
      Alert.alert('Success', 'Image processed successfully!');
    } catch (err: any) {
      Alert.alert('Error', `Upload failed: ${err.message}`);
      setImagePreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  /** Show Upload Options */
  const showUploadOptions = () => {
    Alert.alert(
      'Upload Policy Document',
      'Choose your upload method',
      [
        { text: 'Take Photo', onPress: handleCameraCapture },
        { text: 'Choose from Gallery', onPress: handleGallerySelection },
        { text: 'Select PDF', onPress: handlePDFUpload },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  /** Save Policy */
  const handleSavePolicy = async () => {
    if (!pdfData?.policyNumber) {
      Alert.alert('Error', 'No policy data found');
      return;
    }

    try {
      setIsUploading(true);
      
      const payload = {
        policyHolder: {
          customerId,
          ...pdfData,
        },
        insuredMembers,
      };

      const saveUrl = `https://policysaath.com/api/v1/customer/save-pdf-reader/${customerId}`;
      
      const response = await fetch(saveUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      Alert.alert('Success', 'Policy saved successfully!');
      navigation.navigate('CustomerDashboard');
    } catch (err: any) {
      Alert.alert('Save Error', `Failed to save: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4ECDC4" />
      <ScrollView style={styles.content}>
        <Text style={styles.headerTitle}>Upload Your Policy</Text>
        
        {/* Upload Options */}
        <TouchableOpacity 
          style={[styles.uploadOption, isUploading && styles.uploadingOption]} 
          onPress={handlePDFUpload}
          disabled={isUploading}
        >
          <Text style={styles.uploadOptionTitle}>📄 Import PDF</Text>
          <Text style={styles.uploadOptionSubtitle}>
            Select a PDF document
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.uploadOption, isUploading && styles.uploadingOption]} 
          onPress={handleCameraCapture}
          disabled={isUploading}
        >
          <Text style={styles.uploadOptionTitle}>📷 Take Photo</Text>
          <Text style={styles.uploadOptionSubtitle}>
            Capture with camera
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.uploadOption, isUploading && styles.uploadingOption]} 
          onPress={handleGallerySelection}
          disabled={isUploading}
        >
          <Text style={styles.uploadOptionTitle}>🖼️ Choose from Gallery</Text>
          <Text style={styles.uploadOptionSubtitle}>
            Select from photos
          </Text>
        </TouchableOpacity>

        {/* Quick Upload */}
        <TouchableOpacity 
          style={[styles.quickUploadButton, isUploading && styles.uploadingOption]} 
          onPress={showUploadOptions}
          disabled={isUploading}
        >
          <Text style={styles.quickUploadIcon}>⚡</Text>
          <Text style={styles.quickUploadText}>Quick Upload</Text>
          <Text style={styles.quickUploadSubtext}>All options in one</Text>
        </TouchableOpacity>

        {/* Loading */}
        {isUploading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4ECDC4" />
            <Text style={styles.loadingText}>Processing...</Text>
          </View>
        )}

        {/* Image Preview */}
        {imagePreview && !isUploading && (
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>Preview:</Text>
            <Image
              source={{ uri: imagePreview }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          </View>
        )}

        {/* Policy Data */}
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

        {/* Save Button */}
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4ECDC4',
    marginBottom: 12,
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
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonRow: { 
    flexDirection: 'row', 
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
  infoContainer: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#4ECDC4',
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  uploadOptionsContainer: {
    marginBottom: 16,
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
  quickUploadButton: {
    backgroundColor: '#4ECDC4',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  quickUploadIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  quickUploadText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  quickUploadSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  completeButton: {
    backgroundColor: '#4ECDC4',
    padding: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 12,
  },
  completeButtonText: { 
    color: 'white', 
    fontWeight: 'bold' 
  },
  backButton: {
    padding: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#4ECDC4',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#4ECDC4',
    fontWeight: '500',
  },
  previewContainer: {
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
  previewTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginBottom: 12,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#F0F9F8',
  },
  previewFileName: {
    fontSize: 12,
    color: '#61BACA',
    marginTop: 8,
    textAlign: 'center',
  },
  uploadedFileContainer: {
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
  uploadedFileTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginBottom: 8,
  },
  uploadedFileName: {
    fontSize: 14,
    color: '#333',
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