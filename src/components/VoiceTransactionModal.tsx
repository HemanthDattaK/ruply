import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, X, User, Plus, CreditCard } from 'lucide-react';
import Button from './ui/Button';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface VoiceTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VoiceTransactionModal: React.FC<VoiceTransactionModalProps> = ({ isOpen, onClose }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsedData, setParsedData] = useState<{
    customerName?: string;
    amount?: number;
    description?: string;
    type?: 'debt' | 'payment';
    translatedText?: string;
  } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [showSubmitButton, setShowSubmitButton] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  
  const { customers, addCustomer, addTransaction } = useAppContext();
  const navigate = useNavigate();

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }

    // Stop any existing recognition
    if (recognition) {
      recognition.stop();
      recognition.abort();
    }
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const newRecognition = new SpeechRecognition();
    
    newRecognition.continuous = true;
    newRecognition.interimResults = true;
    newRecognition.lang = 'te-IN'; // Telugu (India)

    setRecognition(newRecognition);
    setIsListening(true);

    newRecognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      
      if (finalTranscript) {
        setTranscript(finalTranscript);
        parseVoiceInput(finalTranscript);
        setShowSubmitButton(true);
        // Auto-stop after getting final result
        newRecognition.stop();
      }
    };

    newRecognition.onerror = (event) => {
      setIsListening(false);
      setRecognition(null);
      const errorType = String(event.error);
      
      if (errorType === 'aborted') {
        console.warn('Speech recognition aborted:', errorType);
      } else if (errorType === 'no-speech') {
        console.warn('No speech detected:', errorType);
        toast.error('No speech detected. Please speak clearly into your microphone.');
      } else {
        console.error('Speech recognition error:', errorType);
        toast.error('Speech recognition error. Please try again.');
      }
    };

    newRecognition.onend = () => {
      setIsListening(false);
      setRecognition(null);
    };

    newRecognition.start();
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      recognition.abort();
      setRecognition(null);
    }
    setIsListening(false);
  };

  const parseVoiceInput = (text: string) => {
    console.log('Original text:', text);
    const lowerText = text.toLowerCase().trim();
    
    // First, convert Telugu numbers to digits, then translate to English
    const numbersConverted = convertTeluguNumbersToDigits(text);
    const translatedText = translateTeluguToEnglish(numbersConverted);
    console.log('Translated text:', translatedText);
    
    // Extract customer name - Telugu patterns and English patterns
    let customerName = '';
    
    // Improved name extraction
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    
    // Remove common Telugu particles and find the actual name
    const nameWords = [];
    for (let i = 0; i < Math.min(3, words.length); i++) {
      const word = words[i];
      // Skip numbers, currency words, and common particles
      if (!word.match(/\d/) && 
          !['రూపాయలు', 'రూపాయల', 'టకా', 'rupees', 'కి', 'కో', 'నుండి', 'వరకు'].includes(word.toLowerCase())) {
        // Clean the word of Telugu particles
        const cleanWord = word.replace(/[కికోసంనుండివరకు]/g, '').trim();
        if (cleanWord.length > 1) {
          nameWords.push(cleanWord);
        }
        // Stop after finding 2 name words or if we hit a transaction keyword
        if (nameWords.length >= 2 || 
            ['కొన్నాడు', 'కొన్నది', 'చెల్లించాడు', 'చెల్లించింది', 'bought', 'paid'].includes(word.toLowerCase())) {
          break;
        }
      }
    }
    
    customerName = nameWords.join(' ');
    
    console.log('Extracted customer name:', customerName);

    // Extract amount - Telugu and English patterns
    let amount = 0;
    
    // Extract from both original and translated text
    const numberMatch = numbersConverted.match(/(\d+(?:\.\d{1,2})?)/);
    if (numberMatch) {
      amount = parseFloat(numberMatch[1]);
    }
    
    console.log('Extracted amount:', amount);

    // Determine transaction type
    let type: 'debt' | 'payment' = 'debt';
    
    // Check for payment keywords
    const paymentKeywords = ['చెల్లించాడు', 'చెల్లించింది', 'వచ్చింది', 'paid', 'payment', 'received'];
    const debtKeywords = ['కొన్నాడు', 'కొన్నది', 'అప్పు', 'బాకీ', 'bought', 'owes', 'debt'];
    
    if (paymentKeywords.some(keyword => text.includes(keyword))) {
      type = 'payment';
    } else if (debtKeywords.some(keyword => text.includes(keyword))) {
      type = 'debt';
    }
    
    console.log('Detected type:', type);

    // Simple description extraction
    let description = '';
    if (text.includes('కిరాణా') || text.includes('groceries')) {
      description = 'Groceries';
    } else if (text.includes('వస్తువులు') || text.includes('items')) {
      description = 'Items purchased';
    } else if (type === 'payment') {
      description = 'Payment received';
    } else {
      description = 'Purchase';
    }
    
    console.log('Final parsed data:', { customerName, amount, description, type });

    if (customerName && amount > 0) {
      setParsedData({
        customerName: customerName.charAt(0).toUpperCase() + customerName.slice(1),
        amount,
        description,
        type,
        translatedText
      });
    } else {
      console.log('Invalid transaction - missing customer name or amount');
    }
  };

  const convertTeluguNumbersToDigits = (text: string): string => {
    // Telugu number words to digits mapping
    const teluguNumbers: { [key: string]: string } = {
      // Basic numbers
      'ఒకటి': '1',
      'రెండు': '2', 
      'మూడు': '3',
      'నాలుగు': '4',
      'అయిదు': '5',
      'ఆరు': '6',
      'ఏడు': '7',
      'ఎనిమిది': '8',
      'తొమ్మిది': '9',
      'పది': '10',
      
      // Teens
      'పదకొండు': '11',
      'పన్నెండు': '12',
      'పదమూడు': '13',
      'పద్నాలుగు': '14',
      'పదిహేను': '15',
      'పదహారు': '16',
      'పదిహేడు': '17',
      'పద్దెనిమిది': '18',
      'పందొమ్మిది': '19',
      
      // Tens
      'ఇరవై': '20',
      'ముప్పై': '30',
      'నలభై': '40',
      'యాభై': '50',
      'అరవై': '60',
      'డెబ్బై': '70',
      'ఎనభై': '80',
      'తొంభై': '90',
      
      // Hundreds
      'వంద': '100',
      'రెండువందలు': '200',
      'మూడువందలు': '300',
      'నాలుగువందలు': '400',
      'అయిదువందలు': '500',
      'ఆరువందలు': '600',
      'ఏడువందలు': '700',
      'ఎనిమిదివందలు': '800',
      'తొమ్మిదివందలు': '900',
      
      // Thousands
      'వేయి': '1000',
      'రెండువేలు': '2000',
      'మూడువేలు': '3000',
      'నాలుగువేలు': '4000',
      'అయిదువేలు': '5000',
      
      // Common combinations
      'రెండువందల': '200',
      'మూడువందల': '300',
      'నాలుగువందల': '400',
      'అయిదువందల': '500',
      'ఆరువందల': '600',
      'ఏడువందల': '700',
      'ఎనిమిదివందల': '800',
      'తొమ్మిదివందల': '900'
    };

    let convertedText = text;
    
    // Replace Telugu number words with digits
    Object.entries(teluguNumbers).forEach(([telugu, digit]) => {
      const regex = new RegExp(telugu, 'gi');
      convertedText = convertedText.replace(regex, digit);
    });
    
    console.log('Numbers converted:', text, '->', convertedText);
    return convertedText;
  };

  const translateTeluguToEnglish = (text: string): string => {
    // Simple Telugu to English translation mapping
    const translations: { [key: string]: string } = {
      // Names (common Telugu names)
      'రాము': 'Ram',
      'రామ': 'Ram',
      'సీత': 'Sita', 
      'సీతా': 'Sita',
      'కృష్ణ': 'Krishna',
      'కృష్ణా': 'Krishna',
      'ప్రియ': 'Priya',
      'ప్రియా': 'Priya',
      'రాజు': 'Raju',
      'రాజ': 'Raja',
      'లక్ష్మి': 'Lakshmi',
      'లక్ష్మీ': 'Lakshmi',
      'వెంకట్': 'Venkat',
      'వెంకటేష్': 'Venkatesh',
      'అనిల్': 'Anil',
      'అనిత': 'Anita',
      'సుధా': 'Sudha',
      'రవి': 'Ravi',
      'రవీ': 'Ravi',
      'మీరా': 'Meera',
      'గీతా': 'Geetha',
      'రాధ': 'Radha',
      'రాధా': 'Radha',
      
      // Currency
      'రూపాయలు': 'rupees',
      'రూపాయల': 'rupees',
      'టకా': 'rupees',
      
      // Transaction types - Debt
      'అప్పు': 'owes',
      'కొన్నాడు': 'bought',
      'కొన్నది': 'bought',
      'తీసుకున్నాడు': 'took',
      'తీసుకున్నది': 'took',
      'బాకీ': 'debt',
      'రావాల్సింది': 'owes',
      
      // Transaction types - Payment
      'చెల్లించాడు': 'paid',
      'చెల్లించింది': 'paid',
      'డబ్బు ఇచ్చాడు': 'gave money',
      'డబ్బు ఇచ్చింది': 'gave money',
      'చెల్లింపు': 'payment',
      'వచ్చింది': 'received',
      'తిరిగి ఇచ్చాడు': 'returned money',
      
      // Items/Description
      'కిరాణా': 'groceries',
      'వస్తువులు': 'items',
      'కోసం': 'for',
      'నుండి': 'from',
      'కి': 'to'
    };

    let translatedText = text;
    
    // Replace Telugu words with English equivalents
    Object.entries(translations).forEach(([telugu, english]) => {
      const regex = new RegExp(telugu, 'gi');
      translatedText = translatedText.replace(regex, english);
    });
    
    return translatedText;
  };

  const handleConfirm = async () => {
    if (!parsedData) return;

    setProcessing(true);
    try {
      let customer: any;
      
      // Check if customer exists
      const existingCustomer = customers.find(c => 
        c.name.toLowerCase() === parsedData.customerName!.toLowerCase()
      );

      if (existingCustomer) {
        customer = existingCustomer;
      } else {
        // Create new customer and get the returned customer object
        customer = await addCustomer(parsedData.customerName!);
      }

      // Add the transaction
      await addTransaction(
        customer.id,
        parsedData.amount!,
        parsedData.description || '',
        parsedData.type || 'debt'
      );

      toast.success(`${parsedData.type === 'debt' ? 'Debt' : 'Payment'} added successfully!`);
      resetModal();
      onClose();
      navigate(`/customer/${customer.id}`);
      
    } catch (error) {
      console.error('Error processing voice transaction:', error);
      toast.error('Failed to process transaction. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const resetModal = () => {
    // Stop any active recognition
    if (recognition) {
      recognition.stop();
      recognition.abort();
      setRecognition(null);
    }
    setTranscript('');
    setParsedData(null);
    setIsListening(false);
    setShowSubmitButton(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="bg-gradient-to-b from-[#0F172A] to-[#1E293B] rounded-2xl p-4 sm:p-6 w-full max-w-md mx-4 border border-white/10 max-h-[90vh] overflow-y-auto"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-gradient-to-b from-[#0F172A] to-[#1E293B] rounded-2xl p-6 w-full max-w-md border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Voice Transaction</h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-white transition-colors p-2 -mr-2"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Voice Input Section */}
              <div className="text-center">
                <div className="mb-3">
                  <motion.button
                    onClick={isListening ? stopListening : startListening}
                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                      isListening
                        ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                        : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isListening ? (
                      <MicOff size={32} className="text-white" />
                    ) : (
                      <Mic size={32} className="text-white" />
                    )}
                  </motion.button>
                </div>
                <p className="text-gray-300 text-sm mb-3">
                  {isListening ? 'Listening... Tap to stop' : 'Tap to start speaking'}
                </p>
                <div className="text-gray-400 text-xs space-y-1">
                  <p className="font-medium">Telugu Examples:</p>
                  <p className="break-words">"రాము అయిదువందలు రూపాయలు కొన్నాడు"</p>
                  <p className="break-words">"సీత రెండువందలు రూపాయలు చెల్లించింది"</p>
                  <p className="font-medium mt-2">English Examples:</p>
                  <p className="break-words">"Ram five hundred rupees bought"</p>
                  <p className="break-words">"Sita two hundred rupees paid"</p>
                </div>
              </div>

              {/* Transcript Display */}
              {transcript && (
                <div className="bg-white/10 rounded-lg p-3">
                  <h3 className="text-sm font-medium text-gray-300 mb-2">What you said:</h3>
                  <p className="text-white text-sm">{transcript}</p>
                </div>
              )}

              {/* Parsed Data Display */}
              {parsedData && (
                <div className="bg-white/10 rounded-lg p-3 space-y-2">
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Detected Information:</h3>
                  
                  {parsedData.translatedText && parsedData.translatedText !== transcript && (
                    <div className="bg-blue-500/10 rounded-lg p-2 mb-2">
                      <p className="text-xs text-blue-300 mb-1">English Translation:</p>
                      <p className="text-blue-100 text-sm">{parsedData.translatedText}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <User size={16} className="text-blue-400" />
                    <div>
                      <p className="text-xs text-gray-400">Customer</p>
                      <p className="text-white font-medium">{parsedData.customerName}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <CreditCard size={16} className="text-green-400" />
                    <div>
                      <p className="text-xs text-gray-400">Amount</p>
                      <p className="text-white font-medium">₹{parsedData.amount}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full ${
                      parsedData.type === 'debt' ? 'bg-red-400' : 'bg-green-400'
                    }`} />
                    <div>
                      <p className="text-xs text-gray-400">Type</p>
                      <p className="text-white font-medium capitalize">{parsedData.type}</p>
                    </div>
                  </div>

                  {parsedData.description && (
                    <div className="flex items-start space-x-2">
                      <Plus size={16} className="text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-400">Description</p>
                        <p className="text-white font-medium">{parsedData.description}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  onClick={handleClose}
                  className="flex-1 border border-white/20 text-white hover:bg-white/10 text-sm py-2"
                >
                  Cancel
                </Button>
                {showSubmitButton && parsedData && (
                  <Button
                    onClick={handleConfirm}
                    loading={processing}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm py-2"
                  >
                    Submit
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VoiceTransactionModal;