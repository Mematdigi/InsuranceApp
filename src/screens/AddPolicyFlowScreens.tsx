/**
 * AddPolicyFlowScreens.tsx - Complete Add Policy Flow with Review & Edit
 *
 * Features:
 * - Step 1: Choose Company
 * - Step 2: Enter Policy Number (Optional)
 * - Step 3: Upload (Camera/Gallery/PDF)
 * - Step 4: Review & Edit extracted data before saving
 *
 * Required packages:
 * npm install @react-native-documents/picker react-native-image-picker
 */

import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { pick, types } from '@react-native-documents/picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet';

const API_BASE = 'https://policysaath.com/api';

// ======================
// Toggle Tabs Component
// ======================
const AddPolicyToggleTabs = ({
  activeTab,
}: {
  activeTab: 'upload' | 'manual';
}) => {
  const navigation = useNavigation<any>();
  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'upload' && styles.activeTab]}
        onPress={() => navigation.navigate('ChooseCompany')}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === 'upload' && styles.activeTabText,
          ]}
        >
          Upload Policy
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'manual' && styles.activeTab]}
        onPress={() => navigation.navigate('FillManually')}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === 'manual' && styles.activeTabText,
          ]}
        >
          Fill Manually
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// ======================
// Editable Info Field Component
// ======================
const InfoField = ({
  label,
  value,
  editable,
  onChangeText,
  keyboardType = 'default',
  multiline = false,
}: {
  label: string;
  value: string;
  editable: boolean;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'numeric' | 'phone-pad';
  multiline?: boolean;
}) => (
  <View style={styles.infoFieldContainer}>
    <Text style={styles.infoFieldLabel}>{label}</Text>
    {editable ? (
      <TextInput
        style={[styles.infoFieldInput, multiline && styles.multilineInput]}
        value={value || ''}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        placeholderTextColor="#A0B7B3"
        placeholder={`Enter ${label.toLowerCase()}`}
      />
    ) : (
      <Text style={styles.infoFieldValue}>{value || '-'}</Text>
    )}
  </View>
);

// ======================
// Section Header with Edit Button
// ======================
const SectionHeader = ({
  title,
  isEditing,
  onToggleEdit,
}: {
  title: string;
  isEditing: boolean;
  onToggleEdit: () => void;
}) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <TouchableOpacity style={styles.editButton} onPress={onToggleEdit}>
      <Text style={styles.editButtonText}>
        {isEditing ? '✓ Save' : '✏️ Edit'}
      </Text>
    </TouchableOpacity>
  </View>
);

// ======================
// Screen 1: Choose Company
// ======================
const ChooseCompanyScreen = () => {
  const navigation = useNavigation<any>();
  const [selectedCompany, setSelectedCompany] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { customerId } = useAuth();

  // const insuranceCompanies = [
  //   'Tata AIA Life Insurance',
  //   'Tata AIG General Insurance Company',
  //   'ACKO HEALTH',
  //   'LIC',
  //   'HDFC Life',
  //   'ICICI Prudential',
  //   'Bajaj Allianz',
  //   'Max Life',
  //   'Star Health',
  //   'HDFC ERGO',
  // ];

  // const filteredCompanies = insuranceCompanies.filter(company =>
  //   company.toLowerCase().includes(searchQuery.toLowerCase()),
  // );

  const handleContinue = () => {
    // if (!selectedCompany) {
    //   Alert.alert('Selection Required', 'Please choose an insurance company');
    //   return;
    // }
    // if (!customerId) {
    //   Alert.alert('Error', 'User not authenticated. Please login again.');
    //   return;
    // }
    // navigation.navigate('AddPolicyStep2', { company: selectedCompany });
    navigation.navigate('AddPolicyStep2');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#1F9393" />

      <LinearGradient colors={['#ffffff', '#6FD0CD']} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton2}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle2}>Add Policy</Text>
          <View style={styles.placeholder} />
        </View>

        <View
          style={{
            alignItems: 'center',
            marginTop: '30%',
            gap: 20,
          }}
        >
          <View
            style={{
              backgroundColor: '#6fd0cd8e',
              height: 200,
              width: 200,
              borderRadius: 100,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="document-text-outline" size={100} color={'#fff'} />
          </View>
          <TouchableOpacity
            style={{
              paddingVertical: 10,
              width: '90%',
              borderWidth: 0.5,
              borderColor: '#6FD0CD',
              borderRadius: 20,
              // alignItems: 'center',
              backgroundColor: '#1F9393',
              elevation: 3,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            }}
            onPress={() => {
              navigation.navigate('AddPolicyStep2');
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: '500',
                color: '#ffffff',
                alignSelf: 'center',
              }}
            >
              Upload Policy
            </Text>
            <Ionicons
              name="arrow-forward"
              size={28}
              color={'#ffffff'}
              // style={{ alignSelf:'flex-end' }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              paddingVertical: 10,
              width: '90%',
              borderWidth: 0.5,
              borderColor: '#6FD0CD',
              borderRadius: 20,
              // alignItems: 'center',
              backgroundColor: '#1F9393',
              elevation: 3,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            }}
            onPress={() => {
              navigation.navigate('FillManually');
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: '500',
                color: '#ffffff',
                // alignSelf: 'center',
              }}
            >
              Fill Manually
            </Text>
            <Ionicons
              name="arrow-forward"
              size={28}
              color={'#ffffff'}
              // style={{ position: 'relative', top: 60, right: '-85%' }}
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>
      {/* </ScrollView> */}
    </SafeAreaView>
  );
};

// ======================
// Screen 2: Insurance Number + Upload + Review & Edit
// ======================
const InsuranceNumberScreen = ({ route }: any) => {
  const navigation = useNavigation<any>();
  // const { company } = route.params || {};
  const { customerId } = useAuth();

  // Step management: 'number' | 'upload' | 'review'
  const [currentStep, setCurrentStep] = useState<
    'number' | 'upload' | 'review'
  >('number');

  // Policy number state
  const [insuranceNumber, setInsuranceNumber] = useState('');

  // Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedFileType, setUploadedFileType] = useState<
    'pdf' | 'image' | null
  >(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Extracted data
  const [pdfData, setPdfData] = useState<any>({});
  const [insuredMembers, setInsuredMembers] = useState<any[]>([]);

  // Edit mode toggles (like web app)
  const [editHolder, setEditHolder] = useState(false);
  const [editPolicy, setEditPolicy] = useState(false);
  const [editFamily, setEditFamily] = useState(false);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['28%'], []);

  const openSheet = () => {
    bottomSheetRef.current?.snapToIndex(0);
  };

  const closeSheet = () => {
    bottomSheetRef.current?.close();
  };

  const handleContinueOrSkip = (skipped = false) => {
    if (skipped) setInsuranceNumber('');
    setCurrentStep('upload');
  };

  // Update pdfData field
  const updatePdfData = (field: string, value: string) => {
    setPdfData((prev: any) => ({ ...prev, [field]: value }));
  };

  // Update insured member field
  const updateInsuredMember = (index: number, field: string, value: string) => {
    setInsuredMembers(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  /** PDF Upload */
  const handlePDFUpload = async () => {
    if (!customerId) {
      Alert.alert('Error', 'User not authenticated.');
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
        uri: res.uri ?? '',
        type: res.type ?? 'application/pdf',
        name: fileName,
      } as any);
      // formData.append('insuranceCompney', company);

      const response = await fetch(
        `${API_BASE}/v1/customer/pdf-reader/${customerId}`,
        { method: 'POST', body: formData },
      );

      if (!response.ok) throw new Error(`Upload failed: ${response.status}`);

      const data = await response.json();
      setPdfData(data.policyHolder || {});
      setInsuredMembers(data.insuredMembers || []);
      setCurrentStep('review'); // Move to review step
      Alert.alert(
        'Success',
        'PDF processed! Please review the extracted information.',
      );
    } catch (err: any) {
      if (!err.message?.includes('canceled')) {
        Alert.alert('Error', `Upload failed: ${err.message}`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  /** Camera */
  const handleCameraCapture = async () => {
    if (!customerId) {
      Alert.alert('Error', 'User not authenticated.');
      return;
    }

    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1920,
      });

      if (result.didCancel || result.errorCode) return;
      if (result.assets?.[0]) await uploadImage(result.assets[0]);
    } catch (err) {
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  /** Gallery */
  const handleGallerySelection = async () => {
    if (!customerId) {
      Alert.alert('Error', 'User not authenticated.');
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

      if (result.didCancel || result.errorCode) return;
      if (result.assets?.[0]) await uploadImage(result.assets[0]);
    } catch (err) {
      Alert.alert('Error', 'Failed to open gallery');
    }
  };

  /** Upload Image */
  const uploadImage = async (photo: any) => {
    try {
      const fileName = photo.fileName || `photo_${Date.now()}.jpg`;
      setUploadedFileName(fileName);
      setUploadedFileType('image');
      setImagePreview(photo.uri || '');
      setIsUploading(true);

      const formData = new FormData();
      formData.append('files', {
        uri: photo.uri,
        type: photo.type || 'image/jpeg',
        name: fileName,
      } as any);
      // formData.append('insuranceCompney', company);

      const response = await fetch(
        `${API_BASE}/v1/customer/image-reader/${customerId}`,
        { method: 'POST', body: formData },
      );

      if (!response.ok) throw new Error(`Upload failed: ${response.status}`);

      const data = await response.json();

      if (data.combinedResult) {
        setPdfData(data.combinedResult.policyHolder || {});
        setInsuredMembers(data.combinedResult.insuredMembers || []);
      } else {
        setPdfData(data.policyHolder || {});
        setInsuredMembers(data.insuredMembers || []);
      }

      setCurrentStep('review'); // Move to review step
      Alert.alert(
        'Success',
        'Image processed! Please review the extracted information.',
      );
    } catch (err: any) {
      Alert.alert('Error', `Upload failed: ${err.message}`);
      setImagePreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  /** Save Policy */
  const handleSavePolicy = async () => {
    if (!pdfData?.policyNumber && !pdfData?.policyHolderName) {
      Alert.alert(
        'Error',
        'Please ensure at least policy number or holder name is filled.',
      );
      return;
    }

    try {
      setIsSaving(true);

      const payload = {
        policyHolder: {
          customerId,
          insuranceNumber,
          ...pdfData,
        },
        insuredMembers,
      };

      const response = await fetch(
        `${API_BASE}/v1/customer/save-pdf-reader/${customerId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      Alert.alert('Success', 'Policy saved successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('MyPolicy') },
      ]);
    } catch (err: any) {
      Alert.alert('Error', `Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // ======================
  // Render: Policy Number Step
  // ======================
  const renderNumberStep = () => (
    <>
      {/* <AddPolicyToggleTabs activeTab="upload" /> */}
      <View style={{ marginTop: '30%' }}>
        <View style={styles.stepCard}>
          <View style={styles.stepIconContainer}>
            <Text style={styles.stepIcon}>💳</Text>
          </View>
          <Text style={styles.stepTitle}>Insurance Number</Text>
          <Text style={styles.stepSubtitle}>
            Enter your policy number (optional)
          </Text>

          <View style={styles.tipBox}>
            <Text style={styles.tipText}>
              You can find your policy number on your insurance card. Skip if
              unavailable.
            </Text>
          </View>

          <TextInput
            style={styles.textInput}
            value={insuranceNumber}
            onChangeText={setInsuranceNumber}
            placeholder="Enter policy number"
            placeholderTextColor="#A0B7B3"
          />

          {/* <View style={styles.infoBox}> */}
            {/* <Text style={styles.infoBoxText}>🏢 Company: {company}</Text> */}
          {/* </View> */}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => handleContinueOrSkip(true)}
            >
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.continueButtonInRow}
              onPress={() => handleContinueOrSkip(false)}
            >
              <Text style={styles.continueButtonText}>Continue →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );

  // ======================
  // Render: Upload Step
  // ======================
  const renderUploadStep = () => (
    <>
      {/* <AddPolicyToggleTabs activeTab="upload" /> */}
      <View style={{ marginTop: '15%' }}>
        <View style={styles.stepCard}>
          <View style={styles.stepIconContainer}>
            <Text style={styles.stepIcon}>📤</Text>
          </View>
          <Text style={styles.stepTitle}>Upload Your Policy</Text>
          <Text style={styles.stepSubtitle}>
            Choose how to add your document
          </Text>

          {/* <View style={styles.infoBox}> */}
          {/* <Text style={styles.infoBoxText}>🏢 {company}</Text> */}
          {/* </View> */}

          {isUploading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1F9393" />
              <Text style={styles.loadingText}>
                Processing your document...
              </Text>
            </View>
          ) : (
            <View style={styles.uploadOptionsContainer}>
              {/* <TouchableOpacity
                style={styles.uploadOption}
                onPress={handleCameraCapture}
              >
                <Text style={styles.uploadOptionIcon}>📷</Text>
                <View>
                  <Text style={styles.uploadOptionTitle}>Take Photo</Text>
                  <Text style={styles.uploadOptionSubtitle}>
                    Capture with camera
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.uploadOption}
                onPress={handleGallerySelection}
              >
                <Text style={styles.uploadOptionIcon}>🖼️</Text>
                <View>
                  <Text style={styles.uploadOptionTitle}>
                    Choose from Gallery
                  </Text>
                  <Text style={styles.uploadOptionSubtitle}>
                    Select from photos
                  </Text>
                </View>
              </TouchableOpacity> */}

              <TouchableOpacity style={styles.uploadOption} onPress={openSheet}>
                <Text style={styles.uploadOptionIcon}>🖼️</Text>
                <View>
                  <Text style={styles.uploadOptionTitle}>Upload Photo</Text>
                  <Text style={styles.uploadOptionSubtitle}>
                    Take photo or choose from gallery
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.uploadOption}
                onPress={handlePDFUpload}
              >
                <Text style={styles.uploadOptionIcon}>📄</Text>
                <View>
                  <Text style={styles.uploadOptionTitle}>Import PDF</Text>
                  <Text style={styles.uploadOptionSubtitle}>
                    Select a PDF document
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentStep('number')}
          >
            <Text style={styles.backButtonText}>
              ← Back to Insurance Number
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );

  // ======================
  // Render: Review & Edit Step
  // ======================
  const renderReviewStep = () => (
    <>
      {/* Header */}
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewTitle}>Review & Edit Information</Text>
        <Text style={styles.reviewSubtitle}>
          Verify the extracted details and make corrections if needed
        </Text>
      </View>

      {/* Image Preview (if uploaded image) */}
      {imagePreview && (
        <View style={styles.previewContainer}>
          <Text style={styles.previewTitle}>📷 Uploaded Image</Text>
          <Image
            source={{ uri: imagePreview }}
            style={styles.previewImage}
            resizeMode="contain"
          />
        </View>
      )}

      {/* File Name (if PDF) */}
      {uploadedFileName && !imagePreview && (
        <View style={styles.fileNameContainer}>
          <Text style={styles.fileNameIcon}>📄</Text>
          <Text style={styles.fileNameText}>{uploadedFileName}</Text>
        </View>
      )}

      {/* Policy Holder Section */}
      <View style={styles.reviewSection}>
        <SectionHeader
          title="👤 Policy Holder"
          isEditing={editHolder}
          onToggleEdit={() => setEditHolder(!editHolder)}
        />
        <View style={styles.fieldsGrid}>
          <InfoField
            label="Name"
            value={pdfData.policyHolderName}
            editable={editHolder}
            onChangeText={t => updatePdfData('policyHolderName', t)}
          />
          <InfoField
            label="Contact"
            value={pdfData.policyHolderPhone}
            editable={editHolder}
            onChangeText={t => updatePdfData('policyHolderPhone', t)}
            keyboardType="phone-pad"
          />
          <InfoField
            label="Nominee"
            value={pdfData.nomineeName}
            editable={editHolder}
            onChangeText={t => updatePdfData('nomineeName', t)}
          />
          <InfoField
            label="Nominee Relation"
            value={pdfData.nomineeRelationship}
            editable={editHolder}
            onChangeText={t => updatePdfData('nomineeRelationship', t)}
          />
          <InfoField
            label="Address"
            value={pdfData.policyHolderAddress}
            editable={editHolder}
            onChangeText={t => updatePdfData('policyHolderAddress', t)}
            multiline
          />
        </View>
      </View>

      {/* Policy Details Section */}
      <View style={styles.reviewSection}>
        <SectionHeader
          title="📋 Policy Details"
          isEditing={editPolicy}
          onToggleEdit={() => setEditPolicy(!editPolicy)}
        />
        <View style={styles.fieldsGrid}>
          <InfoField
            label="Policy Number"
            value={pdfData.policyNumber}
            editable={editPolicy}
            onChangeText={t => updatePdfData('policyNumber', t)}
          />
          <InfoField
            label="Product/Plan Name"
            value={pdfData.productName}
            editable={editPolicy}
            onChangeText={t => updatePdfData('productName', t)}
          />
          <InfoField
            label="Insurance Company"
            value={pdfData.policyType}
            editable={editPolicy}
            onChangeText={t => updatePdfData('policyType', t)}
          />
          <InfoField
            label="Policy Period"
            value={pdfData.policyPeriod}
            editable={editPolicy}
            onChangeText={t => updatePdfData('policyPeriod', t)}
          />
          <InfoField
            label="Premium Amount"
            value={pdfData.premiumAmount}
            editable={editPolicy}
            onChangeText={t => updatePdfData('premiumAmount', t)}
            keyboardType="numeric"
          />
          <InfoField
            label="Payment Mode"
            value={pdfData.paymentMode || 'Annual'}
            editable={editPolicy}
            onChangeText={t => updatePdfData('paymentMode', t)}
          />
          <InfoField
            label="End Date"
            value={pdfData.endDate}
            editable={editPolicy}
            onChangeText={t => updatePdfData('endDate', t)}
          />
        </View>
      </View>

      {/* Family Members Section */}
      <View style={styles.reviewSection}>
        <SectionHeader
          title="👨‍👩‍👧‍👦 Family Members"
          isEditing={editFamily}
          onToggleEdit={() => setEditFamily(!editFamily)}
        />
        {insuredMembers.length === 0 ? (
          <Text style={styles.noMembersText}>
            No family members found in document
          </Text>
        ) : (
          insuredMembers.map((member, index) => (
            <View key={index} style={styles.memberCard}>
              <Text style={styles.memberTitle}>Member {index + 1}</Text>
              <View style={styles.fieldsGrid}>
                <InfoField
                  label="Name"
                  value={member.insuredName}
                  editable={editFamily}
                  onChangeText={t =>
                    updateInsuredMember(index, 'insuredName', t)
                  }
                />
                <InfoField
                  label="Relation"
                  value={member.relationship}
                  editable={editFamily}
                  onChangeText={t =>
                    updateInsuredMember(index, 'relationship', t)
                  }
                />
                <InfoField
                  label="DOB"
                  value={member.dob}
                  editable={editFamily}
                  onChangeText={t => updateInsuredMember(index, 'dob', t)}
                />
                <InfoField
                  label="Sum Insured"
                  value={member.sumInsured}
                  editable={editFamily}
                  onChangeText={t =>
                    updateInsuredMember(index, 'sumInsured', t)
                  }
                />
              </View>
            </View>
          ))
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={styles.reuploadButton}
          onPress={() => {
            setCurrentStep('upload');
            setPdfData({});
            setInsuredMembers([]);
            setImagePreview(null);
          }}
        >
          <Text style={styles.reuploadButtonText}>← Re-upload</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.disabledButton]}
          onPress={handleSavePolicy}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveButtonText}>💾 Save to Dashboard</Text>
          )}
        </TouchableOpacity>
      </View>
    </>
  );

  const renderBackdrop = (props: any) => (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      opacity={0.6} // background dark/blur feel
      pressBehavior="close" // background tap se close ❌
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#1F9393" />
      <LinearGradient colors={['#ffffff', '#6FD0CD']} style={{ flex: 1 }}>
        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          {currentStep === 'number' && renderNumberStep()}
          {currentStep === 'upload' && renderUploadStep()}
          {currentStep === 'review' && renderReviewStep()}
          <View style={styles.bottomSpacing} />
        </ScrollView>

        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={snapPoints}
          enablePanDownToClose={true}
          enableOverDrag={false}
          handleComponent={null}
          backdropComponent={renderBackdrop}
          backgroundStyle={{
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
          }}
        >
          <BottomSheetView style={styles.sheetContent}>
            <Text style={styles.sheetTitle}>Upload Policy</Text>

            <TouchableOpacity
              style={styles.sheetButton}
              onPress={() => {
                closeSheet();
                handleCameraCapture();
              }}
            >
              <Text style={styles.sheetIcon}>📷</Text>
              <Text style={styles.sheetText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sheetButton}
              onPress={() => {
                closeSheet();
                handleGallerySelection();
              }}
            >
              <Text style={styles.sheetIcon}>🖼️</Text>
              <Text style={styles.sheetText}>Choose from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={closeSheet} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </BottomSheetView>
        </BottomSheet>
      </LinearGradient>
    </SafeAreaView>
  );
};

// Upload Policy Screen

const UploadPolicyScreen = ({ route }: any) => {
  const navigation = useNavigation<any>();
  const { company } = route.params || {};
  const { customerId } = useAuth();

  const [isUploading, setIsUploading] = useState(false);

  const handlePDFUpload = async () => {
    if (!customerId) return;
    try {
      const result = await pick({
        type: [types.pdf],
        copyTo: 'cachesDirectory',
      });
      if (!result[0]) return;
      // Navigate to step 2 with upload in progress
      navigation.navigate('AddPolicyStep2', { company: company || 'Unknown' });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F9393" />
      <ScrollView style={styles.content}>
        <Text style={styles.headerTitle}>Upload Your Policy</Text>
        <TouchableOpacity style={styles.uploadOption} onPress={handlePDFUpload}>
          <Text style={styles.uploadOptionIcon}>📄</Text>
          <View>
            <Text style={styles.uploadOptionTitle}>Import PDF</Text>
            <Text style={styles.uploadOptionSubtitle}>
              Select a PDF document
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// ======================
// Styles
// ======================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F9F8' },
  content: { flex: 1, padding: 20 },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    elevation: 3,
  },
  tab: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  activeTab: { backgroundColor: '#1F9393' },
  tabText: { fontSize: 14, color: '#61BACA', fontWeight: '600' },
  activeTabText: { color: 'white' },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F9393',
    marginBottom: 16,
  },
  searchSection: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
  },
  searchInput: { fontSize: 16, color: '#1F9393' },

  // Company List
  companyList: { marginBottom: 20 },
  companyItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
  },
  selectedCompanyItem: { backgroundColor: '#1F9393' },
  companyText: { fontSize: 16, color: '#1F9393', fontWeight: '600' },
  selectedCompanyText: { color: 'white' },

  // Step Card
  stepCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    elevation: 4,
  },
  stepIconContainer: {
    alignSelf: 'center',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E8F6F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepIcon: { fontSize: 32 },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 20,
  },

  // Tip Box
  tipBox: {
    backgroundColor: '#E8F6F3',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  tipText: { fontSize: 13, color: '#4A5568', lineHeight: 18 },

  // Info Box
  infoBox: {
    backgroundColor: '#F0F9F8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#1F9393',
  },
  infoBoxText: { fontSize: 14, color: '#2D3748', fontWeight: '500' },

  // Input
  textInput: {
    backgroundColor: '#F8FFFE',
    borderWidth: 1,
    borderColor: '#1F9393',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#2D3748',
    marginBottom: 16,
  },

  // Buttons
  buttonRow: { flexDirection: 'row', gap: 12 },
  skipButton: {
    flex: 0.4,
    borderWidth: 1,
    borderColor: '#1F9393',
    padding: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  skipButtonText: { color: '#1F9393', fontWeight: '600' },
  continueButtonInRow: {
    flex: 0.6,
    backgroundColor: '#1F9393',
    padding: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  continueButton: {
    backgroundColor: '#1F9393',
    padding: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
  },
  continueButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  disabledButton: { backgroundColor: '#B0D9D5', opacity: 0.7 },

  // Upload Options
  uploadOptionsContainer: { marginBottom: 16 },
  uploadOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FFFE',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8F6F3',
  },
  uploadOptionIcon: { fontSize: 28, marginRight: 16 },
  uploadOptionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1F9393' },
  uploadOptionSubtitle: { fontSize: 12, color: '#718096', marginTop: 2 },

  // Loading
  loadingContainer: { padding: 40, alignItems: 'center' },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#1F9393',
    fontWeight: '600',
  },

  // Back Button
  backButton: { padding: 12, alignItems: 'center' },
  backButtonText: { color: '#1F9393', fontWeight: '600' },

  // Review Screen
  reviewHeader: { alignItems: 'center', marginBottom: 20, paddingTop: 10 },
  reviewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  reviewSubtitle: { fontSize: 14, color: '#718096', textAlign: 'center' },

  // Preview
  previewContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 14,
    color: '#1F9393',
    fontWeight: '600',
    marginBottom: 8,
  },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    backgroundColor: '#F0F9F8',
  },

  fileNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  fileNameIcon: { fontSize: 24, marginRight: 12 },
  fileNameText: { fontSize: 14, color: '#2D3748', flex: 1 },

  // Review Sections
  reviewSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8F6F3',
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1F9393' },
  editButton: {
    backgroundColor: '#E8F6F3',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  editButtonText: { fontSize: 12, color: '#1F9393', fontWeight: '600' },

  fieldsGrid: { gap: 8 },

  // Info Field
  infoFieldContainer: { marginBottom: 12 },
  infoFieldLabel: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 4,
    fontWeight: '500',
  },
  infoFieldValue: {
    fontSize: 15,
    color: '#2D3748',
    fontWeight: '500',
    textTransform: 'capitalize',
    paddingVertical: 8,
  },
  infoFieldInput: {
    borderWidth: 1,
    borderColor: '#1F9393',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#2D3748',
    backgroundColor: '#F8FFFE',
  },
  multilineInput: { minHeight: 70, textAlignVertical: 'top' },

  // Member Card
  memberCard: {
    backgroundColor: '#F8FFFE',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#1F9393',
  },
  memberTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F9393',
    marginBottom: 12,
  },
  noMembersText: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    paddingVertical: 20,
  },

  // Action Buttons
  actionButtonsContainer: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 20,
    gap: 12,
  },
  reuploadButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#1F9393',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  reuploadButtonText: { color: '#1F9393', fontWeight: '600' },
  saveButton: {
    flex: 1.5,
    backgroundColor: '#1F9393',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    elevation: 4,
  },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },

  bottomSpacing: { height: 40 },

  header: {
    backgroundColor: '#1F9393',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  backButton2: {
    // padding: 8,
  },
  backArrow: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle2: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  sheetContent: {
    padding: 20,
  },

  sheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },

  sheetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },

  sheetIcon: {
    fontSize: 22,
    marginRight: 12,
  },

  sheetText: {
    fontSize: 16,
  },

  cancelBtn: {
    marginTop: 10,
    paddingVertical: 12,
  },

  cancelText: {
    textAlign: 'center',
    color: 'red',
    fontSize: 16,
  },
});

export { ChooseCompanyScreen, InsuranceNumberScreen, UploadPolicyScreen };
