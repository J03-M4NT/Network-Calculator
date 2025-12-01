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
  classColor: string
  typeColor: string
}

export default function IPAnalyzer() {
  const [ip, setIp] = useState("")
  const [info, setInfo] = useState<IPInfo | null>(null)
  const [error, setError] = useState("")
  const [details, setDetails] = useState<string[]>([])
  const [loadingIp, setLoadingIp] = useState(false)

  const validateIPv4 = (ipStr: string): boolean => {
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
    if (!ipv4Regex.test(ipStr)) return false
    const parts = ipStr.split(".")
    if (parts.length !== 4) return false
    return parts.every((part) => {
      const num = Number.parseInt(part, 10)
      return num >= 0 && num <= 255 && part === num.toString()
    })
  }

  const getClassColor = (classType: string): string => {
    const colors: Record<string, string> = {
      A: "bg-blue-500/20 text-blue-400 border-blue-500/50",
      B: "bg-green-500/20 text-green-400 border-green-500/50",
      C: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
      D: "bg-purple-500/20 text-purple-400 border-purple-500/50",
      E: "bg-red-500/20 text-red-400 border-red-500/50",
    }
    return colors[classType] || "bg-slate-500/20 text-slate-400 border-slate-500/50"
  }

  const getTypeColor = (type: string): string => {
    if (type.includes("Privada")) {
      return "bg-orange-500/20 text-orange-400 border-orange-500/50"
    }
    if (type === "Pública") {
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
    }
    if (type === "Loopback" || type === "Link-Local") {
      return "bg-cyan-500/20 text-cyan-400 border-cyan-500/50"
    }
    if (type === "Broadcast" || type === "Todos Ceros") {
      return "bg-pink-500/20 text-pink-400 border-pink-500/50"
    }
    return "bg-slate-500/20 text-slate-400 border-slate-500/50"
  }

  const analyzeIP = (ipStr: string) => {
    if (!validateIPv4(ipStr)) {
      setError("Dirección IPv4 inválida. Formato correcto: xxx.xxx.xxx.xxx (0-255)")
      setInfo(null)
      setDetails([])
      return
    }

    setError("")
    const parts = ipStr.split(".").map((p) => Number.parseInt(p, 10))
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
    const decimal = (parts[0] * 16777216 + parts[1] * 65536 + parts[2] * 256 + parts[3]).toLocaleString()

    // Convert to hexadecimal
    const hexadecimal = parts.map((p) => p.toString(16).padStart(2, "0").toUpperCase()).join(":")

    const classColor = getClassColor(classType)
    const typeColor = getTypeColor(type)

    setInfo({
      ip: ipStr,
      class: classType,
      type,
      binary,
      decimal,
      hexadecimal,
      firstByte,
      classColor,
      typeColor,
    })

    setDetails([
      "📊 Detalles de Análisis:",
      "",
      `1️⃣ Determinación de Clase: Clase ${classType}`,
      `   💡 Razón: ${classReason}`,
      "",
      `2️⃣ Determinación de Tipo: ${type}`,
      `   💡 Razón: ${typeReason}`,
      "",
      "3️⃣ Conversión Binaria:",
      `   ${parts[0]} → ${binaryParts[0]}`,
      `   ${parts[1]} → ${binaryParts[1]}`,
      `   ${parts[2]} → ${binaryParts[2]}`,
      `   ${parts[3]} → ${binaryParts[3]}`,
      "",
      "4️⃣ Conversión Hexadecimal:",
      `   ${parts[0]} → 0x${parts[0].toString(16).padStart(2, "0").toUpperCase()}`,
      `   ${parts[1]} → 0x${parts[1].toString(16).padStart(2, "0").toUpperCase()}`,
      `   ${parts[2]} → 0x${parts[2].toString(16).padStart(2, "0").toUpperCase()}`,
      `   ${parts[3]} → 0x${parts[3].toString(16).padStart(2, "0").toUpperCase()}`,
    ])
  }

  const handleAnalyze = () => {
    if (ip.trim() === "") {
      setError("Por favor ingrese una dirección IP")
      return
    }
    analyzeIP(ip.trim())
  }

  const fetchPublicIP = async () => {
    setLoadingIp(true)
    setError("")
    try {
      const response = await fetch("https://api.ipify.org?format=json")
      if (!response.ok) throw new Error("Error en la respuesta")
      const data = await response.json()
      if (data.ip) {
        setIp(data.ip)
        analyzeIP(data.ip)
      } else {
        throw new Error("IP no encontrada")
      }
    } catch (err) {
      setError("Error al obtener IP pública. Verifique su conexión a internet.")
      setInfo(null)
      setDetails([])
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
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Input Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-8 shadow-xl"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <label className="block text-base font-semibold text-slate-200 mb-1">
              🔍 Analizador de Direcciones IPv4
            </label>
            <p className="text-sm text-slate-400">Ingrese una dirección IPv4 para analizar sus propiedades</p>
          </div>
          <button
            onClick={fetchPublicIP}
            disabled={loadingIp}
            className="text-sm bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-blue-400 px-4 py-2 rounded-lg transition-all flex items-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingIp ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Cargando...</span>
              </>
            ) : (
              <>
                <span>📍</span>
                <span>Usar Mi IP Pública</span>
              </>
            )}
          </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={ip}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setIp(e.target.value)
                if (error) setError("")
                if (info) {
                  setInfo(null)
                  setDetails([])
                }
              }}
              onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleAnalyze()}
              placeholder="Ejemplo: 192.168.1.1"
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
            />
          </div>
          <motion.button
            onClick={handleAnalyze}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-8 py-3.5 rounded-lg transition-all shadow-lg shadow-blue-600/50 flex items-center justify-center gap-2"
          >
            <span>⚡</span>
            <span>Analizar</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-red-500/20 border border-red-500/50 rounded-lg px-5 py-4 text-red-400 flex items-center gap-3 shadow-lg"
        >
          <span className="text-xl">⚠️</span>
          <span>{error}</span>
        </motion.div>
      )}

      {/* Results */}
      {info && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {/* IP Address Display */}
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur border border-blue-500/50 rounded-xl p-6 shadow-xl"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-slate-400 text-sm mb-2 font-medium">Dirección IP Analizada</p>
                <p className="text-2xl font-bold text-white font-mono tracking-wide">{info.ip}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <span
                  className={`px-4 py-2 rounded-lg border font-semibold text-sm ${info.classColor} shadow-md`}
                >
                  Clase {info.class}
                </span>
                <span
                  className={`px-4 py-2 rounded-lg border font-semibold text-sm ${info.typeColor} shadow-md`}
                >
                  {info.type}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Info Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: "Representación Decimal", value: info.decimal, icon: "🔢", color: "text-blue-400" },
              {
                label: "Representación Hexadecimal",
                value: info.hexadecimal,
                icon: "🔷",
                color: "text-green-400",
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-5 shadow-lg hover:border-slate-600 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{item.icon}</span>
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">{item.label}</p>
                </div>
                <p className={`font-mono text-lg font-bold ${item.color} break-all`}>{item.value}</p>
              </motion.div>
            ))}

            {/* Binary Card - Full Width */}
            <motion.div
              variants={itemVariants}
              className="md:col-span-2 lg:col-span-3 bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-5 shadow-lg"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🔢</span>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">
                  Representación Binaria
                </p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                <p className="text-cyan-400 font-mono text-sm break-all leading-relaxed">
                  {info.binary.split(".").map((octet: string, idx: number) => (
                    <span key={idx}>
                      <span className="text-cyan-300 font-bold">{octet}</span>
                      {idx < 3 && <span className="text-slate-500 mx-2">•</span>}
                    </span>
                  ))}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Details Section */}
          <motion.div
            variants={itemVariants}
            className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 shadow-xl"
          >
            <h3 className="text-base font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <span className="text-xl">📝</span>
              <span>Detalles del Análisis</span>
            </h3>
            <div className="space-y-2 font-mono text-sm">
              {details.map((line: string, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={line === "" ? "h-3" : "text-slate-300 leading-relaxed"}
                >
                  {line}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}
