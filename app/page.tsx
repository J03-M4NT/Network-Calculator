"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import IPv4ToIPv6Converter from "@/components/ipv4-to-ipv6-converter"
import IPAnalyzer from "@/components/ip-analyzer"
import SubnetCalculator from "@/components/subnet-calculator"

export default function Home() {
  const [activeTab, setActiveTab] = useState<"converter" | "analyzer" | "subnet">("converter")

  const tabs = [
    { id: "converter", label: "IPv4 ↔ IPv6", icon: "🔄" },
    { id: "analyzer", label: "IP Analyzer", icon: "🔍" },
    { id: "subnet", label: "Subnet CIDR", icon: "🌐" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-2">IP Calculator</h1>
          <p className="text-slate-400 text-lg">Convert, analyze, and manage IP addresses with precision</p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex gap-2 mb-8 flex-wrap justify-center"
        >
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "converter" && <IPv4ToIPv6Converter />}
          {activeTab === "analyzer" && <IPAnalyzer />}
          {activeTab === "subnet" && <SubnetCalculator />}
        </motion.div>
      </div>
    </div>
  )
}
