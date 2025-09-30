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
  } | null>(null);
  const [processing, setProcessing] = useState(false);
  
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
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      const errorType = String(event.error);
      
      if (errorType === 'aborted') {
        console.warn('Speech recognition aborted:', errorType);
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
    const lowerText = text.toLowerCase();
    
    // Extract customer name - Telugu patterns and English patterns
    let customerName = '';
    
    // Telugu patterns: కి, కోసం, వాడు, వాళ్ళు, etc.
    const teluguPatterns = [
      /([a-zA-Zఅ-హ\s]+?)(?:\s+కి\s+|\s+కోసం\s+|\s+వాడు\s+|\s+వాళ్ళు\s+)/,
      /([a-zA-Zఅ-హ\s]+?)(?:\s+రూపాయలు|\s+రూపాయల|\s+టకా)/,
      /^([a-zA-Zఅ-హ\s]+?)(?:\s|$|,|\d)/
    ];
    
    // English patterns
    const englishPatterns = [
      /(?:for|to)\s+([a-zA-Z\s]+?)(?:\s|$|,|\d)/,
      /^([a-zA-Z\s]+?)(?:\s|$|,|\d)/
    ];
    
    // Try Telugu patterns first
    for (const pattern of teluguPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        customerName = match[1].trim();
        break;
      }
    }
    
    // If no Telugu match, try English patterns
    if (!customerName) {
      const forMatch = lowerText.match(/(?:for|to)\s+([a-zA-Z\s]+?)(?:\s|$|,|\d)/);
      if (forMatch) {
        customerName = forMatch[1].trim();
      } else {
        // Try to extract name from the beginning
        const nameMatch = lowerText.match(/^([a-zA-Z\s]+?)(?:\s|$|,|\d)/);
        if (nameMatch) {
          customerName = nameMatch[1].trim();
        }
      }
    }

    // Extract amount - Telugu and English patterns
    let amount = 0;
    
    // Telugu currency patterns: రూపాయలు, రూపాయల, టకా
    const teluguAmountMatches = text.match(/(?:రూపాయలు|రూపాయల|టకా)?\s*(\d+(?:\.\d{1,2})?)|(\d+(?:\.\d{1,2})?)\s*(?:రూపాయలు|రూపాయల|టకా)/gi);
    
    // English currency patterns
    const englishAmountMatches = text.match(/(?:rupees?|rs\.?|₹)?\s*(\d+(?:\.\d{1,2})?)|(\d+(?:\.\d{1,2})?)\s*(?:rupees?|rs\.?|₹)/gi);
    
    const amountMatches = teluguAmountMatches || englishAmountMatches;
    if (amountMatches) {
      const numMatch = amountMatches[0].match(/(\d+(?:\.\d{1,2})?)/);
      if (numMatch) {
        amount = parseFloat(numMatch[1]);
      }
    }

    // Determine transaction type
    let type: 'debt' | 'payment' = 'debt';
    
    // Telugu payment keywords: చెల్లించాడు, డబ్బు ఇచ్చాడు, చెల్లింపు, వచ్చింది
    const teluguPaymentKeywords = ['చెల్లించాడు', 'చెల్లించింది', 'డబ్బు ఇచ్చాడు', 'డబ్బు ఇచ్చింది', 'చెల్లింపు', 'వచ్చింది', 'తిరిగి ఇచ్చాడు'];
    
    // Telugu debt keywords: అప్పు, కొన్నాడు, తీసుకున్నాడు, బాకీ
    const teluguDebtKeywords = ['అప్పు', 'కొన్నాడు', 'కొన్నది', 'తీసుకున్నాడు', 'తీసుకున్నది', 'బాకీ', 'రావాల్సింది'];
    
    if (lowerText.includes('paid') || lowerText.includes('payment') || lowerText.includes('received') || lowerText.includes('gave money') ||
        teluguPaymentKeywords.some(keyword => text.includes(keyword))) {
      type = 'payment';
    } else if (lowerText.includes('owes') || lowerText.includes('debt') || lowerText.includes('borrowed') || lowerText.includes('bought') ||
               teluguDebtKeywords.some(keyword => text.includes(keyword))) {
      type = 'debt';
    }

    // Extract description (everything else)
    let description = '';
    const descriptionPatterns = [
      // Telugu patterns
      /(?:కోసం|కొన్నాడు|కొన్నది|తీసుకున్నాడు|తీసుకున్నది)\s+(.+?)(?:\s+(?:రూపాయలు|రూపాయల|టకా|\d)|$)/i,
      /(?:చెల్లించాడు|చెల్లించింది|చెల్లింపు)\s+(.+?)(?:\s+(?:రూపాయలు|రూపాయల|టకా|\d)|$)/i,
      
      // English patterns
      /(?:for|bought|purchased)\s+(.+?)(?:\s+(?:rupees?|rs\.?|₹|\d)|$)/i,
      /(?:owes|debt|borrowed)\s+(.+?)(?:\s+(?:rupees?|rs\.?|₹|\d)|$)/i,
      /(?:paid|payment|received)\s+(.+?)(?:\s+(?:rupees?|rs\.?|₹|\d)|$)/i
    ];
    
    for (const pattern of descriptionPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        description = match[1].trim();
        break;
      }
    }

    // If no specific description found, use a generic one based on type
    if (!description && customerName && amount) {
      description = type === 'debt' ? 'వస్తువులు కొన్నారు' : 'చెల్లింపు వచ్చింది';
    }

    if (customerName && amount > 0) {
      setParsedData({
        customerName: customerName.charAt(0).toUpperCase() + customerName.slice(1),
        amount,
        description,
        type
      });
    }
  };

  const handleConfirm = async () => {
    if (!parsedData) return;

    setProcessing(true);
    try {
      // Check if customer exists
      let customer = customers.find(c => 
        c.name.toLowerCase() === parsedData.customerName!.toLowerCase()
      );

      // If customer doesn't exist, create them
      if (!customer) {
        await addCustomer(parsedData.customerName!);
        // Refresh customers list to get the new customer
        const newCustomers = [...customers];
        customer = newCustomers.find(c => 
          c.name.toLowerCase() === parsedData.customerName!.toLowerCase()
        );
      }

      if (customer) {
        await addTransaction(
          customer.id,
          parsedData.amount!,
          parsedData.description || '',
          parsedData.type || 'debt'
        );

        toast.success(`${parsedData.type === 'debt' ? 'Debt' : 'Payment'} added successfully!`);
        onClose();
        navigate(`/customer/${customer.id}`);
      }
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
                <p className="text-gray-400 text-xs">
                  తెలుగులో మాట్లాడండి: "రాము కి 500 రూపాయలు కిరాణా కోసం" లేదా "మేరీ నుండి 200 రూపాయలు వచ్చింది"
                </p>
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
                {parsedData && (
                  <Button
                    onClick={handleConfirm}
                    loading={processing}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
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