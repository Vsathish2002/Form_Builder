import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const VoiceNavigation = () => {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  // Speech Output
  const speak = (text) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    window.speechSynthesis.speak(utter);
  };

  // ---------------------------------------------------------
  // FIX: Set Value So React Controlled Inputs Detect Change
  // ---------------------------------------------------------
  const setNativeValue = (element, value) => {
    const valueSetter = Object.getOwnPropertyDescriptor(element, "value")?.set;
    const prototype = Object.getPrototypeOf(element);
    const prototypeSetter = Object.getOwnPropertyDescriptor(
      prototype,
      "value"
    )?.set;

    if (prototypeSetter && valueSetter !== prototypeSetter) {
      prototypeSetter.call(element, value);
    } else if (valueSetter) {
      valueSetter.call(element, value);
    } else {
      element.value = value;
    }

    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  };

  // ---------------------------------------------------------
  // FILL INPUT FIELD (EMAIL, NAME, PASSWORD, ETC)
  // ---------------------------------------------------------
  const fillInput = (selectors, value) => {
    for (let sel of selectors) {
      const el = document.querySelector(sel);
      if (el) {
        try {
          el.focus();
        } catch (e) {}

        setNativeValue(el, value);
        return true;
      }
    }

    return false;
  };

  // ---------------------------------------------------------
  // INIT SPEECH RECOGNITION
  // ---------------------------------------------------------
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported");
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = "en-US";

    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);

    rec.onerror = (e) => {
      console.error("Speech error:", e.error);
      setIsListening(false);
    };

    rec.onresult = (event) => {
      const transcript =
        event.results[event.results.length - 1][0].transcript
          .toLowerCase()
          .trim();
      console.log("Command:", transcript);
      handleCommand(transcript);
    };

    setRecognition(rec);
    rec.start();

    return () => rec && rec.stop();
  }, []);

  // ---------------------------------------------------------
  // HANDLE COMMANDS
  // ---------------------------------------------------------
  const handleCommand = (command) => {
    // ------------------- PAGE NAV -----------------------
    if (command.includes("go to home") || command.includes("home page")) {
      navigate("/");
      speak("Navigating to home page");
      return;
    }

    if (command.includes("go to dashboard")) {
      navigate("/user/dashboard");
      speak("Opening dashboard");
      return;
    }

    if (command.includes("go to login")) {
      navigate("/login");
      speak("Opening login page");
      return;
    }

    if (command.includes("go to register")) {
      navigate("/register");
      speak("Opening registration");
      return;
    }

    if (command.includes("go to my forms")) {
      navigate("/my-forms");
      speak("Opening your forms");
      return;
    }

    if (command.includes("go to profile")) {
      navigate("/profile");
      speak("Opening profile");
      return;
    }

    // ------------------- EMAIL FIELD -----------------------
    if (
      command.startsWith("email is") ||
      command.startsWith("my email is") ||
      command.includes("email address is")
    ) {
      const value = command.replace(/(my )?email( address)? is/, "").trim();
      const ok = fillInput(
        ["#email", "input[name='email']", "input[type='email']"],
        value
      );
      speak(ok ? "Email updated" : "email field not found");
      return;
    }

    // ------------------- NAME FIELD -----------------------
    if (command.startsWith("name is") || command.startsWith("my name is")) {
      const value = command.replace(/(my )?name is/, "").trim();
      const ok = fillInput(["#name", "input[name='name']"], value);
      speak(ok ? "Name updated" : "name field not found");
      return;
    }

    // ------------------- PASSWORD FIELD -----------------------
    if (command.startsWith("password is") || command.startsWith("set password")) {
      const value = command.replace(/password is|set password/i, "").trim();
      const ok = fillInput(["input[type='password']"], value);
      speak(ok ? "Password updated" : "password field not found");
      return;
    }

    // ------------------- UNIVERSAL 'TYPE' -----------------------
    if (
      command.startsWith("type") ||
      command.startsWith("write") ||
      command.startsWith("set")
    ) {
      const value = command
        .replace(/^(type|write|set)/i, "")
        .trim();

      if (!value) {
        speak("Please say something to type");
        return;
      }

      const active = document.activeElement;

      if (
        active &&
        (active.tagName === "INPUT" || active.tagName === "TEXTAREA")
      ) {
        setNativeValue(active, value);
        speak("Typed");
        return;
      }

      speak("No field focused. Please tap a field first.");
      return;
    }

    // ------------------- SCROLLING -----------------------
    if (command.includes("scroll down")) {
      window.scrollBy(0, 600);
      speak("Scrolling down");
      return;
    }

    if (command.includes("scroll up")) {
      window.scrollBy(0, -600);
      speak("Scrolling up");
      return;
    }

    // ------------------- SUBMIT FORM -----------------------
    if (command.includes("submit")) {
      const btn =
        document.querySelector("button[type='submit']") ||
        document.querySelector(".submit");

      if (btn) {
        btn.click();
        speak("Form submitted");
      } else {
        speak("Submit button not found");
      }
      return;
    }

    console.log("Unrecognized:", command);
  };

  // ---------------------------------------------------------
  // TOGGLE VOICE LISTENING
  // ---------------------------------------------------------
  const toggleListening = () => {
    if (!recognition) return;

    if (isListening) recognition.stop();
    else recognition.start();
  };

  // ---------------------------------------------------------
  // UI BUTTON
  // ---------------------------------------------------------
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={toggleListening}
        className={`!p-3 !rounded-full !shadow-lg !transition-colors ${
          isListening ? "!bg-red-500 !text-white" : "!bg-blue-500 !text-white"
        } hover:!opacity-80`}
        title={isListening ? "Stop Voice" : "Start Voice"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 1a4 4 0 00-4 4v6a4 4 0 008 0V5a4 4 0 00-4-4z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 10v1a7 7 0 01-14 0v-1M12 21v-3m0 0v-3m0 3h3m-3 0h-3"
          />
        </svg>
      </button>
    </div>
  );
};

export default VoiceNavigation;
