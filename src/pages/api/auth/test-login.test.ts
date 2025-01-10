import fetch from 'node-fetch'

const TEST_URL = 'https://sum-nvutq547j-sums-projects-84746e7b.vercel.app/api/auth/test-login'

async function testLogin() {
  try {
    console.log('開始測試登入...')
    console.log('測試 URL:', TEST_URL)

    const response = await fetch(TEST_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()
    
    if (response.ok) {
      console.log('登入成功:', data)
      return true
    } else {
      console.error('登入失敗:', data)
      return false
    }
  } catch (error) {
    console.error('測試過程發生錯誤:', error)
    return false
  }
}

async function runTest() {
  let attempts = 0
  const maxAttempts = 5
  let success = false

  while (attempts < maxAttempts && !success) {
    attempts++
    console.log(`\n嘗試第 ${attempts} 次登入...`)
    success = await testLogin()
    
    if (!success && attempts < maxAttempts) {
      console.log('等待 5 秒後重試...')
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
  }

  if (success) {
    console.log(`\n登入測試成功！共嘗試 ${attempts} 次`)
  } else {
    console.log(`\n登入測試失敗！已嘗試 ${maxAttempts} 次`)
  }
}

runTest().catch(console.error) 