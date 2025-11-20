"use client"

import { useState } from "react"
import { motion } from "framer-motion"

interface SubnetInfo {
  network: string
  netmask: string
  broadcast: string
  firstHost: string
  lastHost: string
  hostCount: number
  cidr: number
}

export default function SubnetCalculator() {
  const [input, setInput] = useState("")
  const [info, setInfo] = useState<SubnetInfo | null>(null)
  const [error, setError] = useState("")

  const validateIPv4 = (ip: string): boolean => {
    const parts = ip.split(".")
    if (parts.length !== 4) return false
    return parts.every((part) => {
      const num = Number.parseInt(part)
      return num >= 0 && num <= 255 && part === num.toString()
    })
  }

  const parseSubnet = (input: string): [string, number] | null => {
    const parts = input.split("/")
    if (parts.length !== 2) return null
    const ip = parts[0]
    const cidr = Number.parseInt(parts[1])
    if (!validateIPv4(ip) || cidr < 0 || cidr > 32) return null
    return [ip, cidr]
  }

  const ipToNumber = (ip: string): number => {
    const parts = ip.split(".").map((p) => Number.parseInt(p))
    return parts[0] * 16777216 + parts[1] * 65536 + parts[2] * 256 + parts[3]
  }

  const numberToIp = (num: number): string => {
    const a = Math.floor(num / 16777216) & 255
    const b = Math.floor(num / 65536) & 255
    const c = Math.floor(num / 256) & 255
    const d = num & 255
    return `${a}.${b}.${c}.${d}`
  }

  const calculateSubnet = (input: string) => {
    const parsed = parseSubnet(input)
    if (!parsed) {
      setError("Invalid format. Use: 192.168.1.0/24")
      setInfo(null)
      return
    }

    setError("")
    const [ip, cidr] = parsed

    const mask = (0xffffffff << (32 - cidr)) >>> 0
    const ipNum = ipToNumber(ip)
    const network = ipNum & mask
    const broadcast = network | (~mask >>> 0)
    const firstHost = network + 1
    const lastHost = broadcast - 1
    const hostCount = broadcast - network - 1

    setInfo({
      network: numberToIp(network),
      netmask: numberToIp(mask),
      broadcast: numberToIp(broadcast),
      firstHost: numberToIp(firstHost),
      lastHost: numberToIp(lastHost),
      hostCount,
      cidr,
    })
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
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
        <label className="block text-sm font-medium text-slate-300 mb-3">Subnet (CIDR Notation)</label>
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && calculateSubnet(input)}
            placeholder="192.168.1.0/24"
            className="flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <motion.button
            onClick={() => calculateSubnet(input)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 rounded-lg transition-all shadow-lg shadow-blue-600/50"
          >
            Calculate
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
            { label: "Network", value: info.network },
            { label: "Netmask", value: info.netmask },
            { label: "Broadcast", value: info.broadcast },
            { label: "First Host", value: info.firstHost },
            { label: "Last Host", value: info.lastHost },
            { label: "Host Count", value: info.hostCount.toLocaleString() },
            { label: "CIDR", value: `/${info.cidr}` },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-lg p-4 hover:border-blue-500/50 transition-all"
            >
              <p className="text-slate-400 text-sm mb-1">{item.label}</p>
              <p className="text-blue-400 font-semibold text-lg break-all">{item.value}</p>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
