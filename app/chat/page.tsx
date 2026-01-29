'use client';

import { useState, useEffect, useRef } from 'react';
import { sendMessage, getSuggestions } from './actions';
import ReactMarkdown from 'react-markdown';

export default function Chat() {
    const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    useEffect(() => {
        getSuggestions([]).then(setSuggestions).catch(console.error);
    }, []);

    const handleSend = async (textInput?: string) => {
        const messageText = typeof textInput === 'string' ? textInput : input;
        if (!messageText.trim() || isLoading) return;

        const userMessage = { role: 'user' as const, text: messageText };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setSuggestions([]);
        setIsLoading(true);

        try {
            setMessages((prev) => [...prev, { role: 'model', text: '' }]);
            
            const stream = await sendMessage(messages, messageText);
            let fullResponse = '';

            for await (const chunk of stream) {
                fullResponse += chunk;
                setMessages((prev) => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].text = fullResponse;
                    return newMessages;
                });
            }

            // Haal nieuwe suggesties op basis van de bijgewerkte historie
            const newHistory = [...messages, userMessage, { role: 'model' as const, text: fullResponse }];
            const newSuggestions = await getSuggestions(newHistory);
            setSuggestions(newSuggestions);
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages((prev) => [...prev, { role: 'model', text: 'Sorry, er is iets misgegaan. Probeer het later opnieuw.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-zinc-50">
            <div className="bg-blue-900 text-white p-4 w-full">
                <div className="container px-auto mx-auto">
                    <h1 className="text-4xl ">Stel ons een Vraag</h1>
                </div>
            </div>
            
            <div className="container mx-auto p-4 flex-1 flex flex-col gap-4 overflow-y-auto">
                 <div className="flex justify-center mt-8">
                    <img src="/logo-wsbd.png" alt="WSBD Logo" className="h-16  object-contain" />
                </div>
                
                {messages.length === 0 && (
                    <p className="text-center text-2xl text-gray-500 mt-4">Vragen over Waterschap Brabantse Delta? Stel ze hier en we geven je direct antwoord.</p>
                )}

                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-lg ${
                            msg.role === 'user' 
                                ? 'bg-blue-900 text-white rounded-br-none' 
                                : 'bg-white border border-gray-200 rounded-bl-none shadow-sm'
                        }`}>
                            {/*<ReactMarkdown>{msg.text}</ReactMarkdown>*/}
                            <ReactMarkdown
    components={{
        a: ({ node, ...props }) => (
            <a 
                {...props} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 underline hover:text-blue-800" // Optioneel: maakt links duidelijk zichtbaar
            />
        )
    }}
>
    {msg.text}
</ReactMarkdown>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-200 p-4 rounded-lg rounded-bl-none animate-pulse">
                            ...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="container mx-auto p-4 sticky bottom-0">
                <div className="relative">
                    {suggestions.length > 0 && (
                        <div className="flex gap-2 mb-2 overflow-x-auto bg-linear-to-b from-transparent to-zinc-50 pb-4">
                            {suggestions.map((suggestion, index) => (
                                <button 
                                    key={index} 
                                    onClick={() => handleSend(suggestion)}
                                    className="whitespace-nowrap bg-white border border-blue-900 text-blue-900 px-4 py-2 rounded-full text-lg hover:bg-blue-50 transition-colors shadow-sm"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    )}
                    <div className="flex bg-zinc-50 -mt-4 pb-4">
                        <textarea 
                        className="w-full h-32 p-6 border border-solid border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-900 pr-24 bg-zinc-50" 
                        placeholder="Stel uw vraag..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend(input);
                            }
                        }}
                    />
                    <button 
                        onClick={() => handleSend(input)}
                        disabled={isLoading || !input.trim()}
                        className="absolute bottom-6 right-6 bg-blue-900 text-white px-4 py-2 rounded-full hover:bg-blue-800 disabled:opacity-50 transition-colors"
                    >
                        Verstuur
                    </button>
                    </div>
                </div>
            </div>
        </div>
    )
}