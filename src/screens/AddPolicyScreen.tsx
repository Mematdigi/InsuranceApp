import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
  Dimensions,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { launchCamera, CameraOptions, MediaType } from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';

const { width } = Dimensions.get('window');

interface Company {
  id: string;
  name: string;
  logo: string;
}

interface selectedFile{
    name: string;
    uri:string,
    type:string,
    size:number,
}
const AddPolicyScreen = () => {
  const navigation = useNavigation<any>();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [policyNumber, setPolicyNumber] = useState('');
  const [uploadMethod, setUploadMethod] = useState<'camera' | 'pdf' | null>(null);
  const[selectedFile, setSelectedFile] = useState<selectedFile | null>(null);

  const companies: Company[] = [
    { id: '1', name: 'HDFC ERGO General Insurance', logo: '🏢' },
    { id: '2', name: 'ICICI Lombard', logo: '🏦' },
    { id: '3', name: 'Bajaj Allianz', logo: '🏪' },
    { id: '4', name: 'Star Health Insurance', logo: '⭐' },
    { id: '5', name: 'New India Assurance', logo: '🇮🇳' },
    { id: '6', name: 'Oriental Insurance', logo: '🏛️' },
    { id: '7', name: 'United India Insurance', logo: '🏢' },
    { id: '8', name: 'National Insurance', logo: '🏦' },
  ];

  const getStepProgress = () => {
    return (currentStep / 3) * 100;
  };
  
  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs access to camera to take photos of your policy documents.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };
  
  const handleTakePhoto = () => {
    requestCameraPermission().then((hasPermission) => {
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
        return;
      }
      
      const options: CameraOptions = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1920,
      maxHeight: 1080,
      includeBase64: false,
    };
    
    launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.errorMessage) {
        Alert.alert('Error', 'Failed to take photo: ' + response.errorMessage);
      } else if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        setSelectedFile({
          name: asset.fileName || 'policy_photo.jpg',
          uri: asset.uri || '',
          type: asset.type || 'image/jpeg',
          size: asset.fileSize || 0,
        });
        Alert.alert('Success', 'Photo captured successfully!');
      }
    });
  });
  };

  const handleSelectPDF = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
        allowMultiSelection: false,
      });

      if (result && result[0]) {
        const file = result[0];
        setSelectedFile({
          name: file.name || 'policy_document.pdf',
          uri: file.uri,
          type: file.type || 'application/pdf',
          size: file.size || 0,
        });
        Alert.alert('Success', `PDF selected: ${file.name}`);
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled PDF selection');
      } else {
        Alert.alert('Error', 'Failed to select PDF: ' + err);
      }
    }
  };

  const handleContinue = () => {
    if (currentStep === 1 && !selectedCompany) {
      Alert.alert('Error', 'Please select an insurance company');
      return;
    }
    
    if (currentStep === 3 && !uploadMethod) {
      Alert.alert('Error', 'Please select an upload method');
      return;
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleCompleteSetup();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleSkip = () => {
    if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handleCompleteSetup = () => {
    Alert.alert(
      'Success',
      'Policy setup completed successfully!',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  // Removed duplicate handleTakePhoto function to fix redeclaration error.

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBackground}>
        <View style={[styles.progressFill, { width: `${getStepProgress()}%` }]} />
      </View>
      <Text style={styles.progressText}>{Math.round(getStepProgress())}%</Text>
    </View>
  );

  const renderStepIndicators = () => (
    <View style={styles.stepIndicators}>
      <View style={styles.stepItem}>
        <View style={[styles.stepCircle, currentStep >= 1 && styles.activeStepCircle]}>
          <Text style={[styles.stepNumber, currentStep >= 1 && styles.activeStepNumber]}>
            {currentStep > 1 ? '✓' : '1'}
          </Text>
        </View>
        <View style={styles.stepInfo}>
          <Text style={[styles.stepTitle, currentStep === 1 && styles.activeStepTitle]}>
            Choose Company
          </Text>
          <Text style={styles.stepSubtitle}>Select your insurance provider</Text>
        </View>
      </View>

      <View style={styles.stepItem}>
        <View style={[styles.stepCircle, currentStep >= 2 && styles.activeStepCircle]}>
          <Text style={[styles.stepNumber, currentStep >= 2 && styles.activeStepNumber]}>
            {currentStep > 2 ? '✓' : '2'}
          </Text>
        </View>
        <View style={styles.stepInfo}>
          <Text style={[styles.stepTitle, currentStep === 2 && styles.activeStepTitle]}>
            Insurance Number
          </Text>
          <Text style={styles.stepSubtitle}>Add your policy number (optional)</Text>
        </View>
      </View>

      <View style={styles.stepItem}>
        <View style={[styles.stepCircle, currentStep >= 3 && styles.activeStepCircle]}>
          <Text style={[styles.stepNumber, currentStep >= 3 && styles.activeStepNumber]}>3</Text>
        </View>
        <View style={styles.stepInfo}>
          <Text style={[styles.stepTitle, currentStep === 3 && styles.activeStepTitle]}>
            Upload Policy
          </Text>
          <Text style={styles.stepSubtitle}>Add your policy document</Text>
        </View>
      </View>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepIcon}>🏢</Text>
        <Text style={styles.stepMainTitle}>Choose Your Insurance Company</Text>
        <Text style={styles.stepDescription}>
          Select your insurance provider from the list below
        </Text>
      </View>

      <View style={styles.companyList}>
        {companies.map((company) => (
          <TouchableOpacity
            key={company.id}
            style={[
              styles.companyCard,
              selectedCompany?.id === company.id && styles.selectedCompanyCard
            ]}
            onPress={() => setSelectedCompany(company)}
          >
            <Text style={styles.companyLogo}>{company.logo}</Text>
            <Text style={[
              styles.companyName,
              selectedCompany?.id === company.id && styles.selectedCompanyName
            ]}>
              {company.name}
            </Text>
            {selectedCompany?.id === company.id && (
              <View style={styles.selectedIndicator}>
                <Text style={styles.checkmark}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepIcon}>🆔</Text>
        <Text style={styles.stepMainTitle}>Insurance Number</Text>
        <Text style={styles.stepDescription}>
          Enter your policy number (optional)
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoIcon}>ℹ️</Text>
        <Text style={styles.infoText}>
          You can find your policy number on your insurance card or documents. 
          Don't worry if you don't have it – you can skip this step!
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Enter your policy number</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Policy number"
          value={policyNumber}
          onChangeText={setPolicyNumber}
          placeholderTextColor="#9CD1CE"
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepIcon}>⬆️</Text>
        <Text style={styles.stepMainTitle}>Upload Your Policy</Text>
        <Text style={styles.stepDescription}>
          Choose how you'd like to add your policy document
        </Text>
      </View>

      <View style={styles.uploadOptions}>
        <TouchableOpacity
          style={[
            styles.uploadCard,
            uploadMethod === 'camera' && styles.selectedUploadCard
          ]}
          onPress={() => setUploadMethod('camera')}
        >
          <View style={styles.uploadIcon}>
            <Text style={styles.uploadEmoji}>📷</Text>
          </View>
          <Text style={styles.uploadTitle}>Take a Picture</Text>
          <Text style={styles.uploadSubtitle}>
            Use your camera to capture your policy document
          </Text>
          {uploadMethod === 'camera' && (
            <TouchableOpacity style={styles.actionButton} onPress={handleTakePhoto}>
              <Text style={styles.actionButtonText}>Open Camera</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.uploadCard,
            uploadMethod === 'pdf' && styles.selectedUploadCard
          ]}
          onPress={() => setUploadMethod('pdf')}
        >
          <View style={styles.uploadIcon}>
            <Text style={styles.uploadEmoji}>📄</Text>
          </View>
          <Text style={styles.uploadTitle}>Import PDF</Text>
          <Text style={styles.uploadSubtitle}>
            Upload a PDF file of your policy document
          </Text>
          {uploadMethod === 'pdf' && (
            <TouchableOpacity style={styles.actionButton} onPress={handleSelectPDF}>
              <Text style={styles.actionButtonText}>Select PDF</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return renderStep1();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1D837F" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Policy</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Progress */}
        {renderProgressBar()}
        
        {/* Step Indicators */}
        {renderStepIndicators()}

        {/* Step Content */}
        {renderCurrentStep()}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity onPress={handleBack} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>← Back</Text>
        </TouchableOpacity>
        
        {currentStep === 2 && (
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity onPress={handleContinue} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>
            {currentStep === 3 ? 'Complete Setup' : 'Continue →'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1D837F',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    flex: 1,
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginVertical: 20,
    shadowColor: '#1D837F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  progressBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#D7EAEE',
    borderRadius: 4,
    marginRight: 16,
  },
  progressFill: {
    height: 8,
    backgroundColor: '#1D837F',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1D837F',
  },
  stepIndicators: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#1D837F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D7EAEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activeStepCircle: {
    backgroundColor: '#1D837F',
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#61BACA',
  },
  activeStepNumber: {
    color: 'white',
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#61BACA',
    marginBottom: 4,
  },
  activeStepTitle: {
    color: '#1D837F',
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#9CD1CE',
  },
  stepContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#1D837F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  stepIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  stepMainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1D837F',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: '#61BACA',
    textAlign: 'center',
    lineHeight: 24,
  },
  companyList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  companyCard: {
    width: (width - 72) / 2,
    backgroundColor: '#F0F9F8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  selectedCompanyCard: {
    borderColor: '#1D837F',
    backgroundColor: '#E6F7F5',
  },
  companyLogo: {
    fontSize: 32,
    marginBottom: 12,
  },
  companyName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#61BACA',
    textAlign: 'center',
    lineHeight: 16,
  },
  selectedCompanyName: {
    color: '#1D837F',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1D837F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E6F7F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#B8E6E1',
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1D837F',
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D837F',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#D7EAEE',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#FAFFFE',
    color: '#1D837F',
  },
  uploadOptions: {
    gap: 20,
  },
  uploadCard: {
    backgroundColor: '#F0F9F8',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    borderStyle: 'dashed',
  },
  selectedUploadCard: {
    borderColor: '#1D837F',
    backgroundColor: '#E6F7F5',
    borderStyle: 'solid',
  },
  uploadIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(29, 131, 127, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadEmoji: {
    fontSize: 36,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D837F',
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: '#61BACA',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: '#1D837F',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomActions: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#D7EAEE',
    gap: 12,
  },
  secondaryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D7EAEE',
  },
  secondaryButtonText: {
    color: '#61BACA',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  skipButtonText: {
    color: '#9CD1CE',
    fontSize: 16,
    fontWeight: '500',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#1D837F',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddPolicyScreen;