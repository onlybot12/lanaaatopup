"use client"

import { useEffect, type ReactNode, useCallback, useContext, createContext, useState } from "react"
import { AlertCircle, CheckCircle, Info, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

type AlertType = "success" | "error" | "info" | "warning"

interface CustomAlertProps {
  type?: AlertType
  title?: string
  message: string
  duration?: number
  onClose?: () => void
  isOpen?: boolean
}

export function CustomAlert({
  type = "info",
  title,
  message,
  duration = 5000,
  onClose,
  isOpen = true,
}: CustomAlertProps) {
  const [isVisible, setIsVisible] = useState(isOpen)

  useEffect(() => {
    setIsVisible(isOpen)
  }, [isOpen])

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        if (onClose) onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  const handleClose = () => {
    setIsVisible(false)
    if (onClose) onClose()
  }

  const getIcon = (): ReactNode => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "info":
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getContainerStyles = (): string => {
    const baseStyles = "rounded-lg shadow-lg p-4 border flex items-start gap-3"

    switch (type) {
      case "success":
        return cn(baseStyles, "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800")
      case "error":
        return cn(baseStyles, "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800")
      case "warning":
        return cn(baseStyles, "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800")
      case "info":
      default:
        return cn(baseStyles, "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800")
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-[90%]"
        >
          <div className={getContainerStyles()}>
            {getIcon()}
            <div className="flex-1">
              {title && <h4 className="font-medium mb-1">{title}</h4>}
              <p className="text-sm">{message}</p>
            </div>
            <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Context untuk mengelola alert global

interface AlertContextType {
  showAlert: (props: Omit<CustomAlertProps, "isOpen" | "onClose">) => void
  hideAlert: () => void
}

const AlertContext = createContext<AlertContextType | undefined>(undefined)

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState<CustomAlertProps | null>(null)

  const showAlert = useCallback((props: Omit<CustomAlertProps, "isOpen" | "onClose">) => {
    setAlert({ ...props, isOpen: true, onClose: () => setAlert(null) })
  }, [])

  const hideAlert = useCallback(() => {
    setAlert(null)
  }, [])

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      {alert && <CustomAlert {...alert} />}
    </AlertContext.Provider>
  )
}

export function useAlert() {
  const context = useContext(AlertContext)
  if (context === undefined) {
    throw new Error("useAlert must be used within an AlertProvider")
  }
  return context
}

