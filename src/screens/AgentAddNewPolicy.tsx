import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState } from 'react';
import Colors from '../constant/Colors';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Dropdown } from 'react-native-element-dropdown';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const AgentAddNewPolicy = () => {
  const [showPicker, setShowPicker] = useState(false);

  const companyData = [
    { label: 'LIC', value: 'LIC' },
    { label: 'HDFC life', value: 'HDFC life' },
    { label: 'SBI life', value: 'SBI life' },
  ];

  const categoryData = [
    { label: 'LIC', value: 'LIC' },
    { label: 'HDFC life', value: 'HDFC life' },
    { label: 'SBI life', value: 'SBI life' },
  ];

  const typeData = [
    { label: 'LIC', value: 'LIC' },
    { label: 'HDFC life', value: 'HDFC life' },
    { label: 'SBI life', value: 'SBI life' },
  ];

  const ValidationSchema = Yup.object().shape({
    customerName: Yup.string()
      .min(3, 'Name too short')
      .required('Customer name is required'),

    dob: Yup.string().required('Date of birth is required'),
    contactNumber: Yup.string()
      .required('Mobile number is required')
      .matches(/^[6-9]\d{9}$/, 'Enter a valid 10 digit mobile number'),
    email: Yup.string()
      .required('Email is required')
      .matches(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Enter a valid email address',
      ),
    address: Yup.string()
      .trim()
      .required('Address is required')
      .min(10, 'Address must be at least 10 characters')
      .max(250, 'Address must be less than 250 characters'),
    insuranceCompany: Yup.string().required('Insurance company is required'),
    policyNumber: Yup.string().required('Policy number is required'),
    insuranceCategory: Yup.string().required('Insurance Category is required'),
    insuranceType: Yup.string().required('Insurance Type is required'),
    branchName: Yup.string().required('Branch name is required'),
    premiumAmount: Yup.string().required('Premium Amount is required'),
    paymentMode: Yup.string().required('Payment Mode is required'),
    nomineeName: Yup.string().required('Nominee Name is required'),
    nomineeRelation: Yup.string().required('Nominee Relation is required'),
  });

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={{ margin: 16 }}>
        <View style={[styles.row, { gap: 10, marginBottom: 16 }]}>
          <View
            style={{ backgroundColor: '#d1e7dd', padding: 8, borderRadius: 8 }}
          >
            <AntDesign name="file-add" size={26} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.mainHeading}>Add New Policy</Text>
            <Text style={styles.desc}>
              Fill in the customer and insurance details.
            </Text>
          </View>
        </View>

        <View style={[styles.box, { marginBottom: 16 }]}>
          <Text style={styles.mainHeading2}>Customer Information</Text>

          <Formik
            initialValues={{
              customerName: '',
              dob: '',
              contactNumber: '',
              email: '',
              address: '',
              insuranceCompany: '',
              policyNumber: '',
              insuranceCategory: '',
              insuranceType: '',
              branchName: '',
              premiumAmount: '',
              paymentMode: '',
              nomineeName: '',
              nomineeRelation: '',
            }}
            validationSchema={ValidationSchema}
            onSubmit={values => {
              console.log(values);
            }}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              setFieldValue,
            }) => (
              <View>
                {/* Customer Name */}
                <Text style={styles.label}>
                  Customer Name <Text style={styles.star}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.iconBox}>
                    <Ionicons name="person-outline" size={20} color="#0891b2" />
                  </View>
                  <TextInput
                    placeholder="Enter customer name"
                    style={styles.input}
                    value={values.customerName}
                    onChangeText={handleChange('customerName')}
                    onBlur={handleBlur('customerName')}
                  />
                </View>
                {touched.customerName && errors.customerName && (
                  <Text style={styles.error}>{errors.customerName}</Text>
                )}

                {/* Date of Birth */}
                <Text style={styles.label}>
                  Date of Birth <Text style={styles.star}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.iconBox}>
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color="#0891b2"
                    />
                  </View>
                  <TextInput
                    placeholder="mm/dd/yyyy"
                    style={styles.input}
                    value={values.dob}
                    // onChangeText={handleChange('dob')}
                    // onBlur={handleBlur('dob')}
                    editable={false}
                    pointerEvents="none"
                  />
                  <TouchableOpacity
                    style={styles.rightIcon}
                    onPress={() => setShowPicker(true)}
                  >
                    <Ionicons name="calendar" size={18} color="#64748b" />
                  </TouchableOpacity>
                </View>
                {touched.dob && errors.dob && (
                  <Text style={styles.error}>{errors.dob}</Text>
                )}

                {showPicker && (
                  <DateTimePicker
                    value={new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    maximumDate={new Date()}
                    onChange={(event, selectedDate) => {
                      setShowPicker(false);
                      if (selectedDate) {
                        const formattedDate =
                          selectedDate.toLocaleDateString('en-US');
                        setFieldValue('dob', formattedDate);
                      }
                    }}
                  />
                )}

                <Text style={styles.label}>
                  Contact Number <Text style={styles.star}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.iconBox}>
                    <Feather name="phone" size={20} color="#0891b2" />
                  </View>
                  <TextInput
                    placeholder="XXXXXXXXXX"
                    style={styles.input}
                    value={values.contactNumber}
                    onChangeText={handleChange('contactNumber')}
                    onBlur={handleBlur('contactNumber')}
                    keyboardType="number-pad"
                  />
                </View>
                {touched.contactNumber && errors.contactNumber && (
                  <Text style={styles.error}>{errors.contactNumber}</Text>
                )}

                <Text style={styles.label}>
                  Email Address <Text style={styles.star}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.iconBox}>
                    <Feather name="mail" size={20} color="#0891b2" />
                  </View>
                  <TextInput
                    placeholder="Enter email address"
                    style={styles.input}
                    value={values.email}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    keyboardType="email-address"
                  />
                </View>
                {touched.email && errors.email && (
                  <Text style={styles.error}>{errors.email}</Text>
                )}

                <Text style={styles.label}>
                  Address <Text style={styles.star}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.iconBox}>
                    <Ionicons name="location-outline" size={20} color="#0891b2" />
                  </View>
                  <TextInput
                    placeholder="House / Street / City"
                    style={styles.input}
                    value={values.address}
                    onChangeText={handleChange('address')}
                    onBlur={handleBlur('address')}
                  />
                </View>
                {touched.address && errors.address && (
                  <Text style={styles.error}>{errors.address}</Text>
                )}

                <Text style={styles.mainHeading2}>Policy Details</Text>

                <Text style={styles.label}>
                  Insurance Company <Text style={styles.star}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.iconBox}>
                    <FontAwesome name="building-o" size={20} color="#0891b2" />
                  </View>

                  <Dropdown
                    style={{
                      flex: 1,
                      paddingHorizontal: 12,
                      //   height: 45,
                    }}
                    data={companyData}
                    labelField="label"
                    valueField="value"
                    placeholder="Select Insurance Company"
                    placeholderStyle={{ color: Colors.text }}
                    value={values.insuranceCompany}
                    onChange={item => {
                      setFieldValue('insuranceCompany', item.value);
                    }}
                  />
                </View>
                {touched.insuranceCompany && errors.insuranceCompany && (
                  <Text style={styles.error}>{errors.insuranceCompany}</Text>
                )}

                <Text style={styles.label}>
                  Policy Number <Text style={styles.star}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.iconBox}>
                    <FontAwesome name="barcode" size={20} color="#0891b2" />
                  </View>
                  <TextInput
                    placeholder="Enter policy number"
                    style={styles.input}
                    value={values.policyNumber}
                    onChangeText={handleChange('policyNumber')}
                    onBlur={handleBlur('policyNumber')}
                  />
                </View>
                {touched.policyNumber && errors.policyNumber && (
                  <Text style={styles.error}>{errors.policyNumber}</Text>
                )}

                <Text style={styles.label}>
                  Insurance Category <Text style={styles.star}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.iconBox}>
                    <MaterialIcons name="category" size={20} color="#0891b2" />
                  </View>

                  <Dropdown
                    style={{
                      flex: 1,
                      paddingHorizontal: 12,
                      //   height: 45,
                    }}
                    data={categoryData}
                    labelField="label"
                    valueField="value"
                    placeholder="Select category"
                    placeholderStyle={{ color: Colors.text }}
                    value={values.insuranceCategory}
                    onChange={item => {
                      setFieldValue('insuranceCategory', item.value);
                    }}
                  />
                </View>
                {touched.insuranceCategory && errors.insuranceCategory && (
                  <Text style={styles.error}>{errors.insuranceCategory}</Text>
                )}

                <Text style={styles.label}>
                  Insurance Type <Text style={styles.star}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.iconBox}>
                    <FontAwesome name="address-card-o" size={20} color="#0891b2" />
                  </View>

                  <Dropdown
                    style={{
                      flex: 1,
                      paddingHorizontal: 12,
                      //   height: 45,
                    }}
                    data={typeData}
                    labelField="label"
                    valueField="value"
                    placeholder="Select category"
                    placeholderStyle={{ color: Colors.text }}
                    value={values.insuranceType}
                    onChange={item => {
                      setFieldValue('insuranceType', item.value);
                    }}
                  />
                </View>
                {touched.insuranceType && errors.insuranceType && (
                  <Text style={styles.error}>{errors.insuranceType}</Text>
                )}

                <Text style={styles.label}>
                  Branch Name <Text style={styles.star}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.iconBox}>
                    <Ionicons name="location-outline" size={20} color="#0891b2" />
                  </View>
                  <TextInput
                    placeholder="Enter branch name"
                    style={styles.input}
                    value={values.branchName}
                    onChangeText={handleChange('branchName')}
                    onBlur={handleBlur('branchName')}
                  />
                </View>
                {touched.branchName && errors.branchName && (
                  <Text style={styles.error}>{errors.branchName}</Text>
                )}

                <Text style={styles.mainHeading2}>Policy Details</Text>

                <Text style={styles.label}>
                  Premium Amount <Text style={styles.star}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.iconBox}>
                    <FontAwesome name="rupee" size={20} color="#0891b2" />
                  </View>
                  <TextInput
                    placeholder="Enter premium amount"
                    style={styles.input}
                    value={values.premiumAmount}
                    onChangeText={handleChange('premiumAmount')}
                    onBlur={handleBlur('premiumAmount')}
                  />
                </View>
                {touched.premiumAmount && errors.premiumAmount && (
                  <Text style={styles.error}>{errors.premiumAmount}</Text>
                )}

                <Text style={styles.label}>
                  Payment Mode <Text style={styles.star}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.iconBox}>
                    <FontAwesome name="money" size={20} color="#0891b2" />
                  </View>

                  <Dropdown
                    style={{
                      flex: 1,
                      paddingHorizontal: 12,
                      //   height: 45,
                    }}
                    data={typeData}
                    labelField="label"
                    valueField="value"
                    placeholder="Select mode"
                    placeholderStyle={{ color: Colors.text }}
                    value={values.paymentMode}
                    onChange={item => {
                      setFieldValue('paymentMode', item.value);
                    }}
                  />
                </View>
                {touched.paymentMode && errors.paymentMode && (
                  <Text style={styles.error}>{errors.paymentMode}</Text>
                )}

                <Text style={styles.mainHeading2}>Nominee Details</Text>

                <Text style={styles.label}>
                  Nominee Name <Text style={styles.star}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.iconBox}>
                    <Feather name="user" size={20} color="#0891b2" />
                  </View>
                  <TextInput
                    placeholder="Enter nominee name"
                    style={styles.input}
                    value={values.nomineeName}
                    onChangeText={handleChange('nomineeName')}
                    onBlur={handleBlur('nomineeName')}
                  />
                </View>
                {touched.nomineeName && errors.nomineeName && (
                  <Text style={styles.error}>{errors.nomineeName}</Text>
                )}

                <Text style={styles.label}>
                  Nominee Relation <Text style={styles.star}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.iconBox}>
                    <Feather name="users" size={20} color="#0891b2" />
                  </View>
                  <TextInput
                    placeholder="Enter relation"
                    style={styles.input}
                    value={values.nomineeRelation}
                    onChangeText={handleChange('nomineeRelation')}
                    onBlur={handleBlur('nomineeRelation')}
                  />
                </View>
                {touched.nomineeRelation && errors.nomineeRelation && (
                  <Text style={styles.error}>{errors.nomineeRelation}</Text>
                )}

                {/* Submit */}
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    handleSubmit();
                  }}
                >
                  <Text style={styles.buttonText}>Submit</Text>
                </TouchableOpacity>
              </View>
            )}
          </Formik>
        </View>
      </View>
    </ScrollView>
  );
};

export default AgentAddNewPolicy;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainHeading: {
    fontSize: 20,
    color: Colors.primary,
    fontWeight: '700',
  },
  mainHeading2: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: '700',
    borderBottomWidth: 0.5,
    borderColor: Colors.primary,
    paddingBottom: 4,
    marginBottom: 12,
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#0f172a',
  },
  star: {
    color: 'red',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  iconBox: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    height: 45,
    fontSize: 14,
    color: '#0f172a',
  },
  rightIcon: {
    paddingHorizontal: 12,
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#0891b2',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
});
