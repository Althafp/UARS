// UARS Twitter Extension - Native Integration
console.log('🔥 UARS Extension loaded!')

const API_URL = 'http://localhost:3000'

// Extract Twitter username from URL
function getTwitterUsername() {
  const pathParts = window.location.pathname.split('/')
  if (pathParts.length >= 2 && pathParts[1] && !pathParts[1].includes('/')) {
    return pathParts[1]
  }
  return null
}

// Fetch reputation for a Twitter handle
async function fetchReputation(twitterHandle) {
  console.log('🌐 Fetching:', `${API_URL}/api/twitter-reputation?handle=${twitterHandle}`)
  
  try {
    const response = await fetch(`${API_URL}/api/twitter-reputation?handle=${twitterHandle}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    })
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    
    const data = await response.json()
    console.log('✅ API Response:', data)
    return data
  } catch (error) {
    console.error('❌ Error:', error)
    return null
  }
}

// Create simple reputation badge (inline, next to verified checkmark)
function createNativeReputationBadge(reputationData) {
  const badge = document.createElement('span')
  badge.id = 'uars-native-badge'
  
  // Simple, clean styling
  badge.style.cssText = `
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-left: 6px;
    padding: 2px 8px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s;
    vertical-align: middle;
    background: rgba(29, 155, 240, 0.15);
    color: rgb(29, 155, 240);
    border: 1px solid rgba(29, 155, 240, 0.3);
  `
  
  // Simple content - just star + number
  badge.innerHTML = `
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style="display: inline-block;">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
    </svg>
    <span>${reputationData.score.toLocaleString()}</span>
  `
  
  badge.title = `UARS Reputation: ${reputationData.score} points\nClick to view dashboard`
  
  // Click to open dashboard
  badge.onclick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    window.open('http://localhost:3000', '_blank')
  }
  
  // Simple hover effect
  badge.onmouseenter = () => {
    badge.style.opacity = '0.8'
  }
  badge.onmouseleave = () => {
    badge.style.opacity = '1'
  }
  
  return badge
}

// Flag to prevent duplicate injections
let isInjecting = false

// Inject reputation badge INLINE with username
function injectNativeReputationBadge() {
  // Prevent duplicate injections
  if (isInjecting) {
    console.log('⏳ Already injecting, skipping...')
    return
  }
  
  // Check if badge already exists
  if (document.getElementById('uars-native-badge')) {
    console.log('✅ Badge already exists, skipping...')
    return
  }
  
  isInjecting = true
  
  const username = getTwitterUsername()
  if (!username) {
    console.log('❌ No username in URL')
    isInjecting = false
    return
  }
  
  console.log('✅ Profile detected:', username)
  
  // Find the username area - Twitter's layout
  const usernameElement = document.querySelector('[data-testid="UserName"]')
  
  if (!usernameElement) {
    console.log('⏳ Username element not found yet, will retry...')
    isInjecting = false
    return
  }
  
  console.log('✅ Username element found')
  
  // Find the span that contains the username text
  const usernameSpan = usernameElement.querySelector('[dir="ltr"]')
  
  if (!usernameSpan) {
    console.log('❌ Could not find username span')
    isInjecting = false
    return
  }
  
  console.log('✅ Username span found, fetching reputation...')
  
  // Fetch and inject
  fetchReputation(username).then(reputationData => {
    if (!reputationData) {
      console.log('❌ No reputation data')
      isInjecting = false
      return
    }
    
    console.log('📊 Data:', reputationData)
    
    const badge = createNativeReputationBadge(reputationData)
    
    // Insert RIGHT AFTER the username span (next to verified badge)
    usernameSpan.insertAdjacentElement('afterend', badge)
    console.log('✅ Badge inserted after username span')
    
    console.log('🎉 UARS reputation badge injected!')
    isInjecting = false
  }).catch(error => {
    console.error('❌ Error injecting badge:', error)
    isInjecting = false
  })
}

// Watch for URL changes (Twitter is SPA)
let lastUrl = location.href
new MutationObserver(() => {
  const url = location.href
  if (url !== lastUrl) {
    lastUrl = url
    console.log('🔄 URL changed, re-injecting...')
    // Reset injection flag on URL change
    isInjecting = false
    setTimeout(injectNativeReputationBadge, 1500)
  }
}).observe(document, { subtree: true, childList: true })

// Simple initial injection
console.log('⏱️ Starting injection...')

// Try injection after page loads
setTimeout(() => {
  console.log('Initial injection attempt')
  injectNativeReputationBadge()
}, 2000)

// One retry after 5 seconds if needed
setTimeout(() => {
  if (!document.getElementById('uars-native-badge')) {
    console.log('Retry injection')
    injectNativeReputationBadge()
  }
}, 5000)
