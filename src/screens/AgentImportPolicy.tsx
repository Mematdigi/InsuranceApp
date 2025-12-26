import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Colors from '../constant/Colors';
import { pick, types } from '@react-native-documents/picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const AgentImportPolicy = () => {
  const pickExcelFile = async () => {
    try {
      const res = await pick({
        type: [types.xlsx, types.xls],
        allowMultiSelection: false,
      });

      const file = res[0];

      console.log('Excel File:', {
        uri: file.uri,
        name: file.name,
        size: file.size,
        type: file.type,
      });
    } catch (err: any) {
      // ❌ User cancelled picker
      if (err?.code === 'DOCUMENT_PICKER_CANCELED') {
        console.log('User cancelled file picker');
        return;
      }

      // ❌ Any other error
      console.error('Document Picker Error:', err);
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={{ margin: 16 }}>
        <View style={[styles.row, { gap: 10, marginBottom: 16 }]}>
          <View
            style={{ backgroundColor: '#d1e7dd', padding: 8, borderRadius: 8 }}
          >
            <FontAwesome name="file-excel-o" size={26} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.mainHeading}>Import Excel Data</Text>
            <Text style={styles.desc}>
              Upload your customer and insurance data in Excel format.
            </Text>
          </View>
        </View>

        <View style={[styles.box, { alignItems: 'center', marginBottom: 16 }]}>
          {/* <Text>hhh</Text> */}
          <Image
            source={require('../../assets/images/icons/excel-icon.webp')}
            style={{
              width: 100,
              height: 100,
              resizeMode: 'cover',
              alignSelf: 'center',
            }}
          />
          <Text style={styles.mainHeading}>Upload Excel File</Text>
          <Text
            style={[styles.desc, { textAlign: 'center', marginBottom: 16 }]}
          >
            Select an Excel file (./xlsx) containing insurance data.
          </Text>

          <TouchableOpacity style={styles.uploadBtn} onPress={pickExcelFile}>
            <Text style={{ color: '#fff' }}>Upload Excel</Text>
          </TouchableOpacity>

          <View style={[styles.box, { width: '100%' }]}>
            <Text style={styles.heading}>How it works</Text>
            <Text style={styles.unorderedList}>
              1. Download/Export your data to a .xlsx file.
            </Text>
            <Text style={styles.unorderedList}>
              2. Ensure the first row contains the exact column headers below.
            </Text>
            <Text style={styles.unorderedList}>
              3. Click the box above or the button to choose your file and
              upload.
            </Text>
          </View>
        </View>

        <View style={[styles.box, { padding: 32 }]}>
          <View style={[styles.row, {gap:4}]}>
            <Ionicons
              name="information-circle-outline"
              color={Colors.secondary}
              size={18}
            />
            <Text style={styles.heading}>Excel File Format Requirements</Text>
          </View>
          <Text style={[styles.unorderedList,{marginBottom:16}]}>
            Ensure your Excel file includes the following columns with proper
            data fomatting:
          </Text>
          <View style={styles.formatCard}>
            <View style={styles.formatIconView}>
              <MaterialIcons name="contacts" color={Colors.primary} size={20} />
            </View>
            <View>
              <Text style={styles.formatHeader}>Customer Name</Text>
              <Text style={styles.formatTitle}>Full Name (required)</Text>
            </View>
          </View>

          <View style={styles.formatCard}>
            <View style={styles.formatIconView}>
              <FontAwesome name="phone" color={Colors.primary} size={20} />
            </View>
            <View>
              <Text style={styles.formatHeader}>Phone no</Text>
              <Text style={styles.formatTitle}>With country code</Text>
            </View>
          </View>

          <View style={styles.formatCard}>
            <View style={styles.formatIconView}>
              <MaterialIcons name="email" color={Colors.primary} size={20} />
            </View>
            <View>
              <Text style={styles.formatHeader}>Email</Text>
              <Text style={styles.formatTitle}>Valid email address</Text>
            </View>
          </View>

          <View style={styles.formatCard}>
            <View style={styles.formatIconView}>
              <Ionicons name="location" color={Colors.primary} size={20} />
            </View>
            <View>
              <Text style={styles.formatHeader}>Address</Text>
              <Text style={styles.formatTitle}>Residental / Business</Text>
            </View>
          </View>
          <View style={styles.formatCard}>
            <View style={styles.formatIconView}>
              <FontAwesome name="building" color={Colors.primary} size={20} />
            </View>
            <View>
              <Text style={styles.formatHeader}>Company Name</Text>
              <Text style={styles.formatTitle}>Insurer / Organization</Text>
            </View>
          </View>
          <View style={styles.formatCard}>
            <View style={styles.formatIconView}>
              <FontAwesome name="address-card-o" color={Colors.primary} size={20} />
            </View>
            <View>
              <Text style={styles.formatHeader}>Insurance Type</Text>
              <Text style={styles.formatTitle}>Health, Auto, Life...</Text>
            </View>
          </View>
          <View style={styles.formatCard}>
            <View style={styles.formatIconView}>
              <MaterialIcons name="category" color={Colors.primary} size={20} />
            </View>
            <View>
              <Text style={styles.formatHeader}>Insurance Category</Text>
              <Text style={styles.formatTitle}>Category / SubCategory</Text>
            </View>
          </View>
          <View style={styles.formatCard}>
            <View style={styles.formatIconView}>
              <Ionicons name="calendar" color={Colors.primary} size={20} />
            </View>
            <View>
              <Text style={styles.formatHeader}>Start Date</Text>
              <Text style={styles.formatTitle}>Policy Start Date</Text>
            </View>
          </View>
          <View style={styles.formatCard}>
            <View style={styles.formatIconView}>
              <Ionicons name="calendar" color={Colors.primary} size={20} />
            </View>
            <View>
              <Text style={styles.formatHeader}>Due Date</Text>
              <Text style={styles.formatTitle}>Policy End Date</Text>
            </View>
          </View>
          <View style={styles.formatCard}>
            <View style={styles.formatIconView}>
              <FontAwesome name="dollar" color={Colors.primary} size={20} />
            </View>
            <View>
              <Text style={styles.formatHeader}>Premium Amount</Text>
              <Text style={styles.formatTitle}>Numeric Value</Text>
            </View>
          </View>
          <View style={styles.formatCard}>
            <View style={styles.formatIconView}>
              <FontAwesome name="hashtag" color={Colors.primary} size={20} />
            </View>
            <View>
              <Text style={styles.formatHeader}>Policy ID</Text>
              <Text style={styles.formatTitle}>Unique Identifier</Text>
            </View>
          </View>
          <View style={styles.formatCard}>
            <View style={styles.formatIconView}>
              <Ionicons name="shield" color={Colors.primary} size={20} />
            </View>
            <View>
              <Text style={styles.formatHeader}>Sum Assured</Text>
              <Text style={styles.formatTitle}>Total Coverage Value</Text>
            </View>
          </View>

          <View style={[styles.formatCard, {backgroundColor:'#eee', }]}>
            <Ionicons name='bulb-outline' size={20} color={Colors.primary} />
            <Text style={{color:Colors.text}}>Tip: Make sure your Excel file has headers in the first row that match these field names for automatic mapping.</Text>
          </View>

        </View>
      </View>
    </ScrollView>
  );
};

export default AgentImportPolicy;

const styles = StyleSheet.create({
  formatCard: {
    elevation: 3,
    borderRadius: 12,
    backgroundColor: '#fff',
    padding: 8,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginBottom:12
  },
  formatIconView: { backgroundColor: '#eee', padding: 12, borderRadius: 12 },
  formatHeader: { fontSize: 16, fontWeight: '500', color: Colors.text },
  formatTitle: { fontSize: 14, color: Colors.text },
  unorderedList: {
    fontSize: 14,
    color: Colors.text,
  },
  heading: {
    fontWeight: '700',
    color: Colors.primary,
    fontSize: 16,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainHeading: {
    fontSize: 20,
    color: Colors.primary,
    fontWeight: '700',
  },
  desc: {
    fontSize: 14,
    color: Colors.text,
  },
  box: {
    backgroundColor: Colors.white,
    padding: 16,
    elevation: 3,
    borderRadius: 12,
  },
  uploadBtn: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
});
