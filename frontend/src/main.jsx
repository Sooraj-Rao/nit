import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"
import { SocketProvider } from "./context/SocketContext"
import { ThemeProvider } from "./context/theme-context"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <SocketProvider>
        <App />
      </SocketProvider>
    </ThemeProvider>
  </React.StrictMode>
)