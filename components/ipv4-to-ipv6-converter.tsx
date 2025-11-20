"use client"

import { useState } from "react"
import { motion } from "framer-motion"

export default function IPv4ToIPv6Converter() {
  const [ipv4, setIpv4] = useState("")
  const [ipv6, setIpv6] = useState("")
  const [activeTab, setActiveTab] = useState<"ipv4" | "ipv6">("ipv4")
  const [error, setError] = useState("")

  const validateIPv4 = (ip: string): boolean => {
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
    if (!ipv4Regex.test(ip)) return false
    const parts = ip.split(".")
    return parts.every((part) => {
      const num = Number.parseInt(part)
      return num >= 0 && num <= 255
    })
  }

  const validateIPv6 = (ip: string): boolean => {
    const ipv6Regex = /^([\da-f]{0,4}:){2,7}[\da-f]{0,4}$/i
    return ipv6Regex.test(ip) || ip === "::"
  }

  const ipv4ToIPv6 = (ipv4: string): string => {
    if (!validateIPv4(ipv4)) {
      setError("Invalid IPv4 address")
      return ""
    }
    setError("")
    const parts = ipv4.split(".")
    const hex = parts.map((part) => {
      const num = Number.parseInt(part)
      return num.toString(16).padStart(2, "0")
    })
    return `::ffff:${hex[0]}${hex[1]}:${hex[2]}${hex[3]}`
  }

  const ipv6ToIPv4 = (ipv6: string): string => {
    if (!validateIPv6(ipv6)) {
      setError("Invalid IPv6 address")
      return ""
    }
    setError("")
    if (!ipv6.includes("ffff")) {
      setError("IPv6 address is not an IPv4-mapped IPv6 address")
      return ""
    }
    const parts = ipv6.split(":")
    const ffff_index = parts.indexOf("ffff")
    if (ffff_index === -1) return ""
    const hex_part = parts[ffff_index + 1]
    const bytes = [
      Number.parseInt(hex_part.substring(0, 2), 16),
      Number.parseInt(hex_part.substring(2, 4), 16),
      Number.parseInt(parts[ffff_index + 2].substring(0, 2), 16),
      Number.parseInt(parts[ffff_index + 2].substring(2, 4), 16),
    ]
    return bytes.join(".")
  }

  const handleConvert = () => {
    if (activeTab === "ipv4") {
      const result = ipv4ToIPv6(ipv4)
      setIpv6(result)
    } else {
      const result = ipv6ToIPv4(ipv6)
      setIpv4(result)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-8"
    >
      <div className="flex gap-4 mb-6 border-b border-slate-700">
        {(["ipv4", "ipv6"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-semibold transition-all ${
              activeTab === tab ? "text-blue-500 border-b-2 border-blue-500" : "text-slate-400 hover:text-slate-300"
            }`}
          >
            {tab === "ipv4" ? "IPv4 to IPv6" : "IPv6 to IPv4"}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {/* Input */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            {activeTab === "ipv4" ? "IPv4 Address" : "IPv6 Address"}
          </label>
          <input
            type="text"
            value={activeTab === "ipv4" ? ipv4 : ipv6}
            onChange={(e) => (activeTab === "ipv4" ? setIpv4(e.target.value) : setIpv6(e.target.value))}
            placeholder={activeTab === "ipv4" ? "192.168.1.1" : "::ffff:c0a8:0101"}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </motion.div>

        {/* Convert Button */}
        <motion.button
          onClick={handleConvert}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-lg shadow-blue-600/50"
        >
          Convert
        </motion.button>

        {/* Output */}
        {(activeTab === "ipv4" ? ipv6 : ipv4) && !error && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {activeTab === "ipv4" ? "IPv6 Address" : "IPv4 Address"}
            </label>
            <div className="bg-slate-700/30 border border-slate-600 rounded-lg px-4 py-3 text-blue-400 font-mono break-all">
              {activeTab === "ipv4" ? ipv6 : ipv4}
            </div>
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-red-500/20 border border-red-500/50 rounded-lg px-4 py-3 text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
