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
  
  const { customers, addCustomer, addTransaction } = useAppContext();
  const navigate = useNavigate();

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'te-IN'; // Telugu (India)

    setIsListening(true);
    setTranscript('');
    setParsedData(null);

    recognition.onresult = (event) => {
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
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);
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

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const stopListening = () => {
    setIsListening(false);
  };

  const parseVoiceInput = (text: string) => {
    console.log('Original text:', text);
    const lowerText = text.toLowerCase().trim();
    
    // First, try to translate Telugu to English for better processing
    const translatedText = translateTeluguToEnglish(text);
    console.log('Translated text:', translatedText);
    
    // Extract customer name - Telugu patterns and English patterns
    let customerName = '';
    
    // Simple approach: Extract first word(s) as customer name
    const words = text.trim().split(/\s+/);
    if (words.length > 0) {
      // Take first 1-2 words as customer name
      customerName = words[0];
      if (words.length > 1 && words[1].length > 2 && !words[1].match(/\d/)) {
        customerName += ' ' + words[1];
      }
      customerName = customerName.replace(/[కికోసంనుండి]/g, '').trim();
    }
    
    console.log('Extracted customer name:', customerName);

    // Extract amount - Telugu and English patterns
    let amount = 0;
    
    // Simple number extraction
    const numberMatch = text.match(/(\d+(?:\.\d{1,2})?)/);
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

  const translateTeluguToEnglish = (text: string): string => {
    // Simple Telugu to English translation mapping
    const translations: { [key: string]: string } = {
      // Names (common Telugu names)
      'రాము': 'Ram',
      'సీత': 'Sita', 
      'కృష్ణ': 'Krishna',
      'ప్రియ': 'Priya',
      'రాజు': 'Raju',
      'లక్ష్మి': 'Lakshmi',
      'వెంకట్': 'Venkat',
      'అనిల్': 'Anil',
      
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
      let customerId = '';
      
      // Check if customer exists
      const existingCustomer = customers.find(c => 
        c.name.toLowerCase() === parsedData.customerName!.toLowerCase()
      );

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        // Create new customer and get their ID
        await addCustomer(parsedData.customerName!);
        
        // Wait a moment for the customer to be added to the context
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Find the newly created customer
        const newCustomer = customers.find(c => 
          c.name.toLowerCase() === parsedData.customerName!.toLowerCase()
        );
        
        if (newCustomer) {
          customerId = newCustomer.id;
        } else {
          throw new Error('Failed to create customer');
        }
      }

      // Add the transaction
      await addTransaction(
        customerId,
        parsedData.amount!,
        parsedData.description || '',
        parsedData.type || 'debt'
      );

      toast.success(`${parsedData.type === 'debt' ? 'Debt' : 'Payment'} added successfully!`);
      resetModal();
      onClose();
      navigate(`/customer/${customerId}`);
      
    } catch (error) {
      console.error('Error processing voice transaction:', error);
      toast.error('Failed to process transaction. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const resetModal = () => {
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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-gradient-to-b from-[#0F172A] to-[#1E293B] rounded-2xl p-6 w-full max-w-md border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Voice Transaction</h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-white transition-colors p-1"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Voice Input Section */}
              <div className="text-center">
                <div className="mb-4">
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
                <p className="text-gray-300 text-sm mb-2">
                  {isListening ? 'Listening... Tap to stop' : 'Tap to start speaking'}
                </p>
                <div className="text-gray-400 text-xs space-y-1">
                  <p className="font-medium">Telugu Examples:</p>
                  <p>"రాము 500 రూపాయలు కిరాణా కొన్నాడు"</p>
                  <p>"సీత 200 రూపాయలు చెల్లించింది"</p>
                  <p className="font-medium mt-2">English Examples:</p>
                  <p>"Ram 500 rupees groceries bought"</p>
                  <p>"Sita 200 rupees paid"</p>
                </div>
              </div>

              {/* Transcript Display */}
              {transcript && (
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-300 mb-2">What you said:</h3>
                  <p className="text-white text-sm">{transcript}</p>
                </div>
              )}

              {/* Parsed Data Display */}
              {parsedData && (
                <div className="bg-white/10 rounded-lg p-4 space-y-3">
                  <h3 className="text-sm font-medium text-gray-300 mb-3">Detected Information:</h3>
                  
                  {parsedData.translatedText && parsedData.translatedText !== transcript && (
                    <div className="bg-blue-500/10 rounded-lg p-3 mb-3">
                      <p className="text-xs text-blue-300 mb-1">English Translation:</p>
                      <p className="text-blue-100 text-sm">{parsedData.translatedText}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-3">
                    <User size={16} className="text-blue-400" />
                    <div>
                      <p className="text-xs text-gray-400">Customer</p>
                      <p className="text-white font-medium">{parsedData.customerName}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <CreditCard size={16} className="text-green-400" />
                    <div>
                      <p className="text-xs text-gray-400">Amount</p>
                      <p className="text-white font-medium">₹{parsedData.amount}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${
                      parsedData.type === 'debt' ? 'bg-red-400' : 'bg-green-400'
                    }`} />
                    <div>
                      <p className="text-xs text-gray-400">Type</p>
                      <p className="text-white font-medium capitalize">{parsedData.type}</p>
                    </div>
                  </div>

                  {parsedData.description && (
                    <div className="flex items-start space-x-3">
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
                  className="flex-1 border border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                {showSubmitButton && (
                  <Button
                    onClick={() => {
                      if (parsedData) {
                        handleConfirm();
                      } else {
                        toast.error('Please speak a valid transaction');
                      }
                    }}
                    loading={processing}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                  >
                    Submit Transaction
                  </Button>
                )}
                {parsedData && showSubmitButton && (
                  <Button
                    onClick={handleConfirm}
                    loading={processing}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white ml-2"
                  >
                    Confirm & Add
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