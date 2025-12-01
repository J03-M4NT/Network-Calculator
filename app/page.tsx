"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import IPv4ToIPv6Converter from "@/components/ipv4-to-ipv6-converter"
import IPAnalyzer from "@/components/ip-analyzer"
import SubnetCalculator from "@/components/subnet-calculator"

export default function Home() {
  const [activeTab, setActiveTab] = useState<"converter" | "analyzer" | "subnet">("converter")

  const tabs = [
    { id: "converter", label: "Conversor IPv4/IPv6", icon: "🔄" },
    { id: "analyzer", label: "Analizador IP", icon: "🔍" },
    { id: "subnet", label: "Subneteo CIDR", icon: "🌐" },
  ]

  return (
    <div className="min-h-screen app-bg relative">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="card p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-2">Calculadora IP</h1>
          <p className="text-slate-400 text-lg">Convierte, analiza y gestiona direcciones IP con precisión</p>
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
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className={`tab ${activeTab === tab.id ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-lg' : 'text-slate-200'} `}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="whitespace-nowrap">{tab.label}</span>
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
          <div className="mt-6">
            {activeTab === "converter" && <IPv4ToIPv6Converter />}
            {activeTab === "analyzer" && <IPAnalyzer />}
            {activeTab === "subnet" && <SubnetCalculator />}
          </div>
        </motion.div>
        </div>
      </div>
    </div>
  )
}
