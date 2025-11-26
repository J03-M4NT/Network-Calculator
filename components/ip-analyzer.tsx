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
  const [details, setDetails] = useState<string[]>([])
  const [loadingIp, setLoadingIp] = useState(false)

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
      setError("Dirección IPv4 inválida")
      setInfo(null)
      setDetails([])
      return
    }

    setError("")
    const parts = ipStr.split(".").map((p) => Number.parseInt(p))
    const firstByte = parts[0]

    // Determine class
    let classType = ""
    let classReason = ""
    if (firstByte < 128) {
      classType = "A"
      classReason = "El primer octeto está entre 0 y 127"
    } else if (firstByte < 192) {
      classType = "B"
      classReason = "El primer octeto está entre 128 y 191"
    } else if (firstByte < 224) {
      classType = "C"
      classReason = "El primer octeto está entre 192 y 223"
    } else if (firstByte < 240) {
      classType = "D"
      classReason = "El primer octeto está entre 224 y 239 (Multicast)"
    } else {
      classType = "E"
      classReason = "El primer octeto está entre 240 y 255 (Experimental)"
    }

    // Determine type (private/public/special)
    let type = "Pública"
    let typeReason = "No está en ningún rango privado o especial"
    if (ipStr === "127.0.0.1") {
      type = "Loopback"
      typeReason = "127.0.0.1 es la dirección estándar de loopback"
    } else if (ipStr === "0.0.0.0") {
      type = "Todos Ceros"
      typeReason = "0.0.0.0 representa todas las redes"
    } else if (ipStr === "255.255.255.255") {
      type = "Broadcast"
      typeReason = "255.255.255.255 es la dirección de broadcast limitada"
    } else if (ipStr.startsWith("10.")) {
      type = "Privada (Clase A)"
      typeReason = "El rango 10.0.0.0/8 está reservado para redes privadas"
    } else if (ipStr.startsWith("172.") && parts[1] >= 16 && parts[1] <= 31) {
      type = "Privada (Clase B)"
      typeReason = "El rango 172.16.0.0/12 está reservado para redes privadas"
    } else if (ipStr.startsWith("192.168.")) {
      type = "Privada (Clase C)"
      typeReason = "El rango 192.168.0.0/16 está reservado para redes privadas"
    } else if (ipStr.startsWith("169.254.")) {
      type = "Link-Local"
      typeReason = "169.254.0.0/16 se usa para direccionamiento link-local"
    }

    // Convert to binary
    const binaryParts = parts.map((p) => p.toString(2).padStart(8, "0"))
    const binary = binaryParts.join(".")

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

    setDetails([
      "Detalles de Análisis:",
      "",
      `1. Determinación de Clase: Clase ${classType}`,
      `   Razón: ${classReason}`,
      "",
      `2. Determinación de Tipo: ${type}`,
      `   Razón: ${typeReason}`,
      "",
      "3. Conversión Binaria:",
      `   ${parts[0]} -> ${binaryParts[0]}`,
      `   ${parts[1]} -> ${binaryParts[1]}`,
      `   ${parts[2]} -> ${binaryParts[2]}`,
      `   ${parts[3]} -> ${binaryParts[3]}`,
    ])
  }

  const handleAnalyze = () => {
    analyzeIP(ip)
  }

  const fetchPublicIP = async () => {
    setLoadingIp(true)
    try {
      const response = await fetch("https://api.ipify.org?format=json")
      const data = await response.json()
      setIp(data.ip)
      analyzeIP(data.ip)
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
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-medium text-slate-300">Ingresar Dirección IPv4</label>
          <button
            onClick={fetchPublicIP}
            disabled={loadingIp}
            className="text-xs bg-slate-700 hover:bg-slate-600 text-blue-400 px-2 py-1 rounded transition-colors flex items-center gap-1"
          >
            {loadingIp ? <span className="animate-spin">⌛</span> : <span>📍</span>}
            Usar Mi IP Pública
          </button>
        </div>
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
            Analizar
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
            { label: "Clase", value: info.class },
            { label: "Tipo", value: info.type },
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
            <p className="text-slate-400 text-sm mb-2">Binario</p>
            <p className="text-blue-400 font-mono text-sm break-all">{info.binary}</p>
          </motion.div>

          {/* Details Section */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-2 bg-slate-900/50 border border-slate-700 rounded-lg p-4 mt-2"
          >
            <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
              <span>📝</span> Detalles de Análisis
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
