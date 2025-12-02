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

interface SubnetItem {
  index: number
  network: string
  firstHost: string
  lastHost: string
  broadcast: string
}

export default function SubnetCalculator() {
  const [input, setInput] = useState("")
  const [info, setInfo] = useState<SubnetInfo | null>(null)
  const [error, setError] = useState("")
  const [details, setDetails] = useState<string[]>([])
  const [loadingIp, setLoadingIp] = useState(false)
  const [subnetsToCreate, setSubnetsToCreate] = useState<number>(2)
  const [subnetsList, setSubnetsList] = useState<SubnetItem[]>([])
  const [showSubnets, setShowSubnets] = useState(false)
  const [newCidrInput, setNewCidrInput] = useState<number>(25)
  const [divisionMode, setDivisionMode] = useState<"subnets" | "cidr">("subnets")

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

  const calculateSubnets = (networkNum: number, originalCidr: number, numSubnets: number, targetCidr?: number): SubnetItem[] => {
    let newCidr: number
    let actualSubnets: number

    if (targetCidr !== undefined) {
      // Mode: specify target CIDR
      if (targetCidr <= originalCidr || targetCidr > 32) {
        return []
      }
      newCidr = targetCidr
      actualSubnets = Math.pow(2, targetCidr - originalCidr)
    } else {
      // Mode: specify number of subnets
      const bitsNeeded = Math.ceil(Math.log2(numSubnets))
      newCidr = originalCidr + bitsNeeded
      
      if (newCidr > 32) {
        return []
      }
      actualSubnets = Math.pow(2, bitsNeeded)
    }

    const subnetSize = Math.pow(2, 32 - newCidr)
    const subnets: SubnetItem[] = []

    for (let i = 0; i < actualSubnets; i++) {
      const subnetNetwork = networkNum + (i * subnetSize)
      const subnetBroadcast = subnetNetwork + subnetSize - 1
      const firstHost = subnetNetwork + 1
      const lastHost = subnetBroadcast - 1

      subnets.push({
        index: i + 1,
        network: `${numberToIp(subnetNetwork)}/${newCidr}`,
        firstHost: numberToIp(firstHost),
        lastHost: numberToIp(lastHost),
        broadcast: numberToIp(subnetBroadcast),
      })
    }

    return subnets
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

    // Calculate subnets list
    const subnets = divisionMode === "cidr" 
      ? calculateSubnets(network, cidr, 0, newCidrInput)
      : calculateSubnets(network, cidr, subnetsToCreate)
    setSubnetsList(subnets)
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
      <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-8">
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-medium text-slate-300">Subred (Notación CIDR)</label>
          <button
            onClick={fetchPublicIP}
            disabled={loadingIp}
            className="text-xs bg-slate-700 hover:bg-slate-600 text-blue-400 px-2 py-1 rounded transition-colors flex items-center gap-1"
          >
            {loadingIp ? <span className="animate-spin">⌛</span> : <span>📍</span>}
            Usar Mi IP Pública
          </button>
        </div>
        <div className="flex gap-3 mb-4">
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
            Calcular
          </motion.button>
        </div>

        {/* Subnet Division Options */}
        <div className="pt-4 border-t border-slate-700 space-y-3">
          <div className="flex items-center gap-4">
            <label className="text-sm text-slate-400">Modo de división:</label>
            <div className="flex gap-2">
              <button
                onClick={() => setDivisionMode("subnets")}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  divisionMode === "subnets"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                }`}
              >
                Por cantidad
              </button>
              <button
                onClick={() => setDivisionMode("cidr")}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  divisionMode === "cidr"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                }`}
              >
                Por máscara
              </button>
            </div>
          </div>

          {divisionMode === "subnets" ? (
            <div className="flex items-center gap-4">
              <label className="text-sm text-slate-400">Dividir en:</label>
              <select
                value={subnetsToCreate}
                onChange={(e) => {
                  setSubnetsToCreate(Number(e.target.value))
                  if (info) {
                    const parsed = parseSubnet(input)
                    if (parsed) {
                      const [, cidr] = parsed
                      const mask = (0xffffffff << (32 - cidr)) >>> 0
                      const ipNum = ipToNumber(parsed[0])
                      const network = ipNum & mask
                      setSubnetsList(calculateSubnets(network, cidr, Number(e.target.value)))
                    }
                  }
                }}
                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[2, 4, 8, 16, 32, 64, 128, 256].map((n) => (
                  <option key={n} value={n}>
                    {n} subredes
                  </option>
                ))}
              </select>
              <span className="text-xs text-slate-500">
                (Bits adicionales: {Math.ceil(Math.log2(subnetsToCreate))})
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <label className="text-sm text-slate-400">Nueva máscara:</label>
              <div className="flex items-center gap-2">
                <span className="text-white">/</span>
                <input
                  type="number"
                  min={info ? info.cidr + 1 : 1}
                  max={32}
                  value={newCidrInput}
                  onChange={(e) => {
                    const value = Number(e.target.value)
                    setNewCidrInput(value)
                    if (info && value > info.cidr && value <= 32) {
                      const parsed = parseSubnet(input)
                      if (parsed) {
                        const [, cidr] = parsed
                        const mask = (0xffffffff << (32 - cidr)) >>> 0
                        const ipNum = ipToNumber(parsed[0])
                        const network = ipNum & mask
                        setSubnetsList(calculateSubnets(network, cidr, 0, value))
                      }
                    }
                  }}
                  className="w-16 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                />
              </div>
              {info && (
                <span className="text-xs text-slate-500">
                  (Original: /{info.cidr} → Subredes: {newCidrInput > info.cidr ? Math.pow(2, newCidrInput - info.cidr) : 0})
                </span>
              )}
            </div>
          )}
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
              className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-lg p-4 hover:border-blue-500/50 transition-all"
            >
              <p className="text-slate-400 text-sm mb-1">{item.label}</p>
              <p className="text-blue-400 font-semibold text-lg break-all">{item.value}</p>
            </motion.div>
          ))}

          {/* Details Section */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-2 bg-slate-900/50 border border-slate-700 rounded-lg p-4 mt-2"
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

          {/* Subnets List Section */}
          {subnetsList.length > 0 && (
            <motion.div
              variants={itemVariants}
              className="md:col-span-2 bg-slate-900/50 border border-slate-700 rounded-lg p-4 mt-2"
            >
              <button
                onClick={() => setShowSubnets(!showSubnets)}
                className="w-full flex items-center justify-between text-sm font-semibold text-slate-300 mb-2"
              >
                <span className="flex items-center gap-2">
                  <span>🌐</span> Listado de Subredes ({subnetsList.length} subredes, /{divisionMode === "cidr" ? newCidrInput : info.cidr + Math.ceil(Math.log2(subnetsToCreate))} cada una)
                </span>
                <span className={`transform transition-transform ${showSubnets ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              
              {showSubnets && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="overflow-x-auto"
                >
                  <table className="w-full text-sm mt-3">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-700">
                        <th className="text-left py-2 px-2">#</th>
                        <th className="text-left py-2 px-2">Red</th>
                        <th className="text-left py-2 px-2">Primer Host</th>
                        <th className="text-left py-2 px-2">Último Host</th>
                        <th className="text-left py-2 px-2">Broadcast</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subnetsList.map((subnet) => (
                        <tr
                          key={subnet.index}
                          className="border-b border-slate-700/50 hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="py-2 px-2 text-slate-500">{subnet.index}</td>
                          <td className="py-2 px-2 text-blue-400 font-mono">{subnet.network}</td>
                          <td className="py-2 px-2 text-green-400 font-mono">{subnet.firstHost}</td>
                          <td className="py-2 px-2 text-green-400 font-mono">{subnet.lastHost}</td>
                          <td className="py-2 px-2 text-orange-400 font-mono">{subnet.broadcast}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  <div className="mt-4 p-3 bg-slate-800/50 rounded-lg text-xs text-slate-400">
                    <p className="font-semibold text-slate-300 mb-1">📊 Resumen de División:</p>
                    <p>• Red original: {info.network}/{info.cidr}</p>
                    <p>• Nueva máscara: /{divisionMode === "cidr" ? newCidrInput : info.cidr + Math.ceil(Math.log2(subnetsToCreate))}</p>
                    <p>• Bits prestados: {divisionMode === "cidr" ? newCidrInput - info.cidr : Math.ceil(Math.log2(subnetsToCreate))}</p>
                    <p>• Hosts por subred: {Math.pow(2, 32 - (divisionMode === "cidr" ? newCidrInput : info.cidr + Math.ceil(Math.log2(subnetsToCreate)))) - 2}</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
