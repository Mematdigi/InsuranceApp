import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface Category {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
}

const FAQScreen = () => {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>('1'); // First FAQ expanded by default
  const [filteredFAQs, setFilteredFAQs] = useState<FAQ[]>([]);

  const categories: Category[] = [
    {
      id: '1',
      title: 'Right Policy',
      subtitle: 'Policy & Plans',
      icon: '🔔',
      color: '#E3F2FD'
    },
    {
      id: '2',
      title: 'Payment methods',
      subtitle: 'Premiums',
      icon: '🛡️',
      color: '#E8F5E8'
    },
    {
      id: '3',
      title: 'Track',
      subtitle: 'Support',
      icon: '📋',
      color: '#FFEBEE'
    }
  ];

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'How to buy a new policy?',
      answer: 'You can purchase a new insurance policy from the "Buy Policy" section in the app. Select the policy type, provide required details, and complete payment.',
      category: 'Policy'
    },
    {
      id: '2',
      question: 'How do I pay my premium online?',
      answer: 'You can pay your premium online through the app by going to the "Pay Premium" section, selecting your policy, and choosing your preferred payment method.',
      category: 'Payment'
    },
    {
      id: '3',
      question: 'How to file a claim?',
      answer: 'To file a claim, go to the "Claims" section in the app, fill out the claim form with required documents, and submit it for processing. You will receive updates on your claim status.',
      category: 'Claims'
    },
    {
      id: '4',
      question: 'Can I add or update my nominee?',
      answer: 'Yes, you can add or update your nominee details by going to the "Profile" section and selecting "Nominees/Dependents". You can modify nominee information at any time.',
      category: 'Policy'
    }
  ];

  useEffect(() => {
    filterFAQs();
  }, [searchQuery]);

  const filterFAQs = () => {
    if (searchQuery.trim() === '') {
      setFilteredFAQs(faqs);
    } else {
      const filtered = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFAQs(filtered);
    }
  };

  const toggleFAQ = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  const CategoryCard = ({ category }: { category: Category }) => (
    <TouchableOpacity 
      style={[styles.categoryCard, { backgroundColor: category.color }]}
      activeOpacity={0.8}
    >
      <View style={styles.categoryIcon}>
        <Text style={styles.categoryIconText}>{category.icon}</Text>
      </View>
      <Text style={styles.categoryTitle}>{category.title}</Text>
      <Text style={styles.categorySubtitle}>{category.subtitle}</Text>
    </TouchableOpacity>
  );

  const FAQItem = ({ faq }: { faq: FAQ }) => {
    const isExpanded = expandedFAQ === faq.id;
    
    return (
      <TouchableOpacity 
        style={styles.faqItem}
        onPress={() => toggleFAQ(faq.id)}
        activeOpacity={0.8}
      >
        <View style={styles.faqHeader}>
          <Text style={styles.faqQuestion}>{faq.question}</Text>
          <Text style={[styles.faqToggle, isExpanded && styles.faqToggleExpanded]}>
            {isExpanded ? '−' : '+'}
          </Text>
        </View>
        {isExpanded && (
          <View style={styles.faqAnswer}>
            <Text style={styles.faqAnswerText}>{faq.answer}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F9393" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FAQ's</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>How can we help you?</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search insurance FAQs"
              placeholderTextColor="#9CD1CE"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </ScrollView>
        </View>

        {/* FAQ Section */}
        <View style={styles.faqSection}>
          <View style={styles.faqSectionHeader}>
            <Text style={styles.faqSectionTitle}>Insurance-Related FAQs:</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.faqList}>
            {filteredFAQs.map((faq) => (
              <FAQItem key={faq.id} faq={faq} />
            ))}
          </View>

          {filteredFAQs.length === 0 && searchQuery.trim() !== '' && (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>No FAQs found</Text>
              <Text style={styles.noResultsSubtext}>Try searching with different keywords</Text>
            </View>
          )}
        </View>

        <View style={styles.bottomSpacing} />
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
    backgroundColor: '#1F9393',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  backButton: {
    // padding: 8,
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
  content: {
    flex: 1,
  },
  titleSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F9393',
    textAlign: 'center',
    lineHeight: 36,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F6F3',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchIcon: {
    fontSize: 20,
    color: '#1F9393',
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F9393',
    fontWeight: '500',
  },
  categoriesContainer: {
    marginBottom: 30,
  },
  categoriesScroll: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  categoryCard: {
    width: 140,
    height: 120,
    borderRadius: 16,
    padding: 16,
    marginRight: 10,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryIcon: {
    alignSelf: 'flex-start',
  },
  categoryIconText: {
    fontSize: 24,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  categorySubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
  },
  faqSection: {
    paddingHorizontal: 20,
  },
  faqSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  faqSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F9393',
  },
  viewAllText: {
    fontSize: 14,
    color: '#1F9393',
    fontWeight: '600',
  },
  faqList: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#1F9393',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F9F8',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1F9393',
    marginRight: 16,
    lineHeight: 22,
  },
  faqToggle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F9393',
    width: 30,
    textAlign: 'center',
  },
  faqToggleExpanded: {
    color: '#1F9393',
  },
  faqAnswer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 20,
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F9393',
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#61BACA',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 40,
  },
});

export default FAQScreen;