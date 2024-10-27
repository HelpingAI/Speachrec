import React, { useState, useEffect, useRef } from 'react';
import { Mic, Copy, Check, Globe, Volume2 } from 'lucide-react';

const languages = [
  { code: 'en-IN', name: 'English (India)' },
  { code: 'hi-IN', name: 'Hindi (India)' },
  { code: 'bn-IN', name: 'Bengali (India)' },
  { code: 'te-IN', name: 'Telugu (India)' },
  { code: 'ta-IN', name: 'Tamil (India)' },
  { code: 'mr-IN', name: 'Marathi (India)' },
  { code: 'gu-IN', name: 'Gujarati (India)' },
  { code: 'kn-IN', name: 'Kannada (India)' },
  { code: 'ml-IN', name: 'Malayalam (India)' },
  { code: 'pa-IN', name: 'Punjabi (India)' },
  { code: 'en-US', name: 'English (United States)' },
  { code: 'es-ES', name: 'Spanish (Spain)' },
  { code: 'fr-FR', name: 'French (France)' },
  { code: 'de-DE', name: 'German (Germany)' },
  { code: 'it-IT', name: 'Italian (Italy)' },
  { code: 'ja-JP', name: 'Japanese (Japan)' },
  { code: 'ko-KR', name: 'Korean (South Korea)' },
  { code: 'zh-CN', name: 'Chinese (Simplified, China)' },
  { code: 'ru-RU', name: 'Russian (Russia)' },
  { code: 'ar-SA', name: 'Arabic (Saudi Arabia)' },
];

function App() {
  const [isListening, setIsListening] = useState(false);
  const [text, setText] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('en-IN');
  const [copied, setCopied] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = selectedLanguage;

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
            setConfidence(event.results[i][0].confidence);
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        setText(finalTranscript + interimTranscript);
      };
    } else {
      console.log('Speech recognition not supported');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [selectedLanguage]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
    setIsListening(!isListening);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLanguage(event.target.value);
    if (recognitionRef.current) {
      recognitionRef.current.lang = event.target.value;
      if (isListening) {
        recognitionRef.current.stop();
        recognitionRef.current.start();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex flex-col items-center justify-center p-4 transition-all duration-500">
      <div className="bg-white bg-opacity-90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-2xl transform hover:scale-105 transition-all duration-300">
        <h1 className="text-5xl font-extrabold text-center mb-8 bg-gradient-to-r from-indigo-600 to-pink-500 text-transparent bg-clip-text">
          Speech to Text
        </h1>
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <Globe className="w-6 h-6 mr-2 text-indigo-600" />
            <label htmlFor="language-select" className="text-gray-700 font-semibold text-lg">
              Select Language:
            </label>
          </div>
          <select
            id="language-select"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
            value={selectedLanguage}
            onChange={handleLanguageChange}
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
        <div className="relative mb-6 group">
          <textarea
            className="w-full h-48 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Start speaking..."
            readOnly
          />
          <button
            className={`absolute bottom-2 right-2 p-2 rounded-full ${
              copied ? 'bg-green-500' : 'bg-gray-200 group-hover:bg-indigo-100'
            } transition-all duration-300`}
            onClick={copyToClipboard}
            title="Copy to clipboard"
          >
            {copied ? <Check className="w-5 h-5 text-white" /> : <Copy className="w-5 h-5 text-gray-600" />}
          </button>
        </div>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Volume2 className="w-5 h-5 mr-2 text-indigo-600" />
            <p className="text-sm font-medium text-gray-700">
              Confidence: <span className="font-bold text-indigo-600">{(confidence * 100).toFixed(2)}%</span>
            </p>
          </div>
          <p className={`text-sm font-medium ${isListening ? 'text-green-600' : 'text-gray-600'}`}>
            Status: {isListening ? 'Listening...' : 'Not listening'}
          </p>
        </div>
        <button
          className={`w-full py-4 rounded-lg text-white font-bold text-lg flex items-center justify-center transition-all duration-300 transform hover:scale-105 ${
            isListening
              ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
              : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'
          }`}
          onClick={toggleListening}
        >
          <Mic className={`w-6 h-6 mr-2 ${isListening ? 'animate-pulse' : ''}`} />
          {isListening ? 'Stop Recording' : 'Start Recording'}
        </button>
      </div>
      <p className="mt-6 text-sm text-white opacity-75 font-medium">
        © 2024 HelpingAI. All rights reserved.
      </p>
    </div>
  );
}

export default App;