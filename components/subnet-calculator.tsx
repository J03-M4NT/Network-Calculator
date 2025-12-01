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
  const [details, setDetails] = useState<string[]>([])
  const [loadingIp, setLoadingIp] = useState(false)

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
      setError("Formato inválido. Usar: 192.168.1.0/24")
      setInfo(null)
      setDetails([])
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
    const hostCount = cidr === 32 ? 1 : cidr === 31 ? 2 : broadcast - network - 1

    const netmaskStr = numberToIp(mask)
    const networkStr = numberToIp(network)
    const broadcastStr = numberToIp(broadcast)

    setInfo({
      network: networkStr,
      netmask: netmaskStr,
      broadcast: broadcastStr,
      firstHost: numberToIp(firstHost),
      lastHost: numberToIp(lastHost),
      hostCount,
      cidr,
    })

    setDetails([
      "Detalles de Cálculo:",
      "",
      `1. Cálculo de Máscara (/${cidr}):`,
      `   Binario: ${mask.toString(2).padStart(32, "0").match(/.{1,8}/g)?.join(".")}`,
      `   Decimal: ${netmaskStr}`,
      "",
      "2. Dirección de Red (IP & Máscara):",
      `   IP Binario:      ${ipNum.toString(2).padStart(32, "0").match(/.{1,8}/g)?.join(".")}`,
      `   Máscara Binario: ${mask.toString(2).padStart(32, "0").match(/.{1,8}/g)?.join(".")}`,
      `   Resultado:       ${network.toString(2).padStart(32, "0").match(/.{1,8}/g)?.join(".")}`,
      `   Decimal:         ${networkStr}`,
      "",
      "3. Dirección de Broadcast (Red | ~Máscara):",
      `   Resultado:       ${broadcast.toString(2).padStart(32, "0").match(/.{1,8}/g)?.join(".")}`,
      `   Decimal:         ${broadcastStr}`,
      "",
      "4. Rango de Hosts:",
      `   Primer Host: Red + 1 = ${numberToIp(firstHost)}`,
      `   Último Host: Broadcast - 1 = ${numberToIp(lastHost)}`,
      `   Total de Hosts: 2^(32 - ${cidr}) - 2 = ${hostCount.toLocaleString()}`,
    ])
  }

  const fetchPublicIP = async () => {
    setLoadingIp(true)
    try {
      const response = await fetch("https://api.ipify.org?format=json")
      const data = await response.json()
      // Keep existing CIDR or default to /24
      const currentCidr = input.includes("/") ? input.split("/")[1] : "24"
      const newInput = `${data.ip}/${currentCidr}`
      setInput(newInput)
      calculateSubnet(newInput)
    } catch (err) {
      setError("Error al obtener IP pública")
    } finally {
      setLoadingIp(false)
    }
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
      <div className="card p-6">
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-medium text-slate-300">Subred (Notación CIDR)</label>
          <button
            onClick={fetchPublicIP}
            disabled={loadingIp}
            className="text-xs px-2 py-1 rounded transition-colors flex items-center gap-1 text-slate-200 bg-slate-700/40 hover:bg-slate-700/60"
          >
            {loadingIp ? <span className="animate-spin">⌛</span> : <span>📍</span>}
            Usar Mi IP Pública
          </button>
        </div>
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
            className="btn-primary"
          >
            Calcular
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
            { label: "Red", value: info.network },
            { label: "Máscara", value: info.netmask },
            { label: "Broadcast", value: info.broadcast },
            { label: "Primer Host", value: info.firstHost },
            { label: "Último Host", value: info.lastHost },
            { label: "Cantidad de Hosts", value: info.hostCount.toLocaleString() },
            { label: "CIDR", value: `/${info.cidr}` },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="card p-4 hover:shadow-xl transition-all"
            >
              <p className="text-slate-400 text-sm mb-1">{item.label}</p>
              <p className="text-blue-400 font-semibold text-lg break-all">{item.value}</p>
            </motion.div>
          ))}

          {/* Details Section */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-2 card p-4 mt-2"
          >
            <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
              <span>📝</span> Detalles de Cálculo
            </h3>
            <div className="space-y-1 font-mono text-sm text-slate-400">
              {details.map((line, index) => (
                <div key={index} className={line === "" ? "h-2" : ""}>
                  {line}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}
