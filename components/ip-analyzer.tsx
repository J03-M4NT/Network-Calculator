"use client"

import { useState } from "react"
import { motion } from "framer-motion"

interface IPInfo {
  ip: string
  class: string
  type: string
  binary: string
  decimal: string
  hexadecimal: string
  firstByte: number
}

export default function IPAnalyzer() {
  const [ip, setIp] = useState("")
  const [info, setInfo] = useState<IPInfo | null>(null)
  const [error, setError] = useState("")

  const validateIPv4 = (ipStr: string): boolean => {
    const parts = ipStr.split(".")
    if (parts.length !== 4) return false
    return parts.every((part) => {
      const num = Number.parseInt(part)
      return num >= 0 && num <= 255 && part === num.toString()
    })
  }

  const analyzeIP = (ipStr: string) => {
    if (!validateIPv4(ipStr)) {
      setError("Invalid IPv4 address")
      setInfo(null)
      return
    }

    setError("")
    const parts = ipStr.split(".").map((p) => Number.parseInt(p))
    const firstByte = parts[0]

    // Determine class
    let classType = ""
    if (firstByte < 128) classType = "A"
    else if (firstByte < 192) classType = "B"
    else if (firstByte < 224) classType = "C"
    else if (firstByte < 240) classType = "D"
    else classType = "E"

    // Determine type (private/public/special)
    let type = "Public"
    if (ipStr === "127.0.0.1") type = "Loopback"
    else if (ipStr === "0.0.0.0") type = "All Zeros"
    else if (ipStr === "255.255.255.255") type = "Broadcast"
    else if (ipStr.startsWith("10.")) type = "Private (Class A)"
    else if (ipStr.startsWith("172.") && parts[1] >= 16 && parts[1] <= 31) type = "Private (Class B)"
    else if (ipStr.startsWith("192.168.")) type = "Private (Class C)"
    else if (ipStr.startsWith("169.254.")) type = "Link-Local"

    // Convert to binary
    const binary = parts.map((p) => p.toString(2).padStart(8, "0")).join(".")

    // Convert to decimal notation
    const decimal = (parts[0] * 16777216 + parts[1] * 65536 + parts[2] * 256 + parts[3]).toString()

    // Convert to hexadecimal
    const hexadecimal = parts.map((p) => p.toString(16).padStart(2, "0")).join(":")

    setInfo({
      ip: ipStr,
      class: classType,
      type,
      binary,
      decimal,
      hexadecimal,
      firstByte,
    })
  }

  const handleAnalyze = () => {
    analyzeIP(ip)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="space-y-6">
      {/* Input Section */}
      <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-8">
        <label className="block text-sm font-medium text-slate-300 mb-3">Enter IPv4 Address</label>
        <div className="flex gap-3">
          <input
            type="text"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAnalyze()}
            placeholder="192.168.1.1"
            className="flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <motion.button
            onClick={handleAnalyze}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 rounded-lg transition-all shadow-lg shadow-blue-600/50"
          >
            Analyze
          </motion.button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/20 border border-red-500/50 rounded-lg px-4 py-3 text-red-400"
        >
          {error}
        </motion.div>
      )}

      {/* Results */}
      {info && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {[
            { label: "Class", value: info.class },
            { label: "Type", value: info.type },
            { label: "Decimal", value: info.decimal },
            { label: "Hex", value: info.hexadecimal },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-lg p-4"
            >
              <p className="text-slate-400 text-sm mb-1">{item.label}</p>
              <p className="text-white font-semibold text-lg">{item.value}</p>
            </motion.div>
          ))}

          <motion.div
            variants={itemVariants}
            className="md:col-span-2 bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-lg p-4"
          >
            <p className="text-slate-400 text-sm mb-2">Binary</p>
            <p className="text-blue-400 font-mono text-sm break-all">{info.binary}</p>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}
