"use client"

import { useState } from "react"
import { motion } from "framer-motion"

export default function IPv4ToIPv6Converter() {
  const [ipv4, setIpv4] = useState("")
  const [ipv6, setIpv6] = useState("")
  const [activeTab, setActiveTab] = useState<"ipv4" | "ipv6">("ipv4")
  const [error, setError] = useState("")
  const [details, setDetails] = useState<string[]>([])
  const [loadingIp, setLoadingIp] = useState(false)

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
      setError("Dirección IPv4 inválida")
      setDetails([])
      return ""
    }
    setError("")
    const parts = ipv4.split(".")
    const hex = parts.map((part) => {
      const num = Number.parseInt(part)
      return num.toString(16).padStart(2, "0")
    })

    const explanation = [
      "Las direcciones IPv6 mapeadas a IPv4 se usan para representar direcciones IPv4 como IPv6.",
      "Formato: ::ffff:xxxx:xxxx",
      "",
      "Paso 1: Convertir cada octeto a Hexadecimal",
      `${parts[0]} -> ${hex[0]}`,
      `${parts[1]} -> ${hex[1]}`,
      `${parts[2]} -> ${hex[2]}`,
      `${parts[3]} -> ${hex[3]}`,
      "",
      "Paso 2: Combinar valores hexadecimales",
      `Primer grupo: ${hex[0]}${hex[1]}`,
      `Segundo grupo: ${hex[2]}${hex[3]}`,
      "",
      "Paso 3: Formatear como IPv6",
      `::ffff:${hex[0]}${hex[1]}:${hex[2]}${hex[3]}`,
    ]
    setDetails(explanation)

    return `::ffff:${hex[0]}${hex[1]}:${hex[2]}${hex[3]}`
  }

  const ipv6ToIPv4 = (ipv6: string): string => {
    if (!validateIPv6(ipv6)) {
      setError("Dirección IPv6 inválida")
      setDetails([])
      return ""
    }
    setError("")
    if (!ipv6.includes("ffff")) {
      setError("La dirección IPv6 no es una dirección IPv4 mapeada")
      setDetails([])
      return ""
    }
    const parts = ipv6.split(":")
    const ffff_index = parts.indexOf("ffff")
    if (ffff_index === -1) return ""
    const hex_part1 = parts[ffff_index + 1]
    const hex_part2 = parts[ffff_index + 2]

    const bytes = [
      Number.parseInt(hex_part1.substring(0, 2), 16),
      Number.parseInt(hex_part1.substring(2, 4), 16),
      Number.parseInt(hex_part2.substring(0, 2), 16),
      Number.parseInt(hex_part2.substring(2, 4), 16),
    ]

    const explanation = [
      "Convirtiendo dirección IPv6 mapeada a IPv4 de vuelta a IPv4.",
      `Entrada: ${ipv6}`,
      "",
      "Paso 1: Extraer los últimos 32 bits (últimos 2 grupos)",
      `Grupo 1: ${hex_part1}`,
      `Grupo 2: ${hex_part2}`,
      "",
      "Paso 2: Dividir en bytes y convertir a Decimal",
      `${hex_part1.substring(0, 2)} -> ${bytes[0]}`,
      `${hex_part1.substring(2, 4)} -> ${bytes[1]}`,
      `${hex_part2.substring(0, 2)} -> ${bytes[2]}`,
      `${hex_part2.substring(2, 4)} -> ${bytes[3]}`,
      "",
      "Paso 3: Formatear como IPv4",
      `${bytes.join(".")}`,
    ]
    setDetails(explanation)

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

  const fetchPublicIP = async () => {
    setLoadingIp(true)
    try {
      const response = await fetch("https://api.ipify.org?format=json")
      const data = await response.json()
      const ip = data.ip

      if (ip.includes(".")) {
        setActiveTab("ipv4")
        setIpv4(ip)
        // Clear previous results/details when new IP is fetched
        setIpv6("")
        setDetails([])
        setError("")
      } else if (ip.includes(":")) {
        setActiveTab("ipv6")
        setIpv6(ip)
        setIpv4("")
        setDetails([])
        setError("")
      }
    } catch (err) {
      setError("Error al obtener IP pública")
    } finally {
      setLoadingIp(false)
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
            onClick={() => {
              setActiveTab(tab)
              setDetails([])
              setError("")
            }}
            className={`px-4 py-2 font-semibold transition-all ${activeTab === tab ? "text-blue-500 border-b-2 border-blue-500" : "text-slate-400 hover:text-slate-300"
              }`}
          >
            {tab === "ipv4" ? "IPv4 a IPv6" : "IPv6 a IPv4"}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {/* Input */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-slate-300">
              {activeTab === "ipv4" ? "Dirección IPv4" : "Dirección IPv6"}
            </label>
            <button
              onClick={fetchPublicIP}
              disabled={loadingIp}
              className="text-xs bg-slate-700 hover:bg-slate-600 text-blue-400 px-2 py-1 rounded transition-colors flex items-center gap-1"
            >
              {loadingIp ? (
                <span className="animate-spin">⌛</span>
              ) : (
                <span>📍</span>
              )}
              Usar Mi IP Pública
            </button>
          </div>
          <input
            type="text"
            value={activeTab === "ipv4" ? ipv4 : ipv6}
            onChange={(e) => {
              if (activeTab === "ipv4") {
                setIpv4(e.target.value)
              } else {
                setIpv6(e.target.value)
              }
              // Clear details when input changes to avoid mismatch
              if (details.length > 0) setDetails([])
            }}
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
          Convertir
        </motion.button>

        {/* Output */}
        {(activeTab === "ipv4" ? ipv6 : ipv4) && !error && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {activeTab === "ipv4" ? "Dirección IPv6" : "Dirección IPv4"}
            </label>
            <div className="bg-slate-700/30 border border-slate-600 rounded-lg px-4 py-3 text-blue-400 font-mono break-all">
              {activeTab === "ipv4" ? ipv6 : ipv4}
            </div>
          </motion.div>
        )}

        {/* Details */}
        {details.length > 0 && !error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
            className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 mt-4"
          >
            <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
              <span>📝</span> Detalles de Conversión
            </h3>
            <div className="space-y-1 font-mono text-sm text-slate-400">
              {details.map((line, index) => (
                <div key={index} className={line === "" ? "h-2" : ""}>
                  {line}
                </div>
              ))}
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
