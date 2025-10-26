/**
 * Encode claimAchievement(string) function call - EXACT same as cast does it
 */
export function encodeClaimAchievement(achievementId: string): string {
  const functionSelector = '0x6c19e783' // claimAchievement(string)
  
  // String encoding (same as cast)
  const offset = '0000000000000000000000000000000000000000000000000000000000000020'
  const idBytes = Buffer.from(achievementId, 'utf8')
  const idLength = idBytes.length.toString(16).padStart(64, '0')
  const idData = idBytes.toString('hex').padEnd(Math.ceil(idBytes.length / 32) * 64, '0')
  
  return functionSelector + offset + idLength + idData
}

/**
 * Wait for transaction confirmation with better error handling
 */
export async function waitForTransaction(
  ethereum: any,
  txHash: string,
  maxAttempts: number = 40
): Promise<any> {
  let attempts = 0
  
  while (attempts < maxAttempts) {
    try {
      const receipt = await ethereum.request({
        method: 'eth_getTransactionReceipt',
        params: [txHash],
      })
      
      if (receipt) {
        return receipt
      }
    } catch (e) {
      // Continue waiting
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    attempts++
  }
  
  throw new Error('Transaction timeout')
}
