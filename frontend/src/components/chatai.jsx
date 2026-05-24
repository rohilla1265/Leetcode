import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../../utils/axiosClient";
import { Send } from 'lucide-react';

function ChatAi({ problem, userCode = "", language = "javascript" }) {
    // 1. userCode aur language ko ya toh props se lein ya default value dein
    const [messages, setMessages] = useState([
        { role: 'model', parts: [{ text: "Hi, How are you" }] },
        { role: 'user', parts: [{ text: "I am Good" }] }
    ]);

    // Hint state maintain karne ke liye taaki 1 se lekar 3 tak increment ho sake
    const [hintCount, setHintCount] = useState(1);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const onSubmit = async (data) => {
        const userMessage = { role: 'user', parts: [{ text: data.message }] };
        const updatedMessages = [...messages, userMessage];

        setMessages(updatedMessages);
        reset();

        try {
            // 2. Exact wahi payload bhejein jo backend ko chahiye aur jo Thunder Client mein chal gaya tha
            const response = await axiosClient.post("/ai/hint", {
                problemId: problem?._id,
                userCode: userCode,
                language: language,
                hintCount: hintCount,
                message: data.message,
                chatHistory: messages
            });

            if (response.data?.success) {
                setMessages(prev => [...prev, {
                    role: 'model',
                    parts: [{ text: response.data?.hint || "No hint found" }] // 3. Backend se 'hint' key aa rahi hai
                }]);

                // Agli baar ke liye hint level badhayein agar available ho
                if (response.data?.hasNextHint) {
                    setHintCount(prev => prev + 1);
                }
            }
        } catch (error) {
            console.error("API Error:", error);
            setMessages(prev => [...prev, {
                role: 'model',
                parts: [{ text: "Error from AI Chatbot" }]
            }]);
        }
    };

    return (
        <div className="flex flex-col h-[500px] max-h-[60vh] w-full bg-base-100 rounded-xl overflow-hidden">
            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`chat ${msg.role === "user" ? "chat-end" : "chat-start"}`}
                    >
                        <div className={`chat-bubble text-sm ${msg.role === "user" ? "bg-indigo-600 text-white" : "bg-base-200 text-base-content"}`}>
                            {msg.parts?.[0]?.text || ""}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="p-4 bg-base-100 border-t border-base-300 grid grid-cols-[1fr_auto] gap-2 items-center"
            >
                <input
                    placeholder="Ask for a hint..."
                    className="input input-bordered input-sm w-full"
                    {...register("message", { required: true })}
                />
                <button
                    type="submit"
                    className="btn btn-indigo btn-sm square"
                >
                    <Send size={16} />
                </button>
            </form>
        </div>
    );
}

export default ChatAi;