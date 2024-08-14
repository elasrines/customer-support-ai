"use client";

import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  LinearProgress,
} from "@mui/material";
import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm your Career Guidance Assistant. How can I assist you today?",
    },
  ]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;
    setIsLoading(true);

    const userMessage = message;
    setMessage("");
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: userMessage },
      { role: "assistant", content: "" },
    ]);

    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "meta-llama/llama-3.1-8b-instruct:free",
            messages: [...messages, { role: "user", content: userMessage }],
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      const assistantResponse = data.choices[0].message.content; // Extract only the assistant's response

      setMessages((prevMessages) => {
        let lastMessage = prevMessages[prevMessages.length - 1];
        let otherMessages = prevMessages.slice(0, prevMessages.length - 1);
        return [
          ...otherMessages,
          { ...lastMessage, content: assistantResponse },
        ];
      });
    } catch (error) {
      console.error("Error:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "assistant",
          content: "I encountered an issue. Please try again later.",
        },
      ]);
    }

    setIsLoading(false);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Box
      sx={{
        p: 3,
        maxWidth: "80%",
        mx: "auto",
        backgroundColor: "#f9f9f9",
        borderRadius: "12px",
        boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Stack spacing={3} sx={{ mb: 3 }}>
        {messages.map((message, i) => (
          <Box
            key={i}
            sx={{
              display: "flex",
              justifyContent:
                message.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <Box
              sx={{
                maxWidth: "75%",
                p: 2,
                border: "1px solid #ccc",
                borderRadius: "16px",
                boxShadow: 1,
                backgroundColor:
                  message.role === "user" ? "#007bff" : "#f1f1f1",
                color: message.role === "user" ? "#ffffff" : "#333333",
              }}
            >
              <Typography
                sx={{
                  whiteSpace: "pre-line",
                  wordBreak: "break-word",
                }}
              >
                {message.content}
              </Typography>
            </Box>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Stack>

      {isLoading && <LinearProgress />}

      <TextField
        fullWidth
        multiline
        minRows={3}
        maxRows={8}
        value={message}
        label="Ask your question..."
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        sx={{
          mb: 3,
          backgroundColor: "#ffffff",
          borderRadius: "8px",
        }}
      />

      <Button
        fullWidth
        variant="contained"
        onClick={sendMessage}
        disabled={isLoading}
        sx={{
          backgroundColor: "#28a745",
          color: "#ffffff",
          borderRadius: "8px",
          "&:hover": {
            backgroundColor: "#218838",
          },
        }}
      >
        Send
      </Button>
    </Box>
  );
}
