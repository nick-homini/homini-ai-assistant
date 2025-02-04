(function () {
    
    // Function to load config.txt and parse values
    async function loadConfig() {
        try {
            const response = await fetch("config-solidx.txt");
            const text = await response.text();
            const config = {};
    
            text.split("\n").forEach((line) => {
                // Ignore empty lines or lines without '='
                if (!line.includes("=") || line.trim() === "") return;
    
                // Find the first occurrence of '=' to correctly split key-value
                const separatorIndex = line.indexOf("=");
                const key = line.substring(0, separatorIndex).trim();
                const value = line.substring(separatorIndex + 1).trim();
    
                if (key) {
                    config[key] = value;
                }
            });
    
            return config;
        } catch (error) {
            console.error("Error loading config.txt:", error);
            return {};
        }
    }
    

    // Initialize chatbot widget after loading config
    async function initChatbot() {

        const config = await loadConfig();

        // Default values if config.txt is missing
        const chatbotUrl = config.iframeSrc || "https://homini.live/?embedded=true&embed_options=light_theme,show_padding";
        const chatTextTitle = config.chatTextTitle || "Ask Homini AI Assistent";
        const titleVariable = config.titleVariable || "Homini AI Assistent";

        // Create a style element for CSS
        const style = document.createElement("style");
        style.innerHTML = `
        /* Style for the popup container DESKTOP */
        .popup {
            position: fixed;
            bottom: 2%;
            right: 2%;
            z-index: 1000; /* Ensures the pop-up appears above other content */
            width: 500px;
            height: 90vh;
            background-color: #fff; /* Background color */
            border: 2px solid #888; /* Border styling */
            border-radius: 25px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3); /* Optional shadow for better visibility */
            overflow: auto; /* Adds scrollbars if content overflows */
            display: none; /* Hidden by default */
            transition: height 0.3s ease-in-out;
        }

        /* Hide popup when minimized */
        .popup.minimized {
            display: none !important;
        }

        /* Style for the popup container on mobile devices */
        @media (max-width: 768px) {
            .popup {
                width: 95vw;
                height: 85vh;
            }
        }

        /* Style for the popup content */
        .popup-content {
            position: relative;
            background-color: #fff;
            margin: auto;
            padding: 0;
            width: 100%;
            height: auto;
            max-height: 100%;
            overflow-y: auto;
            animation: fadeIn 0.3s;
        }

        /* Header with minimize button */
        .popup-header {
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 10px;
            font-weight: bold;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        /* Button styles */
        .header-buttons {
            display: flex;
            gap: 10px;
        }

        .popup-btn {
            background: transparent;
            color: white;
            border: none;
            font-size: 18px;
            cursor: pointer;
        }

        .popup-btn:hover {
            color: #ddd;
        }

        /* Responsive iframe container */
        .iframe-container {
            position: relative;
            width: 100%;
            height: 100%;
            padding-top: 5%;
            overflow: hidden;
        }

        .iframe-container iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: 0;
        }

        /* Fade-in animation */
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        `;
        document.head.appendChild(style);
        // Add favicon dynamically
        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = 'Homini-logo.ico'; // Path to your favicon file
        link.type = 'image/x-icon';
        document.head.appendChild(link);

        const meta = document.createElement('meta');
        meta.charset = 'UTF-8';
        document.head.appendChild(meta);
        
        const viewport = document.createElement('meta');
        viewport.name = 'viewport';
        viewport.content = 'width=device-width, initial-scale=1.0';
        document.head.appendChild(viewport);

        const title = document.createElement('title');
        title.innerText = titleVariable;
        document.head.appendChild(title);
        // Create a container div for the icon and text
        const chatContainer = document.createElement("div");
        chatContainer.style.position = "fixed";
        chatContainer.style.bottom = "3%";
        chatContainer.style.right = "3%";
        chatContainer.style.textAlign = "center";
        chatContainer.style.cursor = "pointer";
        chatContainer.style.zIndex = "1000";

        // Create a button to trigger the pop-up
        const openBtn = document.createElement("img");
        openBtn.id = "openPopup";
        openBtn.src = "homini_assistant_icon.svg"; // Update with actual SVG path
        openBtn.alt = "Fråga Homini AI Assistent";
        openBtn.style.borderRadius = "25px";
        openBtn.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.2)";
        openBtn.style.width = "60px";  // Adjust size as needed
        openBtn.style.height = "60px"; // Adjust size as needed
        
        // Create a text element
        const chatText = document.createElement("div");
        chatText.innerText = chatTextTitle;
        chatText.style.color = "#000"; 
        chatText.style.fontSize = "14px";
        chatText.style.marginTop = "10px";
        chatText.style.fontWeight = "400";

        // Append the elements to the container
        chatContainer.appendChild(openBtn);
        chatContainer.appendChild(chatText);
        document.body.appendChild(chatContainer);

        const popup = document.createElement("div");
        popup.id = "popupContainer";
        popup.className = "popup";
        popup.innerHTML = `
        <div class="popup-header">
            <span>${titleVariable}</span>
            <div class="header-buttons">
                <button class="popup-btn" id="minimizeBtn">−</button>
                <button class="popup-btn" id="closePopup">×</button>
            </div>
        </div>
        <div class="popup-content">
            <div class="iframe-container">
                <iframe
                    src='${chatbotUrl}'
                    frameborder="0"
                    id="chatFrame"
                ></iframe>
            </div>
        </div>
        `;
        document.body.appendChild(popup);

        // Get elements
        const minimizeBtn = document.getElementById("minimizeBtn");
        const closeBtn = document.getElementById("closePopup");

        // Close the popup
        closeBtn.addEventListener("click", hidePopup);
        
        // Open the popup
        openBtn.addEventListener("click", showPopup);

        // Minimize popup (hide completely)
        minimizeBtn.addEventListener("click", () => {
            popup.classList.toggle("minimized");
        });
        
        // Click outside to minimize instead of closing
        window.addEventListener("click", (event) => {
            if (!popup.contains(event.target) && !openBtn.contains(event.target)) {
                popup.classList.add("minimized");
            }
        });

        // Function to show the pop-up
        function showPopup() {
            popup.style.display = "block";
            popup.classList.remove("minimized");

            if (popup.scrollIntoView) {
                popup.scrollIntoView({ behavior: "smooth" });
            } else {
                // Fallback for browsers that do not support scrollIntoView with options
                window.scrollTo({
                top: popup.offsetTop,
                behavior: 'smooth'
                });
            }
        }

        // Function to hide the pop-up completely
        function hidePopup() {
            popup.style.display = "none";
        }

        // Auto-focus the chatbot iframe when loaded
        document.getElementById("chatFrame").onload = function() {
            let iframe = document.getElementById("chatFrame").contentWindow;
            iframe.postMessage({ action: "focusChatInput" }, "*");
        };
    }
    // Initialize the chatbot widget
    initChatbot();
})();
