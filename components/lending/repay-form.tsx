"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/contexts/WalletContext"
import { useToast } from "@/hooks/use-toast"
import { ArrowUp, Loader2, CheckCircle, RefreshCw, Clock, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface LoanData {
  index: number
  amount: string
  collateral: string
  interestRate: string
  interestAmount: string
  totalRepay: string
  timestamp: number
}

export default function RepayForm() {
  const { address } = useWallet()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [userLoans, setUserLoans] = useState<LoanData[]>([])
  const [selectedLoan, setSelectedLoan] = useState<LoanData | null>(null)

  const fetchUserLoans = async () => {
    if (!address) {
      console.log("No address connected")
      return
    }
    
    setIsFetching(true)
    console.log("Fetching loans for:", address)
    console.log("Contract:", process.env.NEXT_PUBLIC_LENDING_ADDRESS)
    
    try {
      const ethereum = (window as any).ethereum
      if (!ethereum) {
        console.log("No ethereum provider")
        return
      }

      // Get user loan indices - getUserLoans(address)
      const getUserLoansSelector = '0x02bf321f'
      const paddedAddress = address.slice(2).padStart(64, '0')
      
      const loanIndicesData = await ethereum.request({
        method: 'eth_call',
        params: [{
          to: process.env.NEXT_PUBLIC_LENDING_ADDRESS,
          data: getUserLoansSelector + paddedAddress
        }, 'latest']
      })

      console.log("Loan indices raw data:", loanIndicesData)

      if (!loanIndicesData || loanIndicesData === '0x' || loanIndicesData.length <= 66) {
        console.log("No loan data found")
        setUserLoans([])
        return
      }

      // Parse dynamic array
      // First 32 bytes: offset to array start
      // Next 32 bytes: array length
      // Then: array elements
      
      const arrayLength = parseInt(loanIndicesData.slice(66, 130), 16)
      
      console.log("Number of loan indices:", arrayLength)

      if (arrayLength > 0) {
        const loansData: LoanData[] = []

        for (let i = 0; i < Math.min(arrayLength, 20); i++) {
          // Each loan index is 32 bytes
          const loanIndexHex = loanIndicesData.slice(130 + (i * 64), 130 + ((i + 1) * 64))
          const loanIndexNum = parseInt(loanIndexHex, 16)
          
          console.log(`Fetching loan index ${i}:`, loanIndexNum)

          // Get loan details - getLoan(uint256)
          const getLoanSelector = '0x504006ca'
          const paddedLoanIndex = loanIndexNum.toString(16).padStart(64, '0')
          
          const loanData = await ethereum.request({
            method: 'eth_call',
            params: [{
              to: process.env.NEXT_PUBLIC_LENDING_ADDRESS,
              data: getLoanSelector + paddedLoanIndex
            }, 'latest']
          })

          console.log(`Loan ${loanIndexNum} data:`, loanData)

          if (loanData && loanData !== '0x' && loanData.length > 66) {
            // Parse loan struct
            const borrower = '0x' + loanData.slice(26, 66)
            const amount = parseInt(loanData.slice(66, 130), 16) / 1e18
            const collateral = parseInt(loanData.slice(130, 194), 16) / 1e18
            const rate = parseInt(loanData.slice(194, 258), 16)
            const timestamp = parseInt(loanData.slice(258, 322), 16)
            const repaid = parseInt(loanData.slice(322, 386), 16) === 1

            console.log(`Loan ${loanIndexNum} parsed:`, { 
              borrower, 
              amount, 
              collateral, 
              rate, 
              timestamp, 
              repaid,
              matchesAddress: borrower.toLowerCase() === address.toLowerCase()
            })

            if (borrower.toLowerCase() === address.toLowerCase() && !repaid) {
              // EXACT calculation matching contract: amount + (amount * rate / 10000)
              const interest = (amount * rate) / 10000
              const total = amount + interest

              loansData.push({
                index: loanIndexNum,  // GLOBAL loan ID for repay(loanIndex)
                amount: amount.toString(),
                collateral: collateral.toString(),
                interestRate: (rate / 100).toFixed(2),
                interestAmount: interest.toString(),
                totalRepay: total.toString(),  // NO ROUNDING - full precision
                timestamp: timestamp
              })
            }
          }
        }

        console.log("Active loans found:", loansData)
        setUserLoans(loansData)
        
        if (loansData.length === 0) {
          console.log("No active loans to repay")
        }
      } else {
        setUserLoans([])
      }
    } catch (error) {
      console.error("Error fetching loans:", error)
      setUserLoans([])
    } finally {
      setIsFetching(false)
    }
  }

  useEffect(() => {
    if (address) {
      console.log("Address changed, fetching loans...")
      fetchUserLoans()
      const interval = setInterval(fetchUserLoans, 10000) // Refresh every 10s
      return () => clearInterval(interval)
    }
  }, [address])

  const handleRepay = async (loan: LoanData) => {
    if (!address) return

    setIsLoading(true)
    setSelectedLoan(loan)
    
    try {
      const ethereum = (window as any).ethereum
      if (!ethereum) throw new Error("MetaMask not found")

      // Calculate EXACT repayment matching contract
      const repayAmount = parseFloat(loan.totalRepay)
      const repayWei = BigInt(Math.ceil(repayAmount * 1e18)) // Ceil to ensure enough
      const repayHex = repayWei.toString(16)

      // Function selector for repay(uint256)
      const functionSelector = "0x371fd8e6"
      const paddedIndex = loan.index.toString(16).padStart(64, "0")
      const data = functionSelector + paddedIndex

      console.log("Repaying loan:", {
        index: loan.index,
        amount: loan.amount,
        interestRate: loan.interestRate,
        interest: loan.interestAmount,
        totalRepay: loan.totalRepay,
        repayPC: repayAmount,
        repayWei: repayWei.toString(),
        repayHex: `0x${repayHex}`,
        contract: process.env.NEXT_PUBLIC_LENDING_ADDRESS
      })

      const txHash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: address,
          to: process.env.NEXT_PUBLIC_LENDING_ADDRESS,
          value: `0x${repayHex}`,
          data: data,
          gas: `0x${(400000).toString(16)}`
        }],
      })

      toast({
        title: "Repayment Sent!",
        description: `Transaction hash: ${txHash.slice(0, 10)}...`,
      })

      // Wait for confirmation
      const receipt = await waitForTransaction(ethereum, txHash)
      
      if (receipt.status === '0x1') {
        toast({
          title: "Loan Repaid Successfully! 🎉",
          description: `Repaid ${loan.totalRepay} PC. Collateral of ${loan.collateral} PC returned! +100 reputation points!`,
        })

        // Refresh loans after 3 seconds
        setTimeout(() => {
          fetchUserLoans()
          setSelectedLoan(null)
        }, 3000)
      } else {
        throw new Error("Transaction failed")
      }

    } catch (error: any) {
      console.error("Repay error:", error)
      toast({
        title: "Transaction Failed",
        description: error.message || "Please check console and try again",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setSelectedLoan(null)
    }
  }

  const waitForTransaction = async (ethereum: any, txHash: string) => {
    let attempts = 0
    while (attempts < 40) {
      try {
        const receipt = await ethereum.request({
          method: 'eth_getTransactionReceipt',
          params: [txHash],
        })
        if (receipt) {
          return receipt
        }
      } catch (e) {}
      await new Promise(resolve => setTimeout(resolve, 2000))
      attempts++
    }
    throw new Error("Transaction timeout")
  }

  const formatDate = (timestamp: number) => {
    if (!timestamp || timestamp === 0) return "Recently"
    const date = new Date(timestamp * 1000)
    const now = Date.now()
    const diff = now - date.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <Card className="bg-white/5 backdrop-blur-md border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <ArrowUp className="w-5 h-5 text-blue-400" />
              Repay Loans
            </CardTitle>
            <CardDescription className="text-gray-400">
              {userLoans.length > 0 
                ? `You have ${userLoans.length} active loan${userLoans.length !== 1 ? 's' : ''}`
                : 'No active loans to repay'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
              +100 Points
            </Badge>
            <button
              onClick={fetchUserLoans}
              disabled={isFetching}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              title="Refresh loans"
            >
              <RefreshCw className={`w-4 h-4 text-gray-400 ${isFetching ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Loading State */}
        {isFetching && userLoans.length === 0 && (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-400">Loading your loans...</p>
          </div>
        )}

        {/* No Loans */}
        {!isFetching && userLoans.length === 0 && (
          <div className="text-center py-8 px-4 rounded-lg bg-white/5 border border-white/10">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-sm text-gray-300 mb-1 font-semibold">All Clear!</p>
            <p className="text-xs text-gray-500">You don't have any active loans to repay</p>
            <p className="text-xs text-gray-600 mt-2">Borrow some funds to get started</p>
          </div>
        )}

        {/* Debug Info */}
        {!isFetching && userLoans.length === 0 && address && (
          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-xs">
                <p className="text-yellow-300 font-semibold mb-1">Troubleshooting:</p>
                <p className="text-gray-400">Contract: {process.env.NEXT_PUBLIC_LENDING_ADDRESS?.slice(0, 10)}...</p>
                <p className="text-gray-400">Your address: {address.slice(0, 10)}...</p>
                <p className="text-gray-400 mt-1">If you just borrowed, wait 10s and click refresh ↗️</p>
              </div>
            </div>
          </div>
        )}

        {/* Loan List */}
        {userLoans.map((loan) => (
          <div
            key={loan.index}
            className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 space-y-3 animate-in fade-in slide-in-from-top duration-500"
          >
            <div className="flex items-center justify-between mb-2">
              <Badge className="bg-blue-500/30 text-blue-200 border-blue-400">
                Loan #{loan.index}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                {formatDate(loan.timestamp)}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Borrowed</span>
                <span className="text-white font-semibold">{loan.amount} PC</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Interest Rate</span>
                <span className="text-white font-semibold">{loan.interestRate}% APY</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Interest Due</span>
                <span className="text-yellow-400 font-semibold">+{loan.interestAmount} PC</span>
              </div>
              
              <div className="h-px bg-white/20 my-2" />
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300 font-semibold text-sm">Total to Repay</span>
                <span className="text-white font-bold text-xl">{loan.totalRepay} PC</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Collateral Returns</span>
                <span className="text-green-400 font-semibold">{loan.collateral} PC ✅</span>
              </div>
            </div>

            <Button
              onClick={() => handleRepay(loan)}
              disabled={isLoading && selectedLoan?.index === loan.index}
              className="w-full mt-3 gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              {isLoading && selectedLoan?.index === loan.index ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Repaying...
                </>
              ) : (
                <>
                  <ArrowUp className="w-4 h-4" />
                  Repay {loan.totalRepay} PC
                </>
              )}
            </Button>
          </div>
        ))}

        {/* Bonus Info */}
        {userLoans.length > 0 && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
            <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-white mb-1">
                Repayment Rewards
              </div>
              <div className="text-xs text-gray-400">
                Earn +100 reputation points for each loan you repay on time!
              </div>
            </div>
          </div>
        )}

        <p className="text-xs text-center text-gray-500">
          {userLoans.length > 0
            ? 'Your collateral will be returned immediately after each repayment'
            : 'Loans will appear here automatically after you borrow'}
        </p>
      </CardContent>
    </Card>
  )
}
