/**
 * AddPolicyFlowScreens.tsx - Enhanced with Camera & Gallery Support + Toggle Tabs
 *
 * Required packages:
 * npm install @react-native-documents/picker react-native-image-picker
 *
 * For iOS: cd ios && pod install
 * Android: Ensure camera permissions in AndroidManifest.xml
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

// ✅ IMPORTANT: screens are in src/screens, context is in src/context
import { useAuth } from '../context/AuthContext';

// ======================
// Reusable Toggle Tabs
// ======================
const AddPolicyToggleTabs = ({ activeTab }: { activeTab: 'upload' | 'manual' }) => {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'upload' && styles.activeTab]}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('ChooseCompany')}
      >
        <Text style={[styles.tabText, activeTab === 'upload' && styles.activeTabText]}>
          ⬆️ Upload Policy
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'manual' && styles.activeTab]}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('FillManually')}
      >
        <Text style={[styles.tabText, activeTab === 'manual' && styles.activeTabText]}>
          📝 Fill Manually
        </Text>
      </TouchableOpacity>
    </View>
  );
};

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

    navigation.navigate('AddPolicyStep2', { company: selectedCompany });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4ECDC4" />

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {/* ✅ Toggle Tabs */}
        <AddPolicyToggleTabs activeTab="upload" />

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
              activeOpacity={0.85}
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
          activeOpacity={0.9}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// ======================
// Screen 2: Insurance Number + Upload (Combined)
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
    if (skipped) setInsuranceNumber('');
    setPolicyNumberEntered(true);
  };

  /** PDF Upload */
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
      if (!res) return;

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
        { method: 'POST', body: formData }
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
      console.error('PDF upload error:', err);
      Alert.alert('Error', `Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  /** Camera */
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

      if (result.didCancel) return;

      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage || 'Failed to capture image');
        return;
      }

      if (result.assets && result.assets.length > 0) {
        await uploadImage(result.assets[0]);
      }
    } catch (err) {
      console.error('Camera error:', err);
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  /** Gallery */
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

      if (result.didCancel) return;

      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage || 'Failed to select image');
        return;
      }

      if (result.assets && result.assets.length > 0) {
        await uploadImage(result.assets[0]);
      }
    } catch (err) {
      console.error('Gallery error:', err);
      Alert.alert('Error', 'Failed to open gallery');
    }
  };

  /** Upload Image (Camera/Gallery) */
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
        { method: 'POST', body: formData }
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
      Alert.alert('Error', `Upload failed: ${err.message}`);
      setImagePreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  /** Upload Options popup */
  const showUploadOptions = () => {
    Alert.alert('Upload Policy Document', 'Choose your upload method', [
      { text: 'Take Photo', onPress: handleCameraCapture },
      { text: 'Choose from Gallery', onPress: handleGallerySelection },
      { text: 'Select PDF', onPress: handlePDFUpload },
      { text: 'Cancel', style: 'cancel' },
    ]);
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
          ...pdfData, // ✅ fixed
        },
        insuredMembers,
      };

      const saveUrl = `https://policysaath.com/api/v1/customer/save-pdf-reader/${customerId}`;

      const response = await fetch(saveUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

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

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {/* ✅ Toggle Tabs */}
        <AddPolicyToggleTabs activeTab="upload" />

        {!policyNumberEntered ? (
          <>
            <Text style={styles.headerTitle}>Insurance Number (Optional)</Text>

            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                Company: <Text style={{ fontWeight: '700' }}>{company || 'N/A'}</Text>
              </Text>
            </View>

            <TextInput
              style={styles.textInput}
              placeholder="Enter insurance number (optional)"
              placeholderTextColor="#A0B7B3"
              value={insuranceNumber}
              onChangeText={setInsuranceNumber}
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.skipButton}
                onPress={() => handleContinueOrSkip(true)}
                activeOpacity={0.9}
              >
                <Text style={styles.skipButtonText}>Skip</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.continueButtonInRow}
                onPress={() => handleContinueOrSkip(false)}
                activeOpacity={0.9}
              >
                <Text style={styles.continueButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>

            {/* Optional: If you want direct "upload-only" screen */}
            <TouchableOpacity
              style={[styles.secondaryNavButton]}
              onPress={() =>
                navigation.navigate('UploadPolicy', {
                  company,
                  insuranceNumber,
                })
              }
              activeOpacity={0.9}
            >
              <Text style={styles.secondaryNavButtonText}>Go to Upload Screen →</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.headerTitle}>Upload Your Policy</Text>

            <View style={styles.uploadOptionsContainer}>
              <TouchableOpacity
                style={[styles.uploadOption, isUploading && styles.uploadingOption]}
                onPress={handlePDFUpload}
                disabled={isUploading}
                activeOpacity={0.9}
              >
                <Text style={styles.uploadOptionTitle}>📄 Import PDF</Text>
                <Text style={styles.uploadOptionSubtitle}>Select a PDF document</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.uploadOption, isUploading && styles.uploadingOption]}
                onPress={handleCameraCapture}
                disabled={isUploading}
                activeOpacity={0.9}
              >
                <Text style={styles.uploadOptionTitle}>📷 Take Photo</Text>
                <Text style={styles.uploadOptionSubtitle}>Capture with camera</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.uploadOption, isUploading && styles.uploadingOption]}
                onPress={handleGallerySelection}
                disabled={isUploading}
                activeOpacity={0.9}
              >
                <Text style={styles.uploadOptionTitle}>🖼️ Choose from Gallery</Text>
                <Text style={styles.uploadOptionSubtitle}>Select from photos</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickUploadButton, isUploading && styles.uploadingOption]}
                onPress={showUploadOptions}
                disabled={isUploading}
                activeOpacity={0.9}
              >
                <Text style={styles.quickUploadIcon}>⚡</Text>
                <Text style={styles.quickUploadText}>Quick Upload</Text>
                <Text style={styles.quickUploadSubtext}>All options in one</Text>
              </TouchableOpacity>
            </View>

            {isUploading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4ECDC4" />
                <Text style={styles.loadingText}>Processing...</Text>
              </View>
            )}

            {imagePreview && !isUploading && (
              <View style={styles.previewContainer}>
                <Text style={styles.previewTitle}>Image Preview:</Text>
                <Image source={{ uri: imagePreview }} style={styles.previewImage} resizeMode="contain" />
                <Text style={styles.previewFileName}>{uploadedFileName}</Text>
              </View>
            )}

            {uploadedFileName && !isUploading && !imagePreview && (
              <View style={styles.uploadedFileContainer}>
                <Text style={styles.uploadedFileTitle}>Uploaded File:</Text>
                <Text style={styles.uploadedFileName}>
                  {uploadedFileType === 'pdf' ? '📄' : '📷'} {uploadedFileName}
                </Text>
              </View>
            )}

            {pdfData && !isUploading && (
              <View style={styles.pdfDataContainer}>
                <Text style={styles.pdfDataTitle}>✅ Policy Details Extracted</Text>
                <Text style={styles.pdfDataText}>Policy Number: {pdfData.policyNumber || 'N/A'}</Text>
                {pdfData.policyHolderName && (
                  <Text style={styles.pdfDataText}>Policy Holder: {pdfData.policyHolderName}</Text>
                )}
                {insuredMembers.length > 0 && (
                  <Text style={styles.pdfDataText}>Insured Members: {insuredMembers.length}</Text>
                )}
              </View>
            )}

            {pdfData && (
              <TouchableOpacity
                style={[styles.completeButton, isUploading && styles.disabledButton]}
                onPress={handleSavePolicy}
                disabled={isUploading}
                activeOpacity={0.9}
              >
                {isUploading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.completeButtonText}>Save to Dashboard</Text>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setPolicyNumberEntered(false)}
              activeOpacity={0.9}
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
      if (!res) return;

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
        { method: 'POST', body: formData }
      );

      if (!response.ok) throw new Error(`Upload failed: ${response.status}`);

      const data = await response.json();
      setPdfData(data.policyHolder || {});
      setInsuredMembers(data.insuredMembers || []);
      Alert.alert('Success', 'PDF parsed successfully!');
    } catch (err: any) {
      Alert.alert('Error', `Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

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
      });

      if (result.didCancel) return;
      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage || 'Failed to capture image');
        return;
      }

      if (result.assets && result.assets.length > 0) {
        await uploadImage(result.assets[0]);
      }
    } catch {
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  const handleGallerySelection = async () => {
    if (!customerId) {
      Alert.alert('Error', 'User not authenticated. Please login again.');
      return;
    }

    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      });

      if (result.didCancel) return;
      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage || 'Failed to select image');
        return;
      }

      if (result.assets && result.assets.length > 0) {
        await uploadImage(result.assets[0]);
      }
    } catch {
      Alert.alert('Error', 'Failed to open gallery');
    }
  };

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
        { method: 'POST', body: formData }
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
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      Alert.alert('Success', 'Policy saved successfully!');
      navigation.navigate('CustomerDashboard');
    } catch (err: any) {
      Alert.alert('Save Error', `Failed to save: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const showUploadOptions = () => {
    Alert.alert('Upload Policy Document', 'Choose your upload method', [
      { text: 'Take Photo', onPress: handleCameraCapture },
      { text: 'Choose from Gallery', onPress: handleGallerySelection },
      { text: 'Select PDF', onPress: handlePDFUpload },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4ECDC4" />

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {/* ✅ Toggle Tabs */}
        <AddPolicyToggleTabs activeTab="upload" />

        <Text style={styles.headerTitle}>Upload Your Policy</Text>

        <TouchableOpacity
          style={[styles.uploadOption, isUploading && styles.uploadingOption]}
          onPress={handlePDFUpload}
          disabled={isUploading}
          activeOpacity={0.9}
        >
          <Text style={styles.uploadOptionTitle}>📄 Import PDF</Text>
          <Text style={styles.uploadOptionSubtitle}>Select a PDF document</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.uploadOption, isUploading && styles.uploadingOption]}
          onPress={handleCameraCapture}
          disabled={isUploading}
          activeOpacity={0.9}
        >
          <Text style={styles.uploadOptionTitle}>📷 Take Photo</Text>
          <Text style={styles.uploadOptionSubtitle}>Capture with camera</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.uploadOption, isUploading && styles.uploadingOption]}
          onPress={handleGallerySelection}
          disabled={isUploading}
          activeOpacity={0.9}
        >
          <Text style={styles.uploadOptionTitle}>🖼️ Choose from Gallery</Text>
          <Text style={styles.uploadOptionSubtitle}>Select from photos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickUploadButton, isUploading && styles.uploadingOption]}
          onPress={showUploadOptions}
          disabled={isUploading}
          activeOpacity={0.9}
        >
          <Text style={styles.quickUploadIcon}>⚡</Text>
          <Text style={styles.quickUploadText}>Quick Upload</Text>
          <Text style={styles.quickUploadSubtext}>All options in one</Text>
        </TouchableOpacity>

        {isUploading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4ECDC4" />
            <Text style={styles.loadingText}>Processing...</Text>
          </View>
        )}

        {imagePreview && !isUploading && (
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>Preview:</Text>
            <Image source={{ uri: imagePreview }} style={styles.previewImage} resizeMode="contain" />
            <Text style={styles.previewFileName}>{uploadedFileName}</Text>
          </View>
        )}

        {pdfData && !isUploading && (
          <View style={styles.pdfDataContainer}>
            <Text style={styles.pdfDataTitle}>✅ Policy Details Extracted</Text>
            <Text style={styles.pdfDataText}>Policy Number: {pdfData.policyNumber || 'N/A'}</Text>
            {pdfData.policyHolderName && (
              <Text style={styles.pdfDataText}>Policy Holder: {pdfData.policyHolderName}</Text>
            )}
          </View>
        )}

        {pdfData && (
          <TouchableOpacity
            style={[styles.completeButton, isUploading && styles.disabledButton]}
            onPress={handleSavePolicy}
            disabled={isUploading}
            activeOpacity={0.9}
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
    backgroundColor: '#F0F9F8',
  },
  content: {
    flex: 1,
    padding: 20,
  },

  // ✅ Tabs (same feel as your manual screen)
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
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

  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginBottom: 16,
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
    color: '#4ECDC4',
  },

  companyList: {
    marginBottom: 20,
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
    gap: 12,
    marginBottom: 16,
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
    fontWeight: '600',
  },
  continueButtonInRow: {
    flex: 0.6,
    backgroundColor: '#4ECDC4',
    padding: 16,
    borderRadius: 25,
    alignItems: 'center',
  },

  continueButton: {
    backgroundColor: '#4ECDC4',
    padding: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
  },
  continueButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#B0D9D5',
    opacity: 0.7,
  },

  secondaryNavButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#4ECDC4',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  secondaryNavButtonText: {
    color: '#4ECDC4',
    fontWeight: '700',
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
    color: '#4ECDC4',
  },
  uploadOptionSubtitle: {
    fontSize: 14,
    color: '#61BACA',
    marginTop: 4,
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

  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#4ECDC4',
    fontWeight: '600',
  },

  previewContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4ECDC4',
    marginBottom: 10,
  },
  previewImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
  },
  previewFileName: {
    marginTop: 10,
    color: '#333',
    fontWeight: '600',
  },

  uploadedFileContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  uploadedFileTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4ECDC4',
    marginBottom: 8,
  },
  uploadedFileName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },

  pdfDataContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  pdfDataTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#4ECDC4',
    marginBottom: 10,
  },
  pdfDataText: {
    color: '#333',
    fontWeight: '600',
    marginBottom: 6,
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
    fontWeight: 'bold',
  },

  backButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#4ECDC4',
    fontWeight: '700',
  },
});

export { ChooseCompanyScreen, InsuranceNumberScreen, UploadPolicyScreen };
