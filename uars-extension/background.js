// UARS Extension - Background Service Worker

console.log('UARS background service worker loaded')

// Listen for extension icon clicks
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({ url: 'http://localhost:3000' })
})

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchReputation') {
    fetch(`http://localhost:3000/api/twitter-reputation?handle=${request.handle}`)
      .then(response => response.json())
      .then(data => sendResponse(data))
      .catch(error => {
        console.error('Error:', error)
        sendResponse({ score: 0, tier: 'Unregistered', registered: false })
      })
    return true // Keep channel open for async response
  }
})

